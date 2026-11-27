import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/auth-session";

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
