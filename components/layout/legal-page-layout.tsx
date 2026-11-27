import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  badge?: string;
  lastUpdated: string;
  effectiveNotice?: ReactNode;
  children: ReactNode;
}

export function LegalSectionHeading({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-ink mb-1.5">
        {children}
      </h2>
      <div className="h-0.5 w-12 bg-gold-dark rounded-full" aria-hidden="true" />
    </div>
  );
}

export function LegalPageLayout({
  title,
  subtitle,
  badge = "Legal",
  lastUpdated,
  effectiveNotice,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-cream">
      {/* Unified Chancery Editorial Hero */}
      <section className="pt-32 pb-24 sm:pb-32 lg:pt-40 lg:pb-36 bg-gradient-to-b from-ink to-forest-900 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-80 h-80 bg-gold/8 rounded-full blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
        <Container className="relative">
          <div className="max-w-3xl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gold hover:text-cream transition-colors mb-6 no-underline"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar ao início
            </Link>
            <span className="block font-body text-xs font-semibold uppercase tracking-[0.25em] text-gold/90 mb-3">
              {badge}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-cream leading-tight mb-4">
              {title}
            </h1>
            <p className="text-base sm:text-lg text-cream/75 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          </div>
        </Container>
        <div
          className="absolute inset-x-0 -bottom-px h-24 sm:h-28 pointer-events-none z-20 fade-to-cream"
          aria-hidden="true"
        />
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24 bg-cream">
        <Container>
          <div className="max-w-3xl mx-auto space-y-12 text-ink text-[0.95rem] sm:text-base leading-relaxed">
            {children}

            {/* Last updated / Vigência block */}
            <div className="bg-forest-900 rounded-2xl p-6 text-cream">
              {effectiveNotice ? (
                <div className="text-cream/85 text-sm leading-relaxed mb-3">
                  {effectiveNotice}
                </div>
              ) : null}
              <p className="text-cream/65 text-xs">
                Última atualização: {lastUpdated}
              </p>
            </div>

            {/* Back link styled with buttonVariants (zero nested <button> inside <a>) */}
            <div className="pt-4 border-t border-forest-600/20">
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "group no-underline"
                )}
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Voltar ao início
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
