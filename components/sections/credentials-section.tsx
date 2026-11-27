import { ShieldCheck, MapPin, Lock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section-title";
import { SITE_CONFIG } from "@/lib/site-config";

const credentials = [
  {
    icon: ShieldCheck,
    label: "Registro Oficial",
    title: SITE_CONFIG.oab,
    description: `Sociedade de advocacia regularmente registrada desde ${SITE_CONFIG.founded}.`,
  },
  {
    icon: MapPin,
    label: "Atuação Regional e Nacional",
    title: `${SITE_CONFIG.address.city}/${SITE_CONFIG.address.state} e Brasil`,
    description:
      "Atendimento presencial em nossa sede e atendimento digital estruturado para todo o país.",
  },
  {
    icon: Lock,
    label: "Compromisso Ético",
    title: "Sigilo Profissional",
    description:
      "Condução ética, reservada e individualizada desde o primeiro contato.",
  },
];

const steps = [
  {
    number: "01",
    title: "Primeiro contato",
    description:
      "Você relata brevemente a situação pelo WhatsApp ou formulário de contato, com total discrição.",
  },
  {
    number: "02",
    title: "Análise estratégica",
    description:
      "Avaliamos os fatos, os documentos disponíveis e os encaminhamentos jurídicos cabíveis ao caso.",
  },
  {
    number: "03",
    title: "Atuação dedicada",
    description:
      "Condução técnica e transparente em todas as etapas, com comunicação clara sobre o andamento.",
  },
];

export function CredentialsSection() {
  return (
    <section className="py-20 lg:py-28 bg-cream-light relative overflow-hidden border-t border-forest-200/70">
      <Container>
        {/* Editorial hairline-bordered authority strip */}
        <div className="border-y border-forest-200/80 mb-20 lg:mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-forest-200/80">
            {credentials.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 py-7 md:px-7 first:md:pl-0 last:md:pr-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold-dark/25 bg-forest-900 text-gold mt-0.5">
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-dark mb-1">
                    {item.label}
                  </p>
                  <h3 className="font-display text-xl font-bold text-ink mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-forest-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works — connected 01 -> 02 -> 03 editorial step rail */}
        <SectionTitle
          label="Como Funciona"
          title="Atendimento claro desde o primeiro passo"
          subtitle="Um processo objetivo para compreender sua demanda e orientar as medidas jurídicas adequadas."
        />

        <div className="relative">
          {/* Continuous horizontal hairline connector on desktop */}
          <div
            className="hidden md:block absolute top-6 left-[16.666%] right-[16.666%] h-px bg-gradient-to-r from-gold-dark/30 via-gold-dark/60 to-gold-dark/30"
            aria-hidden="true"
          />

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative">
            {steps.map((step) => (
              <li
                key={step.number}
                className="relative flex flex-col items-start md:items-center md:text-center"
              >
                <div className="relative z-10 flex items-center gap-3 mb-5">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-cream-light border border-gold-dark/50 font-mono text-sm font-bold text-forest-900 shadow-xs">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold text-ink mb-2.5">
                  {step.title}
                </h3>
                <p className="text-sm text-forest-600 leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
