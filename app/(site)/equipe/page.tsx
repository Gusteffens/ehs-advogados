import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { TeamCard } from "@/components/equipe/TeamCard";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Nossa Equipe",
  description:
    "Conheça os advogados da Erlo, Haas & Steffens: especialistas em Direito Civil, Penal, Agronegócio e Ambiental.",
  alternates: {
    canonical: "/equipe",
  },
};

export default function EquipePage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-28 sm:pb-36 lg:pt-40 lg:pb-40 bg-gradient-to-b from-ink to-forest-900 relative overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
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

      {/* Team Grid */}
      <section className="py-20 lg:py-28 bg-cream">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {SITE_CONFIG.team.map((member) => (
              <TeamCard key={member.slug} member={member} />
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
          <Link href="/contato">
            <Button variant="secondary" size="lg" className="group">
              Agende uma Consulta
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </Container>
      </section>
    </>
  );
}
