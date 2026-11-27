"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SCAM_ALERT_ITEMS } from "./scam-alerts-data";

export function ScamAlertsAccordion() {
  const [openId, setOpenId] = useState<string | null>(SCAM_ALERT_ITEMS[0].id);

  return (
    <div className="space-y-3.5">
      {SCAM_ALERT_ITEMS.map((item) => {
        const isOpen = openId === item.id;
        const panelId = `scam-alert-panel-${item.id}`;
        const buttonId = `scam-alert-trigger-${item.id}`;

        return (
          <div
            key={item.id}
            className={cn(
              "rounded-2xl border bg-white transition-all duration-200",
              isOpen
                ? "border-gold-dark/45 shadow-md shadow-forest-900/5"
                : "border-forest-100 hover:border-forest-200"
            )}
          >
            <h3 className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-7 sm:py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne-500 focus-visible:ring-inset rounded-2xl"
              >
                <span className="flex items-start gap-3.5">
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                      isOpen
                        ? "bg-red-100 text-red-700"
                        : "bg-cream text-gold-dark"
                    )}
                    aria-hidden="true"
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <span className="font-display text-lg sm:text-xl font-bold leading-snug text-ink">
                    {item.quote}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-forest-600 transition-transform duration-200",
                    isOpen && "rotate-180 text-gold-dark"
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "grid transition-all duration-200 ease-out",
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="border-t border-forest-100/80 px-5 pb-5 pt-4 sm:px-7 sm:pb-6 sm:pl-[4.75rem]">
                  <p className="text-[0.95rem] sm:text-base leading-relaxed text-forest-700">
                    {item.explanation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
