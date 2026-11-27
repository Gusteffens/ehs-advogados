import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/tracking/whatsapp-link";
import { SITE_CONFIG } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function CtaSection() {
  return (
    <section className="py-24 lg:py-28 bg-forest-900 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gold/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-forest-600/10 rounded-full blur-[150px]" />
      </div>

      <Container className="relative text-center">
        <div>
          <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold mb-5">
            Entre em contato
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-cream mb-6 leading-tight">
            Precisa de assessoria
            <br />
            <span className="text-gold">jurídica especializada?</span>
          </h2>
          <p className="text-cream/80 text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-body">
            Agende uma consulta inicial. Nossa equipe está pronta para analisar
            seu caso e apresentar as melhores estratégias.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contato"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "group text-base no-underline"
              )}
            >
              Fale com um Advogado
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <WhatsAppLink
              href={SITE_CONFIG.contact.whatsappWithText}
              page="/"
              placement="cta-section"
              label="WhatsApp CTA Home"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-cream/30 text-cream hover:bg-cream/10 hover:text-cream text-base no-underline"
              )}
            >
              WhatsApp
            </WhatsAppLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
