"use client";

import { useEffect } from "react";
import {
  getOrCreateArticleSessionId,
  sendAnalyticsBeacon,
  setArticleSessionId,
} from "@/lib/analytics/client-beacon";

const IDLE_THRESHOLD_MS = 30_000;
const QUALIFIED_VIEW_SECONDS = 3;
const QUALIFIED_VIEW_SCROLL_PCT = 15;
const MAX_ENGAGED_SECONDS = 7200;
const SCROLL_MILESTONES = [25, 50, 75, 100] as const;

function getLocalDayBucket(): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function readArticleScrollPct(): number {
  const articleEl = document.querySelector<HTMLElement>("[data-article-content]");
  if (articleEl) {
    const rect = articleEl.getBoundingClientRect();
    const articleTop = rect.top + window.scrollY;
    const articleHeight = articleEl.offsetHeight;

    if (articleHeight <= 0) {
      return 0;
    }

    const viewportBottom = window.scrollY + window.innerHeight;
    const progressed = viewportBottom - articleTop;
    if (progressed <= 0) {
      return 0;
    }

    return Math.min(100, Math.max(0, Math.round((progressed / articleHeight) * 100)));
  }

  const docHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) {
    return 100;
  }

  return Math.min(
    100,
    Math.max(0, Math.round((window.scrollY / docHeight) * 100))
  );
}

function getUtmParams(): {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
} {
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get("utm_source")?.trim().slice(0, 255) || null,
      utmMedium: params.get("utm_medium")?.trim().slice(0, 255) || null,
      utmCampaign: params.get("utm_campaign")?.trim().slice(0, 255) || null,
    };
  } catch {
    return { utmSource: null, utmMedium: null, utmCampaign: null };
  }
}

export function useArticleTracker(postId: string): void {
  useEffect(() => {
    if (typeof window === "undefined" || !postId) {
      return;
    }

    if (typeof navigator !== "undefined" && navigator.webdriver) {
      return;
    }

    const startTracking = (): (() => void) => {
      const storageKey = `ehs_av:${postId}:${getLocalDayBucket()}`;
      let existingStoredSession: string | null = null;
      try {
        existingStoredSession = window.sessionStorage.getItem(storageKey);
      } catch {
        // sessionStorage may be blocked in restricted browsing contexts
      }

      let sessionId: string;
      let viewSent = false;

      if (
        existingStoredSession &&
        /^[a-zA-Z0-9_-]{8,64}$/.test(existingStoredSession)
      ) {
        sessionId = existingStoredSession;
        setArticleSessionId(postId, sessionId);
        viewSent = true;
      } else {
        sessionId = getOrCreateArticleSessionId(postId);
      }

      let activeSeconds = 0;
      let maxScrollPct = readArticleScrollPct();
      let lastActivityMs = Date.now();
      let lastFlushedSeconds = 0;
      let lastFlushedScroll = 0;
      let highestMilestoneFlushed = 0;
      let scrollRafId: number | null = null;

      const flushEngagement = (preferBeacon: boolean) => {
        if (!viewSent) {
          return;
        }

        const clampedSeconds = Math.min(MAX_ENGAGED_SECONDS, Math.floor(activeSeconds));
        const clampedScroll = Math.min(100, Math.max(0, Math.round(maxScrollPct)));

        if (
          clampedSeconds <= lastFlushedSeconds &&
          clampedScroll <= lastFlushedScroll
        ) {
          return;
        }

        lastFlushedSeconds = Math.max(lastFlushedSeconds, clampedSeconds);
        lastFlushedScroll = Math.max(lastFlushedScroll, clampedScroll);

        sendAnalyticsBeacon(
          {
            type: "engagement",
            postId,
            sessionId,
            engagedSeconds: lastFlushedSeconds,
            maxScrollPct: lastFlushedScroll,
          },
          preferBeacon
        );
      };

      const maybeSendQualifiedView = () => {
        if (viewSent) {
          return;
        }

        if (
          activeSeconds >= QUALIFIED_VIEW_SECONDS ||
          maxScrollPct >= QUALIFIED_VIEW_SCROLL_PCT
        ) {
          viewSent = true;
          try {
            window.sessionStorage.setItem(storageKey, sessionId);
          } catch {
            // Ignore storage write errors
          }

          const utms = getUtmParams();
          sendAnalyticsBeacon(
            {
              type: "view",
              postId,
              sessionId,
              referrer: document.referrer || null,
              utmSource: utms.utmSource,
              utmMedium: utms.utmMedium,
              utmCampaign: utms.utmCampaign,
            },
            false
          );
        }
      };

      const markActivity = () => {
        lastActivityMs = Date.now();
      };

      const handleScroll = () => {
        markActivity();
        if (scrollRafId !== null) {
          return;
        }
        scrollRafId = window.requestAnimationFrame(() => {
          scrollRafId = null;
          const current = readArticleScrollPct();
          if (current > maxScrollPct) {
            maxScrollPct = current;
          }

          maybeSendQualifiedView();

          if (viewSent) {
            for (const milestone of SCROLL_MILESTONES) {
              if (maxScrollPct >= milestone && milestone > highestMilestoneFlushed) {
                highestMilestoneFlushed = milestone;
                flushEngagement(true);
              }
            }
          }
        });
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden") {
          flushEngagement(true);
        } else {
          markActivity();
        }
      };

      const handlePageHide = () => {
        flushEngagement(true);
      };

      const intervalId = window.setInterval(() => {
        if (document.visibilityState !== "visible") {
          return;
        }
        if (Date.now() - lastActivityMs > IDLE_THRESHOLD_MS) {
          return;
        }
        if (activeSeconds < MAX_ENGAGED_SECONDS) {
          activeSeconds += 1;
        }
        maybeSendQualifiedView();
      }, 1000);

      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("pointerdown", markActivity, { passive: true });
      window.addEventListener("pointermove", markActivity, { passive: true });
      window.addEventListener("keydown", markActivity, { passive: true });
      window.addEventListener("touchstart", markActivity, { passive: true });
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("pagehide", handlePageHide);

      return () => {
        window.clearInterval(intervalId);
        if (scrollRafId !== null) {
          window.cancelAnimationFrame(scrollRafId);
        }
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("pointerdown", markActivity);
        window.removeEventListener("pointermove", markActivity);
        window.removeEventListener("keydown", markActivity);
        window.removeEventListener("touchstart", markActivity);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("pagehide", handlePageHide);
        flushEngagement(true);
      };
    };

    const docWithPrerender = document as Document & { prerendering?: boolean };
    let cleanupTracking: (() => void) | null = null;
    let cancelled = false;

    const activateTracking = () => {
      if (cancelled || cleanupTracking) {
        return;
      }
      cleanupTracking = startTracking();
    };

    if (docWithPrerender.prerendering) {
      document.addEventListener("prerenderingchange", activateTracking, {
        once: true,
      });
      return () => {
        cancelled = true;
        document.removeEventListener("prerenderingchange", activateTracking);
        cleanupTracking?.();
      };
    }

    cleanupTracking = startTracking();
    return () => {
      cancelled = true;
      cleanupTracking?.();
    };
  }, [postId]);
}
