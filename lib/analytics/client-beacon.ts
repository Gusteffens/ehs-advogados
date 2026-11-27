"use client";

import posthog from "posthog-js";
import { getConsentState } from "@/lib/tracking";
import type { ArticleEventType } from "@/types/analytics";

const COLLECT_ENDPOINT = "/api/analytics/collect";

export type AnalyticsBeaconPayload =
  | {
      type: "view";
      postId: string;
      sessionId: string;
      referrer?: string | null;
      utmSource?: string | null;
      utmMedium?: string | null;
      utmCampaign?: string | null;
    }
  | {
      type: "engagement";
      postId: string;
      sessionId: string;
      engagedSeconds: number;
      maxScrollPct: number;
    }
  | {
      type: "event";
      postId: string;
      sessionId?: string | null;
      eventType: ArticleEventType;
      target?: string | null;
    };

const activeSessions = new Map<string, string>();

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "");
  }
  const randomPart = Math.random().toString(36).slice(2, 14);
  const timePart = Date.now().toString(36);
  return `${timePart}_${randomPart}`.replace(/[^a-zA-Z0-9_-]/g, "");
}

export function setArticleSessionId(postId: string, sessionId: string): void {
  activeSessions.set(postId, sessionId);
}

export function getExistingArticleSessionId(postId: string): string | null {
  return activeSessions.get(postId) ?? null;
}

export function getOrCreateArticleSessionId(postId: string): string {
  const existing = activeSessions.get(postId);
  if (existing) {
    return existing;
  }
  const created = generateSessionId();
  activeSessions.set(postId, created);
  return created;
}

export function sendAnalyticsBeacon(
  payload: AnalyticsBeaconPayload,
  preferBeacon = true
): void {
  if (typeof window === "undefined") {
    return;
  }

  const body = JSON.stringify(payload);

  if (
    preferBeacon &&
    typeof navigator !== "undefined" &&
    typeof navigator.sendBeacon === "function"
  ) {
    try {
      const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
      if (navigator.sendBeacon(COLLECT_ENDPOINT, blob)) {
        return;
      }
    } catch {
      // Fall through to keepalive fetch
    }
  }

  try {
    void fetch(COLLECT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {
      // Silently ignore network errors for analytics beacons
    });
  } catch {
    // Ignore synchronous fetch construction errors
  }
}

export function trackArticleEvent(params: {
  postId: string;
  eventType: ArticleEventType;
  target?: string | null;
}): void {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof navigator !== "undefined" && navigator.webdriver) {
    return;
  }

  const sessionId = getExistingArticleSessionId(params.postId);

  sendAnalyticsBeacon(
    {
      type: "event",
      postId: params.postId,
      sessionId,
      eventType: params.eventType,
      target: params.target ?? null,
    },
    true
  );

  try {
    if (getConsentState() === "granted" && posthog.__loaded) {
      posthog.capture(`article_${params.eventType}`, {
        post_id: params.postId,
        target: params.target ?? undefined,
      });
    }
  } catch {
    // Never let third-party analytics throw
  }
}
