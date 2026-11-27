"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/tracking/whatsapp-link";
import { SITE_CONFIG } from "@/lib/site-config";
import { useMediaQuery } from "@/lib/client-hooks";
import { cn } from "@/lib/utils";

const rotatingWords = [
  "Direito Civil",
  "Direito do Agronegócio",
  "Direito Penal",
  "Direito Ambiental",
  "Direito Empresarial",
  "Direito Militar",
];

export function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)"
  );

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const currentWord = rotatingWords[wordIndex];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-ink">
      {/* Static opacity-35 prevents SSR -> hydration LCP opacity flash */}
      <div className="absolute inset-0 z-0 opacity-35">
        <Image
          src="/images/team/equipe.webp"
          alt="Equipe Erlo, Haas & Steffens"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-top"
        />
      </div>

      {/* Single unified dark overlay — dissolves photo cleanly into ink (#0D1812) */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(13,24,18,0.92) 0%, rgba(13,24,18,0.68) 48%, rgba(13,24,18,0.92) 86%, #0D1812 100%)",
        }}
        aria-hidden="true"
      />

      {/* Subtle architectural gold hairlines (zero GPU particles) */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        aria-hidden="true"
      >
        <div className="hidden lg:block absolute top-0 bottom-0 left-[8%] w-px bg-gradient-to-b from-transparent via-gold/15 to-transparent" />
        <div className="hidden lg:block absolute top-0 bottom-0 right-[8%] w-px bg-gradient-to-b from-transparent via-gold/15 to-transparent" />
        <div className="absolute top-28 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-gold/45 to-transparent" />
      </div>

      {/* Content */}
      <Container className="relative z-[3] w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center px-4 pt-28 pb-40 sm:pb-48">
        {/* Quiet Chancery trust strip */}
        <p className="inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[0.72rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-gold/85 mb-6">
          <span>{SITE_CONFIG.oab}</span>
          <span className="h-1 w-1 rounded-full bg-gold/60" aria-hidden="true" />
          <span>
            {SITE_CONFIG.address.city}/{SITE_CONFIG.address.state}
          </span>
        </p>

        {/* Headline with rotating specialty — wraps cleanly on < sm with zero horizontal clipping */}
        <h1 className="font-display text-[2.25rem] sm:text-[3.35rem] md:text-[4rem] lg:text-[4.5rem] font-bold leading-[1.1] tracking-tight text-cream max-w-4xl">
          Advocacia ética e
          <br />
          responsável em{" "}
          <span className="block sm:inline-block mt-1 sm:mt-0 text-gold">
            <span
              key={currentWord}
              className="inline-block relative animate-[fade-in_0.45s_ease-out_both] motion-reduce:animate-none"
            >
              {currentWord}
              <span
                className="block mt-1 h-[2px] w-full rounded-full bg-gradient-to-r from-gold/10 via-gold to-gold/10"
                aria-hidden="true"
              />
            </span>
          </span>
        </h1>

        {/* Sharpened subtitle without repeating "responsável" */}
        <p className="text-base sm:text-xl text-cream/80 max-w-2xl leading-relaxed mt-6 mb-10 font-body">
          Atuação técnica e estratégica para decisões jurídicas seguras, com
          sigilo e rigor em cada etapa.
        </p>

        {/* CTAs using buttonVariants directly on interactive links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/contato"
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "group text-base px-8 w-full sm:w-auto no-underline"
            )}
          >
            Fale com um Advogado
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <WhatsAppLink
            href={SITE_CONFIG.contact.whatsappWithText}
            page="/"
            placement="hero-secondary"
            label="WhatsApp Hero"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-cream/30 text-cream hover:bg-cream/10 hover:text-cream text-base px-7 w-full sm:w-auto no-underline"
            )}
          >
            <MessageCircle className="h-4 w-4 text-gold" />
            WhatsApp
          </WhatsAppLink>
        </div>
      </Container>

      {/* Eased multi-stop fade to cream (#EEEDE5) — eliminates Mach banding & 1px seam */}
      <div
        className="absolute inset-x-0 -bottom-px h-40 sm:h-48 md:h-56 pointer-events-none z-20 fade-to-cream"
        aria-hidden="true"
      />
    </section>
  );
}
