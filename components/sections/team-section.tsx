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
        oab: "OAB/SC 67.239 | OAB/PR 134.567",
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
