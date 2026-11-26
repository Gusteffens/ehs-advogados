"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { getConsentState } from "@/lib/tracking";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const isPostHogConfigured = Boolean(posthogKey && posthogHost);

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined" || !posthogKey || !posthogHost) {
      return;
    }

    const initialConsent = getConsentState();
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: "identified_only",
      capture_pageview: "history_change",
      opt_out_capturing_by_default: initialConsent !== "granted",
    });

    if (initialConsent === "granted") {
      posthog.opt_in_capturing();
    } else {
      posthog.opt_out_capturing();
    }

    const handleConsentChange = () => {
      if (getConsentState() === "granted") {
        posthog.opt_in_capturing();
        posthog.capture("$pageview");
      } else {
        posthog.opt_out_capturing();
      }
    };

    window.addEventListener("ehs:consent-change", handleConsentChange);
    return () => {
      window.removeEventListener("ehs:consent-change", handleConsentChange);
    };
  }, []);

  if (!isPostHogConfigured) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
