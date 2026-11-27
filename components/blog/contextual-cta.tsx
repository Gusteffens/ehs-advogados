"use client";

import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SITE_CONFIG } from "@/lib/site-config";
import { trackWhatsAppClick } from "@/lib/tracking";
import { trackArticleEvent } from "@/lib/analytics/client-beacon";

interface BlogContextualCtaProps {
  postId?: string;
  postTitle: string;
  postSlug: string;
  categorySlug: string | null;
  categoryName: string | null;
}

function normalizeText(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function resolvePracticeAreaAssunto(
  categorySlug: string | null,
  categoryName: string | null
): string | null {
  const normalized = normalizeText(`${categorySlug ?? ""} ${categoryName ?? ""}`);
  if (!normalized.trim()) return null;

  const matched = SITE_CONFIG.practiceAreas.find((area) => {
    const areaId = normalizeText(area.id);
    const areaTitle = normalizeText(area.title);
    const areaShort = normalizeText(area.shortTitle);
    return (
      normalized.includes(areaId) ||
      normalized.includes(areaTitle) ||
      normalized.includes(areaShort)
    );
  });

  return matched?.title ?? categoryName;
}

function getContextualConfig(
  categorySlug: string | null,
  categoryName: string | null,
  postTitle: string
) {
  const normalized = normalizeText(`${categorySlug ?? ""} ${categoryName ?? ""}`);
  const assuntoTitle = resolvePracticeAreaAssunto(categorySlug, categoryName);
  const assuntoParam = assuntoTitle
    ? `?assunto=${encodeURIComponent(assuntoTitle)}`
    : "";

  if (
    normalized.includes("agrario") ||
    normalized.includes("agronegocio") ||
    normalized.includes("proagro") ||
    normalized.includes("rural") ||
    normalized.includes("credito")
  ) {
    return {
      eyebrow: "Direito Agrário & Proagro",
      heading: "Precisa de orientação sobre Proagro ou crédito rural?",
      description:
        "Nossa equipe atua diretamente na defesa do produtor rural em pedidos de Proagro negado, seguro rural e renegociação de dívidas.",
      primaryHref: "/proagro",
      primaryLabel: "Conhecer atuação em Proagro",
      contactHref: `/contato${assuntoParam || `?assunto=${encodeURIComponent("Direito Agrário e do Agronegócio")}`}`,
      whatsappText: `Olá, li o artigo "${postTitle}" no site da EHS e gostaria de orientação sobre Direito Agrário / Proagro.`,
      trackingLabel: "blog_cta_proagro",
    };
  }

  if (normalized.includes("penal") || normalized.includes("criminal")) {
    return {
      eyebrow: "Direito Penal",
      heading: "Precisa de defesa criminal técnica e sigilosa?",
      description:
        "Atuação estratégica em inquéritos policiais, audiências, habeas corpus e processos criminais em todas as instâncias.",
      primaryHref: "/penal",
      primaryLabel: "Conhecer atuação em Direito Penal",
      contactHref: `/contato${assuntoParam || `?assunto=${encodeURIComponent("Direito Penal")}`}`,
      whatsappText: `Olá, li o artigo "${postTitle}" no site da EHS e gostaria de atendimento sigiloso em Direito Penal.`,
      trackingLabel: "blog_cta_penal",
    };
  }

  return {
    eyebrow: assuntoTitle ?? "Orientação Jurídica",
    heading: "Precisa de orientação sobre este tema?",
    description:
      "Nossa equipe está pronta para analisar o seu caso com sigilo, clareza e estratégia jurídica personalizada.",
    primaryHref: `/contato${assuntoParam}`,
    primaryLabel: "Solicitar análise pelo formulário",
    contactHref: `/contato${assuntoParam}`,
    whatsappText: `Olá, li o artigo "${postTitle}" no site da EHS e gostaria de solicitar uma orientação jurídica.`,
    trackingLabel: categorySlug ? `blog_cta_${categorySlug}` : "blog_cta_geral",
  };
}

export function BlogSidebarCta({
  postId,
  postTitle,
  postSlug,
  categorySlug,
  categoryName,
}: BlogContextualCtaProps) {
  const config = getContextualConfig(categorySlug, categoryName, postTitle);
  const whatsappUrl = `${SITE_CONFIG.contact.whatsapp}?text=${encodeURIComponent(
    config.whatsappText
  )}`;

  return (
    <aside className="rounded-2xl bg-primary border border-gold/20 p-5 shadow-md shadow-ink/10">
      <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-gold mb-2">
        {config.eyebrow}
      </span>
      <h3 className="font-display text-base font-bold text-cream leading-snug mb-2">
        Ficou com dúvidas sobre este tema?
      </h3>
      <p className="text-xs text-cream/75 leading-relaxed mb-4">
        Converse com um advogado da nossa equipe para analisar o seu caso com sigilo.
      </p>
      <div className="flex flex-col gap-2.5">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackWhatsAppClick({
              page: `/blog/${postSlug}`,
              placement: "blog_sidebar_cta",
              label: config.trackingLabel,
            });
            if (postId) {
              trackArticleEvent({
                postId,
                eventType: "cta_whatsapp",
                target: `${config.trackingLabel}_sidebar`,
              });
            }
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-ink shadow-sm hover:bg-gold/90 transition-colors no-underline"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Falar no WhatsApp
        </a>
        <Link
          href={config.contactHref}
          onClick={() => {
            if (postId) {
              trackArticleEvent({
                postId,
                eventType: "cta_primary",
                target: config.contactHref,
              });
            }
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-cream/20 px-4 py-2 text-xs font-medium text-cream/90 hover:bg-cream/10 hover:text-cream transition-colors no-underline"
        >
          Enviar mensagem
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
}

export function BlogContextualCta({
  postId,
  postTitle,
  postSlug,
  categorySlug,
  categoryName,
}: BlogContextualCtaProps) {
  const config = getContextualConfig(categorySlug, categoryName, postTitle);
  const whatsappUrl = `${SITE_CONFIG.contact.whatsapp}?text=${encodeURIComponent(
    config.whatsappText
  )}`;

  return (
    <section className="py-16 bg-primary">
      <Container className="text-center">
        <span className="inline-block text-xs font-semibold uppercase tracking-[0.22em] text-gold mb-3">
          {config.eyebrow}
        </span>
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-cream mb-4 max-w-2xl mx-auto">
          {config.heading}
        </h3>
        <p className="text-cream/75 max-w-xl mx-auto mb-8 leading-relaxed">
          {config.description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackWhatsAppClick({
                page: `/blog/${postSlug}`,
                placement: "blog_article_cta",
                label: config.trackingLabel,
              });
              if (postId) {
                trackArticleEvent({
                  postId,
                  eventType: "cta_whatsapp",
                  target: config.trackingLabel,
                });
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-ink shadow-md hover:bg-gold/90 transition-colors no-underline"
          >
            <MessageCircle className="h-4 w-4" />
            Fale com um Especialista
          </a>
          <Link
            href={config.primaryHref}
            onClick={() => {
              if (postId) {
                trackArticleEvent({
                  postId,
                  eventType: "cta_primary",
                  target: config.primaryHref,
                });
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-cream/25 px-6 py-3 text-sm font-medium text-cream hover:bg-cream/10 transition-colors no-underline"
          >
            {config.primaryLabel}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
