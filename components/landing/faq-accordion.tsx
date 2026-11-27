"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FaqAccordionItem {
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  items: readonly FaqAccordionItem[];
  defaultOpenIndex?: number | null;
  allowMultiple?: boolean;
  idPrefix?: string;
}

export function FaqAccordion({
  items,
  defaultOpenIndex = 0,
  allowMultiple = false,
  idPrefix = "faq",
}: FaqAccordionProps) {
  const [openIndices, setOpenIndices] = useState<Record<number, boolean>>(() =>
    defaultOpenIndex !== null && defaultOpenIndex >= 0
      ? { [defaultOpenIndex]: true }
      : {}
  );

  const toggleIndex = (idx: number) => {
    setOpenIndices((prev) => {
      const nextValue = !prev[idx];
      if (allowMultiple) {
        return { ...prev, [idx]: nextValue };
      }
      return nextValue ? { [idx]: true } : {};
    });
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = !!openIndices[idx];
        const buttonId = `${idPrefix}-btn-${idx}`;
        const panelId = `${idPrefix}-panel-${idx}`;

        return (
          <div
            key={item.question}
            className="rounded-2xl bg-white border border-forest-100 shadow-sm overflow-hidden transition-colors hover:border-forest-200"
          >
            <h3 className="m-0">
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleIndex(idx)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left font-display text-lg sm:text-xl font-bold text-ink hover:text-forest-600 transition-colors cursor-pointer"
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-gold-dark transition-transform duration-300",
                    isOpen && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="px-6 pb-5 pt-1"
            >
              <p className="text-sm sm:text-base text-forest-600 leading-relaxed m-0">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
