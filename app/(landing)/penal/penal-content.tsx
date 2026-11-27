"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  FileSearch,
  Gavel,
  Instagram,
  Lock,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Play,
  Scale,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { WhatsAppLink } from "@/components/tracking/whatsapp-link";
import { SITE_CONFIG } from "@/lib/site-config";
import { getConsentState, trackWhatsAppClick } from "@/lib/tracking";
import { cn } from "@/lib/utils";
import "./penal.css";

const WHATSAPP_BASE_MESSAGE =
  "Olá, encontrei a página de Direito Penal do escritório Erlo, Haas & Steffens e gostaria de solicitar atendimento.";

const WHATSAPP_LINK = `${SITE_CONFIG.contact.whatsapp}?text=${encodeURIComponent(
  WHATSAPP_BASE_MESSAGE
)}`;

const REEL_URL = "https://www.instagram.com/reel/DXfNdGXCfYY/";

const alessandra =
  SITE_CONFIG.team.find((member) => member.slug === "alessandra-steffens") ??
  SITE_CONFIG.team[0];

const navLinks = [
  { href: "#atuacao", label: "Atuação" },
  { href: "#como-ajudar", label: "Como podemos ajudar" },
  { href: "#escritorio", label: "Especialista" },
  { href: "#duvidas", label: "Dúvidas" },
  { href: "#contato", label: "Contato" },
];

const urgencySignals = [
  "Flagrantes",
  "Intimações",
  "Investigações",
  "Processos",
];

const helpAreas = [
  {
    number: "01",
    icon: ShieldAlert,
    title: "Prisão em flagrante e audiência de custódia",
    description:
      "Atuação imediata para análise da legalidade da prisão, pedidos de liberdade e proteção de garantias.",
  },
  {
    number: "02",
    icon: UserCheck,
    title: "Intimações, depoimentos e interrogatórios",
    description:
      "Orientação prévia e acompanhamento técnico em delegacia ou em juízo antes de qualquer declaração.",
  },
  {
    number: "03",
    icon: FileSearch,
    title: "Inquéritos e investigações criminais",
    description:
      "Acompanhamento de procedimentos investigativos, acesso aos autos e construção de linha defensiva desde o início.",
  },
  {
    number: "04",
    icon: ShieldCheck,
    title: "Busca e apreensão e medidas cautelares",
    description:
      "Avaliação técnica de ordens judiciais, restrições patrimoniais ou pessoais e medidas cabíveis.",
  },
  {
    number: "05",
    icon: Gavel,
    title: "Defesa em processos e recursos criminais",
    description:
      "Defesa técnica em todas as instâncias, Tribunal do Júri, execução penal e recursos superiores.",
  },
  {
    number: "06",
    icon: Scale,
    title: "Assistência jurídica às vítimas",
    description:
      "Orientação, representação e acompanhamento processual como assistente de acusação quando cabível.",
  },
];

const methodSteps = [
  {
    number: "01",
    title: "Compreensão da situação",
    description:
      "Escuta reservada e objetiva dos fatos para identificar urgências, prazos e riscos imediatos.",
  },
  {
    number: "02",
    title: "Análise jurídica e documental",
    description:
      "Exame técnico de intimações, boletins, autos ou decisões para fundamentar cada encaminhamento.",
  },
  {
    number: "03",
    title: "Definição da estratégia",
    description:
      "Condução individualizada e transparente das medidas judiciais ou extrajudiciais adequadas ao caso.",
  },
];

const faqs = [
  {
    question: "Quando devo procurar um advogado criminal?",
    answer:
      "Assim que houver prisão, intimação, investigação, acusação ou dúvida sobre possível repercussão criminal. A orientação inicial ajuda a avaliar os próximos passos.",
  },
  {
    question: "Recebi uma intimação. O que devo fazer?",
    answer:
      "Preserve o documento e procure orientação antes da data indicada. A providência depende do conteúdo e da finalidade da intimação.",
  },
  {
    question: "Posso ser acompanhado antes de prestar depoimento?",
    answer:
      "Em geral, é possível obter orientação jurídica prévia e acompanhamento. As condições concretas devem ser verificadas conforme o procedimento.",
  },
  {
    question: "O escritório atende situações urgentes?",
    answer:
      "Sim, o escritório recebe contatos urgentes. A disponibilidade e as medidas possíveis são avaliadas conforme cada situação.",
  },
  {
    question: "Um familiar pode solicitar atendimento para uma pessoa presa?",
    answer:
      "Sim. O familiar pode fornecer as informações iniciais para avaliação da situação e das providências possíveis.",
  },
];

export default function PenalPageContent() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({ 0: true });
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const syncConsent = () => {
      setBannerVisible(getConsentState() === "unset");
    };
    syncConsent();
    window.addEventListener("ehs:consent-change", syncConsent);
    return () => window.removeEventListener("ehs:consent-change", syncConsent);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.currentTarget;
    const name = (
      target.elements.namedItem("name") as HTMLInputElement
    ).value.trim();
    const phone = (
      target.elements.namedItem("phone") as HTMLInputElement
    ).value.trim();
    const message = (
      target.elements.namedItem("message") as HTMLTextAreaElement
    ).value.trim();

    const textLines = [
      "Olá, encontrei a página de Direito Penal da EHS Advocacia e gostaria de solicitar atendimento.",
      "",
      `Nome: ${name}`,
      phone ? `Telefone: ${phone}` : null,
      `Mensagem: ${message}`,
    ].filter(Boolean);

    trackWhatsAppClick({
      page: "/penal",
      placement: "penal-whatsapp-form",
      label: "Formulário WhatsApp Penal",
    });

    const text = textLines.join("\n");
    window.open(
      `${SITE_CONFIG.contact.whatsapp}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const floatingVisibility = bannerVisible
    ? "hidden sm:inline-flex"
    : "inline-flex";

  return (
    <div className="landing-penal" id="topo">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>

      {/* ── Header LP (mesmo padrão visual do site principal) ── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-cream shadow-md shadow-forest-900/5 py-3 lg:bg-cream/95 lg:backdrop-blur-xl"
            : "bg-transparent py-5"
        )}
      >
        <Container>
          <nav
            className="flex items-center justify-between gap-4"
            aria-label="Navegação principal"
          >
            <a
              href="#topo"
              className="group flex items-center gap-3 no-underline"
              aria-label={`${SITE_CONFIG.legalName} — início`}
            >
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/images/logo-ehs-monogram.png"
                  alt={SITE_CONFIG.shortName}
                  width={44}
                  height={44}
                  className={cn(
                    "object-contain transition-all duration-500",
                    scrolled ? "brightness-0" : "brightness-100"
                  )}
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span
                  className={cn(
                    "font-display text-lg font-bold leading-tight tracking-tight transition-colors duration-500",
                    scrolled ? "text-ink" : "text-cream"
                  )}
                >
                  Erlo, Haas & Steffens
                </span>
                <span
                  className={cn(
                    "font-body text-[10px] font-semibold uppercase tracking-[0.2em] leading-none mt-0.5 transition-colors duration-500",
                    scrolled ? "text-gold-dark" : "text-gold/85"
                  )}
                >
                  Direito Criminal
                </span>
              </div>
            </a>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 no-underline",
                    scrolled
                      ? "text-forest-600 hover:text-ink hover:bg-forest-100/60"
                      : "text-cream/80 hover:text-cream hover:bg-cream/10"
                  )}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <WhatsAppLink
                href={WHATSAPP_LINK}
                page="/penal"
                placement="header-cta"
                label="Header Penal"
                className="no-underline"
              >
                <Button variant="secondary" size="sm">
                  Solicitar atendimento
                </Button>
              </WhatsAppLink>
            </div>

            {/* Mobile Toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className={cn(
                "lg:hidden relative z-50 flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                menuOpen
                  ? "text-ink hover:bg-forest-100"
                  : scrolled
                    ? "text-ink hover:bg-forest-100"
                    : "text-cream hover:bg-cream/10"
              )}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              aria-controls="penal-mobile-drawer"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </nav>
        </Container>

        {/* Mobile Drawer */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 bg-ink/60 lg:hidden"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div
              id="penal-mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navegação"
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-cream shadow-2xl lg:hidden"
            >
              <div className="flex flex-col h-full pt-24 px-8 pb-8">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 text-lg font-medium rounded-xl text-ink hover:bg-forest-100 transition-colors no-underline"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>

                <div className="mt-auto space-y-3">
                  <div className="h-px bg-forest-600/25 mb-4" />
                  <WhatsAppLink
                    href={WHATSAPP_LINK}
                    page="/penal"
                    placement="mobile-menu-cta"
                    label="Menu Mobile Penal"
                    onClick={() => setMenuOpen(false)}
                    className="block no-underline"
                  >
                    <Button variant="secondary" size="md" className="w-full">
                      Solicitar atendimento
                    </Button>
                  </WhatsAppLink>
                  <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-forest-600 hover:text-ink no-underline"
                  >
                    Site institucional
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      <main id="conteudo">
        {/* ── Hero Section ── */}
        <section
          id="atuacao"
          className="relative min-h-[88vh] flex items-center overflow-hidden bg-ink text-cream pt-28 pb-20 lg:pt-32 lg:pb-28 scroll-mt-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0 opacity-35">
            <Image
              src="/images/team/alessandra-mesa.jpg"
              alt="Dra. Alessandra Franke Steffens em fotografia institucional"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[70%_22%]"
            />
          </div>

          {/* Dark gradient overlay dissolving cleanly into ink (#0D1812) */}
          <div
            className="absolute inset-0 z-[1] pointer-events-none"
            style={{
              background:
                "linear-gradient(95deg, rgba(13,24,18,0.97) 0%, rgba(13,24,18,0.88) 48%, rgba(13,24,18,0.68) 78%, rgba(13,24,18,0.84) 100%)",
            }}
          />

          {/* Subtle brand ambient accents */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold/8 rounded-full blur-[120px] pointer-events-none z-[1]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-forest-600/15 rounded-full blur-[120px] pointer-events-none z-[1]" />

          <Container className="relative z-[2]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Copy */}
              <div className="lg:col-span-7">
                <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-gold mb-5">
                  <span>Dra. {alessandra.name}</span>
                  <span className="text-cream/35" aria-hidden="true">
                    ·
                  </span>
                  <span>Mestre em Direitos Fundamentais</span>
                  <span className="text-cream/35" aria-hidden="true">
                    ·
                  </span>
                  <span>+20 anos na área criminal</span>
                </p>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.75rem] font-bold leading-[1.08] tracking-tight text-cream mb-6 max-w-2xl">
                  Quanto antes começa a defesa,{" "}
                  <span className="text-gold">
                    mais estratégica ela pode ser
                  </span>
                </h1>

                <p className="font-body text-base sm:text-lg text-cream/80 leading-relaxed max-w-xl mb-8">
                  Orientação jurídica em prisões, investigações e processos
                  criminais, com atuação técnica, individualizada e sigilosa.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <WhatsAppLink
                    href={WHATSAPP_LINK}
                    page="/penal"
                    placement="hero-primary"
                    label="Hero Penal"
                    className="no-underline"
                  >
                    <Button
                      variant="secondary"
                      size="lg"
                      className="group w-full sm:w-auto text-base px-8"
                    >
                      Falar agora pelo WhatsApp
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </WhatsAppLink>

                  <a href="#como-ajudar" className="no-underline">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto border-cream/30 text-cream hover:bg-cream/10 hover:text-cream text-base px-7"
                    >
                      Ver como podemos ajudar
                    </Button>
                  </a>
                </div>

                {/* Urgency Signals */}
                <div
                  className="flex flex-wrap gap-2 mt-7"
                  aria-label="Situações atendidas"
                >
                  {urgencySignals.map((signal) => (
                    <span
                      key={signal}
                      className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-forest-900/80 text-cream/85 border border-gold/25"
                    >
                      {signal}
                    </span>
                  ))}
                </div>

                <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-cream/65 font-mono">
                  <Lock className="h-3.5 w-3.5 text-gold shrink-0" />
                  <span>Contato direto e sigiloso</span>
                  <span aria-hidden="true">·</span>
                  <span>{alessandra.oab}</span>
                </p>
              </div>

              {/* Right Editorial Instagram Reel Card */}
              <aside
                className="lg:col-span-5"
                aria-label="Vídeo sobre estratégia no Direito Penal"
              >
                <div className="mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden bg-forest-900/95 border border-gold/30 shadow-2xl shadow-ink/60">
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-forest-600/40 bg-forest-950/50">
                    <span className="inline-flex items-center gap-2 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-cream/85">
                      <span className="h-2 w-2 rounded-full bg-gold shadow-[0_0_0_4px_rgba(232,212,154,0.16)]" />
                      Reel oficial · @ehs.adv
                    </span>
                    <a
                      href={REEL_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gold hover:text-cream transition-colors no-underline"
                    >
                      Instagram
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  {/* Clickable Thumbnail Cover */}
                  <a
                    href={REEL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-[4/5] max-h-[340px] w-full overflow-hidden bg-ink no-underline"
                    aria-label="Assistir ao Reel oficial sobre estratégia no Direito Penal no Instagram"
                  >
                    <Image
                      src={alessandra.image}
                      alt={`Dra. ${alessandra.name} — Reel sobre estratégia no Direito Penal`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 420px"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-900 via-ink/35 to-ink/20" />

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-ink shadow-xl shadow-ink/40 ring-8 ring-gold/20 transition-transform duration-300 group-hover:scale-110">
                        <Play className="h-7 w-7 fill-current ml-0.5" />
                      </span>
                    </div>

                    {/* Overlay Caption */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-ink/75 border border-gold/30 text-[10px] font-semibold uppercase tracking-[0.15em] text-gold mb-2">
                        Processo Penal e Defesa
                      </span>
                      <p className="font-display text-xl font-bold text-cream leading-snug">
                        A estratégia no início do caso define os próximos passos
                      </p>
                    </div>
                  </a>

                  {/* Summary & CTA */}
                  <div className="p-5 space-y-4">
                    <p className="text-sm text-cream/75 leading-relaxed font-body">
                      No Direito Penal, a estratégia adotada logo no início pode
                      definir o rumo de toda a ação judicial. Contar com apoio
                      técnico assegura que sua voz seja ouvida dentro da lei.
                    </p>
                    <a
                      href={REEL_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest-800 border border-gold/30 px-4 py-3 text-sm font-semibold text-gold hover:bg-gold hover:text-ink transition-all duration-300 no-underline"
                    >
                      <Instagram className="h-4 w-4" />
                      Assistir ao Reel no Instagram
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </aside>
            </div>
          </Container>
        </section>

        {/* ── Como Podemos Ajudar ── */}
        <section
          id="como-ajudar"
          className="py-20 lg:py-28 bg-cream relative overflow-hidden scroll-mt-24"
        >
          <div className="absolute top-1/3 -left-24 w-72 h-72 bg-forest-600/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-16 -right-24 w-96 h-96 bg-gold/12 rounded-full blur-3xl pointer-events-none" />

          <Container className="relative">
            <SectionTitle
              label="Orientação desde o início"
              title="Como podemos ajudar?"
              subtitle="Atuação jurídica desde os primeiros acontecimentos para avaliar os fatos, preservar direitos e definir os próximos passos."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {helpAreas.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.number}
                    className="group relative flex flex-col h-full p-7 rounded-2xl bg-white border border-forest-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-forest-900/8 hover:border-forest-200"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-100 text-ink transition-all duration-300 group-hover:bg-forest-900 group-hover:text-gold">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-xs font-bold tracking-wider text-gold-dark">
                        {item.number}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-ink leading-snug mb-3">
                      {item.title}
                    </h3>

                    <p className="text-forest-600 text-[0.925rem] leading-relaxed">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <WhatsAppLink
                href={WHATSAPP_LINK}
                page="/penal"
                placement="help-section"
                label="Como Podemos Ajudar Penal"
                className="no-underline inline-block"
              >
                <Button variant="primary" size="lg" className="group text-base">
                  Explicar minha situação pelo WhatsApp
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </WhatsAppLink>
            </div>
          </Container>
        </section>

        {/* ── Atuação Responsável / Como Funciona ── */}
        <section className="py-20 lg:py-28 bg-cream-light relative overflow-hidden border-t border-forest-100">
          <Container>
            <SectionTitle
              label="Atuação responsável"
              title="Cada situação exige uma análise própria"
              subtitle="Os fatos e documentos são avaliados com rigor técnico para definir a medida juridicamente adequada."
            />

            <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 list-none p-0 m-0">
              {methodSteps.map((step, index) => (
                <li
                  key={step.number}
                  className="relative rounded-2xl bg-white border border-forest-100 p-7 lg:p-8 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-champagne-300/30 font-mono text-sm font-bold text-gold-dark">
                      {step.number}
                    </span>
                    {index < methodSteps.length - 1 && (
                      <ArrowRight
                        className="hidden md:block h-4 w-4 text-forest-300"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <h3 className="font-display text-xl font-bold text-ink mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-forest-600 leading-relaxed">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* ── Especialista & Atendimento Direto ── */}
        <section
          id="escritorio"
          className="py-20 lg:py-28 bg-forest-900 text-cream relative overflow-hidden scroll-mt-24"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-gold/6 rounded-full blur-[110px] pointer-events-none" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-forest-600/15 rounded-full blur-[110px] pointer-events-none" />

          <Container className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Specialist Column */}
              <div className="lg:col-span-7">
                <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold mb-4">
                  Especialista em destaque
                </span>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-cream leading-tight mb-8">
                  Dra. {alessandra.name}
                </h2>

                <div className="rounded-2xl overflow-hidden bg-forest-800/90 border border-forest-600/40 grid grid-cols-1 sm:grid-cols-12">
                  <figure className="sm:col-span-5 relative min-h-[320px] sm:min-h-full m-0 bg-ink overflow-hidden">
                    <Image
                      src={alessandra.image}
                      alt={`Dra. ${alessandra.name} — ${alessandra.role}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 320px"
                      className="object-cover object-top"
                    />
                  </figure>

                  <div className="sm:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {alessandra.specialties.map((spec) => (
                          <span
                            key={spec}
                            className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gold text-ink"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      <h3 className="font-display text-2xl font-bold text-cream leading-snug mb-2">
                        Atuação técnica, estratégica e sigilosa
                      </h3>

                      <p className="font-mono text-xs text-gold tracking-wider mb-5">
                        {alessandra.role} · {alessandra.oab}
                      </p>

                      <p className="text-sm text-cream/80 leading-relaxed">
                        Mestre em Direitos Fundamentais e com mais de 20 anos de
                        experiência na área criminal. Responsável pela atuação
                        criminal do escritório, com atendimento próximo e
                        análise individualizada em investigações, processos,
                        júri e recursos.
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-forest-600/40 flex items-center justify-between gap-3">
                      <a
                        href={`mailto:${alessandra.email}`}
                        className="inline-flex items-center gap-2 text-xs font-medium text-cream/80 hover:text-gold transition-colors no-underline"
                      >
                        <Mail className="h-4 w-4 text-gold shrink-0" />
                        {alessandra.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Contact Card */}
              <aside className="lg:col-span-5">
                <div className="rounded-2xl bg-white text-ink p-7 sm:p-8 shadow-2xl border border-forest-100">
                  <span className="inline-block font-body text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark mb-3">
                    Contato direto e sigiloso
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink leading-tight mb-4">
                    Precisa de orientação em uma situação criminal?
                  </h3>
                  <p className="text-forest-600 text-sm sm:text-base leading-relaxed mb-6">
                    Conte brevemente o que aconteceu. As informações iniciais
                    serão avaliadas para orientar os próximos passos possíveis.
                  </p>

                  <WhatsAppLink
                    href={WHATSAPP_LINK}
                    page="/penal"
                    placement="office-contact-card"
                    label="Card Contato Penal"
                    className="block no-underline mb-6"
                  >
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full text-base"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Conversar pelo WhatsApp
                    </Button>
                  </WhatsAppLink>

                  <address className="not-italic border-t border-forest-100 pt-5 space-y-3 text-sm text-forest-600">
                    <a
                      href={SITE_CONFIG.contact.phone}
                      className="flex items-center gap-3 hover:text-ink transition-colors no-underline"
                    >
                      <Phone className="h-4 w-4 text-gold-dark shrink-0" />
                      {SITE_CONFIG.contact.whatsappDisplay}
                    </a>
                    <a
                      href={`mailto:${SITE_CONFIG.contact.email}`}
                      className="flex items-center gap-3 hover:text-ink transition-colors no-underline"
                    >
                      <Mail className="h-4 w-4 text-gold-dark shrink-0" />
                      {SITE_CONFIG.contact.email}
                    </a>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-gold-dark shrink-0 mt-0.5" />
                      <span>
                        {SITE_CONFIG.address.street}, {SITE_CONFIG.address.building}
                        <br />
                        {SITE_CONFIG.address.neighborhood} —{" "}
                        {SITE_CONFIG.address.city}/{SITE_CONFIG.address.state}
                      </span>
                    </div>
                  </address>
                </div>
              </aside>
            </div>
          </Container>
        </section>

        {/* ── Dúvidas Frequentes ── */}
        <section
          id="duvidas"
          className="py-20 lg:py-28 bg-cream scroll-mt-24"
        >
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              <div className="lg:col-span-5">
                <SectionTitle
                  align="left"
                  label="Antes do contato"
                  title="Dúvidas frequentes"
                  subtitle="Informações objetivas para ajudar você a dar o primeiro passo com segurança."
                  className="mb-0"
                />
              </div>

              <div className="lg:col-span-7 space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = !!openFaq[idx];
                  return (
                    <div
                      key={faq.question}
                      className="rounded-2xl bg-white border border-forest-100 overflow-hidden transition-colors hover:border-forest-200"
                    >
                      <h3 className="m-0">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={`faq-${idx}`}
                          id={`faq-btn-${idx}`}
                          onClick={() => toggleFaq(idx)}
                          className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left font-display text-lg sm:text-xl font-bold text-ink cursor-pointer"
                        >
                          <span>{faq.question}</span>
                          <ChevronDown
                            className={cn(
                              "h-5 w-5 shrink-0 text-gold-dark transition-transform duration-300",
                              isOpen && "rotate-180"
                            )}
                            aria-hidden="true"
                          />
                        </button>
                      </h3>
                      <div
                        id={`faq-${idx}`}
                        role="region"
                        aria-labelledby={`faq-btn-${idx}`}
                        hidden={!isOpen}
                        className="px-6 pb-5"
                      >
                        <p className="text-sm sm:text-base text-forest-600 leading-relaxed m-0">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div className="mt-6 rounded-2xl bg-forest-900 text-cream p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-forest-600/40">
                  <div>
                    <strong className="block font-display text-2xl font-bold text-cream mb-1">
                      Ainda tem dúvidas?
                    </strong>
                    <span className="text-sm text-cream/80">
                      Envie uma mensagem e explique brevemente a situação.
                    </span>
                  </div>
                  <WhatsAppLink
                    href={WHATSAPP_LINK}
                    page="/penal"
                    placement="faq-cta"
                    label="FAQ Penal"
                    className="no-underline shrink-0"
                  >
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full sm:w-auto"
                    >
                      Falar com a equipe
                    </Button>
                  </WhatsAppLink>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ── Formulário de Contato ── */}
        <section
          id="contato"
          aria-labelledby="contact-form-title"
          className="py-20 lg:py-28 bg-cream-light border-t border-forest-100 scroll-mt-24"
        >
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              <div className="lg:col-span-5 lg:pt-4">
                <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark mb-4">
                  Contato inicial
                </span>
                <h2
                  id="contact-form-title"
                  className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight mb-5"
                >
                  Conte brevemente como podemos ajudar
                </h2>
                <p className="text-forest-600 text-base sm:text-lg leading-relaxed mb-6">
                  Preencha os campos ao lado para iniciar uma conversa
                  diretamente com a equipe pelo WhatsApp.
                </p>
                <div className="inline-flex items-center gap-2 rounded-xl bg-champagne-300/30 border border-champagne-200 px-4 py-2.5 text-xs font-semibold text-gold-dark">
                  <Lock className="h-4 w-4 shrink-0" />
                  Atendimento direto, responsável e sigiloso.
                </div>
              </div>

              <div className="lg:col-span-7">
                <form
                  id="whatsapp-contact-form"
                  onSubmit={handleFormSubmit}
                  className="rounded-2xl bg-white border border-forest-100 p-6 sm:p-8 shadow-lg shadow-forest-900/5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="contact-name"
                        className="text-xs font-bold uppercase tracking-wider text-forest-900"
                      >
                        Nome
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        placeholder="Como podemos chamar você?"
                        className="w-full rounded-xl border border-forest-200 bg-cream-light/50 px-4 py-3 text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="contact-phone"
                        className="text-xs font-bold uppercase tracking-wider text-forest-900"
                      >
                        Telefone
                      </label>
                      <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        required
                        placeholder="(49) 99999-9999"
                        className="w-full rounded-xl border border-forest-200 bg-cream-light/50 px-4 py-3 text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-col gap-2">
                      <label
                        htmlFor="contact-message"
                        className="text-xs font-bold uppercase tracking-wider text-forest-900"
                      >
                        Mensagem
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={5}
                        maxLength={700}
                        required
                        placeholder="Descreva brevemente a situação, sem incluir documentos ou dados sensíveis."
                        className="w-full rounded-xl border border-forest-200 bg-cream-light/50 px-4 py-3 text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all resize-y min-h-[130px]"
                      />
                    </div>

                    <div className="sm:col-span-2 pt-1">
                      <Button
                        variant="secondary"
                        size="lg"
                        type="submit"
                        className="group w-full text-base"
                      >
                        Enviar pelo WhatsApp
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                      <p className="mt-3 text-xs text-forest-600 leading-relaxed">
                        Os dados não são armazenados nesta página. Ao enviar, o
                        WhatsApp será aberto com a mensagem preenchida.
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </Container>
        </section>
      </main>

      {/* ── Footer LP (padrão visual do site principal) ── */}
      <footer className="relative bg-forest-900 text-cream/85 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

        <Container className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 py-16">
            {/* Brand */}
            <div>
              <Link
                href="/"
                className="group inline-flex items-center gap-3 no-underline mb-5"
              >
                <Image
                  src="/images/logo-ehs-monogram.png"
                  alt={SITE_CONFIG.legalName}
                  width={44}
                  height={44}
                  className="object-contain brightness-[3] transition-transform duration-300 group-hover:scale-105"
                />
                <div className="flex flex-col">
                  <span className="font-display text-lg font-bold leading-tight tracking-tight text-cream">
                    Erlo, Haas & Steffens
                  </span>
                  <span className="font-display text-[11px] font-normal uppercase tracking-[0.25em] leading-none text-gold/85 mt-1">
                    Sociedade de Advocacia
                  </span>
                </div>
              </Link>
              <p className="text-xs font-mono text-cream/70">
                {SITE_CONFIG.oab} · CNPJ: {SITE_CONFIG.cnpj}
              </p>
            </div>

            {/* Anchors */}
            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-gold mb-4">
                Nesta página
              </h4>
              <nav
                aria-label="Links do rodapé"
                className="flex flex-col gap-2.5"
              >
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm text-cream/80 hover:text-gold transition-colors no-underline"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-gold mb-4">
                Contato
              </h4>
              <div className="space-y-3 text-sm text-cream/80">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                  <p className="leading-relaxed m-0">
                    {SITE_CONFIG.address.street}
                    <br />
                    {SITE_CONFIG.address.building},{" "}
                    {SITE_CONFIG.address.neighborhood}
                    <br />
                    {SITE_CONFIG.address.city} - {SITE_CONFIG.address.state}
                  </p>
                </div>
                <a
                  href={SITE_CONFIG.contact.phone}
                  className="flex items-center gap-2.5 hover:text-gold transition-colors no-underline"
                >
                  <Phone className="h-4 w-4 text-gold shrink-0" />
                  {SITE_CONFIG.contact.whatsappDisplay}
                </a>
                <a
                  href={`mailto:${SITE_CONFIG.contact.email}`}
                  className="flex items-center gap-2.5 hover:text-gold transition-colors no-underline"
                >
                  <Mail className="h-4 w-4 text-gold shrink-0" />
                  {SITE_CONFIG.contact.email}
                </a>
              </div>
            </div>

            {/* Institutional Links */}
            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-gold mb-4">
                Institucional
              </h4>
              <div className="flex flex-col gap-2.5 text-sm text-cream/80">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 hover:text-gold transition-colors no-underline"
                >
                  Site institucional
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href={SITE_CONFIG.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-gold transition-colors no-underline"
                >
                  Instagram do escritório
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <Link
                  href="/politica-de-privacidade"
                  className="hover:text-gold transition-colors no-underline"
                >
                  Política de Privacidade
                </Link>
                <Link
                  href="/termos-de-uso"
                  className="hover:text-gold transition-colors no-underline"
                >
                  Termos de Uso
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-forest-600/60 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-cream/65">
            <p className="m-0 max-w-2xl leading-relaxed">
              Conteúdo informativo. A análise jurídica depende das
              circunstâncias de cada caso e não representa promessa de
              resultado.
            </p>
            <p className="m-0 shrink-0">
              © {new Date().getFullYear()} {SITE_CONFIG.legalName}. Todos os
              direitos reservados.
            </p>
          </div>
        </Container>
      </footer>

      {/* ── Floating WhatsApp (alinhado ao componente oficial, z-40) ── */}
      <WhatsAppLink
        href={WHATSAPP_LINK}
        page="/penal"
        placement="floating-whatsapp"
        label="Botão Flutuante Penal"
        aria-label="Solicitar atendimento pelo WhatsApp"
        className={`${floatingVisibility} fixed right-5 bottom-5 z-40 items-center gap-2.5 rounded-full bg-forest-900 text-cream border border-gold/35 pl-2.5 pr-2.5 sm:pr-4 py-2 shadow-xl shadow-ink/30 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:shadow-2xl no-underline`}
      >
        <span
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white shrink-0"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93a7.898 7.898 0 0 0-2.327-5.607zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.493.654.666-2.433-.156-.25a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.591-6.593 6.591zm3.615-4.934c-.197-.1-1.17-.578-1.353-.646-.182-.065-.315-.1-.445.1-.133.197-.514.646-.63.775-.116.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.984-.59-.525-.986-1.172-1.102-1.37-.116-.198-.013-.306.087-.405.09-.088.197-.232.296-.347.1-.116.133-.198.198-.33.066-.133.033-.248-.016-.347-.05-.1-.446-1.076-.61-1.47-.16-.389-.323-.336-.445-.342-.116-.006-.248-.006-.38-.006a.729.729 0 0 0-.529.248c-.182.198-.694.678-.694 1.654 0 .976.71 1.916.81 2.049.098.132 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.15.907.129 1.249.078.38-.058 1.171-.48 1.337-.943.164-.462.164-.858.116-.943-.05-.084-.182-.132-.38-.232z" />
          </svg>
        </span>
        <span className="hidden sm:inline font-body text-xs font-semibold tracking-wide text-gold">
          Atendimento
        </span>
      </WhatsAppLink>
    </div>
  );
}
