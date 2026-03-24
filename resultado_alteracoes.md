1. LISTA DE ARQUIVOS MODIFICADOS
- components/sections/hero-section.tsx
- components/layout/header.tsx
- components/sections/areas-section.tsx
- components/sections/team-section.tsx
- components/layout/footer.tsx
- components/sections/cta-section.tsx
- app/contato/page.tsx

2. CÓDIGO completo de cada arquivo alterado:

--- components/sections/hero-section.tsx ---
```tsx
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

const rotatingWords = ["Direito Civil", "Agronegócio", "Direito Penal", "Direito Ambiental"];

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
    const [isMobile, setIsMobile] = useState(false);

    const particles = useGoldenParticles(12);

    /* Hydration-safe mobile check */
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    /* Rotating word timer */
    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % rotatingWords.length);
        }, 2800);
        return () => clearInterval(interval);
    }, []);

    const shouldReduceMotion = prefersReducedMotion || isMobile;

    const fadeOnly = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.2 },
    };

    return (
        <section
            ref={sectionRef}
            className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#0D1812]"
        >
            {/* ── Background Image & Gradient Overlays ── */}
            
            {/* 1. Base Gradient */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0D1812] via-[#0D1812] to-[#1B2D1E]" />

            {/* 2. Team Photo Background */}
            <motion.div
                className="absolute inset-0 z-0"
                {...(shouldReduceMotion
                    ? {
                          initial: { opacity: 0 },
                          animate: { opacity: 0.35 },
                          transition: { duration: 0.2 },
                      }
                    : {
                          initial: { opacity: 0, scale: 0.95 },
                          animate: { opacity: 0.35, scale: 1 },
                          transition: { duration: 1.8, ease: "easeOut" },
                      })}
            >
                <Image
                    src="/images/team/equipe.png"
                    alt="Equipe Erlo Haas & Steffens"
                    fill
                    priority={true}
                    fetchPriority="high"
                    sizes="(max-width: 768px) 100vw, 100vw"
                    className="object-cover object-top"
                />
            </motion.div>

            {/* 3. Dark Overlay (Gradient from top to bottom) */}
            <div 
                className="absolute inset-0 z-[1] pointer-events-none"
                style={{
                    background: `linear-gradient(to bottom, #0D1812 0%, rgba(13, 24, 18, 0.8) 40%, rgba(13, 24, 18, 0.9) 100%)`
                }}
            />

            {/* 4. Golden Particles (above gradient, behind text) */}
            <div className="absolute inset-0 z-[1] pointer-events-none">
                {!shouldReduceMotion &&
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

            {/* 5. Decorative Grids & Lines */}
            <div className="absolute inset-0 z-[1] pointer-events-none">
                {/* Subtle grid */}
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(201,168,76,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.4) 1px, transparent 1px)`,
                        backgroundSize: "80px 80px",
                    }}
                />
                {/* Decorative vertical lines */}
                <div className="absolute top-0 right-[30%] w-px h-full bg-gradient-to-b from-transparent via-[#E8D49A]/10 to-transparent" />
                <div className="absolute top-0 right-[60%] w-px h-full bg-gradient-to-b from-transparent via-[#E8D49A]/5 to-transparent" />
            </div>

            {/* ── Content ── */}
            <Container className="relative z-[2] w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center px-4 py-20">
                {/* Headline with rotating word */}
                <motion.h1
                    {...(shouldReduceMotion
                        ? fadeOnly
                        : {
                              initial: { opacity: 0, translateY: "30px" },
                              animate: { opacity: 1, translateY: "0px" },
                              transition: { duration: 0.7, delay: 0.1 },
                          })}
                    className="font-display text-[2.75rem] sm:text-[3.5rem] md:text-[4rem] lg:text-[4.5rem] font-bold leading-[1.08] mb-6 tracking-tight text-[#EEEDE5]"
                >
                    Advocacia ética e
                    <br />
                    responsável em{" "}
                    <span className="relative inline-block text-left align-bottom h-[1.1em] w-[210px] sm:w-[280px] md:w-[320px] lg:w-[380px] xl:w-[440px]">
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
                                className="absolute left-0 bottom-[0.1em] text-[#E8D49A] whitespace-nowrap"
                                style={
                                    shouldReduceMotion
                                        ? undefined
                                        : { transformOrigin: "bottom left" }
                                }
                            >
                                {rotatingWords[wordIndex]}
                                {/* The animated golden underline */}
                                <motion.div
                                    layout="position"
                                    className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-[#E8D49A]/10 via-[#E8D49A] to-[#E8D49A]/10"
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
                              initial: { opacity: 0, translateY: "20px" },
                              animate: { opacity: 1, translateY: "0px" },
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
                              initial: { opacity: 0, translateY: "20px" },
                              animate: { opacity: 1, translateY: "0px" },
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

```

--- components/layout/header.tsx ---
```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Scale } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
    { href: "/", label: "Início" },
    { href: "/sobre", label: "Sobre" },
    { href: "/areas-de-atuacao", label: "Áreas de Atuação" },
    { href: "/equipe", label: "Equipe" },
    { href: "/blog", label: "Blog" },
    { href: "/contato", label: "Contato" },
];

export function Header() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
                scrolled
                    ? "bg-[#EEEDE5] shadow-md shadow-forest-900/5 py-3 lg:bg-[#EEEDE5]/95 lg:backdrop-blur-xl"
                    : "bg-transparent py-5"
            )}
        >
            <Container>
                <nav className="flex items-center justify-between">
                    {/* ── Logo ── */}
                    <Link
                        href="/"
                        className="group flex items-center gap-3 no-underline"
                    >
                        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#3B5A3C] text-[#877249]/70 transition-all duration-300 group-hover:bg-[#3B5A3C] group-hover:scale-105 group-hover:shadow-lg">
                            <Scale className="h-5 w-5" />
                            <div className="absolute -inset-0.5 rounded-xl bg-[#E8D49A]/20 opacity-0 transition-opacity group-hover:opacity-100 blur-sm" />
                        </div>
                        <div className="flex flex-col">
                            <span className={cn(
                                "font-display text-lg font-bold leading-tight tracking-tight transition-colors duration-500",
                                scrolled ? "text-[#0D1812]" : "text-[#EEEDE5]"
                            )}>
                                Erlo Haas & Steffens
                            </span>
                        </div>
                    </Link>

                    {/* ── Desktop Nav ── */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 no-underline",
                                        scrolled
                                            ? isActive
                                                ? "text-[#0D1812]"
                                                : "text-[#3B5A3C] hover:text-[#0D1812] hover:bg-[#EEEDE5]"
                                            : isActive
                                                ? "text-[#EEEDE5]"
                                                : "text-[#EEEDE5]/60 hover:text-[#EEEDE5] hover:bg-[#EEEDE5]/10"
                                    )}
                                >
                                    {link.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#E8D49A]"
                                            transition={{
                                                type: "spring",
                                                stiffness: 380,
                                                damping: 30,
                                            }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* ── Desktop Auth + CTA ── */}
                    <div className="hidden lg:flex items-center gap-3">

                        <Show when="signed-in">
                            <UserButton />
                        </Show>
                        <Link href="/contato">
                            <Button variant="secondary" size="sm">
                                Fale Conosco
                            </Button>
                        </Link>
                    </div>

                    {/* ── Mobile Menu Toggle ── */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={cn(
                            "lg:hidden relative z-50 flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                            scrolled
                                ? "text-[#0D1812] hover:bg-[#EEEDE5]"
                                : "text-[#EEEDE5] hover:bg-[#EEEDE5]/10"
                        )}
                        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
                    >
                        <AnimatePresence mode="wait">
                            {isOpen ? (
                                <motion.div
                                    key="close"
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <X className="h-5 w-5" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="menu"
                                    initial={{ rotate: 90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: -90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Menu className="h-5 w-5" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </nav>
            </Container>

            {/* ── Mobile Menu Overlay ── */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-[#0D1812]/60 lg:hidden"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#EEEDE5] shadow-2xl lg:hidden"
                        >
                            <div className="flex flex-col h-full pt-24 px-8 pb-8">
                                <div className="flex flex-col gap-1">
                                    {navLinks.map((link, i) => {
                                        const isActive = pathname === link.href;
                                        return (
                                            <motion.div
                                                key={link.href}
                                                initial={{ x: 40, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: i * 0.05, duration: 0.3 }}
                                            >
                                                <Link
                                                    href={link.href}
                                                    className={cn(
                                                        "block px-4 py-3 text-lg font-medium rounded-xl transition-colors no-underline",
                                                        isActive
                                                            ? "bg-[#3B5A3C] text-[#EEEDE5]-light"
                                                            : "text-[#0D1812] hover:bg-[#EEEDE5]"
                                                    )}
                                                >
                                                    {link.label}
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                <div className="mt-auto space-y-3">
                                    <div className="h-px bg-[#3B5A3C]/50 mb-4" />

                                    <Show when="signed-in">
                                        <div className="flex justify-center">
                                            <UserButton />
                                        </div>
                                    </Show>
                                    <Link href="/contato" className="block">
                                        <Button variant="secondary" size="md" className="w-full">
                                            Fale Conosco
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}


```

--- components/sections/areas-section.tsx ---
```tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
 Briefcase,
 Users,
 FileText,
 Scale,
 Landmark,
 ShieldCheck,
 ArrowUpRight,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section-title";
import { cn } from "@/lib/utils";

const areas = [
 {
 icon: Briefcase,
 title: "Direito Empresarial",
 description:
 "Assessoria completa para empresas, desde a constituição societária até fusões, aquisições e reestruturações corporativas.",
 href: "/areas-de-atuacao#empresarial",
 color: "from-[#1B2D1E] to-[#1B2D1E]",
 iconBg: "bg-[#3B5A3C]/50 text-[#0D1812] group-hover:bg-[#3B5A3C] group-hover:text-[#EEEDE5]",
 },
 {
 icon: FileText,
 title: "Direito Civil",
 description:
 "Contratos, responsabilidade civil, direito de família, sucessões e resolução de disputas por mediação ou litígio.",
 href: "/areas-de-atuacao#civil",
 color: "from-[#3B5A3C] to-[#1B2D1E]",
 iconBg: "bg-[#3B5A3C]/50 text-[#3B5A3C] group-hover:bg-[#3B5A3C] group-hover:text-[#EEEDE5]",
 },
 {
 icon: Landmark,
 title: "Direito Tributário",
 description:
 "Planejamento fiscal, contencioso administrativo e judicial, e consultoria em incentivos fiscais e compliance tributário.",
 href: "/areas-de-atuacao#tributario",
 color: "from-[#E8D49A] to-[#E8D49A]",
 iconBg: "bg-[#E8D49A]/30 text-[#877249] group-hover:bg-[#E8D49A] group-hover:text-[#0D1812]",
 },
 {
 icon: ShieldCheck,
 title: "Direito Militar",
 description:
 "Atuação especializada na defesa de direitos e garantias das carreiras militares, em questões administrativas e judiciais.",
 href: "/areas-de-atuacao#militar",
 color: "from-[#E8D49A] to-[#877249]",
 iconBg: "bg-[#E8D49A]/30 text-[#877249] group-hover:bg-[#E8D49A] group-hover:text-[#0D1812]",
 },
 {
 icon: Scale,
 title: "Direito Penal",
 description:
 "Defesa técnica e estratégica em inquéritos policiais e processos criminais, com foco em garantias fundamentais.",
 href: "/areas-de-atuacao#penal",
 color: "from-[#1B2D1E] to-[#0D1812]",
 iconBg: "bg-[#3B5A3C]/50 text-[#0D1812] group-hover:bg-[#1B2D1E] group-hover:text-[#877249]/70",
 },
 {
 icon: Users,
 title: "Direito Agrário",
 description:
 "Consultoria para o agronegócio, contratos agrários, regularização fundiária e defesa em litígios rurais.",
 href: "/areas-de-atuacao#agrario",
 color: "from-[#877249] to-[#877249]",
 iconBg: "bg-[#E8D49A]/30 text-[#877249] group-hover:bg-[#877249] group-hover:text-[#EEEDE5]",
 },
 {
 icon: Briefcase,
 title: "Direito Ambiental",
 description:
 "Orientação em licenciamentos, defesa em autuações ambientais e adequação à legislação de proteção ambiental.",
 href: "/areas-de-atuacao#ambiental",
 color: "from-[#3B5A3C] to-[#1B2D1E]",
 iconBg: "bg-[#3B5A3C]/50 text-[#3B5A3C] group-hover:bg-[#3B5A3C] group-hover:text-[#EEEDE5]",
 },
];

const containerVariants = {
 hidden: {},
 visible: {
 transition: { staggerChildren: 0.08 },
 },
};

const cardVariants = {
 hidden: { opacity: 0, y: 30 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function AreasSection() {
 return (
 <section className="py-24 lg:py-32 bg-[#EEEDE5] relative overflow-hidden">
 {/* Decorative blobs */}
 <div className="absolute top-0 left-0 w-72 h-72 bg-[#3B5A3C]/50/50 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
 <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#E8D49A]/30/40 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

 <Container className="relative">
 <SectionTitle
 label="Áreas de Atuação"
 title="Experiência em diversas áreas de atuação do direito"
 />

 <motion.div
 variants={containerVariants}
 initial="hidden"
 whileInView="visible"
 viewport={{ once: true, margin: "-80px" }}
 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
 >
 {areas.map((area) => (
 <motion.div key={area.title} variants={cardVariants}>
 <Link
 href={area.href}
 className={cn(
 "group relative flex flex-col h-full p-7 rounded-2xl bg-white border border-forest-100",
 "transition-all duration-400 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-forest-900/8 hover:border-forest-200",
 "no-underline"
 )}
 >
 {/* Gradient accent on hover */}
 <div
 className={cn(
 "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-400 group-hover:opacity-[0.03]",
 area.color
 )}
 />

 <div className="relative">
 <div
 className={cn(
 "flex h-12 w-12 items-center justify-center rounded-xl mb-5 transition-all duration-300",
 area.iconBg
 )}
 >
 <area.icon className="h-5 w-5" />
 </div>

 <h3 className="font-display text-xl font-bold text-[#0D1812] mb-3 flex items-center gap-2">
 {area.title}
 <ArrowUpRight className="h-4 w-4 text-[#E8D49A] opacity-0 -translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0" />
 </h3>

 <p className="text-[#3B5A3C] text-[0.925rem] leading-relaxed">
 {area.description}
 </p>
 </div>
 </Link>
 </motion.div>
 ))}
 </motion.div>
 </Container>
 </section>
 );
}

```

--- components/sections/team-section.tsx ---
```tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Mail } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section-title";
import { cn } from "@/lib/utils";

const team = [
    {
        name: "Alessandra Franke Steffens",
        role: "Advogada",
        oab: "OAB/SC 21.390-B | OAB/RS 55.474",
        specialties: ["Direito Criminal"],
        image: "/images/team/alessandra-steffens.png",
        gradient: "from-[#E8D49A] to-[#877249]",
        email: "alessandra@erlohaas.com.br",
    },
    {
        name: "Luíza Klein Haas",
        role: "Advogada",
        oab: "OAB/SC 65.939",
        specialties: ["Direito Civil", "Direito do Agronegócio", "Direito Ambiental"],
        image: "/images/team/luiza-haas.png",
        gradient: "from-[#E8D49A] to-[#E8D49A]",
        email: "luiza@erlohaas.com.br",
    },
    {
        name: "Maísa Christ",
        role: "Advogada",
        oab: "OAB/SC 74.365",
        specialties: ["Direito Civil"],
        image: "/images/team/maisa-christ.png",
        gradient: "from-[#3B5A3C] to-[#1B2D1E]",
        email: "maisa@erlohaas.com.br",
    },
    {
        name: "Jacson Mateus Erlo",
        role: "Advogado",
        oab: "OAB/SC 74.319",
        specialties: ["Direito do Agronegócio", "Direito Civil", "Direito Ambiental"],
        image: "/images/team/jacson-erlo.png",
        gradient: "from-[#1B2D1E] to-[#0D1812]",
        email: "jacson@erlohaas.com.br",
    },
    {
        name: "Jean Tiago Erlo",
        role: "Advogado",
        oab: "OAB/SC 67.239",
        specialties: ["Direito do Agronegócio", "Direito Ambiental"],
        image: "/images/team/jean-erlo.png",
        gradient: "from-[#1B2D1E] to-[#1B2D1E]",
        email: "jean@erlohaas.com.br",
    },
];

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" as const },
    },
};

export function TeamSection() {
    const prefersReducedMotion = useReducedMotion();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia("(max-width: 768px)");
        setIsMobile(mql.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, []);

    const shouldReduceMotion = prefersReducedMotion || isMobile;

    const renderCard = (member: typeof team[0]) => (
        <motion.div
            key={member.name}
            variants={cardVariants}
            className="group h-full"
        >
            <div
                className={cn(
                    "relative rounded-2xl overflow-hidden h-full flex flex-col",
                    "bg-[#3B5A3C]/60 border border-[#3B5A3C]/30",
                    "transition-all duration-500",
                    "hover:border-[#E8D49A]/30 hover:shadow-2xl hover:shadow-champagne-500/5",
                    "hover:-translate-y-2"
                )}
            >
                {/* Top gradient bar */}
                <div className={cn("h-1.5 flex-none bg-gradient-to-r absolute top-0 z-10 left-0 right-0", member.gradient)} />

                {/* Avatar / Image */}
                <div className="relative w-full aspect-[3/4] flex-none overflow-hidden bg-[#0D1812] mb-0">
                    <Image
                        src={member.image}
                        alt={`${member.name} - ${member.role} especialista em ${member.specialties.join(", ")}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover w-full h-full object-top transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B2D1E] via-[#1B2D1E]/70 to-transparent opacity-100 transition-opacity duration-500 group-hover:opacity-90" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 flex flex-col justify-end">
                        <h3 className="font-display text-xl font-bold text-[#EEEDE5] leading-tight drop-shadow-md">
                            {member.name}
                        </h3>
                        <p className="text-[#877249] text-sm font-semibold mt-0.5 drop-shadow-md">
                            {member.role}
                        </p>
                    </div>
                </div>

                <div className="p-6 pt-5 bg-[#3B5A3C]/60 flex-1 flex flex-col justify-between">
                    <div>
                        {/* OAB */}
                        <p className="text-xs text-[#EEEDE5]/30 font-mono tracking-wider mb-4">
                            {member.oab}
                        </p>

                        {/* Specialties */}
                        <div className="flex flex-wrap gap-2 mb-6 min-h-[80px] content-start">
                            {member.specialties.map((spec) => (
                                <span
                                    key={spec}
                                    className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-[#E8D49A] text-[#0D1812]"
                                >
                                    {spec}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="flex gap-2 pt-4 border-t border-[#3B5A3C]/30 mt-auto">
                        <a
                            href={`mailto:${member.email}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#EEEDE5]/40 hover:text-[#877249]/70 hover:bg-[#E8D49A]/10 transition-all"
                            aria-label={`Email de ${member.name}`}
                        >
                            <Mail className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <section className="py-24 lg:py-32 bg-[#1B2D1E] relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E8D49A]/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E8D49A]/20 to-transparent" />
            <div className="absolute top-20 right-10 w-64 h-64 bg-[#E8D49A]/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#3B5A3C]/10 rounded-full blur-[100px]" />

            <Container className="relative">
                <SectionTitle
                    label="Nossa Equipe"
                    title="Profissionais dedicados ao seu caso"
                    subtitle="Uma equipe pronta para oferecer as soluções jurídicas mais adequadas para o seu caso."
                    light
                />

                {/* Mobile: 1 column */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    className="md:hidden grid grid-cols-1 gap-6 items-stretch"
                >
                    {team.map(renderCard)}
                </motion.div>

                {/* Tablet: 2 columns (2 + 2 + 1 centered) */}
                <div className="hidden md:block lg:hidden">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-60px" }}
                        className="grid grid-cols-2 gap-6 mb-6 items-stretch"
                    >
                        {team.slice(0, 4).map(renderCard)}
                    </motion.div>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-60px" }}
                        className="grid grid-cols-1 max-w-[50%] mx-auto items-stretch"
                    >
                        {team.slice(4, 5).map(renderCard)}
                    </motion.div>
                </div>

                {/* Desktop: 3 columns top row, 2 columns bottom row centered */}
                <div className="hidden lg:block">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-60px" }}
                        className="grid grid-cols-3 gap-8 items-stretch"
                    >
                        {team.slice(0, 3).map(renderCard)}
                    </motion.div>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-60px" }}
                        className="grid grid-cols-2 gap-8 max-w-[66%] mx-auto mt-8 items-stretch"
                    >
                        {team.slice(3, 5).map(renderCard)}
                    </motion.div>
                </div>
            </Container>
        </section>
    );
}

```

--- components/layout/footer.tsx ---
```tsx
"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
    Scale,
    MapPin,
    Phone,
    Mail,
    Instagram,
    Linkedin,
    ArrowUpRight,
} from "lucide-react";
import { Container } from "@/components/ui/container";

const practiceAreas = [
    { label: "Direito Empresarial", href: "/areas-de-atuacao#empresarial" },
    { label: "Direito Trabalhista", href: "/areas-de-atuacao#trabalhista" },
    { label: "Direito Civil", href: "/areas-de-atuacao#civil" },
    { label: "Direito Tributário", href: "/areas-de-atuacao#tributario" },
];

const quickLinks = [
    { label: "Sobre o Escritório", href: "/sobre" },
    { label: "Nossa Equipe", href: "/equipe" },
    { label: "Blog Jurídico", href: "/blog" },
    { label: "Fale Conosco", href: "/contato" },
];

const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/ehs.adv/", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
];

export function Footer() {
    const { isSignedIn } = useAuth();
    
    return (
        <footer className="relative bg-[#1B2D1E] text-[#EEEDE5]/80 overflow-hidden">
            {/* Decorative top border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#877249] via-[#E8D49A] to-[#877249]" />

            {/* Decorative subtle pattern */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8D49A]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

            <Container className="relative">
                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 py-16 lg:py-20">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="group inline-flex items-center gap-3 no-underline mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8D49A] text-[#0D1812] transition-transform duration-300 group-hover:scale-105">
                                <Scale className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-display text-lg font-bold text-[#EEEDE5] leading-tight">
                                    Erlo Haas
                                </span>
                                <span className="font-display text-[10px] uppercase tracking-[0.3em] text-[#877249]/70 leading-none">
                                    & Steffens
                                </span>
                            </div>
                        </Link>
                        <p className="text-sm leading-relaxed text-[#EEEDE5]/60 max-w-xs">
                            Advocacia com tradição, expertise e dedicação aos nossos clientes
                            desde 2010.
                        </p>

                        {/* Social */}
                        <div className="flex gap-3 mt-6">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3B5A3C] text-[#EEEDE5]/60 transition-all duration-200 hover:bg-[#E8D49A] hover:text-[#0D1812] hover:scale-105"
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Practice Areas */}
                    <div>
                        <h4 className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-[#877249]/70 mb-5">
                            Áreas de Atuação
                        </h4>
                        <ul className="space-y-3">
                            {practiceAreas.map((area) => (
                                <li key={area.href}>
                                    <Link
                                        href={area.href}
                                        className="group inline-flex items-center gap-1.5 text-sm text-[#EEEDE5]/70 hover:text-[#877249]/70 transition-colors no-underline"
                                    >
                                        {area.label}
                                        <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0.5 transition-all group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-[#877249]/70 mb-5">
                            Links Rápidos
                        </h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="group inline-flex items-center gap-1.5 text-sm text-[#EEEDE5]/70 hover:text-[#877249]/70 transition-colors no-underline"
                                    >
                                        {link.label}
                                        <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0.5 transition-all group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0" />
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link
                                    href={isSignedIn ? "/admin" : "/sign-in"}
                                    className="text-xs text-[#3B5A3C]/40 hover:text-[#E8D49A]/60 transition-colors duration-300 no-underline"
                                >
                                    Área Restrita
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-[#877249]/70 mb-5">
                            Contato
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 mt-1 text-[#E8D49A] shrink-0" />
                                <p className="text-sm text-[#EEEDE5]/70 leading-relaxed">
                                    Rua Exemplo, 123 — Sala 1001
                                    <br />
                                    Centro, Cidade — RS
                                </p>
                            </div>
                            <a
                                href="tel:+5549984001053"
                                className="flex items-center gap-3 text-sm text-[#EEEDE5]/70 hover:text-[#877249]/70 transition-colors no-underline"
                            >
                                <Phone className="h-4 w-4 text-[#E8D49A] shrink-0" />
                                +55 (49) 98400-1053
                            </a>
                            <a
                                href="mailto:contato@erlohaas.com.br"
                                className="flex items-center gap-3 text-sm text-[#EEEDE5]/70 hover:text-[#877249]/70 transition-colors no-underline"
                            >
                                <Mail className="h-4 w-4 text-[#E8D49A] shrink-0" />
                                contato@erlohaas.com.br
                            </a>
                        </div>
                    </div>
                </div>

                {/* ── Bottom Bar ── */}
                <div className="border-t border-[#3B5A3C] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-[#EEEDE5]/40">
                        © {new Date().getFullYear()} Erlo Haas & Steffens Advogados Associados. Todos os
                        direitos reservados.
                    </p>
                    <div className="flex gap-6">
                        <Link
                            href="/politica-de-privacidade"
                            className="text-xs text-[#EEEDE5]/40 hover:text-[#EEEDE5]/70 transition-colors no-underline"
                        >
                            Política de Privacidade
                        </Link>
                        <Link
                            href="/termos-de-uso"
                            className="text-xs text-[#EEEDE5]/40 hover:text-[#EEEDE5]/70 transition-colors no-underline"
                        >
                            Termos de Uso
                        </Link>
                    </div>
                </div>
            </Container>
        </footer>
    );
}

```

--- components/sections/cta-section.tsx ---
```tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function CtaSection() {
 return (
 <section className="py-24 lg:py-28 bg-[#1B2D1E] relative overflow-hidden">
 {/* Decorative */}
 <div className="absolute inset-0">
 <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8D49A]/8 rounded-full blur-[120px]" />
 <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#E8D49A]/5 rounded-full blur-[100px]" />
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#3B5A3C]/10 rounded-full blur-[150px]" />
 </div>

 <Container className="relative text-center">
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.6 }}
 >
 <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.2em] text-[#E8D49A] mb-5">
 Entre em contato
 </span>
 <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#EEEDE5] mb-6 leading-tight">
 Precisa de assessoria
 <br />
 <span className="text-[#E8D49A]">jurídica especializada?</span>
 </h2>
 <p className="text-[#EEEDE5]/70 text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-body">
 Agende uma consulta inicial. Nossa equipe está pronta
 para analisar seu caso e apresentar as melhores estratégias.
 </p>
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <Link href="/contato">
 <Button variant="secondary" size="lg" className="group text-base">
 Fale com um Advogado
 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
 </Button>
 </Link>
 <a href="https://wa.me/+5549984001053" target="_blank" rel="noopener noreferrer">
 <Button
 variant="outline"
 size="lg"
 className="border-[#F5F0E8]/25 text-[#EEEDE5] hover:bg-[#EEEDE5]/10 hover:text-[#EEEDE5] text-base"
 >
 WhatsApp
 </Button>
 </a>
 </div>
 </motion.div>
 </Container>
 </section>
 );
}

```

--- app/contato/page.tsx ---
```tsx
import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
 title: "Contato",
 description: "Entre em contato com o escritório Erlo Haas & Steffens. Agende uma consulta.",
};

const contactInfo = [
 {
 icon: MapPin,
 label: "Endereço",
 value: "Rua Exemplo, 123 — Sala 1001\nCentro, Cidade — RS\nCEP 90000-000",
 href: "https://maps.google.com/?q=Rua+Exemplo+123+Cidade+RS",
 },
 {
 icon: Phone,
 label: "Telefone",
 value: "+55 (49) 98400-1053",
 href: "tel:+5549984001053",
 },
 {
 icon: Mail,
 label: "E-mail",
 value: "contato@erlohaas.com.br",
 href: "mailto:contato@erlohaas.com.br",
 },
 {
 icon: Clock,
 label: "Horário",
 value: "Segunda a Sexta\n9h às 18h",
 href: null,
 },
];

export default function ContatoPage() {
 return (
 <>
 {/* Hero */}
 <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 bg-gradient-to-b from-[#0D1812] to-[#1B2D1E] relative overflow-hidden">
 <div className="absolute top-10 left-10 w-80 h-80 bg-[#E8D49A]/8 rounded-full blur-[120px]" />
 <Container className="relative">
 <div className="max-w-3xl">
 <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.2em] text-[#E8D49A] mb-4">
 Contato
 </span>
 <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#EEEDE5] leading-tight mb-6">
 Fale
 <span className="text-[#E8D49A]"> conosco</span>
 </h1>
 <p className="text-lg text-[#EEEDE5]/70 leading-relaxed max-w-2xl">
 Agende uma consulta inicial ou envie sua mensagem. Estamos prontos para ouvir você.
 </p>
 </div>
 </Container>
 <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-[1] hidden md:block" style={{ height: '60px', background: 'linear-gradient(to bottom, transparent, #F5F0E8)' }} />
 </section>

 {/* Contact Content */}
 <section className="py-20 lg:py-28">
 <Container>
 <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
 {/* Form */}
 <div className="lg:col-span-3">
 <h2 className="font-display text-2xl font-bold text-[#0D1812] mb-2">
 Envie sua mensagem
 </h2>
 <p className="text-[#3B5A3C] mb-8">
 Preencha o formulário abaixo e retornaremos o mais breve possível.
 </p>
 <ContactForm />
 </div>

 {/* Sidebar */}
 <div className="lg:col-span-2 space-y-6">
 {/* Contact Cards */}
 {contactInfo.map((item) => {
 const Wrapper = item.href ? "a" : "div";
 const wrapperProps = item.href
 ? { href: item.href, target: item.href.startsWith("http") ? "_blank" : undefined, rel: item.href.startsWith("http") ? "noopener noreferrer" : undefined }
 : {};

 return (
 <Wrapper
 key={item.label}
 {...wrapperProps}
 className="group flex items-start gap-4 rounded-xl border border-forest-100 bg-white p-5 transition-all hover:border-forest-200 hover:shadow-md no-underline"
 >
 <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEEDE5] text-[#3B5A3C] shrink-0 group-hover:bg-[#E8D49A]/30 group-hover:text-[#877249] transition-colors">
 <item.icon className="h-5 w-5" />
 </div>
 <div>
 <p className="text-xs font-semibold uppercase tracking-wider text-[#3B5A3C] mb-1">{item.label}</p>
 <p className="text-[#0D1812] text-sm leading-relaxed whitespace-pre-line">{item.value}</p>
 </div>
 </Wrapper>
 );
 })}

 {/* WhatsApp CTA */}
 <a
 href="https://wa.me/+5549984001053"
 target="_blank"
 rel="noopener noreferrer"
 className="group flex items-center gap-4 rounded-xl bg-[#3B5A3C] p-5 transition-all hover:bg-[#3B5A3C] no-underline"
 >
 <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500 text-[#EEEDE5] shrink-0">
 <MessageCircle className="h-5 w-5" />
 </div>
 <div>
 <p className="text-[#EEEDE5] font-medium text-sm">Prefere WhatsApp?</p>
 <p className="text-[#EEEDE5]/50 text-xs">Clique aqui e fale direto com a gente</p>
 </div>
 </a>

 {/* Map Embed */}
 <Card variant="default" padding="none" className="overflow-hidden">
 <CardContent>
 <div className="aspect-[4/3] bg-[#EEEDE5] flex items-center justify-center">
 <iframe
 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3454.2!2d-51.2!3d-30.03!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDAyJzAuMCJTIDUxwrAxMicwLjAiVw!5e0!3m2!1spt-BR!2sbr!4v1"
 width="100%"
 height="100%"
 style={{ border: 0, minHeight: "280px" }}
 allowFullScreen
 loading="lazy"
 referrerPolicy="no-referrer-when-downgrade"
 title="Localização Erlo Haas & Steffens"
 />
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 </Container>
 </section>
 </>
 );
}

```
