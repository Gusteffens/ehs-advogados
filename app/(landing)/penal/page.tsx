import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/site-config";
import type { FaqAccordionItem } from "@/components/landing/faq-accordion";
import PenalPageContent from "./penal-content";

const PAGE_URL = `${SITE_CONFIG.url}/penal`;
const PAGE_TITLE = "Advocacia Criminal | EHS Advocacia";
const PAGE_DESCRIPTION =
  "Atuação jurídica estratégica e sigilosa em investigações, prisões, inquéritos, processos criminais, recursos e assistência às vítimas.";

const PENAL_FAQS: readonly FaqAccordionItem[] = [
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

export const metadata: Metadata = {
  title: {
    absolute: PAGE_TITLE,
  },
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: "/penal",
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
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Advocacia Criminal — Erlo, Haas & Steffens Sociedade de Advocacia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function PenalPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Advocacia Criminal e Defesa Penal",
    serviceType: "Direito Penal",
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
    mainEntity: PENAL_FAQS.map((item) => ({
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
        name: "Advocacia Criminal",
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
      <PenalPageContent faqs={PENAL_FAQS} />
    </>
  );
}
