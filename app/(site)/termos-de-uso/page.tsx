import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalPageLayout,
  LegalSectionHeading,
} from "@/components/layout/legal-page-layout";
import { SITE_CONFIG } from "@/lib/site-config";

const pageTitle = "Termos de Uso";
const pageDescription = `Termos de uso do site ehsadvogados.com.br — ${SITE_CONFIG.legalName}.`;

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/termos-de-uso",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${SITE_CONFIG.url}/termos-de-uso`,
    siteName: "Erlo, Haas & Steffens Advocacia",
    title: `${pageTitle} | Erlo, Haas & Steffens`,
    description: pageDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Termos de Uso — Erlo, Haas & Steffens Advocacia",
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

export default function TermosDeUsoPage() {
  return (
    <LegalPageLayout
      title="Termos de Uso"
      subtitle="Vigência a partir de março de 2026. Leia atentamente antes de utilizar este site."
      lastUpdated="Março de 2026"
      effectiveNotice={
        <>
          Estes Termos de Uso entram em vigor em{" "}
          <strong className="text-gold">março de 2026</strong> e permanecem
          válidos até nova atualização, que será comunicada nesta mesma página.
        </>
      }
    >
      {/* 1. Identificação */}
      <div>
        <LegalSectionHeading>1. Identificação</LegalSectionHeading>
        <p className="mb-3">
          O presente documento regula o uso do site{" "}
          <strong>ehsadvogados.com.br</strong>, mantido pela:
        </p>
        <div className="bg-white rounded-2xl border border-forest-100 p-6 space-y-1 text-sm text-forest-600">
          <p className="text-ink font-semibold text-base mb-1">
            {SITE_CONFIG.legalName}
          </p>
          <p>CNPJ: {SITE_CONFIG.cnpj}</p>
          <p>{SITE_CONFIG.oab}</p>
          <p className="pt-1">
            {SITE_CONFIG.address.street}, {SITE_CONFIG.address.building},{" "}
            {SITE_CONFIG.address.neighborhood}
            <br />
            {SITE_CONFIG.address.city} - {SITE_CONFIG.address.state}
          </p>
          <p className="pt-1">
            E-mail:{" "}
            <a
              href={`mailto:${SITE_CONFIG.contact.email}`}
              className="text-gold-dark hover:underline"
            >
              {SITE_CONFIG.contact.email}
            </a>
          </p>
        </div>
      </div>

      {/* 2. Objeto */}
      <div>
        <LegalSectionHeading>2. Objeto</LegalSectionHeading>
        <p>
          Estes Termos de Uso estabelecem as condições para o acesso e a
          utilização do site <strong>ehsadvogados.com.br</strong> e de todos os
          serviços e conteúdos nele disponibilizados, incluindo o blog jurídico,
          as informações institucionais e os meios de contato do escritório.
        </p>
      </div>

      {/* 3. Isenção de Responsabilidade */}
      <div>
        <LegalSectionHeading>3. Isenção de Responsabilidade</LegalSectionHeading>
        <p className="mb-4">
          O conteúdo disponibilizado neste site, especialmente os artigos do
          blog jurídico, tem caráter{" "}
          <strong>estritamente informativo e educacional</strong>. Não
          constitui, em nenhuma hipótese, consultoria jurídica individualizada,
          opinião legal ou aconselhamento profissional.
        </p>
        <p>
          A leitura de qualquer conteúdo deste site não estabelece relação
          advogado-cliente. Para obter orientação jurídica específica para seu
          caso, entre em contato diretamente com o escritório para agendamento
          de consulta.
        </p>
      </div>

      {/* 4. Propriedade Intelectual */}
      <div>
        <LegalSectionHeading>4. Propriedade Intelectual</LegalSectionHeading>
        <p>
          Todos os textos, artigos, imagens, logotipos, marcas, layout, design e
          demais elementos de conteúdo disponíveis neste site são de propriedade
          exclusiva da <strong>{SITE_CONFIG.legalName}</strong> ou de seus
          respectivos autores, e estão protegidos pela legislação brasileira de
          direitos autorais (Lei n.º 9.610/1998) e pela legislação de
          propriedade industrial.
        </p>
      </div>

      {/* 5. Limitação de Uso */}
      <div>
        <LegalSectionHeading>5. Limitação de Uso</LegalSectionHeading>
        <p className="mb-4">É expressamente vedado ao usuário:</p>
        <ul className="space-y-2 pl-4">
          {[
            "Reproduzir, copiar ou redistribuir qualquer conteúdo deste site para fins comerciais sem autorização prévia e por escrito;",
            "Utilizar os textos, artigos e materiais para alimentar ferramentas de inteligência artificial, scraping ou qualquer forma de extração em massa de dados;",
            "Apresentar o conteúdo deste site como de sua própria autoria;",
            "Utilizar o site para fins ilícitos ou que violem a legislação brasileira.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-ink">
              <span
                className="mt-2.5 w-1.5 h-1.5 rounded-full bg-gold-dark shrink-0"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 6. Comunicações */}
      <div>
        <LegalSectionHeading>6. Comunicações</LegalSectionHeading>
        <p>
          Para esclarecer dúvidas, solicitar a remoção de conteúdo ou exercer
          qualquer direito previsto nestes Termos, o usuário poderá entrar em
          contato pelo e-mail{" "}
          <a
            href={`mailto:${SITE_CONFIG.contact.email}`}
            className="text-gold-dark hover:underline font-medium"
          >
            {SITE_CONFIG.contact.email}
          </a>{" "}
          ou pelo WhatsApp {SITE_CONFIG.contact.whatsappDisplay}. O prazo de
          resposta é de até 5 dias úteis.
        </p>
      </div>

      {/* 7. Privacidade */}
      <div>
        <LegalSectionHeading>7. Privacidade de Dados</LegalSectionHeading>
        <p>
          O tratamento de dados pessoais coletados por meio deste site é
          regulado pela nossa{" "}
          <Link
            href="/politica-de-privacidade"
            className="text-gold-dark hover:underline font-medium"
          >
            Política de Privacidade
          </Link>
          , em conformidade com a Lei Geral de Proteção de Dados (Lei n.º
          13.709/2018 — LGPD).
        </p>
      </div>

      {/* 8. Lei Aplicável */}
      <div>
        <LegalSectionHeading>8. Lei Aplicável e Foro</LegalSectionHeading>
        <p>
          Estes Termos de Uso são regidos e interpretados de acordo com a
          legislação brasileira. Fica eleito o foro da comarca de{" "}
          <strong>
            {SITE_CONFIG.address.city} - {SITE_CONFIG.address.state}
          </strong>{" "}
          para dirimir quaisquer controvérsias decorrentes deste instrumento,
          com renúncia expressa a qualquer outro, por mais privilegiado que
          seja.
        </p>
      </div>
    </LegalPageLayout>
  );
}
