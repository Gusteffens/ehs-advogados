import "server-only";
import { createHash, createHmac } from "node:crypto";
import { SITE_CONFIG } from "@/lib/site-config";
import type { AnalyticsDeviceType, AnalyticsTrafficSource } from "@/types/analytics";

const SAO_PAULO_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const SEARCH_ENGINE_DOMAINS = [
  "google.",
  "bing.com",
  "duckduckgo.com",
  "search.yahoo.com",
  "br.search.yahoo.com",
  "yahoo.com",
  "ecosia.org",
  "search.brave.com",
  "yandex.",
  "baidu.com",
  "perplexity.ai",
  "chatgpt.com",
];

const SOCIAL_DOMAINS = [
  "instagram.com",
  "l.instagram.com",
  "facebook.com",
  "m.facebook.com",
  "l.facebook.com",
  "lm.facebook.com",
  "fb.com",
  "linkedin.com",
  "lnkd.in",
  "t.co",
  "twitter.com",
  "x.com",
  "whatsapp.com",
  "wa.me",
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "threads.net",
  "pinterest.com",
  "reddit.com",
];

let cachedSalt: string | null = null;

function getAnalyticsSalt(): string {
  if (cachedSalt) {
    return cachedSalt;
  }

  const configured = process.env.ANALYTICS_HASH_SALT?.trim();
  if (configured && configured.length >= 16) {
    cachedSalt = configured;
    return cachedSalt;
  }

  const seed =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "ehs-local-dev-analytics-salt";

  cachedSalt = createHash("sha256")
    .update(`ehs:analytics:salt:v1:${seed}`)
    .digest("hex");

  return cachedSalt;
}

/**
 * Returns YYYY-MM-DD in America/Sao_Paulo timezone.
 */
export function getSaoPauloDateString(date: Date = new Date()): string {
  return SAO_PAULO_DATE_FORMATTER.format(date);
}

/**
 * Extracts client IP preferring Cloudflare -> Reverse Proxy -> X-Forwarded-For.
 */
export function extractClientIp(headers: Headers): string {
  const cfIp = headers.get("cf-connecting-ip")?.trim();
  if (cfIp) {
    return cfIp;
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return "unknown";
}

/**
 * Normalizes a User-Agent string for consistent hashing without retaining excessive length.
 */
export function normalizeUserAgent(ua: string | null | undefined): string {
  if (!ua) {
    return "";
  }
  return ua.trim().replace(/\s+/g, " ").toLowerCase().slice(0, 200);
}

/**
 * Computes a daily rotating, irreversible HMAC-SHA256 visitor hash (LGPD-safe, zero PII).
 */
export function computeDailyVisitorHash(
  ip: string,
  userAgent: string,
  dayBucket: string
): string {
  const salt = getAnalyticsSalt();
  const normalizedUa = normalizeUserAgent(userAgent);
  return createHmac("sha256", salt)
    .update(`${dayBucket}:${ip}:${normalizedUa}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Classifies device type from User-Agent without heavy parsing dependencies.
 */
export function detectDeviceType(
  userAgent: string | null | undefined
): AnalyticsDeviceType {
  const ua = (userAgent ?? "").toLowerCase();

  if (
    /ipad|tablet|playbook|silk|(android(?!.*mobi))/i.test(ua)
  ) {
    return "tablet";
  }

  if (
    /mobi|iphone|ipod|android|blackberry|iemobile|opera mini|windows phone/i.test(ua)
  ) {
    return "mobile";
  }

  return "desktop";
}

function normalizeHostname(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) {
    return null;
  }
  try {
    const parsed = new URL(rawUrl);
    return parsed.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

function getConfiguredSiteHost(): string | null {
  return normalizeHostname(SITE_CONFIG.url);
}

function matchesDomainList(hostname: string, list: string[]): boolean {
  return list.some((pattern) => {
    if (pattern.endsWith(".")) {
      return hostname.startsWith(pattern) || hostname.includes(`.${pattern}`);
    }
    return hostname === pattern || hostname.endsWith(`.${pattern}`);
  });
}

/**
 * Extracts normalized referrer domain and classifies the traffic source.
 */
export function classifyTraffic(params: {
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  requestHost?: string | null;
}): {
  referrerDomain: string | null;
  trafficSource: AnalyticsTrafficSource;
} {
  const referrerDomain = normalizeHostname(params.referrer);
  const utmSource = params.utmSource?.trim().toLowerCase() || null;
  const utmMedium = params.utmMedium?.trim().toLowerCase() || null;

  if (utmMedium || utmSource) {
    if (
      utmSource &&
      /(instagram|facebook|fb|linkedin|whatsapp|tiktok|youtube|twitter|x|social)/i.test(
        utmSource
      ) &&
      !/(cpc|ppc|paid|ads|display)/i.test(utmMedium ?? "")
    ) {
      return { referrerDomain, trafficSource: "social" };
    }
    return { referrerDomain, trafficSource: "campaign" };
  }

  if (!referrerDomain) {
    return { referrerDomain: null, trafficSource: "direct" };
  }

  const siteHost = getConfiguredSiteHost();
  const normalizedRequestHost = params.requestHost
    ?.split(":")[0]
    ?.toLowerCase()
    .replace(/^www\./, "");

  if (
    (siteHost && referrerDomain === siteHost) ||
    (normalizedRequestHost && referrerDomain === normalizedRequestHost) ||
    referrerDomain === "localhost" ||
    referrerDomain === "127.0.0.1"
  ) {
    return { referrerDomain, trafficSource: "internal" };
  }

  if (matchesDomainList(referrerDomain, SEARCH_ENGINE_DOMAINS)) {
    return { referrerDomain, trafficSource: "organic" };
  }

  if (matchesDomainList(referrerDomain, SOCIAL_DOMAINS)) {
    return { referrerDomain, trafficSource: "social" };
  }

  return { referrerDomain, trafficSource: "referral" };
}

/**
 * Verifies same-origin Origin or Referer header to block cross-site beacon abuse.
 */
export function isAllowedAnalyticsOrigin(headers: Headers): boolean {
  const originHeader = headers.get("origin");
  const refererHeader = headers.get("referer");
  const candidate = originHeader || refererHeader;

  if (!candidate) {
    return false;
  }

  const candidateHost = normalizeHostname(candidate);
  if (!candidateHost) {
    return false;
  }

  const allowedHosts = new Set<string>();
  const siteHost = getConfiguredSiteHost();
  if (siteHost) {
    allowedHosts.add(siteHost);
  }

  const requestHost = headers
    .get("host")
    ?.split(":")[0]
    ?.toLowerCase()
    .replace(/^www\./, "");
  if (requestHost) {
    allowedHosts.add(requestHost);
  }

  const vercelHost = process.env.VERCEL_URL
    ?.toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "");
  if (vercelHost) {
    allowedHosts.add(vercelHost);
  }

  if (process.env.NODE_ENV !== "production") {
    allowedHosts.add("localhost");
    allowedHosts.add("127.0.0.1");
  }

  return allowedHosts.has(candidateHost);
}
