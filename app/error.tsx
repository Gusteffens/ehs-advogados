"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/tracking/whatsapp-link";
import { SITE_CONFIG } from "@/lib/site-config";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary:", error);
  }, [error]);

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-ink to-forest-900 text-cream py-24 relative overflow-hidden">
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <Container className="relative text-center max-w-2xl">
        <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.25em] text-gold mb-4">
          Algo deu errado
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-cream leading-tight mb-6">
          Ocorreu um erro <span className="text-gold">inesperado</span>
        </h1>
        <p className="text-cream/75 text-lg leading-relaxed mb-10">
          Não foi possível carregar esta página no momento. Você pode tentar
          novamente ou falar diretamente com nossa equipe pelo WhatsApp.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="secondary" size="lg" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Tentar novamente
          </Button>
          <Link href="/">
            <Button
              variant="outline"
              size="lg"
              className="border-cream/30 text-cream hover:bg-cream/10 hover:text-cream"
            >
              <Home className="h-4 w-4" />
              Voltar ao início
            </Button>
          </Link>
          <WhatsAppLink
            href={SITE_CONFIG.contact.whatsappWithText}
            page="/error"
            placement="error-cta"
            label="WhatsApp Error"
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
