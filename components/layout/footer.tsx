"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import {
    MapPin,
    Phone,
    Mail,
    Instagram,
    Facebook,
    ArrowUpRight,
} from "lucide-react";
import { Container } from "@/components/ui/container";

const practiceAreas = [
    { label: "Direito Civil", href: "/areas-de-atuacao#civil" },
    { label: "Direito Penal", href: "/areas-de-atuacao#penal" },
    { label: "Direito Agrário e do Agronegócio", href: "/areas-de-atuacao#agrario" },
    { label: "Direito Ambiental", href: "/areas-de-atuacao#ambiental" },
    { label: "Direito Militar", href: "/areas-de-atuacao#militar" },
    { label: "Direito Empresarial", href: "/areas-de-atuacao#empresarial" },
];

const quickLinks = [
    { label: "Sobre o Escritório", href: "/sobre" },
    { label: "Nossa Equipe", href: "/equipe" },
    { label: "Blog Jurídico", href: "/blog" },
    { label: "Fale Conosco", href: "/contato" },
];

const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/ehs.adv/", label: "Instagram" },
    { icon: Facebook, href: "https://www.facebook.com/ehs.adv", label: "Facebook" },
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
                            <Image
                                src="/images/logo-ehs-monogram.png"
                                alt="Erlo, Haas & Steffens"
                                width={44}
                                height={44}
                                className="object-contain brightness-[3] transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="flex flex-col">
                                <span className="font-display text-lg font-bold leading-tight tracking-tight text-[#EEEDE5]">
                                    Erlo, Haas & Steffens
                                </span>
                                <span className="font-display text-[11px] font-medium uppercase tracking-[0.25em] leading-none text-[#877249]/70">
                                    Sociedade de Advocacia
                                </span>
                            </div>
                        </Link>
                        <p className="text-sm leading-relaxed text-[#EEEDE5]/60 max-w-xs">
                            Advocacia com tradição, expertise e dedicação aos nossos clientes
                            desde 2022.
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
                                    Rua Itaberaba, 930, Sala 304<br />
                                    Ed. Fransozi, Centro<br />
                                    São Miguel do Oeste - SC<br />
                                    <span className="text-[#EEEDE5]/40 text-xs font-mono">
                                        CNPJ: 48.624.064/0001-90 | OAB/SC 8487
                                    </span>
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
                                href="mailto:ehs.escritorio@gmail.com"
                                className="flex items-center gap-3 text-sm text-[#EEEDE5]/70 hover:text-[#877249]/70 transition-colors no-underline"
                            >
                                <Mail className="h-4 w-4 text-[#E8D49A] shrink-0" />
                                ehs.escritorio@gmail.com
                            </a>
                        </div>
                    </div>
                </div>

                {/* ── Bottom Bar ── */}
                <div className="border-t border-[#3B5A3C] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-[#EEEDE5]/40">
                        © {new Date().getFullYear()} Erlo, Haas & Steffens Advogados Associados. Todos os
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
