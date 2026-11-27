const ATTRIBUTION_STORAGE_KEY = "ehs_attribution_v1";

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  gclid?: string;
  fbclid?: string;
  landing_page?: string;
  referrer?: string;
}

const PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "gclid",
  "fbclid",
] as const;

function sanitizeParam(value: string | null, maxLength = 200): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

/**
 * Reads previously captured first/last-touch attribution from sessionStorage.
 * Safe to call during SSR (returns empty object).
 */
export function getStoredAttribution(): AttributionData {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};

    const record = parsed as Record<string, unknown>;
    const result: AttributionData = {};

    for (const key of [
      ...PARAM_KEYS,
      "landing_page",
      "referrer",
    ] as const) {
      const val = record[key];
      if (typeof val === "string" && val.trim()) {
        result[key] = val.trim();
      }
    }

    return result;
  } catch {
    return {};
  }
}

/**
 * Captures UTM parameters, click IDs (gclid/fbclid), landing_page, and referrer
 * from the current URL and preserves them across navigations in sessionStorage.
 *
 * - First-touch fields (`landing_page`, `referrer`) are recorded on first load and preserved.
 * - Campaign fields (`utm_*`, `gclid`, `fbclid`) preserve first-touch values when absent
 *   from subsequent URLs, and update to last-touch when explicitly present in a new URL.
 */
export function captureAttribution(): AttributionData {
  if (typeof window === "undefined") {
    return {};
  }

  const existing = getStoredAttribution();
  const merged: AttributionData = { ...existing };

  if (!merged.landing_page) {
    merged.landing_page = sanitizeParam(window.location.pathname, 300);
  }

  if (!merged.referrer && typeof document !== "undefined" && document.referrer) {
    try {
      const refUrl = new URL(document.referrer);
      if (refUrl.origin !== window.location.origin) {
        merged.referrer = sanitizeParam(document.referrer, 500);
      }
    } catch {
      merged.referrer = sanitizeParam(document.referrer, 500);
    }
  }

  try {
    const params = new URLSearchParams(window.location.search);
    for (const key of PARAM_KEYS) {
      const val = sanitizeParam(params.get(key));
      if (val) {
        merged[key] = val;
      }
    }
  } catch {
    // Ignore malformed search strings
  }

  try {
    window.sessionStorage.setItem(
      ATTRIBUTION_STORAGE_KEY,
      JSON.stringify(merged)
    );
  } catch {
    // Ignore storage quota or private-mode restrictions
  }

  return merged;
}
