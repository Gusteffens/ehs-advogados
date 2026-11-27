import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/site-config";
import type { FaqAccordionItem } from "@/components/landing/faq-accordion";
import ProagroPageContent from "./proagro-content";

const PAGE_URL = `${SITE_CONFIG.url}/proagro`;
const PAGE_TITLE = "Proagro Negado | Análise Jurídica para Produtores Rurais";
const PAGE_DESCRIPTION =
  "Análise jurídica para produtores rurais com Proagro negado, reduzido ou glosado. Atendimento técnico em Direito do Agronegócio, crédito rural, Proagro e seguro rural.";

const PROAGRO_FAQS: readonly FaqAccordionItem[] = [
  {
    question: "A análise garante indenização?",
    answer:
      "Não. Ela serve para avaliar a viabilidade técnica do caso, a documentação disponível e os possíveis caminhos, sem promessa de resultado.",
  },
  {
    question: "Posso chamar mesmo sem todos os documentos?",
    answer:
      "Sim. O escritório pode orientar quais documentos procurar e avaliar a solicitação junto ao banco, cooperativa ou agente financeiro, conforme o caso.",
  },
  {
    question: "Atende produtor de outra cidade?",
    answer:
      "Sim. O atendimento pode ser presencial em nossa sede em São Miguel do Oeste/SC ou digital, conforme a necessidade do produtor rural.",
  },
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: "/proagro",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: PAGE_URL,
    siteName: SITE_CONFIG.legalName,
    title: `${PAGE_TITLE} | ${SITE_CONFIG.name}`,
    description: PAGE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Proagro Negado — Análise Jurídica para Produtores Rurais | EHS Advocacia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${PAGE_TITLE} | ${SITE_CONFIG.name}`,
    description: PAGE_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function ProagroPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Análise Jurídica de Proagro e Crédito Rural",
    serviceType: "Direito do Agronegócio",
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    provider: {
      "@type": "LegalService",
      name: SITE_CONFIG.legalName,
      url: SITE_CONFIG.url,
      telephone: "+55-49-98400-1053",
      address: {
        "@type": "PostalAddress",
        streetAddress: `${SITE_CONFIG.address.street}, ${SITE_CONFIG.address.building}`,
        addressLocality: SITE_CONFIG.address.city,
        addressRegion: SITE_CONFIG.address.state,
        postalCode: SITE_CONFIG.address.zipCode,
        addressCountry: "BR",
      },
    },
    areaServed: {
      "@type": "State",
      name: "Santa Catarina",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PROAGRO_FAQS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: SITE_CONFIG.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Proagro Negado",
        item: PAGE_URL,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProagroPageContent faqs={PROAGRO_FAQS} />
    </>
  );
}
