import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, ShieldAlert } from "lucide-react";
import { getAdminSession } from "@/lib/auth";
import { LogoutActionButton } from "@/components/admin/login-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function UnauthorizedPage() {
  const session = await getAdminSession();

  return (
    <div className="min-h-screen bg-ink flex flex-col relative overflow-hidden items-center justify-center px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,90,60,0.24),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(232,212,154,0.1),_transparent_60%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-forest-800 bg-primary/50 backdrop-blur-sm p-8 sm:p-10 text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logo-ehs-monogram.png"
            alt="Erlo, Haas & Steffens Advocacia"
            width={96}
            height={58}
            className="object-contain opacity-90"
          />
        </div>

        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream mb-3">
          Acesso Restrito
        </h1>

        <p className="text-cream/75 text-sm sm:text-base leading-relaxed mb-6">
          Sua conta autenticada não possui permissão de administrador para
          acessar o painel interno da{" "}
          <span className="text-cream font-medium">
            Erlo, Haas & Steffens
          </span>
          .
        </p>

        {session.email && (
          <div className="mb-7 inline-flex items-center gap-2 rounded-xl border border-forest-700 bg-ink/70 px-4 py-2.5 text-xs text-cream/85">
            <Mail className="h-3.5 w-3.5 text-gold shrink-0" />
            <span>
              Conectado como{" "}
              <strong className="font-semibold text-cream">
                {session.email}
              </strong>
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {session.userId ? (
            <LogoutActionButton className="w-full sm:w-auto" />
          ) : (
            <Link href="/sign-in" className="w-full sm:w-auto">
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="w-full sm:w-auto"
              >
                Entrar com outra conta
              </Button>
            </Link>
          )}

          <Link href="/" className="w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="w-full sm:w-auto border-forest-600 text-cream hover:bg-forest-700 hover:text-cream"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao site
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
