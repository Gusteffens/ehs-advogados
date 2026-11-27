"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  FileSearch,
  Gavel,
  Instagram,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  Scale,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { WhatsAppLink } from "@/components/tracking/whatsapp-link";
import {
  LandingHeader,
  type LandingNavLink,
} from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import {
  FaqAccordion,
  type FaqAccordionItem,
} from "@/components/landing/faq-accordion";
import { LandingLeadForm } from "@/components/landing/landing-lead-form";
import { SITE_CONFIG } from "@/lib/site-config";
import { getConsentState } from "@/lib/tracking";
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

const navLinks: readonly LandingNavLink[] = [
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

interface PenalPageContentProps {
  faqs: readonly FaqAccordionItem[];
}

export default function PenalPageContent({ faqs }: PenalPageContentProps) {
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    const syncConsent = () => {
      setBannerVisible(getConsentState() === "unset");
    };
    syncConsent();
    window.addEventListener("ehs:consent-change", syncConsent);
    return () => window.removeEventListener("ehs:consent-change", syncConsent);
  }, []);

  const floatingVisibility = bannerVisible
    ? "hidden sm:inline-flex"
    : "inline-flex";

  return (
    <div className="landing-penal" id="topo">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>

      <LandingHeader
        subtitle="Direito Criminal"
        navLinks={navLinks}
        topHref="#topo"
        whatsappUrl={WHATSAPP_LINK}
        page="/penal"
        ctaLabel="Solicitar atendimento"
        showCtaIcon={false}
        drawerId="penal-mobile-drawer"
      />

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
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "lg" }),
                      "group w-full sm:w-auto text-base px-8 no-underline"
                    )}
                  >
                    Falar agora pelo WhatsApp
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </WhatsAppLink>

                  <a
                    href="#como-ajudar"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "w-full sm:w-auto border-cream/30 text-cream hover:bg-cream/10 hover:text-cream text-base px-7 no-underline"
                    )}
                  >
                    Ver como podemos ajudar
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
                className={cn(
                  buttonVariants({ variant: "primary", size: "lg" }),
                  "group text-base no-underline"
                )}
              >
                Explicar minha situação pelo WhatsApp
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "lg" }),
                      "w-full text-base no-underline mb-6"
                    )}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Conversar pelo WhatsApp
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
                        {SITE_CONFIG.address.street},{" "}
                        {SITE_CONFIG.address.building}
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

              <div className="lg:col-span-7 space-y-6">
                <FaqAccordion
                  items={faqs}
                  defaultOpenIndex={0}
                  allowMultiple
                  idPrefix="penal-faq"
                />

                <div className="rounded-2xl bg-forest-900 text-cream p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-forest-600/40">
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
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "md" }),
                      "w-full sm:w-auto shrink-0 no-underline"
                    )}
                  >
                    Falar com a equipe
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
                  Preencha os campos ao lado para registrar seu pedido de
                  atendimento com sigilo e iniciar a conversa diretamente pelo
                  WhatsApp.
                </p>
                <div className="inline-flex items-center gap-2 rounded-xl bg-champagne-300/30 border border-champagne-200 px-4 py-2.5 text-xs font-semibold text-gold-dark">
                  <Lock className="h-4 w-4 shrink-0" />
                  Atendimento direto, responsável e sigiloso.
                </div>
              </div>

              <div className="lg:col-span-7">
                <LandingLeadForm
                  sourcePage="/penal"
                  defaultSubject="Atendimento em Direito Penal"
                  nameLabel="Nome"
                  namePlaceholder="Como podemos chamar você?"
                  phoneLabel="Telefone / WhatsApp"
                  phonePlaceholder="(49) 99999-9999"
                  showEmailField
                  messageLabel="Mensagem"
                  messagePlaceholder="Descreva brevemente a situação, sem incluir documentos ou dados sensíveis."
                  submitLabel="Enviar pelo WhatsApp"
                  submitVariant="secondary"
                  trackingPlacement="penal-whatsapp-form"
                  trackingLabel="Formulário WhatsApp Penal"
                />
              </div>
            </div>
          </Container>
        </section>
      </main>

      <LandingFooter navLinks={navLinks} />

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
