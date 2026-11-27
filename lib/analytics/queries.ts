import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSaoPauloDateString } from "@/lib/analytics/visitor";
import type {
  AnalyticsOverviewResponse,
  AnalyticsRange,
  AnalyticsSummary,
  AnalyticsTimeseriesPoint,
  BreakdownItem,
  PostAnalyticsResponse,
  ScrollFunnel,
  TopArticleMetric,
} from "@/types/analytics";

const RANGE_DAYS: Record<AnalyticsRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export function parseAnalyticsRange(
  raw: string | null | undefined
): AnalyticsRange {
  if (raw === "7d" || raw === "30d" || raw === "90d") {
    return raw;
  }
  return "30d";
}

function shiftDateString(isoDate: string, deltaDays: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
  const year = dt.getUTCFullYear();
  const month = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dt.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildDateSequence(startDate: string, days: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < days; i += 1) {
    dates.push(shiftDateString(startDate, i));
  }
  return dates;
}

function isMissingSchemaError(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  if (
    error.code === "42P01" ||
    error.code === "42703" ||
    error.code === "PGRST205" ||
    error.code === "PGRST204"
  ) {
    return true;
  }
  const msg = (error.message ?? "").toLowerCase();
  return (
    msg.includes("does not exist") ||
    msg.includes("could not find the table") ||
    msg.includes("schema cache")
  );
}

function roundOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function buildBreakdown(
  counts: Map<string, number>,
  limit?: number
): BreakdownItem[] {
  const entries = Array.from(counts.entries())
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  const sliced = typeof limit === "number" ? entries.slice(0, limit) : entries;

  return sliced.map(([label, count]) => ({
    label,
    count,
    pct: total > 0 ? roundOneDecimal((count / total) * 100) : 0,
  }));
}

function emptySummary(): AnalyticsSummary {
  return {
    uniqueViews: 0,
    rawViews: 0,
    prevUniqueViews: 0,
    deltaPct: null,
    avgReadTimeSec: 0,
    completionRatePct: 0,
    shareClicks: 0,
    ctaClicks: 0,
    engagedSessions: 0,
  };
}

function emptyFunnel(): ScrollFunnel {
  return {
    reached25Pct: 0,
    reached50Pct: 0,
    reached75Pct: 0,
    reached100Pct: 0,
  };
}

function computeScrollFunnel(params: {
  rawViews: number;
  engagedSessions: number;
  scroll25: number;
  scroll50: number;
  scroll75: number;
  scroll100: number;
}): ScrollFunnel {
  const denominator = Math.max(
    params.rawViews,
    params.engagedSessions,
    params.scroll25
  );
  if (denominator <= 0) {
    return emptyFunnel();
  }

  const pct = (count: number) =>
    Math.min(100, roundOneDecimal((count / denominator) * 100));

  return {
    reached25Pct: pct(params.scroll25),
    reached50Pct: pct(params.scroll50),
    reached75Pct: pct(params.scroll75),
    reached100Pct: pct(params.scroll100),
  };
}

interface DailyRow {
  post_id: string;
  metric_date: string;
  raw_views: number;
  unique_views: number;
  engaged_sessions: number;
  total_engaged_seconds: number;
  scroll_25_count: number;
  scroll_50_count: number;
  scroll_75_count: number;
  scroll_100_count: number;
  share_clicks: number;
  cta_clicks: number;
}

interface SessionBreakdownRow {
  traffic_source: string | null;
  referrer_domain: string | null;
  device_type: string | null;
}

interface PostMetaRow {
  id: string;
  title: string;
  slug: string;
  views: number | null;
  categories: { name: string } | { name: string }[] | null;
}

function extractCategoryName(
  categories: { name: string } | { name: string }[] | null | undefined
): string | null {
  if (!categories) return null;
  if (Array.isArray(categories)) {
    return categories[0]?.name ?? null;
  }
  return categories.name ?? null;
}

function aggregateWindowMetrics(
  dailyRows: DailyRow[],
  startDate: string,
  dates: string[]
): {
  summary: AnalyticsSummary;
  timeseries: AnalyticsTimeseriesPoint[];
  scrollFunnel: ScrollFunnel;
} {
  let uniqueViews = 0;
  let rawViews = 0;
  let prevUniqueViews = 0;
  let engagedSessions = 0;
  let totalEngagedSeconds = 0;
  let scroll25 = 0;
  let scroll50 = 0;
  let scroll75 = 0;
  let scroll100 = 0;
  let shareClicks = 0;
  let ctaClicks = 0;

  const dayMap = new Map<string, AnalyticsTimeseriesPoint>();
  for (const date of dates) {
    dayMap.set(date, { date, uniqueViews: 0, rawViews: 0, ctaClicks: 0 });
  }

  for (const row of dailyRows) {
    if (row.metric_date < startDate) {
      prevUniqueViews += row.unique_views ?? 0;
      continue;
    }

    uniqueViews += row.unique_views ?? 0;
    rawViews += row.raw_views ?? 0;
    engagedSessions += row.engaged_sessions ?? 0;
    totalEngagedSeconds += Number(row.total_engaged_seconds ?? 0);
    scroll25 += row.scroll_25_count ?? 0;
    scroll50 += row.scroll_50_count ?? 0;
    scroll75 += row.scroll_75_count ?? 0;
    scroll100 += row.scroll_100_count ?? 0;
    shareClicks += row.share_clicks ?? 0;
    ctaClicks += row.cta_clicks ?? 0;

    const bucket = dayMap.get(row.metric_date);
    if (bucket) {
      bucket.uniqueViews += row.unique_views ?? 0;
      bucket.rawViews += row.raw_views ?? 0;
      bucket.ctaClicks += row.cta_clicks ?? 0;
    }
  }

  const scrollFunnel = computeScrollFunnel({
    rawViews,
    engagedSessions,
    scroll25,
    scroll50,
    scroll75,
    scroll100,
  });

  const deltaPct =
    prevUniqueViews > 0
      ? roundOneDecimal(((uniqueViews - prevUniqueViews) / prevUniqueViews) * 100)
      : null;

  const avgReadTimeSec =
    engagedSessions > 0 ? Math.round(totalEngagedSeconds / engagedSessions) : 0;

  return {
    summary: {
      uniqueViews,
      rawViews,
      prevUniqueViews,
      deltaPct,
      avgReadTimeSec,
      completionRatePct: scrollFunnel.reached75Pct,
      shareClicks,
      ctaClicks,
      engagedSessions,
    },
    timeseries: dates.map((d) => dayMap.get(d)!),
    scrollFunnel,
  };
}

function aggregateSessionBreakdowns(rows: SessionBreakdownRow[]): {
  trafficSources: BreakdownItem[];
  topReferrers: BreakdownItem[];
  devices: BreakdownItem[];
} {
  const sourceCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();

  for (const row of rows) {
    const source = row.traffic_source || "direct";
    sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);

    const device = row.device_type || "desktop";
    deviceCounts.set(device, (deviceCounts.get(device) ?? 0) + 1);

    if (row.referrer_domain && source !== "internal") {
      referrerCounts.set(
        row.referrer_domain,
        (referrerCounts.get(row.referrer_domain) ?? 0) + 1
      );
    }
  }

  return {
    trafficSources: buildBreakdown(sourceCounts),
    topReferrers: buildBreakdown(referrerCounts, 8),
    devices: buildBreakdown(deviceCounts),
  };
}

export async function getAnalyticsOverview(
  range: AnalyticsRange = "30d"
): Promise<AnalyticsOverviewResponse> {
  const supabase = createAdminClient();
  const days = RANGE_DAYS[range];
  const endDate = getSaoPauloDateString();
  const startDate = shiftDateString(endDate, -(days - 1));
  const prevStartDate = shiftDateString(startDate, -days);
  const dates = buildDateSequence(startDate, days);

  const [postsRes, dailyRes, sessionsRes] = await Promise.all([
    supabase
      .from("posts")
      .select("id, title, slug, views, categories(name)")
      .eq("status", "published")
      .order("views", { ascending: false }),
    supabase
      .from("article_analytics_daily")
      .select(
        "post_id, metric_date, raw_views, unique_views, engaged_sessions, total_engaged_seconds, scroll_25_count, scroll_50_count, scroll_75_count, scroll_100_count, share_clicks, cta_clicks"
      )
      .gte("metric_date", prevStartDate)
      .lte("metric_date", endDate),
    supabase
      .from("article_sessions")
      .select("traffic_source, referrer_domain, device_type")
      .gte("view_date", startDate)
      .lte("view_date", endDate),
  ]);

  const posts = (postsRes.data ?? []) as unknown as PostMetaRow[];
  const postMap = new Map<string, PostMetaRow>();
  for (const post of posts) {
    postMap.set(post.id, post);
  }

  if (
    isMissingSchemaError(dailyRes.error) ||
    isMissingSchemaError(sessionsRes.error)
  ) {
    const fallbackArticles: TopArticleMetric[] = posts
      .slice(0, 15)
      .map((post) => ({
        postId: post.id,
        title: post.title,
        slug: post.slug,
        categoryName: extractCategoryName(post.categories),
        uniqueViews: post.views ?? 0,
        rawViews: post.views ?? 0,
        avgReadTimeSec: 0,
        completionRatePct: 0,
        shareClicks: 0,
        ctaClicks: 0,
      }));

    return {
      range,
      migrationReady: false,
      summary: emptySummary(),
      timeseries: dates.map((date) => ({
        date,
        uniqueViews: 0,
        rawViews: 0,
        ctaClicks: 0,
      })),
      topArticles: fallbackArticles,
      scrollFunnel: emptyFunnel(),
      trafficSources: [],
      topReferrers: [],
      devices: [],
    };
  }

  const dailyRows = (dailyRes.data ?? []) as unknown as DailyRow[];
  const sessionRows = (sessionsRes.data ?? []) as unknown as SessionBreakdownRow[];

  const { summary, timeseries, scrollFunnel } = aggregateWindowMetrics(
    dailyRows,
    startDate,
    dates
  );

  const perPostAgg = new Map<
    string,
    {
      uniqueViews: number;
      rawViews: number;
      engagedSessions: number;
      totalEngagedSeconds: number;
      scroll75: number;
      shareClicks: number;
      ctaClicks: number;
    }
  >();

  for (const row of dailyRows) {
    if (row.metric_date < startDate) continue;
    const current = perPostAgg.get(row.post_id) ?? {
      uniqueViews: 0,
      rawViews: 0,
      engagedSessions: 0,
      totalEngagedSeconds: 0,
      scroll75: 0,
      shareClicks: 0,
      ctaClicks: 0,
    };

    current.uniqueViews += row.unique_views ?? 0;
    current.rawViews += row.raw_views ?? 0;
    current.engagedSessions += row.engaged_sessions ?? 0;
    current.totalEngagedSeconds += Number(row.total_engaged_seconds ?? 0);
    current.scroll75 += row.scroll_75_count ?? 0;
    current.shareClicks += row.share_clicks ?? 0;
    current.ctaClicks += row.cta_clicks ?? 0;

    perPostAgg.set(row.post_id, current);
  }

  let topArticles: TopArticleMetric[] = Array.from(perPostAgg.entries())
    .map(([postId, agg]) => {
      const meta = postMap.get(postId);
      if (!meta) return null;
      const base = Math.max(agg.rawViews, agg.engagedSessions, agg.scroll75);
      return {
        postId,
        title: meta.title,
        slug: meta.slug,
        categoryName: extractCategoryName(meta.categories),
        uniqueViews: agg.uniqueViews,
        rawViews: agg.rawViews,
        avgReadTimeSec:
          agg.engagedSessions > 0
            ? Math.round(agg.totalEngagedSeconds / agg.engagedSessions)
            : 0,
        completionRatePct:
          base > 0 ? Math.min(100, roundOneDecimal((agg.scroll75 / base) * 100)) : 0,
        shareClicks: agg.shareClicks,
        ctaClicks: agg.ctaClicks,
      };
    })
    .filter((item): item is TopArticleMetric => item !== null)
    .sort((a, b) => b.uniqueViews - a.uniqueViews || b.rawViews - a.rawViews)
    .slice(0, 20);

  if (topArticles.length === 0 && posts.length > 0) {
    topArticles = posts.slice(0, 10).map((post) => ({
      postId: post.id,
      title: post.title,
      slug: post.slug,
      categoryName: extractCategoryName(post.categories),
      uniqueViews: 0,
      rawViews: 0,
      avgReadTimeSec: 0,
      completionRatePct: 0,
      shareClicks: 0,
      ctaClicks: 0,
    }));
  }

  const { trafficSources, topReferrers, devices } =
    aggregateSessionBreakdowns(sessionRows);

  return {
    range,
    migrationReady: true,
    summary,
    timeseries,
    topArticles,
    scrollFunnel,
    trafficSources,
    topReferrers,
    devices,
  };
}

export async function getPostAnalytics(
  postId: string,
  range: AnalyticsRange = "30d"
): Promise<PostAnalyticsResponse | null> {
  const supabase = createAdminClient();
  const days = RANGE_DAYS[range];
  const endDate = getSaoPauloDateString();
  const startDate = shiftDateString(endDate, -(days - 1));
  const prevStartDate = shiftDateString(startDate, -days);
  const dates = buildDateSequence(startDate, days);

  let postData: {
    id: string;
    title: string;
    slug: string;
    views: number;
    rawViews: number;
  } | null = null;
  let postMissingRawViews = false;

  const postWithRawRes = await supabase
    .from("posts")
    .select("id, title, slug, views, raw_views")
    .eq("id", postId)
    .maybeSingle();

  if (isMissingSchemaError(postWithRawRes.error)) {
    postMissingRawViews = true;
    const fallbackPostRes = await supabase
      .from("posts")
      .select("id, title, slug, views")
      .eq("id", postId)
      .maybeSingle();

    if (fallbackPostRes.data) {
      postData = {
        id: fallbackPostRes.data.id,
        title: fallbackPostRes.data.title,
        slug: fallbackPostRes.data.slug,
        views: fallbackPostRes.data.views ?? 0,
        rawViews: fallbackPostRes.data.views ?? 0,
      };
    }
  } else if (postWithRawRes.data) {
    postData = {
      id: postWithRawRes.data.id,
      title: postWithRawRes.data.title,
      slug: postWithRawRes.data.slug,
      views: postWithRawRes.data.views ?? 0,
      rawViews: postWithRawRes.data.raw_views ?? postWithRawRes.data.views ?? 0,
    };
  }

  if (!postData) {
    return null;
  }

  const [dailyRes, sessionsRes, eventsRes] = await Promise.all([
    supabase
      .from("article_analytics_daily")
      .select(
        "post_id, metric_date, raw_views, unique_views, engaged_sessions, total_engaged_seconds, scroll_25_count, scroll_50_count, scroll_75_count, scroll_100_count, share_clicks, cta_clicks"
      )
      .eq("post_id", postId)
      .gte("metric_date", prevStartDate)
      .lte("metric_date", endDate),
    supabase
      .from("article_sessions")
      .select("traffic_source, referrer_domain, device_type")
      .eq("post_id", postId)
      .gte("view_date", startDate)
      .lte("view_date", endDate),
    supabase
      .from("article_events")
      .select("event_type")
      .eq("post_id", postId)
      .gte("event_date", startDate)
      .lte("event_date", endDate),
  ]);

  if (
    postMissingRawViews ||
    isMissingSchemaError(dailyRes.error) ||
    isMissingSchemaError(sessionsRes.error) ||
    isMissingSchemaError(eventsRes.error)
  ) {
    return {
      range,
      migrationReady: false,
      post: postData,
      summary: emptySummary(),
      timeseries: dates.map((date) => ({
        date,
        uniqueViews: 0,
        rawViews: 0,
        ctaClicks: 0,
      })),
      scrollFunnel: emptyFunnel(),
      trafficSources: [],
      topReferrers: [],
      devices: [],
      eventsBreakdown: [],
    };
  }

  const dailyRows = (dailyRes.data ?? []) as unknown as DailyRow[];
  const sessionRows = (sessionsRes.data ?? []) as unknown as SessionBreakdownRow[];
  const eventRows = (eventsRes.data ?? []) as unknown as { event_type: string }[];

  const { summary, timeseries, scrollFunnel } = aggregateWindowMetrics(
    dailyRows,
    startDate,
    dates
  );

  const { trafficSources, topReferrers, devices } =
    aggregateSessionBreakdowns(sessionRows);

  const eventCounts = new Map<string, number>();
  for (const row of eventRows) {
    if (row.event_type) {
      eventCounts.set(row.event_type, (eventCounts.get(row.event_type) ?? 0) + 1);
    }
  }

  return {
    range,
    migrationReady: true,
    post: postData,
    summary,
    timeseries,
    scrollFunnel,
    trafficSources,
    topReferrers,
    devices,
    eventsBreakdown: buildBreakdown(eventCounts),
  };
}
