-- ============================================================
-- 003_article_analytics.sql
-- EHS Advocacia — Privacy-preserving, anti-inflation article
-- analytics schema, RLS policies, and atomic service_role RPCs.
-- ============================================================

-- 1. Backward-compatible extension of public.posts
--    posts.views remains deduplicated unique views; raw_views tracks total impressions.
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS raw_views integer NOT NULL DEFAULT 0;

UPDATE public.posts
SET raw_views = GREATEST(COALESCE(raw_views, 0), COALESCE(views, 0));

-- 2. Daily visitor deduplication table (zero PII: daily rotating HMAC-SHA256 hash)
CREATE TABLE IF NOT EXISTS public.article_view_dedup (
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  view_date date NOT NULL,
  visitor_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, view_date, visitor_hash)
);

CREATE INDEX IF NOT EXISTS idx_article_view_dedup_view_date
  ON public.article_view_dedup (view_date);

-- 3. Per-article reading sessions (engagement, scroll depth, attribution)
CREATE TABLE IF NOT EXISTS public.article_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  view_date date NOT NULL,
  visitor_hash text NOT NULL,
  is_unique boolean NOT NULL DEFAULT false,
  engaged_seconds integer NOT NULL DEFAULT 0
    CHECK (engaged_seconds >= 0 AND engaged_seconds <= 7200),
  max_scroll_pct smallint NOT NULL DEFAULT 0
    CHECK (max_scroll_pct >= 0 AND max_scroll_pct <= 100),
  reached_25 boolean NOT NULL DEFAULT false,
  reached_50 boolean NOT NULL DEFAULT false,
  reached_75 boolean NOT NULL DEFAULT false,
  reached_100 boolean NOT NULL DEFAULT false,
  device_type text NOT NULL DEFAULT 'desktop'
    CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  referrer_domain text,
  traffic_source text NOT NULL DEFAULT 'direct'
    CHECK (traffic_source IN ('direct', 'organic', 'social', 'referral', 'campaign', 'internal')),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_article_sessions_view_date
  ON public.article_sessions (view_date);

CREATE INDEX IF NOT EXISTS idx_article_sessions_post_date
  ON public.article_sessions (post_id, view_date);

-- 4. Article interaction events (shares, CTAs, related clicks)
CREATE TABLE IF NOT EXISTS public.article_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  session_id text,
  event_date date NOT NULL,
  event_type text NOT NULL
    CHECK (event_type IN (
      'share_whatsapp',
      'share_linkedin',
      'share_copy',
      'cta_whatsapp',
      'cta_primary',
      'related_click'
    )),
  target text,
  device_type text NOT NULL DEFAULT 'desktop'
    CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_article_events_event_date
  ON public.article_events (event_date);

CREATE INDEX IF NOT EXISTS idx_article_events_post_date
  ON public.article_events (post_id, event_date);

-- 5. Pre-aggregated daily rollups for fast 7d / 30d / 90d admin charts
CREATE TABLE IF NOT EXISTS public.article_analytics_daily (
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  metric_date date NOT NULL,
  raw_views integer NOT NULL DEFAULT 0,
  unique_views integer NOT NULL DEFAULT 0,
  engaged_sessions integer NOT NULL DEFAULT 0,
  total_engaged_seconds bigint NOT NULL DEFAULT 0,
  scroll_25_count integer NOT NULL DEFAULT 0,
  scroll_50_count integer NOT NULL DEFAULT 0,
  scroll_75_count integer NOT NULL DEFAULT 0,
  scroll_100_count integer NOT NULL DEFAULT 0,
  share_clicks integer NOT NULL DEFAULT 0,
  cta_clicks integer NOT NULL DEFAULT 0,
  PRIMARY KEY (post_id, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_article_analytics_daily_metric_date
  ON public.article_analytics_daily (metric_date);

-- 6. Lock down all analytics tables (RLS enabled, service_role only)
ALTER TABLE public.article_view_dedup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_analytics_daily ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.article_view_dedup FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.article_sessions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.article_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.article_analytics_daily FROM PUBLIC, anon, authenticated;

-- 7. Atomic RPC: record_article_view
CREATE OR REPLACE FUNCTION public.record_article_view(
  p_post_id uuid,
  p_session_id text,
  p_view_date date,
  p_visitor_hash text,
  p_device_type text DEFAULT 'desktop',
  p_referrer_domain text DEFAULT NULL,
  p_traffic_source text DEFAULT 'direct',
  p_utm_source text DEFAULT NULL,
  p_utm_medium text DEFAULT NULL,
  p_utm_campaign text DEFAULT NULL,
  p_count_raw boolean DEFAULT true
)
RETURNS TABLE(counted_unique boolean, counted_raw boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_exists boolean;
  v_dedup_inserted integer := 0;
  v_session_inserted integer := 0;
  v_is_unique boolean := false;
  v_is_raw boolean := false;
  v_device text;
  v_source text;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.posts
    WHERE id = p_post_id
      AND status = 'published'
  ) INTO v_post_exists;

  IF NOT v_post_exists THEN
    RETURN QUERY SELECT false, false;
    RETURN;
  END IF;

  v_device := CASE
    WHEN p_device_type IN ('desktop', 'mobile', 'tablet') THEN p_device_type
    ELSE 'desktop'
  END;

  v_source := CASE
    WHEN p_traffic_source IN ('direct', 'organic', 'social', 'referral', 'campaign', 'internal') THEN p_traffic_source
    ELSE 'direct'
  END;

  INSERT INTO public.article_view_dedup (post_id, view_date, visitor_hash)
  VALUES (p_post_id, p_view_date, p_visitor_hash)
  ON CONFLICT (post_id, view_date, visitor_hash) DO NOTHING;

  GET DIAGNOSTICS v_dedup_inserted = ROW_COUNT;
  v_is_unique := (v_dedup_inserted > 0);

  INSERT INTO public.article_sessions (
    session_id,
    post_id,
    view_date,
    visitor_hash,
    is_unique,
    device_type,
    referrer_domain,
    traffic_source,
    utm_source,
    utm_medium,
    utm_campaign
  )
  VALUES (
    p_session_id,
    p_post_id,
    p_view_date,
    p_visitor_hash,
    v_is_unique,
    v_device,
    p_referrer_domain,
    v_source,
    p_utm_source,
    p_utm_medium,
    p_utm_campaign
  )
  ON CONFLICT (post_id, session_id) DO NOTHING;

  GET DIAGNOSTICS v_session_inserted = ROW_COUNT;
  v_is_raw := (v_session_inserted > 0) AND (p_count_raw OR v_is_unique);

  IF v_is_unique OR v_is_raw THEN
    UPDATE public.posts
    SET
      views = COALESCE(views, 0) + (CASE WHEN v_is_unique THEN 1 ELSE 0 END),
      raw_views = COALESCE(raw_views, 0) + (CASE WHEN v_is_raw THEN 1 ELSE 0 END)
    WHERE id = p_post_id;

    INSERT INTO public.article_analytics_daily (
      post_id,
      metric_date,
      raw_views,
      unique_views
    )
    VALUES (
      p_post_id,
      p_view_date,
      CASE WHEN v_is_raw THEN 1 ELSE 0 END,
      CASE WHEN v_is_unique THEN 1 ELSE 0 END
    )
    ON CONFLICT (post_id, metric_date) DO UPDATE
    SET
      raw_views = public.article_analytics_daily.raw_views + EXCLUDED.raw_views,
      unique_views = public.article_analytics_daily.unique_views + EXCLUDED.unique_views;
  END IF;

  RETURN QUERY SELECT v_is_unique, v_is_raw;
END;
$$;

-- 8. Atomic RPC: record_article_engagement (monotonic GREATEST deltas)
CREATE OR REPLACE FUNCTION public.record_article_engagement(
  p_post_id uuid,
  p_session_id text,
  p_engaged_seconds integer,
  p_max_scroll_pct smallint
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.article_sessions%ROWTYPE;
  v_clamped_seconds integer;
  v_clamped_scroll smallint;
  v_new_seconds integer;
  v_delta_seconds integer;
  v_delta_engaged_sessions integer;
  v_new_scroll smallint;
  v_new_25 boolean;
  v_new_50 boolean;
  v_new_75 boolean;
  v_new_100 boolean;
  v_delta_25 integer;
  v_delta_50 integer;
  v_delta_75 integer;
  v_delta_100 integer;
BEGIN
  v_clamped_seconds := LEAST(GREATEST(COALESCE(p_engaged_seconds, 0), 0), 7200);
  v_clamped_scroll := LEAST(GREATEST(COALESCE(p_max_scroll_pct, 0), 0), 100)::smallint;

  SELECT *
  INTO v_row
  FROM public.article_sessions
  WHERE post_id = p_post_id
    AND session_id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  v_new_seconds := GREATEST(v_row.engaged_seconds, v_clamped_seconds);
  v_delta_seconds := v_new_seconds - v_row.engaged_seconds;
  v_delta_engaged_sessions := CASE
    WHEN v_row.engaged_seconds = 0 AND v_new_seconds > 0 THEN 1
    ELSE 0
  END;

  v_new_scroll := GREATEST(v_row.max_scroll_pct, v_clamped_scroll);
  v_new_25 := v_row.reached_25 OR (v_new_scroll >= 25);
  v_new_50 := v_row.reached_50 OR (v_new_scroll >= 50);
  v_new_75 := v_row.reached_75 OR (v_new_scroll >= 75);
  v_new_100 := v_row.reached_100 OR (v_new_scroll >= 100);

  v_delta_25 := CASE WHEN NOT v_row.reached_25 AND v_new_25 THEN 1 ELSE 0 END;
  v_delta_50 := CASE WHEN NOT v_row.reached_50 AND v_new_50 THEN 1 ELSE 0 END;
  v_delta_75 := CASE WHEN NOT v_row.reached_75 AND v_new_75 THEN 1 ELSE 0 END;
  v_delta_100 := CASE WHEN NOT v_row.reached_100 AND v_new_100 THEN 1 ELSE 0 END;

  IF v_delta_seconds = 0
     AND v_new_scroll = v_row.max_scroll_pct
     AND v_delta_25 = 0
     AND v_delta_50 = 0
     AND v_delta_75 = 0
     AND v_delta_100 = 0 THEN
    RETURN;
  END IF;

  UPDATE public.article_sessions
  SET
    engaged_seconds = v_new_seconds,
    max_scroll_pct = v_new_scroll,
    reached_25 = v_new_25,
    reached_50 = v_new_50,
    reached_75 = v_new_75,
    reached_100 = v_new_100,
    updated_at = now()
  WHERE id = v_row.id;

  IF v_delta_seconds > 0
     OR v_delta_engaged_sessions > 0
     OR v_delta_25 > 0
     OR v_delta_50 > 0
     OR v_delta_75 > 0
     OR v_delta_100 > 0 THEN
    INSERT INTO public.article_analytics_daily (
      post_id,
      metric_date,
      engaged_sessions,
      total_engaged_seconds,
      scroll_25_count,
      scroll_50_count,
      scroll_75_count,
      scroll_100_count
    )
    VALUES (
      p_post_id,
      v_row.view_date,
      v_delta_engaged_sessions,
      v_delta_seconds,
      v_delta_25,
      v_delta_50,
      v_delta_75,
      v_delta_100
    )
    ON CONFLICT (post_id, metric_date) DO UPDATE
    SET
      engaged_sessions = public.article_analytics_daily.engaged_sessions + EXCLUDED.engaged_sessions,
      total_engaged_seconds = public.article_analytics_daily.total_engaged_seconds + EXCLUDED.total_engaged_seconds,
      scroll_25_count = public.article_analytics_daily.scroll_25_count + EXCLUDED.scroll_25_count,
      scroll_50_count = public.article_analytics_daily.scroll_50_count + EXCLUDED.scroll_50_count,
      scroll_75_count = public.article_analytics_daily.scroll_75_count + EXCLUDED.scroll_75_count,
      scroll_100_count = public.article_analytics_daily.scroll_100_count + EXCLUDED.scroll_100_count;
  END IF;
END;
$$;

-- 9. Atomic RPC: record_article_event
CREATE OR REPLACE FUNCTION public.record_article_event(
  p_post_id uuid,
  p_session_id text,
  p_event_date date,
  p_event_type text,
  p_target text DEFAULT NULL,
  p_device_type text DEFAULT 'desktop'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_exists boolean;
  v_device text;
  v_share_delta integer := 0;
  v_cta_delta integer := 0;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.posts
    WHERE id = p_post_id
      AND status = 'published'
  ) INTO v_post_exists;

  IF NOT v_post_exists THEN
    RETURN;
  END IF;

  IF p_event_type NOT IN (
    'share_whatsapp',
    'share_linkedin',
    'share_copy',
    'cta_whatsapp',
    'cta_primary',
    'related_click'
  ) THEN
    RETURN;
  END IF;

  v_device := CASE
    WHEN p_device_type IN ('desktop', 'mobile', 'tablet') THEN p_device_type
    ELSE 'desktop'
  END;

  INSERT INTO public.article_events (
    post_id,
    session_id,
    event_date,
    event_type,
    target,
    device_type
  )
  VALUES (
    p_post_id,
    p_session_id,
    p_event_date,
    p_event_type,
    left(p_target, 255),
    v_device
  );

  IF p_event_type IN ('share_whatsapp', 'share_linkedin', 'share_copy') THEN
    v_share_delta := 1;
  ELSIF p_event_type IN ('cta_whatsapp', 'cta_primary') THEN
    v_cta_delta := 1;
  END IF;

  IF v_share_delta > 0 OR v_cta_delta > 0 THEN
    INSERT INTO public.article_analytics_daily (
      post_id,
      metric_date,
      share_clicks,
      cta_clicks
    )
    VALUES (
      p_post_id,
      p_event_date,
      v_share_delta,
      v_cta_delta
    )
    ON CONFLICT (post_id, metric_date) DO UPDATE
    SET
      share_clicks = public.article_analytics_daily.share_clicks + EXCLUDED.share_clicks,
      cta_clicks = public.article_analytics_daily.cta_clicks + EXCLUDED.cta_clicks;
  END IF;
END;
$$;

-- 10. Restrict RPC execution strictly to service_role and lock down legacy increment_post_views
REVOKE ALL ON FUNCTION public.record_article_view(uuid, text, date, text, text, text, text, text, text, text, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_article_view(uuid, text, date, text, text, text, text, text, text, text, boolean) TO service_role;

REVOKE ALL ON FUNCTION public.record_article_engagement(uuid, text, integer, smallint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_article_engagement(uuid, text, integer, smallint) TO service_role;

REVOKE ALL ON FUNCTION public.record_article_event(uuid, text, date, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_article_event(uuid, text, date, text, text, text) TO service_role;

DO $$
BEGIN
  IF to_regprocedure('public.increment_post_views(uuid)') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.increment_post_views(uuid) FROM PUBLIC, anon, authenticated';
  END IF;
END
$$;
