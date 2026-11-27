import Link from "next/link";
import { ArrowLeft, BookOpen, Briefcase, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/tracking/whatsapp-link";
import { SITE_CONFIG } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-ink to-forest-900 text-cream py-24 relative overflow-hidden">
      <div
        className="absolute top-1/4 right-1/4 w-80 h-80 bg-gold/10 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />
      <Container className="relative text-center max-w-2xl">
        <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.25em] text-gold mb-4">
          Erro 404
        </span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-cream leading-tight mb-6">
          Página não <span className="text-gold">encontrada</span>
        </h1>
        <p className="text-cream/75 text-lg leading-relaxed mb-10">
          O endereço que você procurou pode ter sido movido ou não existe mais.
          Continue navegando pelo site da {SITE_CONFIG.legalName} ou fale
          diretamente com nossa equipe.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "no-underline"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>
          <Link
            href="/areas-de-atuacao"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-cream/30 text-cream hover:bg-cream/10 hover:text-cream no-underline"
            )}
          >
            <Briefcase className="h-4 w-4" />
            Áreas de Atuação
          </Link>
          <Link
            href="/blog"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-cream/30 text-cream hover:bg-cream/10 hover:text-cream no-underline"
            )}
          >
            <BookOpen className="h-4 w-4" />
            Blog Jurídico
          </Link>
          <WhatsAppLink
            href={SITE_CONFIG.contact.whatsappWithText}
            page="/404"
            placement="not-found-cta"
            label="WhatsApp 404"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-gold/40 text-gold hover:bg-gold hover:text-ink no-underline"
            )}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </WhatsAppLink>
        </div>
      </Container>
    </section>
  );
}
