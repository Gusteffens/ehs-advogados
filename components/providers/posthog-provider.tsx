"use client";

import { useEffect, useRef } from "react";
import { getConsentState } from "@/lib/tracking";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() || "";
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "";

type PostHogInstance = typeof import("posthog-js").default;

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const posthogRef = useRef<PostHogInstance | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !posthogKey) {
      return;
    }

    let cancelled = false;

    const enablePostHog = async () => {
      if (cancelled || getConsentState() !== "granted") {
        return;
      }

      if (!posthogRef.current) {
        try {
          const mod = await import("posthog-js");
          if (cancelled || getConsentState() !== "granted") {
            return;
          }
          posthogRef.current = mod.default;
        } catch {
          return;
        }
      }

      const ph = posthogRef.current;
      if (!ph) return;

      if (!initializedRef.current) {
        ph.init(posthogKey, {
          api_host: posthogHost || "https://us.i.posthog.com",
          person_profiles: "identified_only",
          capture_pageview: "history_change",
          opt_out_capturing_by_default: false,
        });
        initializedRef.current = true;
      }

      ph.opt_in_capturing();
      ph.capture("$pageview");
    };

    const syncConsent = () => {
      if (getConsentState() === "granted") {
        void enablePostHog();
      } else if (posthogRef.current && initializedRef.current) {
        posthogRef.current.opt_out_capturing();
      }
    };

    syncConsent();

    window.addEventListener("ehs:consent-change", syncConsent);
    window.addEventListener("ehs:consent-updated", syncConsent);
    window.addEventListener("storage", syncConsent);

    return () => {
      cancelled = true;
      window.removeEventListener("ehs:consent-change", syncConsent);
      window.removeEventListener("ehs:consent-updated", syncConsent);
      window.removeEventListener("storage", syncConsent);
    };
  }, []);

  return <>{children}</>;
}
