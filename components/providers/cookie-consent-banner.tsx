"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getConsentState, setConsentState } from "@/lib/tracking";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sync = () => {
      setVisible(getConsentState() === "unset");
    };
    sync();
    window.addEventListener("ehs:consent-change", sync);
    return () => window.removeEventListener("ehs:consent-change", sync);
  }, []);

  if (!visible) return null;

  const handleChoice = (choice: "granted" | "denied") => {
    setConsentState(choice);
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
        <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed">
          <p className="font-semibold text-cream">Privacidade e Cookies</p>
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
