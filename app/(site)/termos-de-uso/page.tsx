import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: `Termos de uso do site ehsadvogados.com.br — ${SITE_CONFIG.legalName}.`,
  alternates: {
    canonical: "/termos-de-uso",
  },
};

export default function TermosDeUsoPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="pt-32 pb-28 sm:pb-36 lg:pt-40 lg:pb-40 bg-ink relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
        <Container className="relative">
          <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.25em] text-gold mb-4">
            Legal
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-cream leading-tight mb-4">
            Termos de Uso
          </h1>
          <p className="text-cream/70 max-w-xl">
            Vigência a partir de março de 2026. Leia atentamente antes de
            utilizar este site.
          </p>
        </Container>
        <div
          className="absolute inset-x-0 -bottom-px h-24 sm:h-32 pointer-events-none z-20 fade-to-cream"
          aria-hidden="true"
        />
      </section>

      {/* Content */}
      <section className="py-16 lg:py-20 bg-cream">
        <Container>
          <div className="max-w-3xl mx-auto space-y-12">
            {/* 1. Identificação */}
            <div>
              <h2 className="font-display text-2xl font-bold text-ink mb-1">
                1. Identificação
              </h2>
              <div className="h-0.5 w-12 bg-gold-dark mb-5 rounded-full" />
              <p className="text-ink leading-relaxed mb-3">
                O presente documento regula o uso do site{" "}
                <strong>ehsadvogados.com.br</strong>, mantido pela:
              </p>
              <div className="bg-white rounded-2xl border border-forest-100 p-6">
                <p className="text-ink font-semibold text-lg mb-1">
                  {SITE_CONFIG.legalName}
                </p>
                <p className="text-forest-600 text-sm">
                  CNPJ: {SITE_CONFIG.cnpj}
                </p>
                <p className="text-forest-600 text-sm">{SITE_CONFIG.oab}</p>
                <p className="text-forest-600 text-sm mt-2">
                  {SITE_CONFIG.address.street}, {SITE_CONFIG.address.building},{" "}
                  {SITE_CONFIG.address.neighborhood}
                  <br />
                  {SITE_CONFIG.address.city} - {SITE_CONFIG.address.state}
                </p>
                <p className="text-forest-600 text-sm mt-1">
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
              <h2 className="font-display text-2xl font-bold text-ink mb-1">
                2. Objeto
              </h2>
              <div className="h-0.5 w-12 bg-gold-dark mb-5 rounded-full" />
              <p className="text-ink leading-relaxed">
                Estes Termos de Uso estabelecem as condições para o acesso e a
                utilização do site <strong>ehsadvogados.com.br</strong> e de
                todos os serviços e conteúdos nele disponibilizados, incluindo o
                blog jurídico, as informações institucionais e os meios de
                contato do escritório.
              </p>
            </div>

            {/* 3. Isenção de Responsabilidade */}
            <div>
              <h2 className="font-display text-2xl font-bold text-ink mb-1">
                3. Isenção de Responsabilidade
              </h2>
              <div className="h-0.5 w-12 bg-gold-dark mb-5 rounded-full" />
              <p className="text-ink leading-relaxed mb-4">
                O conteúdo disponibilizado neste site, especialmente os artigos
                do blog jurídico, tem caráter{" "}
                <strong>estritamente informativo e educacional</strong>. Não
                constitui, em nenhuma hipótese, consultoria jurídica
                individualizada, opinião legal ou aconselhamento profissional.
              </p>
              <p className="text-ink leading-relaxed">
                A leitura de qualquer conteúdo deste site não estabelece relação
                advogado-cliente. Para obter orientação jurídica específica para
                seu caso, entre em contato diretamente com o escritório para
                agendamento de consulta.
              </p>
            </div>

            {/* 4. Propriedade Intelectual */}
            <div>
              <h2 className="font-display text-2xl font-bold text-ink mb-1">
                4. Propriedade Intelectual
              </h2>
              <div className="h-0.5 w-12 bg-gold-dark mb-5 rounded-full" />
              <p className="text-ink leading-relaxed">
                Todos os textos, artigos, imagens, logotipos, marcas, layout,
                design e demais elementos de conteúdo disponíveis neste site são
                de propriedade exclusiva da{" "}
                <strong>{SITE_CONFIG.legalName}</strong> ou de seus respectivos
                autores, e estão protegidos pela legislação brasileira de
                direitos autorais (Lei n.º 9.610/1998) e pela legislação de
                propriedade industrial.
              </p>
            </div>

            {/* 5. Limitação de Uso */}
            <div>
              <h2 className="font-display text-2xl font-bold text-ink mb-1">
                5. Limitação de Uso
              </h2>
              <div className="h-0.5 w-12 bg-gold-dark mb-5 rounded-full" />
              <p className="text-ink leading-relaxed mb-4">
                É expressamente vedado ao usuário:
              </p>
              <ul className="space-y-2 pl-4">
                {[
                  "Reproduzir, copiar ou redistribuir qualquer conteúdo deste site para fins comerciais sem autorização prévia e por escrito;",
                  "Utilizar os textos, artigos e materiais para alimentar ferramentas de inteligência artificial, scraping ou qualquer forma de extração em massa de dados;",
                  "Apresentar o conteúdo deste site como de sua própria autoria;",
                  "Utilizar o site para fins ilícitos ou que violem a legislação brasileira.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-ink">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gold-dark flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* 6. Comunicações */}
            <div>
              <h2 className="font-display text-2xl font-bold text-ink mb-1">
                6. Comunicações
              </h2>
              <div className="h-0.5 w-12 bg-gold-dark mb-5 rounded-full" />
              <p className="text-ink leading-relaxed">
                Para esclarecer dúvidas, solicitar a remoção de conteúdo ou
                exercer qualquer direito previsto nestes Termos, o usuário
                poderá entrar em contato pelo e-mail{" "}
                <a
                  href={`mailto:${SITE_CONFIG.contact.email}`}
                  className="text-gold-dark hover:underline font-medium"
                >
                  {SITE_CONFIG.contact.email}
                </a>{" "}
                ou pelo WhatsApp {SITE_CONFIG.contact.whatsappDisplay}. O prazo
                de resposta é de até 5 dias úteis.
              </p>
            </div>

            {/* 7. Privacidade */}
            <div>
              <h2 className="font-display text-2xl font-bold text-ink mb-1">
                7. Privacidade de Dados
              </h2>
              <div className="h-0.5 w-12 bg-gold-dark mb-5 rounded-full" />
              <p className="text-ink leading-relaxed">
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
              <h2 className="font-display text-2xl font-bold text-ink mb-1">
                8. Lei Aplicável e Foro
              </h2>
              <div className="h-0.5 w-12 bg-gold-dark mb-5 rounded-full" />
              <p className="text-ink leading-relaxed">
                Estes Termos de Uso são regidos e interpretados de acordo com a
                legislação brasileira. Fica eleito o foro da comarca de{" "}
                <strong>
                  {SITE_CONFIG.address.city} - {SITE_CONFIG.address.state}
                </strong>{" "}
                para dirimir quaisquer controvérsias decorrentes deste
                instrumento, com renúncia expressa a qualquer outro, por mais
                privilegiado que seja.
              </p>
            </div>

            {/* Vigência */}
            <div className="bg-forest-900 rounded-2xl p-6">
              <p className="text-cream/80 text-sm">
                Estes Termos de Uso entram em vigor em{" "}
                <strong className="text-gold">março de 2026</strong> e
                permanecem válidos até nova atualização, que será comunicada
                nesta mesma página.
              </p>
              <p className="text-cream/60 text-xs mt-3">
                Última atualização: março de 2026
              </p>
            </div>

            {/* Back link */}
            <div className="pt-4 border-t border-forest-600/20">
              <Link
                href="/"
                className="text-sm text-gold-dark hover:text-ink transition-colors"
              >
                ← Voltar à página inicial
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
