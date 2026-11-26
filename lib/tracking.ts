import posthog from "posthog-js";

export type ConsentState = "granted" | "denied" | "unset";

const CONSENT_STORAGE_KEY = "ehs_cookie_consent";
const CONSENT_CHANGE_EVENT = "ehs:consent-change";

interface TrackingWindow extends Window {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
  dataLayer?: Array<Record<string, unknown>>;
}

function getTrackingWindow(): TrackingWindow | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window as TrackingWindow;
}

export function getConsentState(): ConsentState {
  if (typeof window === "undefined") {
    return "unset";
  }

  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored === "granted" || stored === "denied") {
      return stored;
    }
  } catch {
    // localStorage may be unavailable in restricted contexts
  }

  return "unset";
}

export function setConsentState(state: "granted" | "denied"): void {
  const win = getTrackingWindow();
  if (!win) {
    return;
  }

  try {
    win.localStorage.setItem(CONSENT_STORAGE_KEY, state);
  } catch {
    // Ignore storage quota / privacy mode errors
  }

  try {
    if (typeof win.gtag === "function") {
      win.gtag("consent", "update", {
        ad_storage: state,
        analytics_storage: state,
        ad_user_data: state,
        ad_personalization: state,
      });
    }
  } catch {
    // Ignore third-party script errors
  }

  try {
    if (typeof win.fbq === "function") {
      win.fbq("consent", state === "granted" ? "grant" : "revoke");
      if (state === "granted") {
        win.fbq("track", "PageView");
      }
    }
  } catch {
    // Ignore third-party script errors
  }

  try {
    win.dispatchEvent(
      new CustomEvent(CONSENT_CHANGE_EVENT, {
        detail: { state },
      })
    );
  } catch {
    // Ignore event dispatch errors
  }
}

export function trackWhatsAppClick(params: {
  page: string;
  placement: string;
  label?: string;
}): void {
  const win = getTrackingWindow();
  if (!win || getConsentState() !== "granted") {
    return;
  }

  try {
    if (typeof win.fbq === "function") {
      win.fbq("track", "Contact", {
        content_name: params.label ?? "WhatsApp",
        content_category: params.page,
        placement: params.placement,
      });
    }
  } catch {
    // Ignore third-party script errors
  }

  try {
    if (typeof win.gtag === "function") {
      win.gtag("event", "whatsapp_click", {
        page: params.page,
        placement: params.placement,
        label: params.label ?? "WhatsApp",
      });
    } else if (Array.isArray(win.dataLayer)) {
      win.dataLayer.push({
        event: "whatsapp_click",
        page: params.page,
        placement: params.placement,
        label: params.label ?? "WhatsApp",
      });
    }
  } catch {
    // Ignore third-party script errors
  }

  try {
    if (posthog.__loaded) {
      posthog.capture("whatsapp_click", params);
    }
  } catch {
    // Ignore analytics errors
  }
}

export function trackContactLead(eventId: string, subject?: string): void {
  const win = getTrackingWindow();
  if (!win || getConsentState() !== "granted") {
    return;
  }

  const contentName = subject?.trim() || "Contato";

  try {
    if (typeof win.fbq === "function") {
      win.fbq("track", "Contact", { content_name: contentName }, { eventID: eventId });
    }
  } catch {
    // Ignore third-party script errors
  }

  try {
    if (typeof win.gtag === "function") {
      win.gtag("event", "generate_lead", {
        event_id: eventId,
        content_name: contentName,
      });
    } else if (Array.isArray(win.dataLayer)) {
      win.dataLayer.push({
        event: "generate_lead",
        event_id: eventId,
        content_name: contentName,
      });
    }
  } catch {
    // Ignore third-party script errors
  }

  try {
    if (posthog.__loaded) {
      posthog.capture("contact_form_submitted", { subject: contentName });
    }
  } catch {
    // Ignore analytics errors
  }
}
