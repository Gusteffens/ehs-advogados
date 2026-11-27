import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAnalyticsCollectRatelimit, getRedisClient } from "@/lib/upstash";
import { isBotUserAgent, isPrefetchRequest } from "@/lib/analytics/bot-filter";
import {
  classifyTraffic,
  computeDailyVisitorHash,
  detectDeviceType,
  extractClientIp,
  getSaoPauloDateString,
  isAllowedAnalyticsOrigin,
} from "@/lib/analytics/visitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8192;

const sessionIdSchema = z
  .string()
  .trim()
  .min(8)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/);

const optionalShortString = z
  .string()
  .trim()
  .max(255)
  .optional()
  .nullable();

const viewBeaconSchema = z.object({
  type: z.literal("view"),
  postId: z.string().uuid(),
  sessionId: sessionIdSchema,
  referrer: z.string().trim().max(1024).optional().nullable(),
  utmSource: optionalShortString,
  utmMedium: optionalShortString,
  utmCampaign: optionalShortString,
});

const engagementBeaconSchema = z.object({
  type: z.literal("engagement"),
  postId: z.string().uuid(),
  sessionId: sessionIdSchema,
  engagedSeconds: z.number().int().min(0).max(7200),
  maxScrollPct: z.number().int().min(0).max(100),
});

const eventBeaconSchema = z.object({
  type: z.literal("event"),
  postId: z.string().uuid(),
  sessionId: sessionIdSchema.optional().nullable(),
  eventType: z.enum([
    "share_whatsapp",
    "share_linkedin",
    "share_copy",
    "cta_whatsapp",
    "cta_primary",
    "related_click",
  ]),
  target: optionalShortString,
});

const collectPayloadSchema = z.discriminatedUnion("type", [
  viewBeaconSchema,
  engagementBeaconSchema,
  eventBeaconSchema,
]);

function noContent(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}

function isMissingRpcError(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  if (error.code === "42883" || error.code === "PGRST202" || error.code === "42P01") {
    return true;
  }
  const msg = (error.message ?? "").toLowerCase();
  return msg.includes("could not find the function") || msg.includes("does not exist");
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
    if (
      contentType &&
      !contentType.includes("application/json") &&
      !contentType.includes("text/plain")
    ) {
      return noContent();
    }

    if (!isAllowedAnalyticsOrigin(request.headers)) {
      return new NextResponse(null, {
        status: 403,
        headers: { "Cache-Control": "no-store" },
      });
    }

    if (isPrefetchRequest(request.headers)) {
      return noContent();
    }

    const userAgent = request.headers.get("user-agent") ?? "";
    if (isBotUserAgent(userAgent)) {
      return noContent();
    }

    // Exclude authenticated admins from inflating article metrics
    try {
      const session = await getAdminSession();
      if (session.isAdmin) {
        return noContent();
      }
    } catch {
      // Never block public analytics if session lookup fails
    }

    const ip = extractClientIp(request.headers);

    const ratelimit = getAnalyticsCollectRatelimit();
    if (ratelimit) {
      try {
        const { success } = await ratelimit.limit(ip);
        if (!success) {
          return noContent();
        }
      } catch {
        // Proceed with DB-level safeguards if Redis is unreachable
      }
    }

    const rawText = await request.text();
    if (!rawText || rawText.length > MAX_BODY_BYTES) {
      return noContent();
    }

    let jsonBody: unknown;
    try {
      jsonBody = JSON.parse(rawText);
    } catch {
      return new NextResponse(null, {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const parsed = collectPayloadSchema.safeParse(jsonBody);
    if (!parsed.success) {
      return new NextResponse(null, {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const payload = parsed.data;
    const dayBucket = getSaoPauloDateString();
    const deviceType = detectDeviceType(userAgent);
    const supabase = createAdminClient();

    if (payload.type === "view") {
      const visitorHash = computeDailyVisitorHash(ip, userAgent, dayBucket);
      const { referrerDomain, trafficSource } = classifyTraffic({
        referrer: payload.referrer,
        utmSource: payload.utmSource,
        utmMedium: payload.utmMedium,
        requestHost: request.headers.get("host"),
      });

      let countRaw = true;
      const redis = getRedisClient();
      const uniqueKey = `ehs:av:u:${payload.postId}:${dayBucket}:${visitorHash}`;
      const rawThrottleKey = `ehs:av:r:${payload.postId}:${visitorHash}`;

      // Fast-path read only — never persist dedup keys before DB RPC succeeds
      if (redis) {
        try {
          const [uniqueExists, rawExists] = await Promise.all([
            redis.get(uniqueKey),
            redis.get(rawThrottleKey),
          ]);

          countRaw = !uniqueExists || !rawExists;
        } catch {
          // Fall back cleanly to DB UNIQUE(post_id, view_date, visitor_hash)
          countRaw = true;
        }
      }

      const { error } = await supabase.rpc("record_article_view", {
        p_post_id: payload.postId,
        p_session_id: payload.sessionId,
        p_view_date: dayBucket,
        p_visitor_hash: visitorHash,
        p_device_type: deviceType,
        p_referrer_domain: referrerDomain,
        p_traffic_source: trafficSource,
        p_utm_source: payload.utmSource ?? null,
        p_utm_medium: payload.utmMedium ?? null,
        p_utm_campaign: payload.utmCampaign ?? null,
        p_count_raw: countRaw,
      });

      if (error) {
        if (!isMissingRpcError(error)) {
          console.error("[analytics/collect] record_article_view failed:", error.message);
        }
        return noContent();
      }

      // Persist Redis dedup/throttle keys only after the DB RPC succeeded
      if (redis) {
        try {
          await Promise.all([
            redis.set(uniqueKey, "1", { nx: true, ex: 86400 }),
            redis.set(rawThrottleKey, "1", { nx: true, ex: 60 }),
          ]);
        } catch {
          // Non-blocking: DB-level UNIQUE constraint remains authoritative
        }
      }

      return noContent();
    }

    if (payload.type === "engagement") {
      const { error } = await supabase.rpc("record_article_engagement", {
        p_post_id: payload.postId,
        p_session_id: payload.sessionId,
        p_engaged_seconds: payload.engagedSeconds,
        p_max_scroll_pct: payload.maxScrollPct,
      });

      if (error && !isMissingRpcError(error)) {
        console.error("[analytics/collect] record_article_engagement failed:", error.message);
      }

      return noContent();
    }

    if (payload.type === "event") {
      const { error } = await supabase.rpc("record_article_event", {
        p_post_id: payload.postId,
        p_session_id: payload.sessionId ?? null,
        p_event_date: dayBucket,
        p_event_type: payload.eventType,
        p_target: payload.target ?? null,
        p_device_type: deviceType,
      });

      if (error && !isMissingRpcError(error)) {
        console.error("[analytics/collect] record_article_event failed:", error.message);
      }

      return noContent();
    }

    return noContent();
  } catch (err) {
    console.error("[analytics/collect] unexpected error:", err);
    return noContent();
  }
}
