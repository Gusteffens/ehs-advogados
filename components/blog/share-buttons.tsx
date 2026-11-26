"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, Linkedin, MessageCircle } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`;
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-600 mr-1">
        Compartilhar:
      </span>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartilhar no WhatsApp"
        className="inline-flex items-center gap-1.5 rounded-xl border border-forest-200 bg-white px-3 py-1.5 text-xs font-medium text-ink hover:border-forest-600/40 hover:bg-forest-50 transition-colors no-underline"
      >
        <MessageCircle className="h-3.5 w-3.5 text-forest-600" />
        WhatsApp
      </a>
      <a
        href={linkedinHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartilhar no LinkedIn"
        className="inline-flex items-center gap-1.5 rounded-xl border border-forest-200 bg-white px-3 py-1.5 text-xs font-medium text-ink hover:border-forest-600/40 hover:bg-forest-50 transition-colors no-underline"
      >
        <Linkedin className="h-3.5 w-3.5 text-forest-600" />
        LinkedIn
      </a>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copiar link do artigo"
        className="inline-flex items-center gap-1.5 rounded-xl border border-forest-200 bg-white px-3 py-1.5 text-xs font-medium text-ink hover:border-forest-600/40 hover:bg-forest-50 transition-colors"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-forest-600" />
            Link copiado
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5 text-forest-600" />
            Copiar link
          </>
        )}
      </button>
    </div>
  );
}
