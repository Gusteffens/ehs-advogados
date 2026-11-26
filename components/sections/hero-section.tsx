"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/tracking/whatsapp-link";
import { SITE_CONFIG } from "@/lib/site-config";
import { useHasMounted, useMediaQuery } from "@/lib/client-hooks";

const rotatingWords = [
  "Direito Civil",
  "Direito do Agronegócio",
  "Direito Penal",
  "Direito Ambiental",
];

const longestWord = rotatingWords.reduce((a, b) =>
  a.length >= b.length ? a : b
);

/* ── Golden floating particles ── */
function useGoldenParticles(count: number) {
  return useMemo(() => {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const seed = (i + 1) * 137.508; // golden angle
      particles.push({
        id: i,
        size: 2 + (seed % 4), // 2-6px
        left: `${(seed * 7.3) % 100}%`,
        top: `${(seed * 3.7) % 100}%`,
        duration: 4 + (seed % 4), // 4-8s
        delay: seed % 3,
      });
    }
    return particles;
  }, [count]);
}

export function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const mounted = useHasMounted();

  const particles = useGoldenParticles(12);

  /* Rotating word timer */
  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const shouldReduceMotion = prefersReducedMotion || isMobile;

  const fadeOnly = {
    initial: mounted ? { opacity: 0 } : false,
    animate: mounted ? { opacity: 1 } : false,
    transition: { duration: 0.2 },
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-ink">
      {/* ── Background Image & Gradient Overlays ── */}
      <motion.div
        className="absolute inset-0 z-0"
        {...(shouldReduceMotion
          ? {
              initial: mounted ? { opacity: 0 } : false,
              animate: mounted ? { opacity: 0.35 } : false,
              transition: { duration: 0.2 },
            }
          : {
              initial: mounted ? { opacity: 0, scale: 0.95 } : false,
              animate: mounted ? { opacity: 0.35, scale: 1 } : false,
              transition: { duration: 1.8, ease: "easeOut" },
            })}
      >
        <Image
          src="/images/team/equipe.webp"
          alt="Equipe Erlo, Haas & Steffens"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-top"
        />
      </motion.div>

      {/* Single unified dark overlay — dissolves photo cleanly into ink (#0D1812) */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(13,24,18,0.92) 0%, rgba(13,24,18,0.65) 48%, rgba(13,24,18,0.92) 86%, #0D1812 100%)",
        }}
      />

      {/* Golden Particles (above gradient, behind text) */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        {mounted &&
          !shouldReduceMotion &&
          particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                left: p.left,
                top: p.top,
                backgroundColor: "rgba(232, 212, 154, 0.2)",
                willChange: "transform, opacity",
              }}
              animate={{
                transform: [
                  "translateY(0px)",
                  "translateY(-15px)",
                  "translateY(0px)",
                ],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: p.delay,
              }}
            />
          ))}
      </div>

      {/* ── Content ── */}
      <Container className="relative z-[3] w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center px-4 pt-24 pb-44 sm:pb-52">
        {/* Headline with rotating word (SSR renders first word immediately) */}
        <motion.h1
          {...(shouldReduceMotion
            ? fadeOnly
            : {
                initial: mounted ? { opacity: 0, translateY: "30px" } : false,
                animate: mounted ? { opacity: 1, translateY: "0px" } : false,
                transition: { duration: 0.7, delay: 0.1 },
              })}
          className="font-display text-[2.75rem] sm:text-[3.5rem] md:text-[4rem] lg:text-[4.5rem] font-bold leading-[1.08] mb-6 tracking-tight text-cream"
        >
          Advocacia ética e
          <br />
          responsável em{" "}
          <span className="relative inline-block text-center align-bottom h-[1.1em]">
            {/* Hidden reference span — sizes the container to the longest word */}
            <span className="invisible whitespace-nowrap" aria-hidden="true">
              {longestWord}
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={rotatingWords[wordIndex]}
                initial={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { translateY: "100%", opacity: 0, rotateX: -40 }
                }
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { translateY: "0%", opacity: 1, rotateX: 0 }
                }
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { translateY: "-100%", opacity: 0, rotateX: 40 }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0.2 }
                    : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
                }
                className="absolute left-0 right-0 bottom-[0.1em] text-gold whitespace-nowrap text-center"
                style={
                  shouldReduceMotion
                    ? undefined
                    : { transformOrigin: "bottom center" }
                }
              >
                {rotatingWords[wordIndex]}
                <motion.div
                  layout="position"
                  className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-gold/10 via-gold to-gold/10"
                />
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...(shouldReduceMotion
            ? fadeOnly
            : {
                initial: mounted ? { opacity: 0, translateY: "20px" } : false,
                animate: mounted ? { opacity: 1, translateY: "0px" } : false,
                transition: { duration: 0.7, delay: 0.25 },
              })}
          className="text-lg sm:text-xl text-cream/80 max-w-2xl leading-relaxed mb-10 font-body mt-4"
        >
          Advocacia técnica e estratégica para decisões responsáveis.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...(shouldReduceMotion
            ? fadeOnly
            : {
                initial: mounted ? { opacity: 0, translateY: "20px" } : false,
                animate: mounted ? { opacity: 1, translateY: "0px" } : false,
                transition: { duration: 0.7, delay: 0.4 },
              })}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/contato">
            <Button
              variant="secondary"
              size="lg"
              className="group text-base px-8"
            >
              Fale com um Advogado
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <WhatsAppLink
            href={SITE_CONFIG.contact.whatsappWithText}
            page="/"
            placement="hero-secondary"
            label="WhatsApp Hero"
          >
            <Button
              variant="outline"
              size="lg"
              className="border-cream/30 text-cream hover:bg-cream/10 hover:text-cream text-base px-7"
            >
              <MessageCircle className="h-4 w-4 text-gold" />
              WhatsApp
            </Button>
          </WhatsAppLink>
        </motion.div>
      </Container>

      {/* Eased multi-stop fade to cream (#EEEDE5) — eliminates Mach banding & 1px seam */}
      <div
        className="absolute inset-x-0 -bottom-px h-40 sm:h-48 md:h-56 pointer-events-none z-20 fade-to-cream"
        aria-hidden="true"
      />
    </section>
  );
}
