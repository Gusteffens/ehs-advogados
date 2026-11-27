import type { Metadata } from "next";
import {
  LegalPageLayout,
  LegalSectionHeading,
} from "@/components/layout/legal-page-layout";
import { CookiePreferencesButton } from "@/components/providers/cookie-consent-banner";
import { SITE_CONFIG } from "@/lib/site-config";

const pageTitle = "Política de Privacidade";
const pageDescription = `Política de Privacidade da ${SITE_CONFIG.legalName}, em conformidade com a Lei Geral de Proteção de Dados (LGPD).`;

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/politica-de-privacidade",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${SITE_CONFIG.url}/politica-de-privacidade`,
    siteName: "Erlo, Haas & Steffens Advocacia",
    title: `${pageTitle} | Erlo, Haas & Steffens`,
    description: pageDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Política de Privacidade — Erlo, Haas & Steffens Advocacia",
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

export default function PoliticaDePrivacidadePage() {
  return (
    <LegalPageLayout
      title="Política de Privacidade"
      subtitle="Em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018)."
      badge="Privacidade & LGPD"
      lastUpdated="Março de 2026"
    >
      {/* 1 */}
      <div>
        <LegalSectionHeading>1. Identificação do Controlador</LegalSectionHeading>
        <p className="mb-4">
          O controlador dos dados pessoais coletados por este site é:
        </p>
        <div className="bg-white rounded-2xl border border-forest-100 p-6 space-y-1 text-sm text-forest-600">
          <p className="text-ink font-semibold text-base mb-1">
            {SITE_CONFIG.legalName}
          </p>
          <p>CNPJ: {SITE_CONFIG.cnpj}</p>
          <p>{SITE_CONFIG.oab}</p>
          <p>Endereço: {SITE_CONFIG.address.full}</p>
          <p>
            E-mail do Encarregado de Dados (DPO):{" "}
            <a
              href={`mailto:${SITE_CONFIG.contact.email}`}
              className="text-gold-dark underline underline-offset-2"
            >
              {SITE_CONFIG.contact.email}
            </a>
          </p>
          <p>WhatsApp: {SITE_CONFIG.contact.whatsappDisplay}</p>
          <p>Site: {SITE_CONFIG.url}</p>
        </div>
      </div>

      {/* 2 */}
      <div>
        <LegalSectionHeading>2. Dados Pessoais Coletados</LegalSectionHeading>
        <p className="mb-4">
          Coletamos os seguintes dados pessoais, conforme a finalidade:
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-ink mb-1">
              Formulário de Contato
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nome completo, endereço de e-mail e número de telefone</li>
              <li>Assunto e mensagem (conteúdo livre)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-ink mb-1">
              Dados de Navegação e Mensuração (PostHog, Google Tag Manager,
              Google Ads e Meta Pixel / API de Conversões)
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Páginas visitadas, eventos de conversão e interações no site
              </li>
              <li>Tipo de dispositivo, navegador, sistema operacional e região</li>
              <li>
                Identificadores técnicos e dados criptografados (hash SHA-256 de
                e-mail/telefone no envio do formulário) para mensuração de
                campanhas institucionais
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-ink mb-1">
              Cookies de Sessão (Autenticação Administrativa)
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Cookie de sessão HttpOnly assinado para autenticação interna do
                painel administrativo dos advogados
              </li>
              <li>Dados de perfil associados à conta autenticada</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-ink mb-1">
              Cookies Técnicos (Cloudflare)
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Identificadores de segurança e proteção contra ataques, sem
                finalidade publicitária
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3 */}
      <div>
        <LegalSectionHeading>3. Finalidade do Tratamento</LegalSectionHeading>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Atendimento ao cliente:</strong> responder mensagens
            enviadas pelo formulário de contato e dar andamento a consultas
            jurídicas.
          </li>
          <li>
            <strong>Envio de e-mails:</strong> encaminhar a mensagem do
            formulário ao escritório por meio do serviço Resend.
          </li>
          <li>
            <strong>Melhoria do site e mensuração de mídia:</strong> analisar
            padrões de navegação (PostHog) e medir a eficácia de campanhas
            informativas institucionais (Google Tag Manager, Google Ads e Meta
            Pixel / API de Conversões).
          </li>
          <li>
            <strong>Autenticação:</strong> garantir o acesso seguro ao painel
            administrativo do escritório por meio de sessão própria autenticada.
          </li>
          <li>
            <strong>Segurança e disponibilidade:</strong> proteção contra
            acessos maliciosos e garantia de desempenho (Cloudflare).
          </li>
        </ul>
      </div>

      {/* 4 */}
      <div>
        <LegalSectionHeading>
          4. Base Legal para o Tratamento
        </LegalSectionHeading>
        <p className="mb-3">
          O tratamento dos dados pessoais é realizado com base nas hipóteses
          legais previstas na LGPD (Lei nº 13.709/2018):
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Formulário de contato</strong> — Procedimentos preliminares
            relacionados a contrato e legítimo interesse (Art. 7°, V e IX).
          </li>
          <li>
            <strong>
              Analytics e mensuração de campanhas (PostHog, Google Ads/GTM e
              Meta Pixel)
            </strong>{" "}
            — Legítimo interesse (Art. 7°, IX), respeitado o direito de oposição
            e controle de cookies do titular.
          </li>
          <li>
            <strong>Cookies de sessão administrativa</strong> — Execução de
            contrato ou procedimentos preliminares (Art. 7°, V).
          </li>
          <li>
            <strong>Cookies técnicos (Cloudflare)</strong> — Legítimo interesse
            (Art. 7°, IX) para segurança da infraestrutura.
          </li>
        </ul>
      </div>

      {/* 5 */}
      <div>
        <LegalSectionHeading>
          5. Prazo de Retenção dos Dados
        </LegalSectionHeading>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Dados de contato (formulário):</strong> armazenados por até
            5 (cinco) anos, salvo obrigação legal que exija prazo maior.
          </li>
          <li>
            <strong>
              Dados de navegação e mensuração (PostHog, Google e Meta):
            </strong>{" "}
            retidos conforme os prazos técnicos de cada plataforma (em média de
            13 a 24 meses).
          </li>
          <li>
            <strong>Cookies de sessão administrativa:</strong> mantidos pelo
            tempo de duração da sessão autenticada (até 30 dias ou até o
            encerramento manual).
          </li>
        </ul>
      </div>

      {/* 6 */}
      <div>
        <LegalSectionHeading>6. Direitos do Titular</LegalSectionHeading>
        <p className="mb-3">
          Em conformidade com o art. 18 da LGPD, você tem direito a solicitar
          acesso, correção, exclusão, portabilidade, revogação de consentimento,
          informação sobre compartilhamento e oposição ao tratamento de dados.
        </p>
        <p>
          Para exercer qualquer destes direitos, entre em contato pelo e-mail{" "}
          <a
            href={`mailto:${SITE_CONFIG.contact.email}`}
            className="text-gold-dark font-semibold underline underline-offset-2"
          >
            {SITE_CONFIG.contact.email}
          </a>
          .
        </p>
      </div>

      {/* 7 */}
      <div>
        <LegalSectionHeading>7. Uso de Cookies</LegalSectionHeading>
        <p className="mb-3">
          Este site utiliza cookies estritamente necessários (sessão
          administrativa própria e Cloudflare), cookies de analytics (PostHog) e
          cookies/tags de mensuração de campanhas (Google Tag Manager, Google
          Ads e Meta Pixel).
        </p>
        <p className="mb-4">
          Você pode bloquear ou limpar cookies a qualquer momento nas
          configurações do seu navegador (Chrome, Firefox, Safari ou Edge). A
          recusa de cookies essenciais pode impactar o funcionamento de áreas
          restritas do site.
        </p>
        <p>
          Você também pode alterar ou revogar seu consentimento para cookies de
          análise e mensuração diretamente por aqui (LGPD, Art. 8º, § 5º):{" "}
          <CookiePreferencesButton className="text-gold-dark font-semibold underline underline-offset-2 hover:text-ink transition-colors cursor-pointer">
            Gerenciar preferências de cookies
          </CookiePreferencesButton>
          .
        </p>
      </div>

      {/* 8 */}
      <div>
        <LegalSectionHeading>8. Compartilhamento de Dados</LegalSectionHeading>
        <p className="mb-3">
          Os dados pessoais podem ser compartilhados com os seguintes
          prestadores de serviço, exclusivamente para as finalidades descritas
          nesta política:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Resend</strong> (envio de e-mails) —{" "}
            <a
              href="https://resend.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-dark underline underline-offset-2"
            >
              resend.com/privacy
            </a>
          </li>
          <li>
            <strong>PostHog</strong> (analytics) —{" "}
            <a
              href="https://posthog.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-dark underline underline-offset-2"
            >
              posthog.com/privacy
            </a>
          </li>
          <li>
            <strong>Google (Tag Manager / Google Ads)</strong> (mensuração de
            campanhas) —{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-dark underline underline-offset-2"
            >
              policies.google.com/privacy
            </a>
          </li>
          <li>
            <strong>Meta Platforms (Meta Pixel / API de Conversões)</strong>{" "}
            (mensuração de campanhas) —{" "}
            <a
              href="https://www.facebook.com/privacy/policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-dark underline underline-offset-2"
            >
              facebook.com/privacy/policy
            </a>
          </li>
          <li>
            <strong>Cloudflare</strong> (segurança e DNS) —{" "}
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-dark underline underline-offset-2"
            >
              cloudflare.com/privacypolicy
            </a>
          </li>
          <li>
            <strong>Vercel</strong> (hospedagem) —{" "}
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-dark underline underline-offset-2"
            >
              vercel.com/legal/privacy-policy
            </a>
          </li>
          <li>
            <strong>Supabase</strong> (banco de dados e armazenamento de
            arquivos) —{" "}
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-dark underline underline-offset-2"
            >
              supabase.com/privacy
            </a>
          </li>
          <li>
            <strong>Upstash Redis</strong> (proteção contra abuso, limitação de
            taxa e deduplicação) —{" "}
            <a
              href="https://upstash.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-dark underline underline-offset-2"
            >
              upstash.com/privacy
            </a>
          </li>
        </ul>
        <p className="mt-4 font-semibold">
          Nenhum dado pessoal é vendido ou alugado a terceiros.
        </p>
      </div>

      {/* 9 */}
      <div>
        <LegalSectionHeading>9. Segurança dos Dados</LegalSectionHeading>
        <p className="mb-3">
          Adotamos medidas técnicas e organizacionais para proteger os dados
          pessoais contra acessos não autorizados, perda ou tratamento
          inadequado, incluindo criptografia em trânsito (HTTPS/TLS), proteção
          WAF/DDoS via Cloudflare, controle de acesso por autenticação própria
          com sessões assinadas e hospedagem em infraestrutura certificada
          (Vercel).
        </p>
      </div>

      {/* 10 */}
      <div>
        <LegalSectionHeading>10. Alterações nesta Política</LegalSectionHeading>
        <p>
          Esta Política de Privacidade pode ser atualizada periodicamente para
          refletir mudanças nas nossas práticas ou em requisitos legais. A
          versão mais recente estará sempre disponível nesta página.
        </p>
      </div>

      {/* 11 */}
      <div>
        <LegalSectionHeading>11. Lei Aplicável e Foro</LegalSectionHeading>
        <p>
          Esta Política de Privacidade é regida pela Lei nº 13.709/2018 (LGPD) e
          demais normas brasileiras aplicáveis. Fica eleita a comarca de{" "}
          <strong>
            {SITE_CONFIG.address.city} - {SITE_CONFIG.address.state}
          </strong>{" "}
          como foro competente.
        </p>
      </div>

      {/* 12 */}
      <div>
        <LegalSectionHeading>
          12. Contato e Canal para Exercício de Direitos
        </LegalSectionHeading>
        <p className="mb-3">
          Para dúvidas, solicitações ou reclamações relacionadas ao tratamento
          de dados pessoais, contate o Encarregado de Dados (DPO) pelo e-mail{" "}
          <a
            href={`mailto:${SITE_CONFIG.contact.email}`}
            className="text-gold-dark font-semibold underline underline-offset-2"
          >
            {SITE_CONFIG.contact.email}
          </a>{" "}
          ou WhatsApp {SITE_CONFIG.contact.whatsappDisplay}.
        </p>
        <p>
          Caso não obtenha resposta satisfatória, você pode apresentar
          reclamação à Autoridade Nacional de Proteção de Dados (ANPD):{" "}
          <a
            href="https://www.gov.br/anpd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-dark underline underline-offset-2"
          >
            gov.br/anpd
          </a>
          .
        </p>
      </div>
    </LegalPageLayout>
  );
}
