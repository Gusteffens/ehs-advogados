import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { z } from "zod";
import { constantTimeEqual, verifyPassword } from "@/lib/auth-password";
import {
  ADMIN_SESSION_COOKIE,
  DEFAULT_SESSION_TTL_SECONDS,
  signSessionToken,
} from "@/lib/auth-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRedisClient } from "@/lib/upstash";
import { extractClientIp } from "@/lib/analytics/visitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SHORT_SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
  rememberMe: z.boolean().optional(),
  redirectUrl: z.string().optional(),
});

let loginRatelimitInstance: Ratelimit | null = null;

function getLoginRatelimit(): Ratelimit | null {
  const redis = getRedisClient();
  if (!redis) {
    return null;
  }

  loginRatelimitInstance ??= new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "15 m"),
    analytics: false,
    prefix: "@ehs/auth-login",
  });

  return loginRatelimitInstance;
}

function isMissingTableError(
  error: { code?: string; message?: string } | null | undefined
): boolean {
  if (!error) return false;
  if (error.code === "42P01" || error.code === "PGRST205") {
    return true;
  }
  const msg = (error.message ?? "").toLowerCase();
  return msg.includes("does not exist") || msg.includes("could not find the table");
}

function isMissingColumnError(
  error: { code?: string; message?: string } | null | undefined
): boolean {
  if (!error) return false;
  if (error.code === "42703" || error.code === "PGRST204") {
    return true;
  }
  const msg = (error.message ?? "").toLowerCase();
  return msg.includes("column") && (msg.includes("does not exist") || msg.includes("schema cache"));
}

function sanitizeRedirectUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== "string") {
    return "/admin";
  }

  const trimmed = rawUrl.trim();
  if (trimmed.startsWith("/admin") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  return "/admin";
}

function verifyEnvPassword(inputPassword: string, configuredPassword: string): boolean {
  if (configuredPassword.startsWith("scrypt:")) {
    return verifyPassword(inputPassword, configuredPassword);
  }
  return constantTimeEqual(inputPassword, configuredPassword);
}

export async function POST(request: NextRequest) {
  try {
    const ip = extractClientIp(request.headers);
    const ratelimit = getLoginRatelimit();
    if (ratelimit) {
      try {
        const { success } = await ratelimit.limit(ip);
        if (!success) {
          return NextResponse.json(
            {
              ok: false,
              error:
                "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.",
            },
            { status: 429, headers: { "Cache-Control": "no-store" } }
          );
        }
      } catch {
        // Do not block login if Redis is temporarily unavailable
      }
    }

    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message || "Dados de login inválidos.";
      return NextResponse.json(
        { ok: false, error: firstError },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { email, password, rememberMe, redirectUrl } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    let authenticatedUser: {
      sub: string;
      email: string;
      name: string;
      tv?: number;
    } | null = null;

    let foundDbRowForEmail = false;
    let hasAnyDbUsers = false;

    // 1. Check public.admin_users in Supabase
    try {
      const supabase = createAdminClient();
      let userRow: {
        id: string;
        email: string;
        name: string;
        password_hash: string;
        is_active: boolean;
        token_version?: number | null;
      } | null = null;
      let userError: { code?: string; message?: string } | null = null;

      const withVersionRes = await supabase
        .from("admin_users")
        .select("id, email, name, password_hash, is_active, token_version")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (withVersionRes.error && isMissingColumnError(withVersionRes.error)) {
        // Graceful fallback before migration 005 adds token_version
        const legacyRes = await supabase
          .from("admin_users")
          .select("id, email, name, password_hash, is_active")
          .eq("email", normalizedEmail)
          .maybeSingle();
        userRow = legacyRes.data ? { ...legacyRes.data, token_version: 1 } : null;
        userError = legacyRes.error;
      } else {
        userRow = withVersionRes.data;
        userError = withVersionRes.error;
      }

      if (userError) {
        if (!isMissingTableError(userError)) {
          console.error("[auth/login] Failed to query admin_users:", userError.message);
        }
      } else if (userRow) {
        foundDbRowForEmail = true;
        hasAnyDbUsers = true;

        if (!userRow.is_active) {
          return NextResponse.json(
            {
              ok: false,
              error: "Esta conta administrativa está desativada.",
            },
            { status: 401, headers: { "Cache-Control": "no-store" } }
          );
        }

        if (verifyPassword(password, userRow.password_hash)) {
          authenticatedUser = {
            sub: userRow.id,
            email: userRow.email.toLowerCase(),
            name: userRow.name,
            tv: typeof userRow.token_version === "number" ? userRow.token_version : 1,
          };

          await supabase
            .from("admin_users")
            .update({ last_login_at: new Date().toISOString() })
            .eq("id", userRow.id);
        }
      } else if (process.env.NODE_ENV === "development") {
        // Check if any admin_users exist before allowing dev fallback
        const { count, error: countError } = await supabase
          .from("admin_users")
          .select("id", { count: "exact", head: true });
        if (!countError && (count ?? 0) > 0) {
          hasAnyDbUsers = true;
        }
      }
    } catch {
      // Gracefully ignore missing Supabase env vars or connectivity issues so .env/dev fallback can work
    }

    // 2. Fallback to .env ADMIN_EMAIL + ADMIN_PASSWORD (only if no DB row exists for this email)
    const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";
    const envPassword = process.env.ADMIN_PASSWORD?.trim() || "";

    if (!authenticatedUser && !foundDbRowForEmail && envEmail && envPassword) {
      if (
        normalizedEmail === envEmail &&
        verifyEnvPassword(password, envPassword)
      ) {
        authenticatedUser = {
          sub: `env:${envEmail}`,
          email: envEmail,
          name: process.env.ADMIN_NAME?.trim() || "Administrador",
        };
      }
    }

    // 3. Dev-only convenience fallback (NEVER allowed in production)
    if (
      !authenticatedUser &&
      process.env.NODE_ENV === "development" &&
      !envEmail &&
      !envPassword &&
      !hasAnyDbUsers
    ) {
      if (
        normalizedEmail === "admin@ehsadvogados.com.br" &&
        constantTimeEqual(password, "admin123")
      ) {
        authenticatedUser = {
          sub: "dev:admin",
          email: "admin@ehsadvogados.com.br",
          name: "Administrador (Dev)",
        };
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { ok: false, error: "E-mail ou senha inválidos." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const ttlSeconds =
      rememberMe !== false
        ? DEFAULT_SESSION_TTL_SECONDS
        : SHORT_SESSION_TTL_SECONDS;

    const token = await signSessionToken(
      {
        sub: authenticatedUser.sub,
        email: authenticatedUser.email,
        name: authenticatedUser.name,
        role: "admin",
        ...(authenticatedUser.tv !== undefined ? { tv: authenticatedUser.tv } : {}),
      },
      ttlSeconds
    );

    const redirectTo = sanitizeRedirectUrl(redirectUrl);
    const response = NextResponse.json(
      { ok: true, redirectTo },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: ttlSeconds,
    });

    return response;
  } catch (error) {
    console.error("[auth/login] Unexpected error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Erro interno ao autenticar. Verifique a configuração do servidor.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
