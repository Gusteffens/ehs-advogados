"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface LightboxImage {
  src: string;
  alt: string;
  caption: string | null;
}

interface ArticleImageLightboxProps {
  containerSelector?: string;
}

export function ArticleImageLightbox({
  containerSelector = "[data-article-content]",
}: ArticleImageLightboxProps) {
  const [activeImage, setActiveImage] = useState<LightboxImage | null>(null);

  useEffect(() => {
    const container = document.querySelector<HTMLElement>(containerSelector);
    if (!container) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;
      if (!container.contains(target)) return;

      // Respect images explicitly wrapped in a link
      if (target.closest("a[href]")) return;

      const src = target.currentSrc || target.src;
      if (!src) return;

      const figure = target.closest("figure");
      const figcaption = figure?.querySelector("figcaption");
      const caption = figcaption?.textContent?.trim() || null;

      setActiveImage({
        src,
        alt: target.alt || caption || "Imagem do artigo",
        caption,
      });
    };

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [containerSelector]);

  useEffect(() => {
    if (!activeImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveImage(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImage]);

  if (!activeImage) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={activeImage.alt}
      onClick={() => setActiveImage(null)}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink/92 p-4 sm:p-8 backdrop-blur-md animate-[fade-in_0.18s_ease-out]"
    >
      <button
        type="button"
        onClick={() => setActiveImage(null)}
        aria-label="Fechar visualização ampliada"
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 bg-ink/80 text-cream hover:border-gold/50 hover:text-gold transition-colors cursor-pointer"
      >
        <X className="h-5 w-5" />
      </button>

      <figure
        onClick={(event) => event.stopPropagation()}
        className="relative flex max-h-[90vh] max-w-[94vw] flex-col items-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage.src}
          alt={activeImage.alt}
          className="max-h-[80vh] max-w-full w-auto h-auto rounded-xl border border-gold/15 object-contain shadow-2xl"
        />
        {(activeImage.caption || activeImage.alt) && (
          <figcaption className="mt-4 max-w-2xl text-center text-sm italic leading-relaxed text-cream/80">
            {activeImage.caption ?? activeImage.alt}
          </figcaption>
        )}
      </figure>
    </div>
  );
}
