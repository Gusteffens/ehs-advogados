import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getAdminSession, isDevBootstrapActive } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

function resolveSafeAdminRedirect(raw: string | string[] | undefined): string {
  const candidate = Array.isArray(raw) ? raw[0] : raw;
  if (!candidate || typeof candidate !== "string") {
    return "/admin";
  }

  const trimmed = candidate.trim();
  if (
    trimmed.startsWith("/admin") &&
    !trimmed.startsWith("//") &&
    !trimmed.includes("://") &&
    !trimmed.includes("\\")
  ) {
    return trimmed;
  }

  return "/admin";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string | string[] }>;
}) {
  const [session, resolvedParams] = await Promise.all([
    getAdminSession(),
    searchParams,
  ]);

  const safeRedirect = resolveSafeAdminRedirect(resolvedParams.redirect_url);

  if (session.userId && session.isAdmin) {
    redirect(safeRedirect);
  }

  const showDevHint = isDevBootstrapActive();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-ink md:bg-cream-light">
      {/* Lado esquerdo — Identidade editorial do escritório */}
      <div className="hidden md:flex md:w-[46%] lg:w-[48%] flex-col justify-between bg-ink relative overflow-hidden p-12 lg:p-16 border-r border-forest-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(59,90,60,0.28),_transparent_60%),radial-gradient(ellipse_at_bottom_right,_rgba(232,212,154,0.12),_transparent_55%)] pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-cream/70 hover:text-gold transition-colors no-underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao site
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[11px] font-medium text-gold">
            <ShieldCheck className="h-3.5 w-3.5" />
            Ambiente Restrito
          </span>
        </div>

        <div className="relative z-10 flex flex-col items-start max-w-md my-auto py-12">
          <Image
            src="/images/logo-ehs-monogram.png"
            alt="Erlo, Haas & Steffens Advocacia"
            width={160}
            height={96}
            className="object-contain mb-8"
            priority
          />
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold/85 mb-3">
            Chancery Editorial Workspace
          </p>
          <h2 className="text-cream font-display text-3xl lg:text-4xl font-bold leading-[1.15] tracking-tight">
            Gestão editorial e{" "}
            <span className="text-gold">relacionamento do escritório</span>
          </h2>
          <p className="mt-5 text-cream/70 text-sm leading-relaxed">
            Acesso exclusivo para sócios e equipe autorizada da{" "}
            <strong className="text-cream/90 font-medium">
              Erlo, Haas & Steffens Sociedade de Advocacia
            </strong>
            . Gerencie publicações jurídicas, métricas de leitura e contatos
            recebidos em um só ambiente.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-forest-800/80 pt-6 text-xs text-cream/50">
          <span>Erlo, Haas & Steffens</span>
          <span>OAB/SC 8487</span>
        </div>
      </div>

      {/* Lado direito — Formulário Nativo Chancery Editorial */}
      <div className="flex-1 flex flex-col justify-center relative min-h-screen overflow-y-auto bg-ink md:bg-cream-light">
        <div className="md:hidden absolute top-6 left-6 z-10">
          <Link
            href="/"
            className="flex items-center gap-2 text-cream/75 hover:text-gold transition-colors text-sm font-medium no-underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </Link>
        </div>

        <div className="w-full max-w-[440px] mx-auto flex flex-col px-6 pt-20 pb-12 md:py-16">
          <div className="mb-8 text-center md:text-left">
            <div className="md:hidden flex justify-center mb-6">
              <Image
                src="/images/logo-ehs-monogram.png"
                alt="Erlo, Haas & Steffens Advocacia"
                width={132}
                height={80}
                className="object-contain drop-shadow-lg"
              />
            </div>
            <p className="hidden md:block text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dark mb-2">
              Erlo, Haas & Steffens
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-gold md:text-ink tracking-tight">
              Área Restrita
            </h1>
            <p className="text-cream/75 md:text-forest-600 mt-2 text-sm sm:text-base">
              Entre com seu e-mail e senha autorizados para acessar o painel.
            </p>
          </div>

          <div className="w-full rounded-2xl bg-cream p-6 shadow-2xl border border-forest-200/70 md:bg-white md:p-7 md:shadow-sm">
            <LoginForm
              redirectUrl={safeRedirect}
              showDevHint={showDevHint}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
