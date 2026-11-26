import Image from "next/image";
import { Mail } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section-title";
import { SITE_CONFIG } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function TeamSection() {
  return (
    <section className="py-24 lg:py-32 bg-forest-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute top-20 right-10 w-64 h-64 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-forest-600/10 rounded-full blur-[100px] pointer-events-none" />

      <Container className="relative">
        <SectionTitle
          label="Nossa Equipe"
          title="Profissionais dedicados ao seu caso"
          subtitle="Uma equipe pronta para oferecer as soluções jurídicas mais adequadas para o seu caso."
          light
        />

        {/* Single responsive flex-wrap layout — pure Server Component */}
        <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
          {SITE_CONFIG.team.map((member) => (
            <article
              key={member.slug}
              className="group w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1.334rem)]"
            >
              <div
                className={cn(
                  "relative rounded-2xl overflow-hidden h-full flex flex-col",
                  "bg-forest-800/90 border border-forest-600/40",
                  "transition-all duration-300",
                  "hover:border-gold/40 hover:shadow-2xl hover:shadow-champagne-500/10",
                  "hover:-translate-y-2"
                )}
              >
                {/* Top gradient bar */}
                <div
                  className={cn(
                    "h-1.5 flex-none bg-gradient-to-r absolute top-0 z-10 left-0 right-0",
                    member.gradient
                  )}
                />

                {/* Avatar / Image */}
                <div className="relative w-full aspect-[3/4] flex-none overflow-hidden bg-ink mb-0">
                  <Image
                    src={member.image}
                    alt={`${member.name} - ${member.role} especialista em ${member.specialties.join(", ")}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover w-full h-full object-top transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-900 via-forest-900/60 to-transparent opacity-100 transition-opacity duration-500 group-hover:opacity-90" />

                  <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 flex flex-col justify-end">
                    <h3 className="font-display text-xl font-bold text-cream leading-tight drop-shadow-md">
                      {member.name}
                    </h3>
                    <p className="text-gold text-sm font-semibold mt-0.5 drop-shadow-md">
                      {member.role}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-5 bg-forest-800/90 flex-1 flex flex-col justify-between">
                  <div>
                    {/* OAB */}
                    <p className="text-xs text-cream/75 font-mono tracking-wider mb-4">
                      {member.oab}
                    </p>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2 mb-6 min-h-[80px] content-start">
                      {member.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gold text-ink"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex gap-2 pt-4 border-t border-forest-600/40 mt-auto">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-cream/75 hover:text-gold hover:bg-gold/10 transition-all"
                      aria-label={`E-mail de ${member.name}`}
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
