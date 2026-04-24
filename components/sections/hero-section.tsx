"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    motion,
    AnimatePresence,
    useReducedMotion,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useHasMounted, useMediaQuery } from "@/lib/client-hooks";

const rotatingWords = ["Direito Civil", "Direito do Agronegócio", "Direito Penal", "Direito Ambiental"];

/* ── Golden floating particles ── */
function useGoldenParticles(count: number) {
    return useMemo(() => {
        // Seeded pseudo-random for SSR/CSR consistency
        const particles = [];
        for (let i = 0; i < count; i++) {
            const seed = (i + 1) * 137.508; // golden angle
            particles.push({
                id: i,
                size: 2 + (seed % 4), // 2-6px
                left: `${(seed * 7.3) % 100}%`,
                top: `${(seed * 3.7) % 100}%`,
                duration: 4 + (seed % 4), // 4-8s
                delay: (seed % 3),
            });
        }
        return particles;
    }, [count]);
}

export function HeroSection() {
    const [wordIndex, setWordIndex] = useState(0);
    const prefersReducedMotion = useReducedMotion();
    const sectionRef = useRef<HTMLElement>(null);
    const isMobile = useMediaQuery("(max-width: 767px)");
    const mounted = useHasMounted();

    const particles = useGoldenParticles(12);

    /* Rotating word timer */
    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % rotatingWords.length);
        }, 2800);
        return () => clearInterval(interval);
    }, []);

    const shouldReduceMotion = prefersReducedMotion || isMobile;

    const fadeOnly = {
        initial: mounted ? { opacity: 0 } : false,
        animate: mounted ? { opacity: 1 } : false,
        transition: { duration: 0.2 },
    };

    return (
        <section
            ref={sectionRef}
            className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#0D1812]"
        >
            {/* ── Background Image & Gradient Overlays ── */}

            {/* Team Photo Background */}
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
                    priority={true}
                    fetchPriority="high"
                    sizes="(max-width: 768px) 100vw, 100vw"
                    className="object-cover object-top"
                />
            </motion.div>

            {/* Single unified dark overlay — no seams */}
            <div
                className="absolute inset-0 z-[1] pointer-events-none"
                style={{
                    background: "linear-gradient(to bottom, rgba(13,24,18,0.92) 0%, rgba(13,24,18,0.65) 50%, rgba(13,24,18,0.88) 100%)"
                }}
            />


            {/* Golden Particles (above gradient, behind text) */}
            <div className="absolute inset-0 z-[2] pointer-events-none">
                {mounted && !shouldReduceMotion &&
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
                            animate={{ transform: ["translateY(0px)", "translateY(-15px)", "translateY(0px)"] }}
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
            <Container className="relative z-[3] w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center px-4 py-20">
                {/* Headline with rotating word */}
                <motion.h1
                    {...(shouldReduceMotion
                        ? fadeOnly
                        : {
                              initial: mounted ? { opacity: 0, translateY: "30px" } : false,
                              animate: mounted ? { opacity: 1, translateY: "0px" } : false,
                              transition: { duration: 0.7, delay: 0.1 },
                          })}
                    className="font-display text-[2.75rem] sm:text-[3.5rem] md:text-[4rem] lg:text-[4.5rem] font-bold leading-[1.08] mb-6 tracking-tight text-[#EEEDE5]"
                >
                    Advocacia ética e
                    <br />
                    responsável em{" "}
                    <span suppressHydrationWarning className="relative inline-block text-center align-bottom h-[1.1em]">
                        {/* Hidden reference span — sizes the container to the longest word */}
                        <span className="invisible whitespace-nowrap" aria-hidden="true">
                            {rotatingWords.reduce((a, b) => (a.length >= b.length ? a : b))}
                        </span>
                        {mounted && (
                            <AnimatePresence mode="wait">
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
                                    className="absolute left-0 right-0 bottom-[0.1em] text-[#E8D49A] whitespace-nowrap text-center"
                                    style={
                                        shouldReduceMotion
                                            ? undefined
                                            : { transformOrigin: "bottom center" }
                                    }
                                >
                                    {rotatingWords[wordIndex]}
                                    {/* Golden underline — always starts from left */}
                                    <motion.div
                                        layout="position"
                                        className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-[#E8D49A]/10 via-[#E8D49A] to-[#E8D49A]/10"
                                    />
                                </motion.span>
                            </AnimatePresence>
                        )}
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
                    className="text-lg sm:text-xl text-[#EEEDE5]/70 max-w-2xl leading-relaxed mb-10 font-body mt-4"
                >
                    Advocacia técnica e estratégica para decisões responsáveis.
                </motion.p>

                {/* Single CTA */}
                <motion.div
                    {...(shouldReduceMotion
                        ? fadeOnly
                        : {
                              initial: mounted ? { opacity: 0, translateY: "20px" } : false,
                              animate: mounted ? { opacity: 1, translateY: "0px" } : false,
                              transition: { duration: 0.7, delay: 0.4 },
                          })}
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
                </motion.div>
            </Container>

            {/* Bottom fade — minimal, desktop only */}
            <div
                className="absolute bottom-0 left-0 right-0 pointer-events-none z-[3] hidden md:block"
                style={{
                    height: "60px",
                    background: "linear-gradient(to bottom, transparent, #F5F0E8)",
                }}
            />
        </section>
    );
}
