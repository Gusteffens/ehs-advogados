"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Calendar, Clock, Eye, Monitor, Smartphone, X } from "lucide-react";
import { sanitizeBlogHtml } from "@/lib/sanitize-blog-html";
import { calculateReadingTime, cn } from "@/lib/utils";

interface PostPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  categoryName: string | null;
  categoryColor?: string | null;
  authorName: string;
  authorPhoto: string | null;
  publishedAt?: string | null;
  tags?: string[];
}

function formatPreviewDate(isoOrLocal?: string | null): string {
  const date = isoOrLocal ? new Date(isoOrLocal) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function PostPreviewModal({
  open,
  onClose,
  title,
  excerpt,
  content,
  coverUrl,
  categoryName,
  categoryColor,
  authorName,
  authorPhoto,
  publishedAt,
  tags = [],
}: PostPreviewModalProps) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const sanitizedHtml = useMemo(() => {
    if (!open) return "";
    return sanitizeBlogHtml(content) || "<p>Sem conteúdo ainda.</p>";
  }, [open, content]);

  const readingMin = useMemo(
    () => (content ? calculateReadingTime(content) : 1),
    [content]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 backdrop-blur-xs p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Pré-visualização do artigo"
      onClick={onClose}
    >
      <div
        className={cn(
          "flex flex-col max-h-[92vh] rounded-2xl bg-cream border border-forest-200 shadow-2xl overflow-hidden transition-all duration-200",
          viewport === "mobile" ? "w-full max-w-[400px]" : "w-full max-w-4xl"
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-ink text-cream border-b border-forest-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <Eye className="h-4 w-4 text-gold" />
            <span className="text-sm font-semibold">
              Pré-visualização Editorial
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="hidden sm:flex items-center rounded-lg bg-forest-900 p-0.5 border border-forest-800"
              role="group"
              aria-label="Tamanho da tela"
            >
              <button
                type="button"
                onClick={() => setViewport("desktop")}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  viewport === "desktop"
                    ? "bg-gold text-ink"
                    : "text-cream/70 hover:text-cream"
                )}
              >
                <Monitor className="h-3.5 w-3.5" />
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setViewport("mobile")}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  viewport === "mobile"
                    ? "bg-gold text-ink"
                    : "text-cream/70 hover:text-cream"
                )}
              >
                <Smartphone className="h-3.5 w-3.5" />
                Mobile
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar pré-visualização"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-cream/70 hover:text-cream hover:bg-forest-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable editorial preview body */}
        <div className="overflow-y-auto flex-1">
          {/* Article Hero matching public blog */}
          <div className="bg-ink px-6 sm:px-10 py-10">
            {categoryName && (
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-ink mb-4"
                style={{ backgroundColor: categoryColor ?? "#E8D49A" }}
              >
                {categoryName}
              </span>
            )}
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-cream leading-tight mb-4">
              {title || "Sem título"}
            </h2>
            {excerpt && (
              <p className="text-sm sm:text-base text-cream/75 leading-relaxed mb-6 max-w-2xl">
                {excerpt}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-cream/75">
              <div className="flex items-center gap-2.5">
                {authorPhoto && (
                  <div className="relative h-9 w-9 rounded-full overflow-hidden shrink-0 ring-2 ring-gold/25">
                    <Image
                      src={authorPhoto}
                      alt={authorName}
                      fill
                      sizes="36px"
                      className="object-cover object-top"
                    />
                  </div>
                )}
                <span className="font-medium text-cream">{authorName}</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-cream/65">
                <Calendar className="h-3.5 w-3.5 text-gold/80" />
                {formatPreviewDate(publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-cream/65">
                <Clock className="h-3.5 w-3.5 text-gold/80" />
                {readingMin} min de leitura
              </span>
            </div>
          </div>

          {/* Cover & Prose */}
          <div className="px-6 sm:px-10 py-8 space-y-8 bg-cream-light">
            {coverUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-forest-200 shadow-md">
                <Image
                  src={coverUrl}
                  alt={title || "Imagem de capa"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover"
                />
              </div>
            )}

            <article
              className="prose-editorial max-w-2xl mx-auto"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />

            {tags.length > 0 && (
              <div className="max-w-2xl mx-auto pt-6 border-t border-forest-200/70 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-cream border border-forest-200 px-3 py-1 text-xs font-medium text-forest-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
