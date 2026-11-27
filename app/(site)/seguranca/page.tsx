import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowDown,
  Clock,
  Download,
  MessageCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section-title";
import { WhatsAppLink } from "@/components/tracking/whatsapp-link";
import { WhatsAppScamMockup } from "@/components/seguranca/whatsapp-scam-mockup";
import { ScamAlertsAccordion } from "@/components/seguranca/scam-alerts-accordion";
import { SCAM_ALERT_ITEMS } from "@/components/seguranca/scam-alerts-data";
import { OfficialChannels } from "@/components/seguranca/official-channels";
import { SITE_CONFIG } from "@/lib/site-config";

const pageTitle = "Cartilha de Segurança · Prevenção a Fraudes";
const pageDescription = `Orientações da ${SITE_CONFIG.legalName} para identificar e prevenir o golpe do falso advogado. Confirme sempre pelos nossos canais oficiais.`;

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/seguranca",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${SITE_CONFIG.url}/seguranca`,
    siteName: `${SITE_CONFIG.name} — ${SITE_CONFIG.legalName}`,
    title: `${pageTitle} | Erlo, Haas & Steffens`,
    description: pageDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${pageTitle} — ${SITE_CONFIG.legalName}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${pageTitle} | Erlo, Haas & Steffens`,
    description: pageDescription,
    images: ["/og-image.png"],
  },
};

const sectionNavLinks = [
  { href: "#golpe", label: "Como funciona" },
  { href: "#sinais", label: "Sinais de alerta" },
  { href: "#nunca", label: "O que nunca fazer" },
  { href: "#fazer", label: "Se caiu no golpe" },
  { href: "#canais", label: "Canais oficiais" },
] as const;

const neverDoItems = [
  {
    title: "Não responder a números que não sejam nossos canais oficiais",
    description:
      "Se o contato vier de número desconhecido, interrompa a conversa e confirme diretamente com o escritório.",
  },
  {
    title: "Não realizar pagamentos solicitados por números desconhecidos",
    description:
      "Jamais faça Pix, TED, transferência ou depósito sem confirmação do escritório.",
  },
  {
    title: "Não informar senhas bancárias ou códigos de segurança",
    description:
      "Esses dados são pessoais e não devem ser compartilhados com terceiros.",
  },
  {
    title: "Não compartilhar a tela do seu celular",
    description:
      "O compartilhamento pode permitir acesso indevido a informações sensíveis.",
  },
  {
    title: "Não acessar links suspeitos",
    description:
      "Links podem direcionar para páginas falsas ou instalar programas maliciosos.",
  },
  {
    title: "Não instalar aplicativos por solicitação de terceiros",
    description:
      "Programas sugeridos por golpistas podem permitir invasões e fraudes bancárias.",
  },
  {
    title:
      "Não realizar empréstimos para supostamente liberar valores judiciais",
    description:
      "Esse é um dos argumentos mais comuns em golpes desse tipo.",
  },
  {
    title:
      "Não transferir dinheiro para contas de terceiros sem confirmação do escritório",
    description:
      "Mesmo que o golpista apresente urgência ou detalhes do processo, aguarde sempre o nosso retorno.",
  },
] as const;

const emergencySteps = [
  {
    number: "01",
    title: "Entre em contato com seu banco.",
    description:
      "Informe que foi vítima de um golpe e, se houve Pix, solicite o acionamento do Mecanismo Especial de Devolução (MED).",
  },
  {
    number: "02",
    title: "Avise o escritório.",
    description: "Utilize exclusivamente os canais oficiais de atendimento.",
  },
  {
    number: "03",
    title: "Preserve todas as provas.",
    description:
      "Guarde mensagens, números de telefone, comprovantes, áudios, imagens e qualquer outro registro útil.",
  },
  {
    number: "04",
    title: "Registre um boletim de ocorrência.",
    description:
      "Isso ajuda na formalização do fato e em providências posteriores.",
  },
  {
    number: "05",
    title: "Denuncie e bloqueie o número falso.",
    description: "Faça isso depois de preservar as provas.",
  },
] as const;

function SegurancaJsonLd() {
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    description: pageDescription,
    url: `${SITE_CONFIG.url}/seguranca`,
    inLanguage: "pt-BR",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_CONFIG.legalName,
      url: SITE_CONFIG.url,
    },
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
        name: "Cartilha de Segurança",
        item: `${SITE_CONFIG.url}/seguranca`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SCAM_ALERT_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.quote,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.explanation,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

export default function SegurancaPage() {
  return (
    <>
      <SegurancaJsonLd />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-ink to-forest-900 pt-28 pb-28 sm:pt-32 sm:pb-36 lg:pt-40 lg:pb-40">
        <div
          className="pointer-events-none absolute top-12 right-8 h-80 w-80 rounded-full bg-gold/10 blur-[120px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-16 left-8 h-72 w-72 rounded-full bg-forest-600/20 blur-[120px]"
          aria-hidden="true"
        />

        <Container className="relative z-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Hero copy */}
            <div className="lg:col-span-7">
              <span className="mb-4 inline-block font-body text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                Cartilha de segurança · Prevenção a fraudes
              </span>

              <h1 className="mb-6 font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-cream">
                Cuidado com o golpe do{" "}
                <span className="text-gold">falso advogado!</span>
              </h1>

              <p className="mb-4 max-w-2xl text-base sm:text-lg leading-relaxed text-cream/85">
                Criminosos estão utilizando nomes, fotografias e informações de
                advogados para enganar clientes e solicitar transferências
                bancárias. Saiba como identificar essas tentativas de fraude e
                proteger seu dinheiro.
              </p>

              <p className="mb-7 max-w-2xl text-sm sm:text-base leading-relaxed text-cream/75">
                Esses contatos costumam trazer notícias aparentemente positivas,
                pedidos urgentes de Pix e até menções falsas a audiências ou
                liberações judiciais para pressionar a vítima a agir sem
                confirmação.
              </p>

              {/* Slogan badge */}
              <div className="mb-8 inline-flex items-center gap-2.5 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-gold shadow-sm">
                <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="font-body text-xs sm:text-sm font-extrabold uppercase tracking-[0.18em]">
                  PARE. DESCONFIE. CONFIRME.
                </span>
              </div>

              {/* Hero CTAs */}
              <div className="flex flex-col gap-3.5 sm:flex-row sm:flex-wrap sm:items-center">
                <a
                  href="#canais"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-gold px-7 text-base font-semibold text-ink shadow-md transition-all duration-300 hover:bg-gold-dark hover:text-cream hover:shadow-lg no-underline"
                >
                  Ver canais oficiais
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="#fazer"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-xl border-2 border-cream/30 px-7 text-base font-medium text-cream transition-all duration-300 hover:border-gold hover:bg-cream/10 no-underline"
                >
                  O que fazer se caiu no golpe
                </a>
              </div>
            </div>

            {/* Illustrative WhatsApp scam mockup */}
            <div className="lg:col-span-5">
              <WhatsAppScamMockup />
            </div>
          </div>
        </Container>

        <div
          className="fade-to-cream pointer-events-none absolute inset-x-0 -bottom-px z-20 h-24 sm:h-32"
          aria-hidden="true"
        />
      </section>

      {/* ── Quick Section Navigation ── */}
      <nav
        aria-label="Navegação rápida da cartilha de segurança"
        className="border-b border-forest-100 bg-cream py-4"
      >
        <Container>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:pb-0">
            {sectionNavLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-full border border-forest-200/90 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-forest-800 transition-colors hover:border-gold-dark hover:bg-champagne-50 hover:text-ink no-underline"
              >
                {item.label}
              </a>
            ))}
          </div>
        </Container>
      </nav>

      {/* ── #golpe: Como o golpe funciona ── */}
      <section id="golpe" className="scroll-mt-24 bg-cream py-16 lg:py-24">
        <Container narrow>
          <SectionTitle
            label="Entenda a Fraude"
            title="Como o golpe funciona"
            align="left"
            className="mb-8 lg:mb-10"
          />

          <div className="space-y-6">
            <div className="rounded-2xl border border-forest-100 bg-white p-6 sm:p-8 shadow-sm">
              <p className="text-base sm:text-lg leading-relaxed text-ink">
                Os criminosos entram em contato, geralmente por WhatsApp, e se
                apresentam como advogados ou integrantes do escritório. Para
                convencer a vítima, podem usar nomes verdadeiros, fotografias,
                informações reais do processo, números de OAB e até documentos
                falsificados ou manipulados. O objetivo é induzir o cliente a
                realizar uma transferência, fornecer dados bancários, clicar em
                links suspeitos ou compartilhar a tela do celular.
              </p>
            </div>

            <div
              role="alert"
              className="flex items-start gap-4 rounded-2xl border border-red-200 border-l-4 border-l-red-700 bg-red-50/95 p-5 sm:p-6 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-sm sm:text-base font-semibold leading-relaxed text-red-950">
                Mesmo que a pessoa saiba detalhes do seu processo, isso não
                significa que ela seja realmente seu advogado.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── #sinais: Reconheça os sinais de alerta ── */}
      <section
        id="sinais"
        className="scroll-mt-24 bg-cream-light py-16 lg:py-24"
      >
        <Container narrow>
          <SectionTitle
            label="Sinais de Alerta"
            title="Reconheça os sinais de alerta"
            subtitle="Algumas mensagens aparecem com frequência nesse tipo de fraude. Clique nas situações abaixo para ver por que elas são suspeitas."
          />

          <ScamAlertsAccordion />
        </Container>
      </section>

      {/* ── #nunca: O que você nunca deve fazer ── */}
      <section id="nunca" className="scroll-mt-24 bg-cream py-16 lg:py-24">
        <Container>
          <SectionTitle
            label="Prevenção"
            title="O que você nunca deve fazer"
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {neverDoItems.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-2xl border border-forest-100 bg-white p-6 shadow-sm transition-all duration-200 hover:border-gold-dark/35 hover:shadow-md"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 font-display text-lg font-bold text-red-700"
                  aria-hidden="true"
                >
                  !
                </div>
                <div>
                  <h3 className="mb-1.5 font-display text-lg sm:text-xl font-bold leading-snug text-ink">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-[0.95rem] leading-relaxed text-forest-600">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-8 max-w-4xl space-y-4">
            {/* Red alert */}
            <div
              role="alert"
              className="flex items-start gap-4 rounded-2xl border border-red-200 border-l-4 border-l-red-700 bg-red-50/95 p-5 sm:p-6 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-sm sm:text-base font-semibold leading-relaxed text-red-950">
                Nosso escritório não solicita acesso à sua conta bancária,
                senhas, códigos de segurança ou compartilhamento de tela para
                liberar valores judiciais.
              </p>
            </div>

            {/* Gold / Amber alert */}
            <div className="flex items-start gap-4 rounded-2xl border border-champagne-300 border-l-4 border-l-gold-dark bg-champagne-50 p-5 sm:p-6 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-champagne-200/70 text-gold-dark">
                <Clock className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-ink">
                <strong className="font-bold text-ink">
                  Fora do horário de atendimento:
                </strong>{" "}
                nosso atendimento é das 8h às 18h. Se você não conseguir
                confirmar uma informação nesse período, aguarde sempre o nosso
                retorno e não realize nenhum pagamento.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── #fazer: Caiu no golpe? Saiba o que fazer ── */}
      <section
        id="fazer"
        className="scroll-mt-24 bg-cream-light py-16 lg:py-24"
      >
        <Container narrow>
          <SectionTitle
            label="Ação Imediata"
            title="Caiu no golpe? Saiba o que fazer"
            subtitle="Se você realizou algum pagamento, enviou documentos ou compartilhou informações com criminosos, aja imediatamente."
          />

          <ol className="space-y-4">
            {emergencySteps.map((step) => (
              <li
                key={step.number}
                className="flex items-start gap-4 sm:gap-5 rounded-2xl border border-forest-100 bg-white p-5 sm:p-6 shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-900 font-display text-base font-bold text-gold shadow-sm">
                  {step.number}
                </div>
                <div className="pt-0.5">
                  <h3 className="mb-1 font-display text-lg sm:text-xl font-bold text-ink">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-forest-600">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div
            role="alert"
            className="mt-8 flex items-start gap-4 rounded-2xl border border-red-200 border-l-4 border-l-red-700 bg-red-50/95 p-5 sm:p-6 shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-sm sm:text-base font-semibold leading-relaxed text-red-950">
              Quanto mais rapidamente você agir, maiores poderão ser as chances
              de recuperar os valores transferidos. A devolução, entretanto, não
              é garantida.
            </p>
          </div>
        </Container>
      </section>

      {/* ── #canais: Nossos canais oficiais de atendimento ── */}
      <section id="canais" className="scroll-mt-24 bg-cream py-16 lg:py-24">
        <Container>
          <SectionTitle
            label="Canais Verificados"
            title="Nossos canais oficiais de atendimento"
            subtitle="Salve os nossos contatos em sua agenda. Se receber uma mensagem de outro número, mesmo que contenha a fotografia de um de nossos advogados, confirme a informação exclusivamente pelos canais oficiais abaixo."
          />

          <OfficialChannels />

          {/* Official institutional verification bar */}
          <div className="mt-8 rounded-2xl border border-forest-100 bg-white p-6 sm:p-7 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-champagne-300/30 text-gold-dark">
                  <Shield className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-ink">
                    {SITE_CONFIG.legalName}
                  </p>
                  <p className="mt-0.5 text-sm text-forest-600">
                    {SITE_CONFIG.address.full}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <span className="rounded-lg border border-forest-200 bg-cream-light px-3 py-1.5 font-mono text-xs font-semibold text-forest-800">
                  CNPJ: {SITE_CONFIG.cnpj}
                </span>
                <span className="rounded-lg border border-forest-200 bg-cream-light px-3 py-1.5 font-mono text-xs font-semibold text-forest-800">
                  {SITE_CONFIG.oab}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Closing Banner & PDF Download ── */}
      <section className="relative overflow-hidden bg-forest-900 py-20 lg:py-24">
        <div
          className="pointer-events-none absolute top-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-gold/10 blur-[100px]"
          aria-hidden="true"
        />

        <Container narrow className="relative z-10 text-center">
          <p className="mb-3 font-body text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] text-gold">
            Lembre-se sempre
          </p>
          <h2 className="mb-5 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-wide text-gold">
            PARE. DESCONFIE. CONFIRME.
          </h2>
          <p className="mx-auto mb-2 max-w-2xl text-lg sm:text-xl leading-relaxed text-cream/90">
            Nenhum pagamento é tão urgente que não possa ser previamente
            confirmado.
          </p>
          <p className="mb-12 text-base sm:text-lg font-bold text-cream">
            Sua segurança também é nossa prioridade.
          </p>

          {/* Download card */}
          <div className="mx-auto max-w-2xl rounded-2xl border border-gold/25 bg-ink/45 p-7 sm:p-9 shadow-xl">
            <h3 className="mb-2 font-display text-2xl font-bold text-cream">
              Guarde e compartilhe a cartilha
            </h3>
            <p className="mb-6 text-sm sm:text-base leading-relaxed text-cream/80">
              Salve a versão em PDF e compartilhe estas orientações com seus
              familiares.
            </p>

            <div className="flex flex-col justify-center gap-3.5 sm:flex-row">
              <a
                href="/docs/Cartilha_de_Seguranca.pdf"
                download="Cartilha_de_Seguranca.pdf"
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-gold px-7 text-base font-semibold text-ink shadow-md transition-all duration-300 hover:bg-gold-dark hover:text-cream hover:shadow-lg no-underline"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Baixar cartilha em PDF
              </a>

              <WhatsAppLink
                href={SITE_CONFIG.contact.whatsapp}
                page="/seguranca"
                placement="seguranca-closing-cta"
                label="Confirmar pelo WhatsApp Oficial"
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl border border-cream/30 px-6 text-base font-medium text-cream transition-all duration-300 hover:border-gold hover:bg-cream/10 no-underline"
              >
                <MessageCircle className="h-4 w-4 text-gold" aria-hidden="true" />
                Confirmar pelo WhatsApp oficial
              </WhatsAppLink>
            </div>
          </div>

          <p className="mt-10 text-xs uppercase tracking-[0.16em] text-cream/55">
            {SITE_CONFIG.legalName} · Material informativo de prevenção a
            fraudes
          </p>
        </Container>
      </section>
    </>
  );
}
