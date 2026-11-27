"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  redirectUrl?: string;
  showDevHint?: boolean;
}

export function LoginForm({
  redirectUrl = "/admin",
  showDevHint = false,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDevQuickFill = () => {
    setEmail("admin@ehsadvogados.com.br");
    setPassword("admin123");
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          rememberMe,
          redirectUrl,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        redirectTo?: string;
        error?: string;
      } | null;

      if (!response.ok || !data?.ok) {
        setError(
          data?.error || "Não foi possível entrar. Verifique suas credenciais."
        );
        setIsSubmitting(false);
        return;
      }

      window.location.assign(data.redirectTo || "/admin");
    } catch {
      setError("Erro de conexão ao autenticar. Tente novamente.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold uppercase tracking-[0.14em] text-forest-700"
          >
            E-mail
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-500" />
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isSubmitting}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="socio@ehsadvogados.com.br"
              className="w-full rounded-xl border border-forest-200 bg-cream-light pl-10 pr-4 py-3 text-sm text-ink placeholder:text-forest-400 transition-colors focus:border-gold-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne-400/30 disabled:opacity-60"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="login-password"
            className="block text-xs font-semibold uppercase tracking-[0.14em] text-forest-700"
          >
            Senha
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-500" />
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              disabled={isSubmitting}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="w-full rounded-xl border border-forest-200 bg-cream-light pl-10 pr-11 py-3 text-sm text-ink placeholder:text-forest-400 transition-colors focus:border-gold-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne-400/30 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-forest-500 hover:bg-cream hover:text-ink transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            disabled={isSubmitting}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-forest-300 text-ink accent-ink focus:ring-2 focus:ring-champagne-500/40"
          />
          <span className="text-xs font-medium text-forest-700">
            Manter conectado por 30 dias
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-gold shadow-sm transition-all duration-200 hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne-500 focus-visible:ring-offset-2 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              Acessar Painel
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {showDevHint && (
        <div className="rounded-xl border border-champagne-300/80 bg-champagne-50/90 p-3.5 text-xs text-ink">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 font-semibold text-gold-dark uppercase tracking-[0.12em] text-[10px]">
              <Sparkles className="h-3.5 w-3.5" />
              Acesso rápido (ambiente local)
            </span>
          </div>
          <p className="text-forest-700 leading-relaxed mb-2.5">
            E-mail:{" "}
            <code className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-[11px] text-ink border border-champagne-200">
              admin@ehsadvogados.com.br
            </code>
            <br />
            Senha:{" "}
            <code className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-[11px] text-ink border border-champagne-200">
              admin123
            </code>
          </p>
          <button
            type="button"
            onClick={handleDevQuickFill}
            className="inline-flex items-center gap-1.5 rounded-lg border border-champagne-400/70 bg-white px-3 py-1.5 text-[11px] font-semibold text-ink hover:bg-champagne-100 transition-colors"
          >
            Preencher credenciais de dev
          </button>
        </div>
      )}
    </div>
  );
}

interface LogoutActionButtonProps {
  label?: string;
  className?: string;
}

export function LogoutActionButton({
  label = "Sair / Trocar de conta",
  className,
}: LogoutActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Redirect even if network fails
    } finally {
      window.location.assign("/sign-in");
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="md"
      disabled={isLoading}
      onClick={handleLogout}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      {isLoading ? "Saindo..." : label}
    </Button>
  );
}
