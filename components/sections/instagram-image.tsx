"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const FALLBACK_SRC = "/images/logo-ehs-monogram.png";

interface InstagramImageProps {
  src: string;
  alt: string;
}

export function InstagramImage({ src, alt }: InstagramImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={failed ? FALLBACK_SRC : src}
      alt={alt}
      width={300}
      height={300}
      onError={() => setFailed(true)}
      className={cn(
        "w-full h-full transition-transform duration-500 group-hover:scale-105",
        failed ? "object-contain p-10 bg-forest-900" : "object-cover"
      )}
      loading="lazy"
      decoding="async"
    />
  );
}
