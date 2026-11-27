import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/auth-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRedisClient } from "@/lib/upstash";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const AUTH_USER_CACHE_TTL_SECONDS = 30;

interface CachedAdminUserState {
  is_active: boolean;
  token_version: number | null;
}

function getAuthUserCacheKey(userId: string): string {
  return `ehs:auth:user:${userId}`;
}

export function isAdminUserUuid(sub: string | null | undefined): sub is string {
  return typeof sub === "string" && UUID_REGEX.test(sub);
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

export async function invalidateAdminUserSessionCache(userId: string): Promise<void> {
  if (!isAdminUserUuid(userId)) {
    return;
  }

  const redis = getRedisClient();
  if (!redis) {
    return;
  }

  try {
    await redis.del(getAuthUserCacheKey(userId));
  } catch {
    // Non-blocking cache invalidation
  }
}

async function fetchDbAdminUserState(
  userId: string
): Promise<{ ok: true; state: CachedAdminUserState } | { ok: false; failOpen: boolean }> {
  const redis = getRedisClient();
  const cacheKey = getAuthUserCacheKey(userId);

  if (redis) {
    try {
      const cached = await redis.get<CachedAdminUserState>(cacheKey);
      if (
        cached &&
        typeof cached === "object" &&
        typeof cached.is_active === "boolean" &&
        (cached.token_version === null || typeof cached.token_version === "number")
      ) {
        return { ok: true, state: cached };
      }
    } catch {
      // Fallback to DB if Redis is unavailable
    }
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("admin_users")
      .select("is_active, token_version")
      .eq("id", userId)
      .maybeSingle();

    let state: CachedAdminUserState | null = null;

    if (error) {
      if (isMissingTableError(error)) {
        return { ok: false, failOpen: true };
      }

      if (isMissingColumnError(error)) {
        // Pre-migration 005 fallback: still enforce is_active
        const fallback = await supabase
          .from("admin_users")
          .select("is_active")
          .eq("id", userId)
          .maybeSingle();

        if (fallback.error) {
          if (isMissingTableError(fallback.error)) {
            return { ok: false, failOpen: true };
          }
          return { ok: false, failOpen: false };
        }

        if (!fallback.data) {
          return { ok: false, failOpen: false };
        }

        state = {
          is_active: Boolean(fallback.data.is_active),
          token_version: null,
        };
      } else {
        return { ok: false, failOpen: false };
      }
    } else {
      if (!data) {
        return { ok: false, failOpen: false };
      }
      state = {
        is_active: Boolean(data.is_active),
        token_version:
          typeof data.token_version === "number" ? data.token_version : null,
      };
    }

    if (redis && state) {
      try {
        await redis.set(cacheKey, state, { ex: AUTH_USER_CACHE_TTL_SECONDS });
      } catch {
        // Non-blocking cache write
      }
    }

    return { ok: true, state };
  } catch {
    return { ok: false, failOpen: false };
  }
}

export interface AdminSession {
  userId: string | null;
  email: string | null;
  name: string | null;
  imageUrl: string | null;
  isAdmin: boolean;
}

export interface AuthenticatedAdminSession extends AdminSession {
  userId: string;
  isAdmin: true;
}

export type RequireAdminApiResult =
  | { ok: true; session: AuthenticatedAdminSession }
  | { ok: false; response: NextResponse };

export function isAdmin(
  session: AdminSession | { isAdmin?: boolean; role?: string } | null | undefined | unknown
): boolean {
  if (!session || typeof session !== "object") {
    return false;
  }

  const candidate = session as { isAdmin?: unknown; role?: unknown };
  if (typeof candidate.isAdmin === "boolean") {
    return candidate.isAdmin;
  }

  return candidate.role === "admin";
}

export function isDevBootstrapActive(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    !process.env.ADMIN_EMAIL?.trim() &&
    !process.env.ADMIN_PASSWORD?.trim()
  );
}

export async function getAdminSession(): Promise<AdminSession> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    const payload = await verifySessionToken(token);

    if (!payload) {
      return {
        userId: null,
        email: null,
        name: null,
        imageUrl: null,
        isAdmin: false,
      };
    }

    if (isAdminUserUuid(payload.sub)) {
      const check = await fetchDbAdminUserState(payload.sub);
      if (!check.ok) {
        if (!check.failOpen) {
          return {
            userId: null,
            email: null,
            name: null,
            imageUrl: null,
            isAdmin: false,
          };
        }
      } else {
        const { is_active, token_version } = check.state;
        const versionMismatch =
          typeof payload.tv === "number" &&
          typeof token_version === "number" &&
          token_version !== payload.tv;

        if (!is_active || versionMismatch) {
          return {
            userId: null,
            email: null,
            name: null,
            imageUrl: null,
            isAdmin: false,
          };
        }
      }
    }

    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      imageUrl: null,
      isAdmin: payload.role === "admin",
    };
  } catch {
    return {
      userId: null,
      email: null,
      name: null,
      imageUrl: null,
      isAdmin: false,
    };
  }
}

export async function requireAdmin(): Promise<AuthenticatedAdminSession> {
  const session = await getAdminSession();

  if (!session.userId || !session.isAdmin) {
    redirect("/sign-in");
  }

  return session as AuthenticatedAdminSession;
}

export async function requireAdminApi(): Promise<RequireAdminApiResult> {
  const session = await getAdminSession();

  if (!session.userId || !session.isAdmin) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Não autenticado" },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      ),
    };
  }

  return {
    ok: true,
    session: session as AuthenticatedAdminSession,
  };
}
