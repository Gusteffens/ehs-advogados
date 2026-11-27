-- ============================================================
-- 005_security_and_analytics_rpc.sql
-- EHS Advocacia — Revocable admin sessions (token_version),
-- Supabase Storage bucket hardening (blog-covers), and
-- server-side SQL aggregation RPC for article analytics.
-- ============================================================

-- 1. Revocable admin sessions: add monotonic token_version to admin_users
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS token_version integer NOT NULL DEFAULT 1;

-- 2. Harden Supabase Storage bucket `blog-covers` (15MB max, image MIME allowlist)
UPDATE storage.buckets
SET file_size_limit = 15728640,
    allowed_mime_types = ARRAY[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif'
    ]
WHERE id = 'blog-covers';

-- 3. Server-side SQL aggregation RPC for analytics breakdowns (eliminates PostgREST 1,000-row cap)
CREATE OR REPLACE FUNCTION public.get_analytics_breakdowns(
  p_start date,
  p_end date,
  p_post_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH filtered_sessions AS (
    SELECT
      COALESCE(NULLIF(traffic_source, ''), 'direct') AS traffic_source,
      NULLIF(referrer_domain, '') AS referrer_domain,
      COALESCE(NULLIF(device_type, ''), 'desktop') AS device_type
    FROM public.article_sessions
    WHERE view_date >= p_start
      AND view_date <= p_end
      AND (p_post_id IS NULL OR post_id = p_post_id)
  ),
  filtered_events AS (
    SELECT
      NULLIF(event_type, '') AS event_type
    FROM public.article_events
    WHERE event_date >= p_start
      AND event_date <= p_end
      AND (p_post_id IS NULL OR post_id = p_post_id)
      AND event_type IS NOT NULL
      AND event_type <> ''
  ),
  traffic_sources AS (
    SELECT
      traffic_source AS label,
      COUNT(*)::int AS count
    FROM filtered_sessions
    GROUP BY traffic_source
    ORDER BY count DESC, label ASC
  ),
  top_referrers AS (
    SELECT
      referrer_domain AS label,
      COUNT(*)::int AS count
    FROM filtered_sessions
    WHERE referrer_domain IS NOT NULL
      AND traffic_source <> 'internal'
    GROUP BY referrer_domain
    ORDER BY count DESC, label ASC
    LIMIT 8
  ),
  devices AS (
    SELECT
      device_type AS label,
      COUNT(*)::int AS count
    FROM filtered_sessions
    GROUP BY device_type
    ORDER BY count DESC, label ASC
  ),
  events_breakdown AS (
    SELECT
      event_type AS label,
      COUNT(*)::int AS count
    FROM filtered_events
    GROUP BY event_type
    ORDER BY count DESC, label ASC
  )
  SELECT jsonb_build_object(
    'trafficSources', COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('label', label, 'count', count)) FROM traffic_sources),
      '[]'::jsonb
    ),
    'topReferrers', COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('label', label, 'count', count)) FROM top_referrers),
      '[]'::jsonb
    ),
    'devices', COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('label', label, 'count', count)) FROM devices),
      '[]'::jsonb
    ),
    'eventsBreakdown', COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('label', label, 'count', count)) FROM events_breakdown),
      '[]'::jsonb
    ),
    'totalSessions', COALESCE((SELECT COUNT(*)::int FROM filtered_sessions), 0),
    'totalEvents', COALESCE((SELECT COUNT(*)::int FROM filtered_events), 0)
  );
$$;

REVOKE ALL ON FUNCTION public.get_analytics_breakdowns(date, date, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_analytics_breakdowns(date, date, uuid) TO service_role;
