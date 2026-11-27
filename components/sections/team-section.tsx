import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section-title";
import { buttonVariants } from "@/components/ui/button";
import { TeamMemberCard } from "@/components/team/team-member-card";
import { SITE_CONFIG } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function TeamSection() {
  return (
    <section className="py-24 lg:py-32 bg-ink relative overflow-hidden">
      {/* Subtle architectural hairlines & atmospheric depth */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute top-20 right-10 w-64 h-64 bg-gold/5 rounded-full blur-[100px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-20 left-10 w-80 h-80 bg-forest-600/10 rounded-full blur-[100px] pointer-events-none"
        aria-hidden="true"
      />

      <Container className="relative">
        <SectionTitle
          label="Nossa Equipe"
          title="Profissionais dedicados ao seu caso"
          subtitle="Uma equipe multidisciplinar pronta para conduzir cada demanda com rigor técnico, ética e atendimento direto."
          light
        />

        {/* Balanced centered flex-wrap grid for 5 lawyers (3 + 2 centered) */}
        <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
          {SITE_CONFIG.team.map((member) => (
            <div
              key={member.slug}
              className="w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1.334rem)]"
            >
              <TeamMemberCard member={member} variant="home" />
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/equipe"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "group border-gold/35 text-gold hover:bg-gold hover:text-ink hover:border-gold no-underline"
            )}
          >
            Conheça a equipe completa
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
