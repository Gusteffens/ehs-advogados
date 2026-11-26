import type { Metadata } from "next";
import Link from "next/link";
import {
  Briefcase,
  FileText,
  Scale,
  ShieldCheck,
  Users,
  Leaf,
  ArrowRight,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SITE_CONFIG } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Áreas de Atuação",
  description:
    "Atuamos em Direito Civil, Direito Penal, Agronegócio, Direito Ambiental, Direito Militar e Direito Empresarial.",
  alternates: {
    canonical: "/areas-de-atuacao",
  },
};

const areaIcons: Record<string, LucideIcon> = {
  civil: FileText,
  penal: Scale,
  agrario: Users,
  ambiental: Leaf,
  militar: ShieldCheck,
  empresarial: Briefcase,
};

export default function AreasPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-28 sm:pb-36 lg:pt-40 lg:pb-40 bg-gradient-to-b from-ink to-forest-900 relative overflow-hidden">
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
        <Container className="relative">
          <div className="max-w-3xl">
            <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold mb-4">
              Áreas de Atuação
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-cream leading-tight mb-6">
              Soluções jurídicas
              <span className="text-gold"> especializadas</span>
            </h1>
            <p className="text-lg text-cream/75 leading-relaxed max-w-2xl">
              Atuação multidisciplinar em diversas áreas do Direito, com equipe
              dedicada a cada segmento e foco em excelência técnica e
              atendimento qualificado.
            </p>
          </div>
        </Container>
        <div
          className="absolute inset-x-0 -bottom-px h-24 sm:h-32 pointer-events-none z-20 fade-to-cream"
          aria-hidden="true"
        />
      </section>

      {/* Areas Detail */}
      <section className="py-20 lg:py-28 bg-cream">
        <Container>
          <div className="space-y-20">
            {SITE_CONFIG.practiceAreas.map((area, i) => {
              const Icon = areaIcons[area.id] ?? FileText;
              const isReversed = i % 2 !== 0;

              return (
                <div
                  key={area.id}
                  id={area.id}
                  className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start"
                >
                  {/* Info */}
                  <div className={cn(isReversed && "lg:order-2")}>
                    <div
                      className={cn(
                        "inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-cream mb-6",
                        area.gradient
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="font-display text-3xl font-bold text-ink mb-4">
                      {area.title}
                    </h2>
                    <p className="text-ink leading-relaxed mb-8">
                      {area.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/contato?assunto=${encodeURIComponent(area.id)}`}
                      >
                        <Button variant="primary" className="group">
                          Consultar sobre {area.shortTitle}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                      {area.id === "penal" && (
                        <Link href="/penal">
                          <Button variant="outline" className="group">
                            Advocacia Criminal
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </Link>
                      )}
                      {area.id === "agrario" && (
                        <Link href="/proagro">
                          <Button variant="outline" className="group">
                            Revisão de Proagro
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Services list */}
                  <div
                    className={cn(
                      "bg-white rounded-2xl border border-forest-100 p-7 lg:p-8 shadow-sm",
                      isReversed && "lg:order-1"
                    )}
                  >
                    <h3 className="font-display text-lg font-bold text-ink mb-5 flex items-center gap-2">
                      <Badge variant="accent" size="sm">
                        Serviços
                      </Badge>
                    </h3>
                    <ul className="space-y-3.5">
                      {area.services.map((service) => (
                        <li key={service} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-gold-dark shrink-0 mt-0.5" />
                          <span className="text-ink text-[0.925rem] leading-relaxed">
                            {service}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 bg-forest-900">
        <Container className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream mb-6">
            Precisa de orientação jurídica?
          </h2>
          <p className="text-cream/85 text-lg max-w-xl mx-auto mb-8">
            Entre em contato para uma consulta inicial. Estamos prontos para
            ajudar.
          </p>
          <Link href="/contato">
            <Button variant="secondary" size="lg" className="group">
              Fale Conosco
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </Container>
      </section>
    </>
  );
}
