"use client";

import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SITE_CONFIG } from "@/lib/site-config";
import { trackWhatsAppClick } from "@/lib/tracking";

interface BlogContextualCtaProps {
  postTitle: string;
  postSlug: string;
  categorySlug: string | null;
  categoryName: string | null;
}

function getContextualConfig(
  categorySlug: string | null,
  categoryName: string | null,
  postTitle: string
) {
  const normalized = `${categorySlug ?? ""} ${categoryName ?? ""}`.toLowerCase();

  if (
    normalized.includes("agrario") ||
    normalized.includes("agronegocio") ||
    normalized.includes("proagro") ||
    normalized.includes("rural")
  ) {
    return {
      eyebrow: "Direito Agrário & Proagro",
      heading: "Precisa de orientação sobre Proagro ou crédito rural?",
      description:
        "Nossa equipe atua diretamente na defesa do produtor rural em pedidos de Proagro negado, seguro rural e renegociação de dívidas.",
      primaryHref: "/proagro",
      primaryLabel: "Conhecer atuação em Proagro",
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
      whatsappText: `Olá, li o artigo "${postTitle}" no site da EHS e gostaria de atendimento sigiloso em Direito Penal.`,
      trackingLabel: "blog_cta_penal",
    };
  }

  const assuntoParam = categoryName
    ? `?assunto=${encodeURIComponent(categoryName)}`
    : "";

  return {
    eyebrow: categoryName ?? "Orientação Jurídica",
    heading: "Precisa de orientação sobre este tema?",
    description:
      "Nossa equipe está pronta para analisar o seu caso com sigilo, clareza e estratégia jurídica personalizada.",
    primaryHref: `/contato${assuntoParam}`,
    primaryLabel: "Solicitar análise pelo formulário",
    whatsappText: `Olá, li o artigo "${postTitle}" no site da EHS e gostaria de solicitar uma orientação jurídica.`,
    trackingLabel: categorySlug ? `blog_cta_${categorySlug}` : "blog_cta_geral",
  };
}

export function BlogContextualCta({
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
            onClick={() =>
              trackWhatsAppClick({
                page: `/blog/${postSlug}`,
                placement: "blog_article_cta",
                label: config.trackingLabel,
              })
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-ink shadow-md hover:bg-gold/90 transition-colors no-underline"
          >
            <MessageCircle className="h-4 w-4" />
            Fale com um Especialista
          </a>
          <Link
            href={config.primaryHref}
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
