import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
 title: "Política de Privacidade",
 description:
 "Política de Privacidade do escritório Erlo, Haas & Steffens Advocacia, em conformidade com a Lei Geral de Proteção de Dados (LGPD).",
};

const sections = [
  {
    title: "1. Identificação do Controlador",
    content: `O controlador dos dados pessoais coletados por este site é:

**Erlo, Haas & Steffens Sociedade de Advocacia**
CNPJ: 48.624.064/0001-90
OAB/SC: 8487
Endereço: Rua Itaberaba, 930, Sala 304, Ed. Fransozi, Centro, São Miguel do Oeste - SC, CEP 89900-000
E-mail do Encarregado de Dados (DPO): ehs.escritorio@gmail.com
WhatsApp: (49) 98400-1053
Site: https://www.ehsadvogados.com.br`,
  },
  {
    title: "2. Dados Pessoais Coletados",
    content: `Coletamos os seguintes dados pessoais, conforme a finalidade:

**Formulário de Contato:**
• Nome completo
• Endereço de e-mail
• Número de telefone
• Mensagem (conteúdo livre)

**Dados de Navegação (Analytics — PostHog):**
• Páginas visitadas e cliques
• Tipo de dispositivo, navegador e sistema operacional
• País e região (sem geolocalização precisa)
• Identificadores anonimizados (sem coleta de IP completo)

**Cookies de Sessão (Autenticação — Clerk):**
• Token de sessão para autenticação interna do painel administrativo dos advogados
• Dados de perfil associados à conta autenticada (nome, e-mail)

**Cookies Técnicos (Cloudflare):**
• Identificadores de segurança e proteção contra ataques, sem finalidade publicitária`,
  },
  {
    title: "3. Finalidade do Tratamento",
    content: `Utilizamos os dados coletados para as seguintes finalidades:

• **Atendimento ao cliente:** responder mensagens enviadas pelo formulário de contato e dar andamento a consultas jurídicas.
• **Envio de e-mails:** encaminhar a mensagem do formulário ao escritório por meio do serviço Resend.
• **Melhoria do site:** analisar padrões de navegação anonimizados para aprimorar a experiência do usuário (PostHog).
• **Autenticação:** garantir o acesso seguro ao painel administrativo do escritório (Clerk).
• **Segurança e disponibilidade:** proteção contra acessos maliciosos e garantia de desempenho (Cloudflare).`,
  },
  {
    title: "4. Base Legal para o Tratamento",
    content: `O tratamento dos dados pessoais é realizado com base nas seguintes hipóteses legais previstas na LGPD (Lei 13.709/2018):

• **Formulário de contato** — Legítimo interesse (Art. 7°, IX): o titular envia voluntariamente seus dados para obter atendimento jurídico.
• **Analytics (PostHog)** — Legítimo interesse (Art. 7°, IX): coleta anonimizada para melhoria contínua do site, sem identificação do visitante.
• **Cookies de sessão (Clerk)** — Execução de contrato ou procedimentos preliminares (Art. 7°, V): necessário para autenticação segura dos advogados no painel administrativo.
• **Cookies técnicos (Cloudflare)** — Legítimo interesse (Art. 7°, IX): proteção da infraestrutura e dos usuários do site.`,
  },
  {
    title: "5. Prazo de Retenção dos Dados",
    content: `Os dados pessoais são mantidos pelo tempo necessário para cumprir a finalidade para a qual foram coletados:

• **Dados de contato (formulário):** armazenados por até 5 (cinco) anos, salvo obrigação legal que exija prazo maior.
• **Dados de navegação (PostHog):** retidos por até 13 (treze) meses em formato anonimizado.
• **Cookies de sessão (Clerk):** mantidos pelo tempo de duração da sessão autenticada; expiram automaticamente ao término da sessão.

Após o decurso dos prazos, os dados são eliminados de forma segura ou anonimizados irreversivelmente.`,
  },
  {
    title: "6. Direitos do Titular",
    content: `Em conformidade com o art. 18 da LGPD, você tem os seguintes direitos:

• **Acesso:** solicitar uma cópia dos dados pessoais que mantemos sobre você.
• **Correção:** solicitar a retificação de dados incompletos, inexatos ou desatualizados.
• **Exclusão:** solicitar a eliminação dos dados tratados com base no consentimento ou legítimo interesse.
• **Portabilidade:** solicitar a transferência dos seus dados a outro fornecedor de serviço.
• **Revogação do consentimento:** retirar o consentimento a qualquer momento, sem prejuízo da licitude do tratamento realizado anteriormente.
• **Informação:** ser informado sobre as entidades com as quais seus dados foram compartilhados.
• **Oposição:** opor-se ao tratamento realizado em descumprimento à LGPD.

Para exercer qualquer destes direitos, entre em contato pelo e-mail: **ehs.escritorio@gmail.com**`,
  },
  {
    title: "7. Uso de Cookies",
    content: `Este site utiliza cookies estritamente necessários e cookies de analytics:

**Cookies Essenciais:**
• Cookies de sessão (Clerk) para autenticação do painel administrativo. Necessários para o funcionamento de áreas restritas e não podem ser desativados.
• Cookies técnicos do Cloudflare para segurança e proteção do tráfego.

**Cookies de Analytics:**
• PostHog utiliza cookies para coletar dados de navegação anonimizados, ajudando-nos a entender como os visitantes interagem com o site.

**Como recusar cookies:**
Você pode configurar seu navegador para bloquear ou alertar sobre cookies:
• Chrome: Configurações → Privacidade e segurança → Cookies
• Firefox: Configurações → Privacidade e Segurança
• Safari: Preferências → Privacidade
• Edge: Configurações → Cookies e permissões do site

A recusa de cookies essenciais pode impactar o funcionamento de áreas restritas do site.`,
  },
  {
    title: "8. Compartilhamento de Dados",
    content: `Os dados pessoais podem ser compartilhados com os seguintes prestadores de serviço, exclusivamente para as finalidades descritas nesta política:

• **Resend** (envio de e-mails): encaminhamento das mensagens do formulário de contato — [resend.com/privacy](https://resend.com/privacy)
• **PostHog** (analytics): dados de navegação anonimizados — [posthog.com/privacy](https://posthog.com/privacy)
• **Clerk** (autenticação): processamento de dados de login dos advogados — [clerk.com/privacy](https://clerk.com/privacy)
• **Cloudflare** (segurança e DNS): proteção e disponibilidade do site — [cloudflare.com/privacypolicy](https://www.cloudflare.com/privacypolicy/)
• **Vercel** (hospedagem): infraestrutura de hospedagem — [vercel.com/legal/privacy-policy](https://vercel.com/legal/privacy-policy)

**Nenhum dado pessoal é vendido, alugado ou compartilhado com terceiros para fins comerciais ou publicitários.**`,
  },
  {
    title: "9. Segurança dos Dados",
    content: `Adotamos medidas técnicas e organizacionais para proteger os dados pessoais contra acessos não autorizados, perda, alteração ou tratamento inadequado, incluindo:

• Criptografia de dados em trânsito (HTTPS/TLS)
• Proteção de rede via Cloudflare (WAF, DDoS protection)
• Controle de acesso por autenticação segura (Clerk)
• Monitoramento de acessos ao painel administrativo
• Hospedagem em infraestrutura com certificações de segurança (Vercel)`,
  },
  {
    title: "10. Alterações nesta Política",
    content: `Esta Política de Privacidade pode ser atualizada periodicamente para refletir mudanças nas nossas práticas ou em requisitos legais. A versão mais recente estará sempre disponível nesta página, com a data da última atualização indicada abaixo.

Recomendamos que você revise esta página periodicamente para se manter informado.`,
  },
  {
    title: "11. Lei Aplicável e Foro",
    content: `Esta Política de Privacidade é regida pela Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD) e demais normas brasileiras aplicáveis.

Fica eleita a comarca de São Miguel do Oeste - SC como foro competente para dirimir quaisquer controvérsias decorrentes desta política, com renúncia expressa a qualquer outro, por mais privilegiado que seja.`,
  },
  {
    title: "12. Contato e Canal para Exercício de Direitos",
    content: `Para dúvidas, solicitações ou reclamações relacionadas ao tratamento de dados pessoais, entre em contato:

**Encarregado de Dados (DPO):**
E-mail: ehs.escritorio@gmail.com
WhatsApp: (49) 98400-1053

Caso não obtenha resposta satisfatória, você pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD):
[gov.br/anpd](https://www.gov.br/anpd)`,
  },
];

export default function PoliticaDePrivacidadePage() {
 return (
 <>
 {/* Hero */}
 <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 bg-gradient-to-b from-[#0D1812] to-[#1B2D1E] relative overflow-hidden">
 <Container className="relative">
 <div className="max-w-3xl">
 <Link
 href="/"
 className="inline-flex items-center gap-2 text-sm text-[#E8D49A] hover:text-[#EEEDE5] transition-colors mb-6 no-underline"
 >
 <ArrowLeft className="h-4 w-4" />
 Voltar ao início
 </Link>
 <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#EEEDE5] leading-tight mb-4">
 Política de Privacidade
 </h1>
 <p className="text-lg text-[#EEEDE5]/70 leading-relaxed max-w-2xl">
 Em conformidade com a Lei Geral de Proteção de Dados Pessoais
 (LGPD — Lei nº 13.709/2018).
 </p>
 </div>
 </Container>
 <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-[1] hidden md:block" style={{ height: '60px', background: 'linear-gradient(to bottom, transparent, #F5F0E8)' }} />
 </section>

 {/* Content */}
 <section className="py-16 lg:py-24" style={{ backgroundColor: '#F5F0E8' }}>
 <Container>
 <div className="max-w-3xl mx-auto">
 {sections.map((section) => (
 <div key={section.title} className="mb-12 last:mb-0">
 <h2
 className="font-display text-xl sm:text-2xl font-bold mb-4"
 style={{ color: '#C9B06A' }}
 >
 {section.title}
 </h2>
 <div
 className="prose-privacy text-[0.95rem] sm:text-base leading-relaxed whitespace-pre-line"
 style={{ color: '#0D2318' }}
 dangerouslySetInnerHTML={{
 __html: section.content
 .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
 .replace(
 /\[(.*?)\]\((.*?)\)/g,
 '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2" style="color: #B39540">$1</a>'
 ),
 }}
 />
 </div>
 ))}

 {/* Last updated */}
 <div className="mt-16 pt-8 border-t" style={{ borderColor: '#C9B06A33' }}>
 <p className="text-sm" style={{ color: '#0D231880' }}>
 Última atualização: Março de 2026
 </p>
 </div>

 {/* Back button */}
 <div className="mt-8">
 <Link href="/">
 <Button variant="outline" className="group">
 <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
 Voltar ao início
 </Button>
 </Link>
 </div>
 </div>
 </Container>
 </section>
 </>
 );
}
