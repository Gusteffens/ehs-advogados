import Link from "next/link";
import { ArrowLeft, BookOpen, Briefcase, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/tracking/whatsapp-link";
import { SITE_CONFIG } from "@/lib/site-config";

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-ink to-forest-900 text-cream py-24 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
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
          <Link href="/">
            <Button variant="secondary" size="lg">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao início
            </Button>
          </Link>
          <Link href="/areas-de-atuacao">
            <Button
              variant="outline"
              size="lg"
              className="border-cream/30 text-cream hover:bg-cream/10 hover:text-cream"
            >
              <Briefcase className="h-4 w-4" />
              Áreas de Atuação
            </Button>
          </Link>
          <Link href="/blog">
            <Button
              variant="outline"
              size="lg"
              className="border-cream/30 text-cream hover:bg-cream/10 hover:text-cream"
            >
              <BookOpen className="h-4 w-4" />
              Blog Jurídico
            </Button>
          </Link>
          <WhatsAppLink
            href={SITE_CONFIG.contact.whatsappWithText}
            page="/404"
            placement="not-found-cta"
            label="WhatsApp 404"
          >
            <Button
              variant="outline"
              size="lg"
              className="border-gold/40 text-gold hover:bg-gold hover:text-ink"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          </WhatsAppLink>
        </div>
      </Container>
    </section>
  );
}
