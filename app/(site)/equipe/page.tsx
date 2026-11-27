import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { TeamMemberCard } from "@/components/team/team-member-card";
import { SITE_CONFIG } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const pageTitle = "Nossa Equipe";
const pageDescription =
  "Conheça os advogados da Erlo, Haas & Steffens: especialistas em Direito Civil, Penal, Agronegócio e Ambiental em São Miguel do Oeste - SC.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/equipe",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${SITE_CONFIG.url}/equipe`,
    siteName: "Erlo, Haas & Steffens Advocacia",
    title: `${pageTitle} | Erlo, Haas & Steffens`,
    description: pageDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Equipe Erlo, Haas & Steffens Advocacia",
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

export default function EquipePage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-28 sm:pb-36 lg:pt-40 lg:pb-40 bg-gradient-to-b from-ink to-forest-900 relative overflow-hidden">
        <div
          className="absolute top-20 right-20 w-72 h-72 bg-gold/10 rounded-full blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
        <Container className="relative">
          <div className="max-w-3xl">
            <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold mb-4">
              Nossa Equipe
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-cream leading-tight mb-6">
              Profissionais
              <span className="text-gold"> dedicados</span>
            </h1>
            <p className="text-lg text-cream/75 leading-relaxed max-w-2xl">
              Uma equipe multidisciplinar, formada por profissionais
              qualificados e comprometidos com a excelência em cada caso.
            </p>
          </div>
        </Container>
        <div
          className="absolute inset-x-0 -bottom-px h-24 sm:h-32 pointer-events-none z-20 fade-to-cream"
          aria-hidden="true"
        />
      </section>

      {/* Balanced centered flex-wrap grid for 5 lawyers (row 1: 3, row 2: 2 centered) */}
      <section className="py-20 lg:py-28 bg-cream">
        <Container>
          <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
            {SITE_CONFIG.team.map((member) => (
              <div
                key={member.slug}
                className="w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1.334rem)]"
              >
                <TeamMemberCard member={member} variant="full" />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 bg-forest-900">
        <Container className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream mb-6">
            Converse com um de nossos advogados
          </h2>
          <p className="text-cream/75 text-lg max-w-xl mx-auto mb-8">
            Agende uma consulta para discutir seu caso com quem entende.
          </p>
          <Link
            href="/contato"
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "group no-underline"
            )}
          >
            Agende uma Consulta
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Container>
      </section>
    </>
  );
}
