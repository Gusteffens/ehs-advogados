"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { TeamCard, type TeamMember } from "@/components/equipe/TeamCard";

const teamMembers: TeamMember[] = [
    {
        name: "Alessandra Franke Steffens",
        role: "Advogada",
        oab: "OAB/SC 21.390-B | OAB/RS 55.474",
        specialties: ["Direito Criminal"],
        image: "/images/team/alessandra-mesa.jpg",
        gradient: "from-[#E8D49A] to-[#877249]",
        email: "alessandra@erlohaas.com.br",
        bio: "",
        whatsapp: "https://wa.me/+5549984001053",
    },
    {
        name: "Luíza Klein Haas",
        role: "Advogada",
        oab: "OAB/SC 65.939",
        specialties: ["Direito Civil", "Direito do Agronegócio", "Direito Ambiental"],
        image: "/images/team/luiza-mesa.jpeg",
        gradient: "from-[#E8D49A] to-[#E8D49A]",
        email: "luiza@erlohaas.com.br",
        bio: "",
        whatsapp: "https://wa.me/+5549984001053",
    },
    {
        name: "Maísa Christ",
        role: "Advogada",
        oab: "OAB/SC 74.365",
        specialties: ["Direito Civil"],
        image: "/images/team/maisa-mesa.jpg",
        gradient: "from-[#3B5A3C] to-[#1B2D1E]",
        email: "maisa@erlohaas.com.br",
        bio: "",
        whatsapp: "https://wa.me/+5549984001053",
    },
    {
        name: "Jacson Mateus Erlo",
        role: "Advogado",
        oab: "OAB/SC 74.319",
        specialties: ["Direito do Agronegócio", "Direito Civil", "Direito Ambiental"],
        image: "/images/team/jacson-mesa.jpeg",
        gradient: "from-[#1B2D1E] to-[#0D1812]",
        email: "jacson@erlohaas.com.br",
        bio: "",
        whatsapp: "https://wa.me/+5549984001053",
    },
    {
        name: "Jean Tiago Erlo",
        role: "Advogado",
        oab: "OAB/SC 67.239 | OAB/PR 134.567",
        specialties: ["Direito do Agronegócio", "Direito Ambiental"],
        image: "/images/team/jean-mesa.jpeg",
        gradient: "from-[#1B2D1E] to-[#1B2D1E]",
        email: "jean@erlohaas.com.br",
        bio: "",
        whatsapp: "https://wa.me/+5549984001053",
    },
];

export default function EquipePage() {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const handleToggle = (index: number) => {
        setExpandedIndex((prev) => (prev === index ? null : index));
    };

    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 bg-gradient-to-b from-[#0D1812] to-[#1B2D1E] relative overflow-hidden">
                <div className="absolute top-20 right-20 w-72 h-72 bg-[#E8D49A]/8 rounded-full blur-[120px]" />
                <Container className="relative">
                    <div className="max-w-3xl">
                        <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.2em] text-[#E8D49A] mb-4">
                            Nossa Equipe
                        </span>
                        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#EEEDE5] leading-tight mb-6">
                            Profissionais
                            <span className="text-[#E8D49A]"> dedicados</span>
                        </h1>
                        <p className="text-lg text-[#EEEDE5]/70 leading-relaxed max-w-2xl">
                            Uma equipe multidisciplinar, formada por profissionais qualificados
                            e comprometidos com a excelência em cada caso.
                        </p>
                    </div>
                </Container>
                <div
                    className="absolute bottom-0 left-0 right-0 pointer-events-none z-[1] hidden md:block"
                    style={{ height: "60px", background: "linear-gradient(to bottom, transparent, #EEEDE5)" }}
                />
            </section>

            {/* Team Grid */}
            <section className="py-20 lg:py-28 bg-[#EEEDE5]">
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                        {teamMembers.map((member, index) => (
                            <TeamCard
                                key={member.name}
                                member={member}
                                isExpanded={expandedIndex === index}
                                onToggle={() => handleToggle(index)}
                            />
                        ))}
                    </div>
                </Container>
            </section>

            {/* CTA */}
            <section className="py-20 bg-[#1B2D1E]">
                <Container className="text-center">
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#EEEDE5] mb-6">
                        Converse com um de nossos advogados
                    </h2>
                    <p className="text-[#EEEDE5]/70 text-lg max-w-xl mx-auto mb-8">
                        Agende uma consulta para discutir seu caso com quem entende.
                    </p>
                    <Link href="/contato">
                        <Button variant="secondary" size="lg" className="group">
                            Agende uma Consulta
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </Container>
            </section>
        </>
    );
}