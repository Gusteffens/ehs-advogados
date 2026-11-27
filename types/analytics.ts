export type AnalyticsRange = "7d" | "30d" | "90d";

export type ArticleEventType =
  | "share_whatsapp"
  | "share_linkedin"
  | "share_copy"
  | "cta_whatsapp"
  | "cta_primary"
  | "related_click";

export type AnalyticsDeviceType = "desktop" | "mobile" | "tablet";

export type AnalyticsTrafficSource =
  | "direct"
  | "organic"
  | "social"
  | "referral"
  | "campaign"
  | "internal";

export interface AnalyticsSummary {
  uniqueViews: number;
  rawViews: number;
  prevUniqueViews: number;
  deltaPct: number | null;
  avgReadTimeSec: number;
  completionRatePct: number;
  shareClicks: number;
  ctaClicks: number;
  engagedSessions: number;
}

export interface AnalyticsTimeseriesPoint {
  date: string;
  uniqueViews: number;
  rawViews: number;
  ctaClicks: number;
}

export interface TopArticleMetric {
  postId: string;
  title: string;
  slug: string;
  categoryName: string | null;
  uniqueViews: number;
  rawViews: number;
  avgReadTimeSec: number;
  completionRatePct: number;
  shareClicks: number;
  ctaClicks: number;
}

export interface ScrollFunnel {
  reached25Pct: number;
  reached50Pct: number;
  reached75Pct: number;
  reached100Pct: number;
}

export interface BreakdownItem {
  label: string;
  count: number;
  pct: number;
}

export interface AnalyticsOverviewResponse {
  range: AnalyticsRange;
  migrationReady: boolean;
  summary: AnalyticsSummary;
  timeseries: AnalyticsTimeseriesPoint[];
  topArticles: TopArticleMetric[];
  scrollFunnel: ScrollFunnel;
  trafficSources: BreakdownItem[];
  topReferrers: BreakdownItem[];
  devices: BreakdownItem[];
}

export interface PostAnalyticsResponse {
  range: AnalyticsRange;
  migrationReady: boolean;
  post: {
    id: string;
    title: string;
    slug: string;
    views: number;
    rawViews: number;
  };
  summary: AnalyticsSummary;
  timeseries: AnalyticsTimeseriesPoint[];
  scrollFunnel: ScrollFunnel;
  trafficSources: BreakdownItem[];
  topReferrers: BreakdownItem[];
  devices: BreakdownItem[];
  eventsBreakdown: BreakdownItem[];
}
