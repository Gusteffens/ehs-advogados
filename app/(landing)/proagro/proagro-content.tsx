"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  FileCheck2,
  FileText,
  FolderSearch,
  Instagram,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Play,
  ShieldCheck,
  X,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/tracking/whatsapp-link";
import { SITE_CONFIG } from "@/lib/site-config";
import { getConsentState, trackWhatsAppClick } from "@/lib/tracking";
import { cn } from "@/lib/utils";
import "./proagro.css";

const defaultMessage =
  "Olá, estou com um problema relacionado ao Proagro e gostaria de verificar se meu caso pode ser analisado.";
const defaultWhatsappUrl = `${SITE_CONFIG.contact.whatsapp}?text=${encodeURIComponent(
  defaultMessage
)}`;

const navLinks = [
  { href: "#documentos", label: "Documentos" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#equipe", label: "Equipe" },
  { href: "#conteudos", label: "Conteúdos" },
  { href: "#duvidas", label: "Dúvidas" },
  { href: "#contato", label: "Contato" },
] as const;

const heroSignals = ["Negativa", "Redução", "Glosa", "Encerramento"] as const;

const documentItems = [
  {
    icon: FileText,
    tag: "Contrato",
    title: "Contrato ou orçamento do custeio rural",
    description:
      "Cédula de crédito rural, contrato de financiamento ou orçamento vinculado à safra.",
  },
  {
    icon: FileCheck2,
    tag: "Decisão",
    title: "Laudo, RCP, COP ou decisão de negativa",
    description:
      "Relatório de comprovação de perdas, comunicação de ocorrências ou documento do agente financeiro.",
  },
  {
    icon: FolderSearch,
    tag: "Provas",
    title: "Notas fiscais, fotos, mapas ou mensagens",
    description:
      "Comprovantes de insumos, registros da lavoura e conversas mantidas com banco ou cooperativa.",
  },
] as const;

const processSteps = [
  {
    number: "01",
    title: "Você envia um resumo",
    description:
      "Conte o que aconteceu com a lavoura e o que o banco ou a cooperativa informou sobre o Proagro.",
  },
  {
    number: "02",
    title: "O escritório orienta os documentos",
    description:
      "São indicados os documentos úteis para entender os fundamentos da negativa, redução ou glosa.",
  },
  {
    number: "03",
    title: "O caso é analisado",
    description:
      "A análise técnica verifica os fatos, os documentos da operação e os possíveis encaminhamentos.",
  },
] as const;

const agroTeamSlugs = new Set(["luiza-haas", "jacson-erlo", "jean-erlo"]);
const agroTeam = SITE_CONFIG.team.filter((member) =>
  agroTeamSlugs.has(member.slug)
);

const instagramCarousels = [
  {
    id: "carrossel-01",
    badge: "Carrossel 01",
    title: "Proagro negado: o que observar antes de aceitar a decisão",
    summary:
      "Pontos essenciais sobre laudo, enquadramento, comunicação de perdas e documentação da safra.",
    href: "https://www.instagram.com/p/DYxm0qDjbxO/",
    image: "/images/team/luiza-mesa.jpeg",
    imageAlt: "Dra. Luíza Klein Haas — publicação sobre Proagro no Instagram",
  },
  {
    id: "carrossel-02",
    badge: "Carrossel 02",
    title: "Glosa, redução ou encerramento no Proagro: quais documentos separar",
    summary:
      "Orientações em linguagem direta para organizar contrato, RCP, notas fiscais e registros da lavoura.",
    href: "https://www.instagram.com/p/DWFFlr6CO94/",
    image: "/images/team/jean-mesa.jpeg",
    imageAlt: "Dr. Jean Tiago Erlo — publicação sobre Proagro no Instagram",
  },
] as const;

const faqItems = [
  {
    id: 1,
    question: "A análise garante indenização?",
    answer:
      "Não. Ela serve para avaliar a viabilidade técnica do caso, a documentação disponível e os possíveis caminhos, sem promessa de resultado.",
  },
  {
    id: 2,
    question: "Posso chamar mesmo sem todos os documentos?",
    answer:
      "Sim. O escritório pode orientar quais documentos procurar e avaliar a solicitação junto ao banco, cooperativa ou agente financeiro, conforme o caso.",
  },
  {
    id: 3,
    question: "Atende produtor de outra cidade?",
    answer:
      "Sim. O atendimento pode ser presencial em nossa sede em São Miguel do Oeste/SC ou digital, conforme a necessidade do produtor rural.",
  },
] as const;

export default function ProagroPageContent() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(1);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [formStatus, setFormStatus] = useState(
    "Os dados não são armazenados nesta página. Ao enviar, o WhatsApp será aberto com a mensagem preenchida."
  );

  const contactFormRef = useRef<HTMLFormElement>(null);

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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contactFormRef.current) return;

    const formData = new FormData(contactFormRef.current);
    const name = formData.get("name")?.toString().trim() || "Não informado";
    const status = formData.get("status")?.toString().trim() || "Não informado";
    const message =
      formData.get("message")?.toString().trim() || "Não informado";

    const text = [
      "Olá, gostaria de solicitar análise de um caso de Proagro.",
      "",
      `Nome: ${name}`,
      `Situação do Proagro: ${status}`,
      `Resumo do problema: ${message}`,
    ].join("\n");

    trackWhatsAppClick({
      page: "/proagro",
      placement: "proagro-whatsapp-form",
      label: `Formulário Proagro (${status})`,
    });

    setFormStatus("Abrindo o WhatsApp com a mensagem preenchida.");
    window.open(
      `${SITE_CONFIG.contact.whatsapp}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="landing-proagro min-h-screen bg-cream text-ink">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>

      {/* ── Standalone LP Header (aligned with main site Header) ── */}
      <header
        id="topo"
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-cream/95 backdrop-blur-xl shadow-md shadow-forest-900/5 py-3"
            : "bg-ink/40 backdrop-blur-md border-b border-cream/10 py-4"
        )}
      >
        <Container>
          <nav
            className="flex items-center justify-between gap-4"
            aria-label="Navegação principal"
          >
            <a
              href="#inicio"
              className="group flex items-center gap-3 no-underline shrink-0"
              aria-label={`${SITE_CONFIG.legalName} — início`}
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/images/logo-ehs-monogram.png"
                  alt={SITE_CONFIG.shortName}
                  width={40}
                  height={40}
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
                    "font-display text-base sm:text-lg font-bold leading-tight tracking-tight transition-colors duration-500",
                    scrolled ? "text-ink" : "text-cream"
                  )}
                >
                  Erlo, Haas & Steffens
                </span>
                <span
                  className={cn(
                    "hidden sm:block font-body text-[10px] font-semibold uppercase tracking-[0.2em] leading-none mt-1 transition-colors duration-500",
                    scrolled ? "text-gold-dark" : "text-gold/85"
                  )}
                >
                  Sociedade de Advocacia
                </span>
              </div>
            </a>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-300 no-underline",
                    scrolled
                      ? "text-forest-600 hover:text-ink hover:bg-forest-50"
                      : "text-cream/80 hover:text-cream hover:bg-cream/10"
                  )}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center">
              <WhatsAppLink
                href={defaultWhatsappUrl}
                page="/proagro"
                placement="header-cta"
                label="Header Proagro"
                className="no-underline"
              >
                <Button variant="secondary" size="sm">
                  <MessageCircle className="h-4 w-4" />
                  Falar pelo WhatsApp
                </Button>
              </WhatsAppLink>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className={cn(
                "lg:hidden relative z-50 flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                menuOpen || scrolled
                  ? "text-ink hover:bg-forest-100"
                  : "text-cream hover:bg-cream/10"
              )}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              aria-controls="proagro-mobile-drawer"
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
              onClick={closeMenu}
              aria-hidden="true"
            />
            <div
              id="proagro-mobile-drawer"
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
                      onClick={closeMenu}
                      className="block px-4 py-3 text-lg font-medium text-ink rounded-xl hover:bg-forest-100 transition-colors no-underline"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>

                <div className="mt-auto space-y-4">
                  <div className="h-px bg-forest-600/20" />
                  <WhatsAppLink
                    href={defaultWhatsappUrl}
                    page="/proagro"
                    placement="mobile-menu-cta"
                    label="Menu Mobile Proagro"
                    onClick={closeMenu}
                    className="block no-underline"
                  >
                    <Button variant="secondary" size="md" className="w-full">
                      <MessageCircle className="h-4 w-4" />
                      Falar pelo WhatsApp
                    </Button>
                  </WhatsAppLink>
                  <Link
                    href="/"
                    onClick={closeMenu}
                    className="block text-center text-sm font-semibold text-forest-600 hover:text-ink transition-colors no-underline"
                  >
                    Ir para o site institucional ↗
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
          id="inicio"
          className="relative overflow-hidden bg-ink text-cream pt-28 pb-20 sm:pt-32 sm:pb-24 lg:pt-36 lg:pb-28"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0 opacity-35">
            <Image
              src="/images/team/equipe.webp"
              alt="Equipe do escritório Erlo, Haas & Steffens em fotografia institucional"
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
            />
          </div>

          {/* Unified Dark Overlay (matches HeroSection) */}
          <div
            className="absolute inset-0 z-[1] pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(13,24,18,0.92) 0%, rgba(13,24,18,0.72) 48%, rgba(13,24,18,0.94) 88%, #0D1812 100%)",
            }}
          />

          {/* Subtle Decorative Glows */}
          <div className="absolute top-12 right-0 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none z-[1]" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-forest-600/15 rounded-full blur-[120px] pointer-events-none z-[1]" />

          <Container className="relative z-[2]">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-10">
              {/* Hero Copy */}
              <div className="lg:col-span-7">
                <p className="font-body text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-gold mb-5">
                  Proagro <span className="mx-2 text-cream/35">·</span> Crédito
                  rural <span className="mx-2 text-cream/35">·</span> Produtor
                  rural
                </p>

                <h1 className="font-display text-[2.5rem] sm:text-[3.25rem] lg:text-[4rem] font-bold leading-[1.08] tracking-tight text-cream mb-6">
                  Pedir a revisão do Proagro não precisa significar conflito com
                  o banco.
                </h1>

                <p className="font-body text-base sm:text-lg text-cream/80 max-w-2xl leading-relaxed mb-8">
                  A análise é feita com base nos documentos da operação, no
                  laudo, na decisão de negativa e nas regras aplicáveis ao
                  Proagro.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <WhatsAppLink
                    href={defaultWhatsappUrl}
                    page="/proagro"
                    placement="hero-primary"
                    label="Hero Proagro"
                    className="no-underline"
                  >
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full sm:w-auto group text-base"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Falar pelo WhatsApp
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </WhatsAppLink>
                  <a href="#contato" className="no-underline">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto border-cream/30 text-cream hover:bg-cream/10 hover:text-cream text-base"
                    >
                      Enviar resumo do caso
                    </Button>
                  </a>
                </div>

                {/* Situation Signals */}
                <div
                  className="flex flex-wrap gap-2 mt-8"
                  aria-label="Situações que podem ser analisadas"
                >
                  {heroSignals.map((signal) => (
                    <span
                      key={signal}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-forest-900/90 border border-gold/25 text-xs font-semibold text-gold tracking-wide"
                    >
                      {signal}
                    </span>
                  ))}
                </div>

                <p className="mt-5 text-xs text-cream/65 max-w-xl leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                  <span>
                    A análise depende dos documentos disponíveis e das
                    circunstâncias de cada produtor. Não há promessa de
                    resultado.
                  </span>
                </p>
              </div>

              {/* Editorial Reel Card (replaces fragile Instagram embed.js) */}
              <aside
                className="lg:col-span-5"
                aria-label="Reel sobre Proagro do escritório Erlo, Haas & Steffens"
              >
                <div className="max-w-sm mx-auto lg:ml-auto lg:mr-0 rounded-2xl overflow-hidden bg-forest-800/90 border border-gold/30 shadow-2xl shadow-ink/60">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-3 px-4 py-3 bg-forest-900/95 border-b border-forest-600/40">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cream/85">
                      <span
                        className="h-2 w-2 rounded-full bg-gold"
                        aria-hidden="true"
                      />
                      Reel oficial · @ehs.adv
                    </div>
                    <a
                      href="https://www.instagram.com/reel/DWze10oie80/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gold hover:text-cream transition-colors no-underline"
                    >
                      Abrir
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  {/* Visual Thumbnail & Play Overlay */}
                  <a
                    href="https://www.instagram.com/reel/DWze10oie80/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-[4/5] w-full overflow-hidden bg-ink no-underline"
                    aria-label="Assistir ao Reel oficial sobre Proagro no Instagram"
                  >
                    <Image
                      src="/images/team/jacson-mesa.jpeg"
                      alt="Dr. Jacson Mateus Erlo em vídeo informativo sobre Proagro"
                      fill
                      sizes="(max-width: 1024px) 100vw, 384px"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/20" />

                    {/* Center Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-ink shadow-xl shadow-ink/50 transition-transform duration-300 group-hover:scale-110">
                        <Play className="h-7 w-7 fill-current ml-0.5" />
                      </span>
                    </div>

                    {/* Bottom Caption Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest-900/90 border border-gold/30 text-[11px] font-semibold uppercase tracking-wider text-gold mb-2.5">
                        <Instagram className="h-3 w-3" />
                        Vídeo explicativo
                      </span>
                      <h2 className="font-display text-xl font-bold text-cream leading-snug mb-1.5">
                        Revisão do Proagro: como funciona a análise técnica
                      </h2>
                      <p className="text-xs text-cream/80 leading-relaxed">
                        Entenda por que a revisão documental é um direito do
                        produtor rural e quais documentos são avaliados.
                      </p>
                    </div>
                  </a>

                  {/* Card Footer CTA */}
                  <div className="p-4 bg-forest-900/95 border-t border-forest-600/40">
                    <a
                      href="https://www.instagram.com/reel/DWze10oie80/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gold text-ink hover:bg-gold-dark hover:text-cream px-4 py-2.5 text-sm font-semibold transition-all duration-300 no-underline"
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

        {/* ── Documents Section ── */}
        <section
          id="documentos"
          className="py-20 lg:py-28 bg-cream relative overflow-hidden"
        >
          <div className="absolute top-1/3 -left-24 w-72 h-72 bg-forest-600/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-12 -right-24 w-96 h-96 bg-gold/12 rounded-full blur-3xl pointer-events-none" />

          <Container className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-16">
              <div className="lg:col-span-5">
                <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark mb-4">
                  Documentos
                </span>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight mb-6">
                  Não precisa ter tudo em mãos para fazer o primeiro contato
                </h2>
                <p className="text-base text-forest-600 leading-relaxed mb-4">
                  Se tiver contrato, laudo, decisão, comunicação de perdas ou
                  notas fiscais, isso ajuda na análise.
                </p>
                <p className="text-base text-forest-600 leading-relaxed mb-8">
                  Se faltar documento, o escritório pode avaliar a busca ou
                  solicitação junto ao banco, cooperativa ou agente financeiro,
                  conforme o caso.
                </p>
                <WhatsAppLink
                  href={defaultWhatsappUrl}
                  page="/proagro"
                  placement="documents-section"
                  label="Documentos Proagro"
                  className="no-underline"
                >
                  <Button variant="primary" size="lg" className="group">
                    Tenho dúvidas sobre meus documentos
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </WhatsAppLink>
              </div>

              <div
                className="lg:col-span-7 grid grid-cols-1 gap-4"
                aria-label="Documentos úteis para análise"
              >
                {documentItems.map((item) => (
                  <article
                    key={item.tag}
                    className="group flex items-start gap-5 rounded-2xl bg-white border border-forest-100 p-6 sm:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-forest-900/8 hover:border-forest-200"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-champagne-300/30 text-gold-dark transition-colors duration-300 group-hover:bg-forest-900 group-hover:text-gold">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-gold-dark mb-1.5">
                        {item.tag}
                      </span>
                      <h3 className="font-display text-xl font-bold text-ink leading-snug mb-1.5">
                        {item.title}
                      </h3>
                      <p className="text-sm text-forest-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* ── How It Works Section (aligned with CredentialsSection) ── */}
        <section
          id="como-funciona"
          className="py-20 lg:py-28 bg-cream-light border-t border-forest-100"
        >
          <Container>
            <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
              <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark mb-4">
                Como funciona
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight mb-4">
                Três passos para começar
              </h2>
              <p className="text-lg text-forest-600 leading-relaxed">
                Uma jornada objetiva para compreender a situação inicial e
                orientar os próximos documentos.
              </p>
            </div>

            <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 list-none p-0 m-0">
              {processSteps.map((step, index) => (
                <li
                  key={step.number}
                  className="relative rounded-2xl bg-white border border-forest-100 p-7 lg:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-forest-900/8"
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-champagne-300/30 font-mono text-sm font-bold text-gold-dark">
                      {step.number}
                    </span>
                    {index < processSteps.length - 1 && (
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

        {/* ── Team Section (aligned with main site TeamSection) ── */}
        <section
          id="equipe"
          className="py-20 lg:py-28 bg-forest-900 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          <div className="absolute top-20 right-10 w-64 h-64 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-forest-600/10 rounded-full blur-[100px] pointer-events-none" />

          <Container className="relative">
            <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
              <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold mb-4">
                Equipe
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-cream leading-tight mb-4">
                Atuação em Direito do Agronegócio
              </h2>
              <p className="text-lg text-cream/75 leading-relaxed">
                O atendimento é feito pelo {SITE_CONFIG.legalName}, com sede em{" "}
                {SITE_CONFIG.address.city}/{SITE_CONFIG.address.state} e atuação
                em demandas ligadas ao setor produtivo.
              </p>
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
              aria-label="Profissionais com atuação em Direito do Agronegócio"
            >
              {agroTeam.map((member) => (
                <article key={member.slug} className="group h-full">
                  <div className="relative rounded-2xl overflow-hidden h-full flex flex-col bg-forest-800/90 border border-forest-600/40 transition-all duration-300 hover:border-gold/40 hover:shadow-2xl hover:shadow-champagne-500/10 hover:-translate-y-1.5">
                    <div
                      className={cn(
                        "h-1.5 flex-none bg-gradient-to-r absolute top-0 z-10 left-0 right-0",
                        member.gradient
                      )}
                    />

                    <div className="relative w-full aspect-[3/4] flex-none overflow-hidden bg-ink">
                      <Image
                        src={member.image}
                        alt={`${member.name} — ${member.specialties.join(", ")}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-forest-900 via-forest-900/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 pt-12">
                        <h3 className="font-display text-xl font-bold text-cream leading-tight">
                          {member.name}
                        </h3>
                        <p className="text-gold text-sm font-semibold mt-0.5">
                          {member.role}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-5 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-cream/75 font-mono tracking-wider mb-4">
                          {member.oab}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-5">
                          {member.specialties.map((spec) => (
                            <span
                              key={spec}
                              className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gold text-ink"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-forest-600/40">
                        <a
                          href={`mailto:${member.email}`}
                          className="inline-flex items-center gap-2 text-xs text-cream/75 hover:text-gold transition-colors no-underline"
                          aria-label={`E-mail de ${member.name}`}
                        >
                          <Mail className="h-4 w-4 text-gold" />
                          {member.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>

        {/* ── Content Section (Editorial Instagram Cards, zero embed.js) ── */}
        <section
          id="conteudos"
          aria-labelledby="social-content-title"
          className="py-20 lg:py-28 bg-cream-light relative overflow-hidden border-t border-forest-600/10"
        >
          <div className="absolute top-0 right-[15%] w-96 h-96 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />

          <Container className="relative">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 lg:mb-14">
              <div className="max-w-2xl">
                <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark mb-4">
                  Conteúdos do escritório · @ehs.adv
                </span>
                <h2
                  id="social-content-title"
                  className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight mb-4"
                >
                  Informações sobre Proagro
                </h2>
                <p className="text-lg text-forest-600 leading-relaxed">
                  Publicações do perfil do escritório com orientações em
                  linguagem direta para o produtor rural.
                </p>
              </div>

              <a
                href={SITE_CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 no-underline"
              >
                <Button
                  variant="outline"
                  className="group border-gold-dark/40 text-gold-dark hover:bg-gold-dark hover:text-cream hover:border-gold-dark"
                >
                  <Instagram className="h-4 w-4" />
                  Seguir @ehs.adv
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
              aria-label="Carrosséis do Instagram sobre Proagro"
            >
              {instagramCarousels.map((post) => (
                <a
                  key={post.id}
                  href={post.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-2xl bg-white border border-forest-100 overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-forest-900/8 hover:border-forest-200 no-underline"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink">
                    <Image
                      src={post.image}
                      alt={post.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover object-[50%_60%] transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-900/90 border border-gold/35 text-xs font-semibold text-gold">
                      <Instagram className="h-3.5 w-3.5" />
                      {post.badge}
                    </span>
                    <div className="absolute inset-0 bg-ink/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-ink shadow-lg">
                        <Instagram className="h-5 w-5" />
                      </span>
                    </div>
                  </div>

                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-2xl font-bold text-ink leading-snug mb-3 group-hover:text-forest-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-forest-600 leading-relaxed mb-6">
                        {post.summary}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-forest-50 flex items-center justify-between text-sm font-semibold text-gold-dark group-hover:text-ink transition-colors">
                      <span>Abrir carrossel no Instagram</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </Container>
        </section>

        {/* ── FAQ Section ── */}
        <section id="duvidas" className="py-20 lg:py-28 bg-cream">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              <div className="lg:col-span-5">
                <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark mb-4">
                  Dúvidas rápidas
                </span>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight mb-4">
                  Antes de chamar no WhatsApp
                </h2>
                <p className="text-lg text-forest-600 leading-relaxed">
                  Respostas objetivas para o produtor dar o primeiro passo com
                  segurança e clareza.
                </p>
              </div>

              <div className="lg:col-span-7 space-y-4">
                {faqItems.map((item) => {
                  const isOpen = openFaq === item.id;
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-white border border-forest-100 shadow-sm overflow-hidden"
                    >
                      <h3 className="m-0">
                        <button
                          type="button"
                          id={`faq-btn-${item.id}`}
                          aria-expanded={isOpen}
                          aria-controls={`faq-${item.id}`}
                          onClick={() =>
                            setOpenFaq(isOpen ? null : item.id)
                          }
                          className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left font-display text-xl font-bold text-ink hover:text-forest-600 transition-colors cursor-pointer"
                        >
                          <span>{item.question}</span>
                          <ChevronDown
                            className={cn(
                              "h-5 w-5 text-gold-dark shrink-0 transition-transform duration-200",
                              isOpen && "rotate-180"
                            )}
                            aria-hidden="true"
                          />
                        </button>
                      </h3>
                      <div
                        id={`faq-${item.id}`}
                        role="region"
                        aria-labelledby={`faq-btn-${item.id}`}
                        hidden={!isOpen}
                        className="px-6 pb-6 text-sm sm:text-base text-forest-600 leading-relaxed border-t border-forest-50 pt-4"
                      >
                        <p className="m-0">{item.answer}</p>
                      </div>
                    </div>
                  );
                })}

                {/* Dark CTA Card inside FAQ */}
                <div className="rounded-2xl bg-forest-900 text-cream p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-lg mt-6">
                  <div>
                    <strong className="block font-display text-2xl font-bold text-cream mb-1">
                      Ainda tem dúvidas?
                    </strong>
                    <span className="text-sm text-cream/75">
                      Envie uma mensagem e explique brevemente a situação.
                    </span>
                  </div>
                  <WhatsAppLink
                    href={defaultWhatsappUrl}
                    page="/proagro"
                    placement="faq-cta"
                    label="FAQ Proagro"
                    className="shrink-0 no-underline"
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

        {/* ── Contact Form Section ── */}
        <section
          id="contato"
          aria-labelledby="contact-form-title"
          className="py-20 lg:py-28 bg-cream-light border-t border-forest-100"
        >
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-12 lg:gap-16">
              <div className="lg:col-span-5">
                <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark mb-4">
                  Contato inicial
                </span>
                <h2
                  id="contact-form-title"
                  className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight mb-4"
                >
                  Envie um resumo do seu caso
                </h2>
                <p className="text-base text-forest-600 leading-relaxed mb-8">
                  Use o formulário para montar uma mensagem simples para o
                  WhatsApp. Os dados não são armazenados nesta página.
                </p>

                <div className="rounded-2xl bg-white border border-forest-100 p-6 shadow-sm space-y-3">
                  <strong className="block font-display text-lg font-bold text-ink">
                    {SITE_CONFIG.legalName}
                  </strong>
                  <p className="text-xs font-mono text-gold-dark">
                    {SITE_CONFIG.oab} | CNPJ: {SITE_CONFIG.cnpj}
                  </p>
                  <div className="pt-2 space-y-2 text-sm text-forest-600">
                    <a
                      href={SITE_CONFIG.contact.phone}
                      className="flex items-center gap-2.5 hover:text-ink transition-colors no-underline"
                    >
                      <Phone className="h-4 w-4 text-gold-dark shrink-0" />
                      <span>WhatsApp: {SITE_CONFIG.contact.whatsappDisplay}</span>
                    </a>
                    <a
                      href={`mailto:${SITE_CONFIG.contact.email}`}
                      className="flex items-center gap-2.5 hover:text-ink transition-colors no-underline"
                    >
                      <Mail className="h-4 w-4 text-gold-dark shrink-0" />
                      <span>{SITE_CONFIG.contact.email}</span>
                    </a>
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 text-gold-dark shrink-0 mt-0.5" />
                      <span>
                        {SITE_CONFIG.address.street},{" "}
                        {SITE_CONFIG.address.building},{" "}
                        {SITE_CONFIG.address.neighborhood} —{" "}
                        {SITE_CONFIG.address.city}/{SITE_CONFIG.address.state}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <form
                id="whatsapp-contact-form"
                ref={contactFormRef}
                onSubmit={handleFormSubmit}
                className="lg:col-span-7 rounded-2xl bg-white border border-forest-100 p-6 sm:p-8 lg:p-10 shadow-lg shadow-forest-900/5 space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contact-name"
                      className="text-xs font-bold uppercase tracking-wider text-forest-900"
                    >
                      Nome completo
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="Seu nome"
                      className="w-full rounded-xl border border-forest-200 bg-cream-light/50 px-4 py-3 text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contact-status"
                      className="text-xs font-bold uppercase tracking-wider text-forest-900"
                    >
                      Situação do Proagro
                    </label>
                    <select
                      id="contact-status"
                      name="status"
                      className="w-full rounded-xl border border-forest-200 bg-cream-light/50 px-4 py-3 text-sm text-ink focus:border-gold-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 transition-colors"
                    >
                      <option value="Negado">Negado</option>
                      <option value="Reduzido">Reduzido</option>
                      <option value="Glosado">Glosado</option>
                      <option value="Encerrado">Encerrado</option>
                      <option value="Em análise">Em análise</option>
                      <option value="Não sei informar">Não sei informar</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="contact-message"
                    className="text-xs font-bold uppercase tracking-wider text-forest-900"
                  >
                    Resumo do problema
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    required
                    placeholder="Ex.: perdi a lavoura por seca, o Proagro foi negado e recebi uma decisão do banco."
                    className="w-full rounded-xl border border-forest-200 bg-cream-light/50 px-4 py-3 text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 transition-colors resize-y"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full group"
                >
                  <MessageCircle className="h-4 w-4" />
                  Enviar pelo WhatsApp
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>

                <p
                  id="form-status"
                  aria-live="polite"
                  className="text-xs text-forest-600 leading-relaxed m-0"
                >
                  {formStatus}
                </p>
              </form>
            </div>
          </Container>
        </section>
      </main>

      {/* ── Footer (aligned with main site Footer) ── */}
      <footer className="relative bg-forest-900 text-cream/85 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

        <Container className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 py-14 lg:py-16">
            {/* Brand */}
            <div>
              <Link
                href="/"
                className="group inline-flex items-center gap-3 no-underline mb-4"
              >
                <Image
                  src="/images/logo-ehs-monogram.png"
                  alt={SITE_CONFIG.legalName}
                  width={44}
                  height={44}
                  className="object-contain brightness-[3] transition-transform duration-300 group-hover:scale-105"
                />
                <div className="flex flex-col">
                  <span className="font-display text-lg font-bold leading-tight text-cream">
                    Erlo, Haas & Steffens
                  </span>
                  <span className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-gold/85 mt-0.5">
                    Sociedade de Advocacia
                  </span>
                </div>
              </Link>
              <p className="text-xs font-mono text-cream/70 mt-3">
                {SITE_CONFIG.oab} | CNPJ: {SITE_CONFIG.cnpj}
              </p>
            </div>

            {/* Page Sections */}
            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-gold mb-4">
                Nesta página
              </h4>
              <ul className="space-y-2.5 list-none p-0 m-0">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-cream/80 hover:text-gold transition-colors no-underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-gold mb-4">
                Contato
              </h4>
              <div className="space-y-3 text-sm text-cream/80">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                  <p className="m-0 leading-relaxed">
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
                  className="flex items-center gap-2.5 text-cream/80 hover:text-gold transition-colors no-underline"
                >
                  <Phone className="h-4 w-4 text-gold shrink-0" />
                  {SITE_CONFIG.contact.whatsappDisplay}
                </a>
                <a
                  href={`mailto:${SITE_CONFIG.contact.email}`}
                  className="flex items-center gap-2.5 text-cream/80 hover:text-gold transition-colors no-underline"
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
              <ul className="space-y-2.5 list-none p-0 m-0 text-sm">
                <li>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-cream/80 hover:text-gold transition-colors no-underline"
                  >
                    Site institucional
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
                <li>
                  <a
                    href={SITE_CONFIG.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-cream/80 hover:text-gold transition-colors no-underline"
                  >
                    Instagram do escritório
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </li>
                <li>
                  <Link
                    href="/politica-de-privacidade"
                    className="text-cream/80 hover:text-gold transition-colors no-underline"
                  >
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <Link
                    href="/termos-de-uso"
                    className="text-cream/80 hover:text-gold transition-colors no-underline"
                  >
                    Termos de Uso
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-forest-600/60 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-cream/65">
            <p className="m-0 max-w-2xl">
              Conteúdo informativo. A análise jurídica depende das
              circunstâncias de cada caso e não representa promessa de
              resultado.
            </p>
            <p className="m-0 shrink-0">
              © {new Date().getFullYear()} {SITE_CONFIG.legalName}.
            </p>
          </div>
        </Container>
      </footer>

      {/* ── Floating WhatsApp (aligned with FloatingWhatsApp, respects CookieConsentBanner) ── */}
      <WhatsAppLink
        href={defaultWhatsappUrl}
        page="/proagro"
        placement="floating-whatsapp"
        label="Botão Flutuante Proagro"
        aria-label="Falar com o escritório pelo WhatsApp"
        className={cn(
          bannerVisible ? "hidden sm:inline-flex" : "inline-flex",
          "fixed right-5 bottom-5 z-40 items-center gap-2.5 rounded-full bg-forest-900 text-cream border border-gold/35 pl-2.5 pr-2.5 sm:pr-4 py-2 shadow-xl shadow-ink/30 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:shadow-2xl no-underline"
        )}
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
          WhatsApp
        </span>
      </WhatsAppLink>
    </div>
  );
}
