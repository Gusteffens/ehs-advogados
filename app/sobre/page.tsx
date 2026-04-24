import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Scale, Target, Heart, Eye, ArrowRight, Award, BookOpen, Handshake } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section-title";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Sobre o Escritório",
    description: "Conheça a história e os valores da Erlo, Haas & Steffens, escritório de advocacia fundado em 2022 em São Miguel do Oeste - SC.",
};

const values = [
    { icon: Award, title: "Excelência", description: "Buscamos os mais altos padrões de qualidade em cada caso que assumimos." },
    { icon: Handshake, title: "Ética", description: "Atuamos com integridade, transparência e respeito em todas as relações." },
    { icon: Heart, title: "Dedicação", description: "Cada cliente recebe atenção personalizada e comprometimento total." },
    { icon: BookOpen, title: "Conhecimento", description: "Investimos continuamente na atualização e formação de nossa equipe." },
];

const timeline = [
    { year: "2022", event: "Fundação do escritório Erlo, Haas & Steffens em São Miguel do Oeste - SC, com foco em advocacia ética e especializada." },
    { year: "2023", event: "Consolidação da atuação em Direito Agrário e Ambiental, atendendo clientes do agronegócio catarinense e todo o Brasil." },
    { year: "2024", event: "Expansão da equipe e ampliação das áreas de atuação para Direito Militar e Penal." },
    { year: "2025", event: "Lançamento do canal digital e do blog jurídico, ampliando o alcance do escritório em todo o Brasil." },
];

export default function SobrePage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-0 lg:pt-40 lg:pb-0 bg-gradient-to-b from-[#0D1812] to-[#1B2D1E] relative overflow-hidden">
                <div className="absolute top-10 right-10 w-80 h-80 bg-[#E8D49A]/8 rounded-full blur-[120px]" />
                <Container className="relative pb-16 lg:pb-24">
                    <div className="max-w-3xl">
                        <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.2em] text-[#E8D49A] mb-4">
                            Sobre Nós
                        </span>
                        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#EEEDE5] leading-tight mb-6">
                            Uma história de
                            <span className="text-[#E8D49A]"> tradição e resultados</span>
                        </h1>
                        <p className="text-lg text-[#EEEDE5] leading-relaxed max-w-2xl">
                            Desde 2022, o Erlo, Haas & Steffens se dedica a oferecer soluções jurídicas
                            estratégicas com excelência, ética e compromisso com cada cliente.
                        </p>
                    </div>
                </Container>

                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mb-10 lg:-mb-16">
                    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl lg:rounded-t-3xl overflow-hidden shadow-2xl border border-[#3B5A3C]/20">
                        <Image
                            src="/images/team/equipe.webp"
                            alt="Equipe de advogados do Erlo, Haas & Steffens"
                            width={1400}
                            height={600}
                            className="object-cover w-full h-full object-center"
                            priority={true}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1812]/80 via-transparent to-transparent opacity-60 pointer-events-none" />
                    </div>
                </div>
            </section>

            {/* Mission / Vision */}
            <section className="py-20 lg:py-28">
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Target, label: "Missão", text: "Oferecer assessoria jurídica qualificada, estratégica e personalizada, com atuação ética e técnica voltada à adequada condução das demandas de cada cliente." },
                            { icon: Eye, label: "Visão", text: "Ser reconhecido como escritório de referência regional e nacional, pela excelência jurídica, pela confiança construída com os clientes e pela solidez de sua atuação." },
                            { icon: Scale, label: "Propósito", text: "Firmar a advocacia como prática de responsabilidade, seriedade e segurança jurídica, orientada pelo compromisso com o direito e com as particularidades de cada caso." },
                        ].map((item) => (
                            <Card key={item.label} variant="elevated" hoverable>
                                <CardContent>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEEDE5] text-[#0D1812] mb-5">
                                        <item.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-display text-xl font-bold text-[#0D1812] mb-3">{item.label}</h3>
                                    <p className="text-[#3B5A3C] leading-relaxed text-[0.925rem]">{item.text}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Values */}
            <section className="py-20 bg-[#EEEDE5]">
                <Container>
                    <SectionTitle
                        label="Nossos Valores"
                        title="Princípios que nos guiam"
                        subtitle="Estes são os pilares que sustentam todas as nossas decisões e ações."
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((v) => (
                            <div key={v.title} className="text-center p-6">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8D49A]/30 text-[#877249] mx-auto mb-4">
                                    <v.icon className="h-6 w-6" />
                                </div>
                                <h4 className="font-display text-lg font-bold text-[#0D1812] mb-2">{v.title}</h4>
                                <p className="text-[#3B5A3C] text-sm leading-relaxed">{v.description}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Timeline */}
            <section className="py-20 lg:py-28">
                <Container narrow>
                    <SectionTitle
                        label="Nossa Trajetória"
                        title="Marcos importantes"
                    />
                    <div className="relative">
                        <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-px bg-[#3B5A3C]/50 lg:-translate-x-px" />
                        <div className="space-y-10">
                            {timeline.map((item, i) => (
                                <div key={item.year} className={`relative flex items-start gap-6 lg:gap-0 ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}>
                                    <div className={`hidden lg:block lg:w-1/2 ${i % 2 === 0 ? "lg:pr-12 lg:text-right" : "lg:pl-12"}`}>
                                        <p className="text-[#3B5A3C] leading-relaxed">{item.event}</p>
                                    </div>
                                    <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8D49A] text-[#0D1812] font-bold text-xs shadow-md lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                                        {item.year}
                                    </div>
                                    <div className="lg:hidden flex-1">
                                        <p className="text-[#3B5A3C] leading-relaxed">{item.event}</p>
                                    </div>
                                    <div className={`hidden lg:block lg:w-1/2 ${i % 2 === 0 ? "lg:pl-12" : "lg:pr-12 lg:text-right"}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            {/* CTA */}
            <section className="py-20 bg-[#1B2D1E]">
                <Container className="text-center">
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#EEEDE5] mb-6">
                        Fale com nossa equipe
                    </h2>
                    <p className="text-[#EEEDE5] text-lg max-w-xl mx-auto mb-8">
                        Estamos prontos para conhecer seu caso e apresentar as melhores soluções.
                    </p>
                    <Link href="/contato">
                        <Button variant="secondary" size="lg" className="group">
                            Entre em Contato
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </Container>
            </section>
        </>
    );
}
