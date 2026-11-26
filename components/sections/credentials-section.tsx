import { ShieldCheck, MapPin, Lock, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section-title";
import { SITE_CONFIG } from "@/lib/site-config";

const credentials = [
  {
    icon: ShieldCheck,
    title: SITE_CONFIG.oab,
    description: `Sociedade de advocacia regularmente registrada desde ${SITE_CONFIG.founded}.`,
  },
  {
    icon: MapPin,
    title: `${SITE_CONFIG.address.city}/${SITE_CONFIG.address.state} e Brasil`,
    description:
      "Atendimento presencial em nossa sede e atendimento digital estruturado para todo o país.",
  },
  {
    icon: Lock,
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
    <section className="py-20 lg:py-28 bg-cream-light relative overflow-hidden border-t border-forest-100">
      <Container>
        {/* Credentials Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {credentials.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 rounded-2xl bg-white border border-forest-100 p-6 shadow-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-gold">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-ink mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-forest-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <SectionTitle
          label="Como Funciona"
          title="Atendimento claro desde o primeiro passo"
          subtitle="Um processo objetivo para compreender sua demanda e orientar as medidas jurídicas adequadas."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative rounded-2xl bg-white border border-forest-100 p-7 lg:p-8 shadow-sm"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-champagne-300/30 font-mono text-sm font-bold text-gold-dark">
                  {step.number}
                </span>
                {index < steps.length - 1 && (
                  <ArrowRight
                    className="hidden md:block h-4 w-4 text-forest-300"
                    aria-hidden="true"
                  />
                )}
              </div>
              <h3 className="font-display text-xl font-bold text-ink mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-forest-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
