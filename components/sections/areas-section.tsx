"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Briefcase,
  Users,
  FileText,
  Scale,
  ShieldCheck,
  Leaf,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section-title";
import { SITE_CONFIG } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const areaVisuals: Record<
  string,
  { icon: LucideIcon; iconBg: string }
> = {
  empresarial: {
    icon: Briefcase,
    iconBg:
      "bg-forest-100 text-ink group-hover:bg-forest-600 group-hover:text-cream",
  },
  civil: {
    icon: FileText,
    iconBg:
      "bg-forest-100 text-forest-600 group-hover:bg-forest-600 group-hover:text-cream",
  },
  militar: {
    icon: ShieldCheck,
    iconBg:
      "bg-champagne-300/30 text-gold-dark group-hover:bg-gold group-hover:text-ink",
  },
  penal: {
    icon: Scale,
    iconBg:
      "bg-forest-100 text-ink group-hover:bg-forest-900 group-hover:text-gold",
  },
  agrario: {
    icon: Users,
    iconBg:
      "bg-champagne-300/30 text-gold-dark group-hover:bg-gold-dark group-hover:text-cream",
  },
  ambiental: {
    icon: Leaf,
    iconBg:
      "bg-forest-100 text-forest-600 group-hover:bg-forest-600 group-hover:text-cream",
  },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function AreasSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-24 lg:py-32 bg-cream relative overflow-hidden">
      {/* Decorative blobs (kept clear of section edges to avoid clipped seams) */}
      <div className="absolute top-1/3 -left-24 w-72 h-72 bg-forest-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 -right-24 w-96 h-96 bg-gold/12 rounded-full blur-3xl pointer-events-none" />

      <Container className="relative">
        <SectionTitle
          label="Áreas de Atuação"
          title="Experiência em diversas áreas de atuação do direito"
        />

        <motion.div
          variants={containerVariants}
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
        >
          {SITE_CONFIG.practiceAreas.map((area) => {
            const visual = areaVisuals[area.id] ?? areaVisuals.civil;
            const Icon = visual.icon;

            return (
              <motion.div key={area.id} variants={cardVariants}>
                <Link
                  href={area.href}
                  className={cn(
                    "group relative flex flex-col h-full p-7 rounded-2xl bg-white border border-forest-100",
                    "transition-all duration-400 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-forest-900/8 hover:border-forest-200",
                    "no-underline"
                  )}
                >
                  {/* Gradient accent on hover */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-400 group-hover:opacity-[0.03]",
                      area.gradient
                    )}
                  />

                  <div className="relative">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl mb-5 transition-all duration-300",
                        visual.iconBg
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="font-display text-xl font-bold text-ink mb-3 flex items-center gap-2">
                      {area.title}
                      <ArrowUpRight className="h-4 w-4 text-gold-dark opacity-0 -translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0" />
                    </h3>

                    <p className="text-forest-600 text-[0.925rem] leading-relaxed">
                      {area.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
