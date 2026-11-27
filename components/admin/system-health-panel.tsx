"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Database,
  Info,
  Instagram,
  Loader2,
  Mail,
  RefreshCw,
  Server,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useToast } from "@/components/admin/toast-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HealthStatus = "ok" | "optional" | "warning" | "error";

interface HealthCheckItem {
  id: string;
  name: string;
  category: "database" | "cache" | "email" | "analytics" | "auth" | "social";
  status: HealthStatus;
  summary: string;
  details: string[];
  latencyMs?: number;
}

interface AdminHealthResponse {
  status: HealthStatus;
  checkedAt: string;
  checks: HealthCheckItem[];
  instagram: {
    configured: boolean;
    updatedAt: string | null;
    daysSinceUpdate: number | null;
    status: HealthStatus;
  };
}

const CATEGORY_ICONS: Record<
  HealthCheckItem["category"],
  React.ComponentType<{ className?: string }>
> = {
  database: Database,
  cache: Server,
  email: Mail,
  analytics: BarChart3,
  auth: ShieldCheck,
  social: Instagram,
};

function StatusBadge({ status }: { status: HealthStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        status === "ok" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
        status === "optional" && "bg-cream text-forest-700 border border-forest-200/80",
        status === "warning" && "bg-amber-50 text-amber-800 border border-amber-200",
        status === "error" && "bg-red-50 text-red-700 border border-red-200"
      )}
    >
      {status === "ok" && <CheckCircle2 className="h-3.5 w-3.5" />}
      {status === "optional" && <Info className="h-3.5 w-3.5" />}
      {status === "warning" && <AlertTriangle className="h-3.5 w-3.5" />}
      {status === "error" && <XCircle className="h-3.5 w-3.5" />}
      {status === "ok"
        ? "Operacional"
        : status === "optional"
          ? "Opcional"
          : status === "warning"
            ? "Atenção"
            : "Falha"}
    </span>
  );
}

const INSTAGRAM_REASON_LABELS: Record<string, string> = {
  refreshed: "Token do Instagram renovado com sucesso!",
  token_still_fresh:
    "O token ainda está dentro da validade de 30 dias — renovação não necessária.",
  token_not_configured:
    "Nenhum token real está configurado em instagram_config.",
  supabase_not_configured: "Supabase não está configurado no ambiente.",
  db_error: "Erro ao consultar a tabela instagram_config.",
  db_update_error: "Token renovado na Meta, mas falhou ao salvar no Supabase.",
  network_error: "Erro de rede ao contatar a Graph API do Instagram.",
};

export function SystemHealthPanel() {
  const { toast } = useToast();
  const [data, setData] = useState<AdminHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [refreshingIg, setRefreshingIg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHealth = useCallback(async (isManual = false) => {
    if (isManual) setRefreshingAll(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/health", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }
      const json = (await res.json()) as AdminHealthResponse;
      setData(json);
    } catch (err) {
      console.error("Failed to fetch admin health:", err);
      setError("Não foi possível verificar o status dos serviços.");
    } finally {
      setLoading(false);
      setRefreshingAll(false);
    }
  }, []);

  useEffect(() => {
    void loadHealth(false);
  }, [loadHealth]);

  const handleRefreshInstagram = async () => {
    setRefreshingIg(true);
    try {
      const res = await fetch("/api/admin/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refresh_instagram" }),
      });

      const json = (await res.json()) as {
        ok: boolean;
        result?: { refreshed: boolean; reason: string };
        error?: string;
      };

      if (!res.ok || !json.ok || !json.result) {
        toast.error(
          "Falha na renovação",
          json.error || "Não foi possível acionar a renovação do Instagram."
        );
        return;
      }

      const description =
        INSTAGRAM_REASON_LABELS[json.result.reason] ||
        `Retorno: ${json.result.reason}`;

      if (json.result.refreshed) {
        toast.success("Token renovado", description);
      } else {
        toast.info("Verificação concluída", description);
      }

      await loadHealth(true);
    } catch {
      toast.error(
        "Erro de rede",
        "Não foi possível contatar o endpoint de manutenção."
      );
    } finally {
      setRefreshingIg(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-24 rounded-2xl bg-white border border-forest-200/75 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-44 rounded-2xl bg-white border border-forest-200/75 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-semibold text-red-800 mb-3">
          {error || "Erro ao carregar diagnóstico."}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => loadHealth(true)}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Status Banner */}
      <div className="rounded-2xl bg-ink text-cream border border-forest-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
              data.status === "ok" &&
                "bg-emerald-500/15 border-emerald-400/30 text-emerald-300",
              data.status === "warning" &&
                "bg-gold/15 border-gold/30 text-gold",
              data.status === "error" &&
                "bg-red-500/15 border-red-400/30 text-red-300"
            )}
          >
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold/80">
              Diagnóstico em Tempo Real
            </p>
            <h2 className="font-display text-2xl font-bold text-cream mt-0.5">
              {data.status === "ok"
                ? "Todos os serviços operacionais"
                : data.status === "warning"
                  ? "Sistema operacional com avisos"
                  : "Atenção: há integrações com falha"}
            </h2>
            <p className="text-xs text-cream/65 mt-1">
              Última verificação:{" "}
              {new Date(data.checkedAt).toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
              })}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => loadHealth(true)}
          disabled={refreshingAll}
          className="shrink-0"
        >
          {refreshingAll ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Reverificar Tudo
        </Button>
      </div>

      {/* Checks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {data.checks.map((check) => {
          const Icon = CATEGORY_ICONS[check.category];
          const isInstagram = check.id === "instagram";

          return (
            <div
              key={check.id}
              className="rounded-2xl bg-white border border-forest-200/80 p-5 shadow-xs flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream border border-forest-200/60 text-ink">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-bold text-ink truncate">
                        {check.name}
                      </h3>
                      {typeof check.latencyMs === "number" && (
                        <p className="text-[11px] text-forest-500">
                          Latência: {check.latencyMs}ms
                        </p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={check.status} />
                </div>

                <p className="text-sm text-ink/90 font-medium mb-3">
                  {check.summary}
                </p>

                <ul className="space-y-1.5 border-t border-forest-100 pt-3">
                  {check.details.map((detail, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-forest-600 flex items-start gap-2"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold-dark" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {isInstagram && (
                <div className="pt-2 border-t border-forest-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-forest-500">
                    {data.instagram.configured
                      ? "Renovação segura via Graph API"
                      : "Aguardando token em instagram_config"}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshInstagram}
                    disabled={refreshingIg || !data.instagram.configured}
                    className="h-8 px-3 text-xs"
                  >
                    {refreshingIg ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    Renovar Token
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
