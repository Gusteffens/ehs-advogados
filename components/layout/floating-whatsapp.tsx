"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { WhatsAppLink } from "@/components/tracking/whatsapp-link";
import { SITE_CONFIG } from "@/lib/site-config";
import { getConsentState } from "@/lib/tracking";

export function FloatingWhatsApp() {
  const pathname = usePathname() || "/";
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    const sync = () => {
      setBannerVisible(getConsentState() === "unset");
    };
    sync();
    window.addEventListener("ehs:consent-change", sync);
    return () => window.removeEventListener("ehs:consent-change", sync);
  }, []);

  // On mobile, hide floating button while cookie banner occupies the bottom bar
  const visibilityClasses = bannerVisible
    ? "hidden sm:inline-flex"
    : "inline-flex";

  return (
    <WhatsAppLink
      href={SITE_CONFIG.contact.whatsappWithText}
      page={pathname}
      placement="floating-whatsapp"
      label="Botão flutuante WhatsApp"
      aria-label="Falar com o escritório pelo WhatsApp"
      className={`${visibilityClasses} fixed right-5 bottom-5 z-40 items-center gap-2.5 rounded-full bg-forest-900 text-cream border border-gold/35 pl-2.5 pr-4 py-2 shadow-xl shadow-ink/30 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:shadow-2xl no-underline`}
    >
      <span
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white shrink-0"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93a7.898 7.898 0 0 0-2.327-5.607zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.493.654.666-2.433-.156-.25a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.591-6.593 6.591zm3.615-4.934c-.197-.1-1.17-.578-1.353-.646-.182-.065-.315-.1-.445.1-.133.197-.514.646-.63.775-.116.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.984-.59-.525-.986-1.172-1.102-1.37-.116-.198-.013-.306.087-.405.09-.088.197-.232.296-.347.1-.116.133-.198.198-.33.066-.133.033-.248-.016-.347-.05-.1-.446-1.076-.61-1.47-.16-.389-.323-.336-.445-.342-.116-.006-.248-.006-.38-.006a.729.729 0 0 0-.529.248c-.182.198-.694.678-.694 1.654 0 .976.71 1.916.81 2.049.098.132 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.15.907.129 1.249.078.38-.058 1.171-.48 1.337-.943.164-.462.164-.858.116-.943-.05-.084-.182-.132-.38-.232z" />
        </svg>
      </span>
      <span className="hidden sm:inline font-body text-xs font-semibold tracking-wide text-gold">
        WhatsApp
      </span>
    </WhatsAppLink>
  );
}
