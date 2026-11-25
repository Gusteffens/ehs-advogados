import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-ink flex flex-col relative overflow-hidden items-center justify-center">
      {/* Subtle radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-forest-600/20 via-ink to-ink pointer-events-none" />

      <Container className="relative z-10 text-center max-w-lg">
        <div className="flex justify-center mb-6 text-gold">
          <ShieldAlert className="w-20 h-20" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-cream mb-4">
          Acesso Restrito
        </h1>
        <p className="text-cream/75 text-lg mb-8">
          Desculpe, mas você não tem permissões de administrador para acessar o
          painel de controle do escritório.
        </p>

        <Link href="/">
          <Button variant="secondary" size="lg" className="group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Voltar ao site
          </Button>
        </Link>
      </Container>
    </div>
  );
}
