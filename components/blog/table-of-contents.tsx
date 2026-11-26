"use client";

import { useEffect, useState } from "react";
import { ChevronDown, List } from "lucide-react";
import type { TocHeading } from "@/lib/sanitize-blog-html";
import { cn } from "@/lib/utils";

interface TableOfContentsProps {
  headings: TocHeading[];
  variant?: "desktop" | "mobile";
}

export function TableOfContents({
  headings,
  variant = "desktop",
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (headings.length < 2) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-96px 0px -65% 0px" }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) {
    return null;
  }

  if (variant === "mobile") {
    return (
      <div className="lg:hidden mb-8 rounded-2xl bg-white border border-forest-600/15 overflow-hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <span className="flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.18em] text-forest-700">
            <List className="h-4 w-4 text-gold-dark" />
            Neste artigo ({headings.length})
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-forest-600 transition-transform duration-200",
              mobileOpen && "rotate-180"
            )}
          />
        </button>

        {mobileOpen && (
          <nav
            aria-label="Sumário do artigo"
            className="px-5 pb-4 pt-1 border-t border-forest-100 space-y-1"
          >
            {headings.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block text-sm leading-relaxed py-1.5 no-underline border-l-2 transition-colors",
                  item.level === 3 ? "pl-6" : "pl-3",
                  activeId === item.id
                    ? "border-gold-dark text-ink font-semibold"
                    : "border-transparent text-forest-600 hover:text-ink hover:border-forest-200"
                )}
              >
                {item.text}
              </a>
            ))}
          </nav>
        )}
      </div>
    );
  }

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-28 rounded-2xl bg-white/80 border border-forest-600/12 p-5 backdrop-blur-xs">
        <p className="flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.18em] text-forest-700 mb-4">
          <List className="h-3.5 w-3.5 text-gold-dark" />
          Neste artigo
        </p>
        <nav aria-label="Sumário do artigo" className="space-y-1">
          {headings.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                "block text-[13px] leading-snug py-1.5 no-underline border-l-2 transition-all duration-200",
                item.level === 3 ? "pl-6" : "pl-3.5",
                activeId === item.id
                  ? "border-gold-dark text-ink font-semibold"
                  : "border-transparent text-forest-600/80 hover:text-ink hover:border-forest-200"
              )}
            >
              {item.text}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
