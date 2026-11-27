"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";
import { getConsentState, setConsentState, type ConsentState } from "@/lib/tracking";

export const OPEN_COOKIE_PREFERENCES_EVENT = "ehs:open-cookie-preferences";

export function openCookiePreferences() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_COOKIE_PREFERENCES_EVENT));
  }
}

export function CookiePreferencesButton({
  className,
  children = "Gerenciar Cookies",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={openCookiePreferences}
      className={className}
    >
      {children}
    </button>
  );
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [currentConsent, setCurrentConsent] = useState<ConsentState>("unset");

  useEffect(() => {
    const sync = () => {
      const state = getConsentState();
      setCurrentConsent(state);
      setVisible(state === "unset");
    };

    const handleOpenPreferences = () => {
      setCurrentConsent(getConsentState());
      setVisible(true);
    };

    sync();
    window.addEventListener("ehs:consent-change", sync);
    window.addEventListener("ehs:consent-updated", sync);
    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenPreferences);

    return () => {
      window.removeEventListener("ehs:consent-change", sync);
      window.removeEventListener("ehs:consent-updated", sync);
      window.removeEventListener(
        OPEN_COOKIE_PREFERENCES_EVENT,
        handleOpenPreferences
      );
    };
  }, []);

  if (!visible) return null;

  const handleChoice = (choice: "granted" | "denied") => {
    setConsentState(choice);
    try {
      window.dispatchEvent(
        new CustomEvent("ehs:consent-updated", { detail: { state: choice } })
      );
    } catch {
      // Ignore event dispatch errors
    }
    setCurrentConsent(choice);
    setVisible(false);
  };

  return (
    <aside
      role="dialog"
      aria-label="Preferências de cookies"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 rounded-2xl bg-forest-900/95 text-cream border border-gold/25 shadow-2xl shadow-ink/40 backdrop-blur-md p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-2 text-xs sm:text-[13px] leading-relaxed">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-cream">Privacidade e Cookies</p>
            {currentConsent !== "unset" && (
              <button
                type="button"
                onClick={() => setVisible(false)}
                aria-label="Fechar preferências de cookies"
                className="text-cream/60 hover:text-cream transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-cream/80">
            Utilizamos cookies essenciais e, com o seu consentimento, cookies de
            análise e mensuração de campanhas. Consulte nossa{" "}
            <Link
              href="/politica-de-privacidade"
              className="text-gold underline underline-offset-2 hover:text-cream transition-colors"
            >
              Política de Privacidade
            </Link>
            .
          </p>
          {currentConsent !== "unset" && (
            <p className="text-[11px] text-gold/85">
              Preferência atual:{" "}
              {currentConsent === "granted"
                ? "Cookies de análise e mensuração aceitos"
                : "Apenas cookies essenciais"}
              . Você pode alterar ou revogar seu consentimento a qualquer
              momento.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
        <button
          type="button"
          onClick={() => handleChoice("denied")}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-cream/85 border border-cream/20 hover:bg-cream/10 transition-colors cursor-pointer"
        >
          Apenas essenciais
        </button>
        <button
          type="button"
          onClick={() => handleChoice("granted")}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-gold text-ink hover:bg-champagne-400 transition-colors cursor-pointer"
        >
          Aceitar cookies
        </button>
      </div>
    </aside>
  );
}
