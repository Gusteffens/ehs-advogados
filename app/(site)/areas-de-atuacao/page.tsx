import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Briefcase,
  FileText,
  Scale,
  ShieldCheck,
  Sprout,
  Leaf,
  ArrowRight,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SITE_CONFIG, type TeamMemberConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const pageTitle = "Áreas de Atuação";
const pageDescription =
  "Atuamos em Direito Civil, Direito Penal, Agronegócio, Direito Ambiental, Direito Militar e Direito Empresarial em São Miguel do Oeste - SC e todo o Brasil.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/areas-de-atuacao",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${SITE_CONFIG.url}/areas-de-atuacao`,
    siteName: "Erlo, Haas & Steffens Advocacia",
    title: `${pageTitle} | Erlo, Haas & Steffens`,
    description: pageDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Áreas de Atuação — Erlo, Haas & Steffens Advocacia",
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

const areaIcons: Record<string, LucideIcon> = {
  civil: FileText,
  penal: Scale,
  agrario: Sprout,
  ambiental: Leaf,
  militar: ShieldCheck,
  empresarial: Briefcase,
};

const specialtyMatchersByArea: Record<string, readonly string[]> = {
  civil: ["Direito Civil"],
  penal: ["Direito Criminal", "Direito Penal"],
  agrario: ["Direito do Agronegócio", "Direito Agrário"],
  ambiental: ["Direito Ambiental"],
  militar: ["Direito Militar"],
  empresarial: ["Direito Empresarial"],
};

function getSpecialistsForArea(areaId: string): TeamMemberConfig[] {
  const matchers = specialtyMatchersByArea[areaId] ?? [];
  return SITE_CONFIG.team.filter((member) =>
    member.specialties.some((spec) =>
      matchers.some((m) => spec.toLowerCase().includes(m.toLowerCase()))
    )
  );
}

export default function AreasPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-28 sm:pb-36 lg:pt-40 lg:pb-40 bg-gradient-to-b from-ink to-forest-900 relative overflow-hidden">
        <div
          className="absolute bottom-10 left-10 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
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
      <section className="py-14 lg:py-24 bg-cream">
        <Container>
          {/* Quick anchor pill navigation */}
          <nav
            aria-label="Navegação rápida por áreas de atuação"
            className="mb-14 lg:mb-20 pb-8 border-b border-forest-200/70"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest-600 mb-3.5">
              Ir diretamente para a área
            </p>
            <div className="flex flex-wrap gap-2.5">
              {SITE_CONFIG.practiceAreas.map((area) => {
                const Icon = areaIcons[area.id] ?? FileText;
                return (
                  <a
                    key={area.id}
                    href={`#${area.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white border border-forest-200/80 px-4 py-2 text-sm font-medium text-ink hover:border-gold-dark hover:bg-forest-900 hover:text-cream transition-colors no-underline"
                  >
                    <Icon className="h-3.5 w-3.5 text-gold-dark" aria-hidden="true" />
                    <span>{area.shortTitle}</span>
                  </a>
                );
              })}
            </div>
          </nav>

          <div className="space-y-20 lg:space-y-24">
            {SITE_CONFIG.practiceAreas.map((area, i) => {
              const Icon = areaIcons[area.id] ?? FileText;
              const isReversed = i % 2 !== 0;
              const specialists = getSpecialistsForArea(area.id);

              return (
                <div
                  key={area.id}
                  id={area.id}
                  className="scroll-mt-28 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start"
                >
                  {/* Info */}
                  <div className={cn(isReversed && "lg:order-2")}>
                    <div
                      className={cn(
                        "inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-cream mb-6 shadow-sm",
                        area.gradient
                      )}
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h2 className="font-display text-3xl font-bold text-ink mb-4">
                      {area.title}
                    </h2>
                    <p className="text-ink/90 leading-relaxed mb-6">
                      {area.description}
                    </p>

                    {/* Specialist lawyers for this area */}
                    <div className="mb-7 pt-5 border-t border-forest-200/70">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-forest-600 mb-3">
                        {specialists.length > 0
                          ? specialists.length === 1
                            ? "Especialista na área"
                            : "Especialistas na área"
                          : "Atuação integrada"}
                      </p>
                      {specialists.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {specialists.map((member) => (
                            <Link
                              key={member.slug}
                              href="/equipe"
                              className="inline-flex items-center gap-2.5 rounded-full bg-white border border-forest-100 pl-1.5 pr-3.5 py-1.5 hover:border-gold-dark/50 transition-colors no-underline"
                            >
                              <span className="relative h-7 w-7 rounded-full overflow-hidden bg-ink shrink-0">
                                <Image
                                  src={member.image}
                                  alt={member.name}
                                  fill
                                  sizes="28px"
                                  className="object-cover object-top"
                                />
                              </span>
                              <span className="text-xs font-semibold text-ink">
                                {member.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <Link
                          href="/equipe"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 hover:text-gold-dark transition-colors no-underline"
                        >
                          Equipe multidisciplinar {SITE_CONFIG.shortName}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/contato?assunto=${encodeURIComponent(area.id)}`}
                        className={cn(
                          buttonVariants({ variant: "primary" }),
                          "group no-underline"
                        )}
                      >
                        Consultar sobre {area.shortTitle}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                      {area.id === "penal" && (
                        <Link
                          href="/penal"
                          className={cn(
                            buttonVariants({ variant: "outline" }),
                            "group no-underline"
                          )}
                        >
                          Advocacia Criminal
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      )}
                      {area.id === "agrario" && (
                        <Link
                          href="/proagro"
                          className={cn(
                            buttonVariants({ variant: "outline" }),
                            "group no-underline"
                          )}
                        >
                          Revisão de Proagro
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                          <CheckCircle
                            className="h-5 w-5 text-gold-dark shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
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
          <Link
            href="/contato"
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "group no-underline"
            )}
          >
            Fale Conosco
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Container>
      </section>
    </>
  );
}
