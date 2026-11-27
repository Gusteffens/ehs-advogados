import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { isDevBootstrapActive, requireAdminApi } from "@/lib/auth";
import { isSessionSecretConfigured } from "@/lib/auth-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { refreshInstagramTokenIfNeeded } from "@/lib/instagram";

export const dynamic = "force-dynamic";

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

export async function GET() {
  const guard = await requireAdminApi();
  if (!guard.ok) {
    return guard.response;
  }

  const checks: HealthCheckItem[] = [];

  // 1. Supabase DB & Tables
  let adminUsersReady = false;
  let adminUsersCount = 0;
  let instagramMeta: AdminHealthResponse["instagram"] = {
    configured: false,
    updatedAt: null,
    daysSinceUpdate: null,
    status: "warning",
  };

  const supabaseStart = Date.now();
  try {
    const supabase = createAdminClient();
    const [postsRes, leadsRes, analyticsRes, igRes, adminUsersRes] = await Promise.all([
      supabase.from("posts").select("id", { count: "exact", head: true }),
      supabase
        .from("contact_leads")
        .select("id", { count: "exact", head: true }),
      supabase
        // Cast table name safely in case migration 003 hasn't been applied yet
        .from("article_analytics_daily" as never)
        .select("post_id", { count: "exact", head: true }),
      supabase
        .from("instagram_config")
        .select("access_token, updated_at")
        .eq("id", 1)
        .maybeSingle(),
      supabase
        .from("admin_users")
        .select("id", { count: "exact", head: true }),
    ]);

    adminUsersReady = !adminUsersRes.error;
    adminUsersCount = adminUsersRes.count ?? 0;

    const latencyMs = Date.now() - supabaseStart;
    const coreOk = !postsRes.error && !leadsRes.error;
    const analyticsReady = !analyticsRes.error;

    checks.push({
      id: "supabase",
      name: "Supabase PostgreSQL",
      category: "database",
      status: !coreOk ? "error" : analyticsReady ? "ok" : "warning",
      summary: !coreOk
        ? "Falha ao consultar tabelas principais"
        : analyticsReady
          ? "Conexão saudável e todas as tabelas ativas"
          : "Tabelas principais ativas; migration de analytics pendente",
      details: [
        `posts: ${postsRes.error ? "erro" : `${postsRes.count ?? 0} registros`}`,
        `contact_leads: ${leadsRes.error ? "erro" : `${leadsRes.count ?? 0} registros`}`,
        `article_analytics_daily: ${analyticsReady ? `${analyticsRes.count ?? 0} rollups` : "tabela ausente (aplicar 003_article_analytics.sql)"}`,
      ],
      latencyMs,
    });

    // Instagram token freshness
    if (igRes.error) {
      instagramMeta = {
        configured: false,
        updatedAt: null,
        daysSinceUpdate: null,
        status: "error",
      };
      checks.push({
        id: "instagram",
        name: "Feed do Instagram",
        category: "social",
        status: "error",
        summary: "Erro ao consultar instagram_config",
        details: [igRes.error.message],
      });
    } else if (
      !igRes.data ||
      !igRes.data.access_token ||
      igRes.data.access_token === "PLACEHOLDER_TOKEN"
    ) {
      instagramMeta = {
        configured: false,
        updatedAt: igRes.data?.updated_at ?? null,
        daysSinceUpdate: null,
        status: "optional",
      };
      checks.push({
        id: "instagram",
        name: "Feed do Instagram",
        category: "social",
        status: "optional",
        summary: "Fallback institucional ativo (integração opcional)",
        details: [
          "Quando desejar exibir o feed dinâmico, insira o token em instagram_config (id = 1).",
        ],
      });
    } else {
      const updatedMs = new Date(igRes.data.updated_at).getTime();
      const daysSince = Number.isFinite(updatedMs)
        ? Math.max(0, Math.floor((Date.now() - updatedMs) / (1000 * 60 * 60 * 24)))
        : null;

      const igStatus: HealthStatus =
        daysSince === null
          ? "warning"
          : daysSince <= 30
            ? "ok"
            : daysSince <= 50
              ? "warning"
              : "error";

      instagramMeta = {
        configured: true,
        updatedAt: igRes.data.updated_at,
        daysSinceUpdate: daysSince,
        status: igStatus,
      };

      checks.push({
        id: "instagram",
        name: "Feed do Instagram",
        category: "social",
        status: igStatus,
        summary:
          igStatus === "ok"
            ? "Token válido e atualizado"
            : igStatus === "warning"
              ? "Token próximo da janela de renovação"
              : "Token antigo — recomenda-se renovar imediatamente",
        details: [
          `Última atualização: ${new Date(igRes.data.updated_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
          daysSince !== null
            ? `Idade do token: ${daysSince} dia(s) (renovação automática após 30 dias)`
            : "Data de atualização indisponível",
        ],
      });
    }
  } catch (error) {
    checks.push({
      id: "supabase",
      name: "Supabase PostgreSQL",
      category: "database",
      status: "error",
      summary: "Erro ao inicializar cliente administrativo do Supabase",
      details: [
        error instanceof Error ? error.message : "Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY",
      ],
      latencyMs: Date.now() - supabaseStart,
    });
  }

  // 2. Upstash Redis
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!redisUrl || !redisToken) {
    checks.push({
      id: "upstash",
      name: "Upstash Redis",
      category: "cache",
      status: "warning",
      summary: "Variáveis de ambiente ausentes (rate limit/dedup em modo fallback)",
      details: [
        `UPSTASH_REDIS_REST_URL: ${redisUrl ? "definida" : "ausente"}`,
        `UPSTASH_REDIS_REST_TOKEN: ${redisToken ? "definida" : "ausente"}`,
      ],
    });
  } else {
    const redisStart = Date.now();
    try {
      const redis = new Redis({ url: redisUrl, token: redisToken });
      const pong = await redis.ping();
      const latencyMs = Date.now() - redisStart;
      checks.push({
        id: "upstash",
        name: "Upstash Redis",
        category: "cache",
        status: pong === "PONG" ? "ok" : "warning",
        summary: pong === "PONG" ? "Conectado e respondendo (PONG)" : `Resposta inesperada: ${String(pong)}`,
        details: [
          "Rate limiting de contato e ações admin ativo",
          "Deduplicação rápida de views de artigos ativa",
        ],
        latencyMs,
      });
    } catch (error) {
      checks.push({
        id: "upstash",
        name: "Upstash Redis",
        category: "cache",
        status: "error",
        summary: "Falha ao conectar no Upstash Redis",
        details: [error instanceof Error ? error.message : "Erro de rede/credencial"],
        latencyMs: Date.now() - redisStart,
      });
    }
  }

  // 3. Resend (Email — opcional)
  const hasResendKey = Boolean(process.env.RESEND_API_KEY?.trim());
  const hasContactEmail = Boolean(process.env.CONTACT_EMAIL?.trim());
  const hasFromEmail = Boolean(process.env.CONTACT_FROM_EMAIL?.trim());
  const resendStatus: HealthStatus = !hasResendKey
    ? "optional"
    : hasContactEmail
      ? "ok"
      : "warning";

  checks.push({
    id: "resend",
    name: "Resend (Notificações por E-mail)",
    category: "email",
    status: resendStatus,
    summary: !hasResendKey
      ? "Desativado (leads continuam sendo salvos normalmente no painel)"
      : hasContactEmail
        ? "Pronto para envio de notificações de leads"
        : "RESEND_API_KEY ativa, mas falta definir CONTACT_EMAIL",
    details: [
      `RESEND_API_KEY: ${hasResendKey ? "configurada" : "desativada (opcional)"}`,
      `CONTACT_EMAIL: ${hasContactEmail ? "configurada" : "não definida"}`,
      `CONTACT_FROM_EMAIL: ${hasFromEmail ? "configurada" : "usando padrão"}`,
    ],
  });

  // 4. Analytics Próprio & Pixels Opcionais (PostHog / Meta CAPI / Hash Salt)
  const hasPosthog = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim());
  const hasMetaPixel = Boolean(
    process.env.META_PIXEL_ID?.trim() || process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim()
  );
  const hasMetaCapi = Boolean(
    process.env.META_PIXEL_ID?.trim() && process.env.META_PIXEL_ACCESS_TOKEN?.trim()
  );
  const hasHashSalt = Boolean(process.env.ANALYTICS_HASH_SALT?.trim());

  checks.push({
    id: "analytics",
    name: "Analytics Próprio & Pixels Opcionais",
    category: "analytics",
    status: "ok",
    summary:
      hasPosthog || hasMetaCapi
        ? "Analytics anti-inflação ativo + integrações de marketing habilitadas"
        : "Analytics anti-inflação próprio ativo (LGPD-safe, sem cookies)",
    details: [
      `ANALYTICS_HASH_SALT: ${hasHashSalt ? "dedicado" : "usando fallback seguro"}`,
      `PostHog (opcional): ${hasPosthog ? "ativo" : "desativado"}`,
      `Meta Pixel (opcional): ${hasMetaPixel ? "configurado" : "desativado"}`,
      `Meta CAPI server-side (opcional): ${hasMetaCapi ? "ativo" : "desativado"}`,
    ],
  });

  // 5. Native Admin Auth
  const hasDedicatedSessionSecret = Boolean(
    process.env.ADMIN_SESSION_SECRET?.trim()
  );
  const hasSessionSecret = isSessionSecretConfigured();
  const hasEnvBootstrap = Boolean(
    process.env.ADMIN_EMAIL?.trim() && process.env.ADMIN_PASSWORD?.trim()
  );
  const devBootstrap = isDevBootstrapActive();
  const hasAnyAuthSource = adminUsersCount > 0 || hasEnvBootstrap || devBootstrap;

  const authStatus: HealthStatus =
    !hasSessionSecret && process.env.NODE_ENV === "production"
      ? "error"
      : hasDedicatedSessionSecret && (adminUsersReady || hasEnvBootstrap)
        ? "ok"
        : hasAnyAuthSource
          ? "warning"
          : "error";

  checks.push({
    id: "auth",
    name: "Autenticação Admin Nativa",
    category: "auth",
    status: authStatus,
    summary:
      authStatus === "ok"
        ? "Sessão HttpOnly assinada (HMAC-SHA256) e credenciais configuradas"
        : authStatus === "warning"
          ? "Autenticação ativa com recomendação de endurecimento"
          : "Configuração de autenticação administrativa incompleta",
    details: [
      `ADMIN_SESSION_SECRET: ${hasDedicatedSessionSecret ? "dedicado" : hasSessionSecret ? "usando fallback SUPABASE_SERVICE_ROLE_KEY" : "fallback local de desenvolvimento"}`,
      `Bootstrap (.env ADMIN_EMAIL/ADMIN_PASSWORD): ${hasEnvBootstrap ? "configurado" : devBootstrap ? "modo desenvolvimento local" : "não definido"}`,
      `Tabela admin_users: ${adminUsersReady ? `${adminUsersCount} conta(s) cadastrada(s)` : "pendente (aplicar 004_admin_auth.sql)"}`,
      `Sessão atual: ${guard.session.email || guard.session.userId}`,
    ],
  });

  const overallStatus: HealthStatus = checks.some((c) => c.status === "error")
    ? "error"
    : checks.some((c) => c.status === "warning")
      ? "warning"
      : "ok";

  const payload: AdminHealthResponse = {
    status: overallStatus,
    checkedAt: new Date().toISOString(),
    checks,
    instagram: instagramMeta,
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (!guard.ok) {
    return guard.response;
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { action?: string };

    if (body.action === "refresh_instagram") {
      const result = await refreshInstagramTokenIfNeeded();
      return NextResponse.json(
        { ok: true, result, timestamp: new Date().toISOString() },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { ok: false, error: "Ação não suportada." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Admin health action failed:", error);
    return NextResponse.json(
      { ok: false, error: "Erro ao executar ação de manutenção." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
