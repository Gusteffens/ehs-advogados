import "server-only";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export interface ClerkSessionClaims {
  metadata?: {
    role?: string;
  };
  [key: string]: unknown;
}

export function getUserRole(
  sessionClaims: ClerkSessionClaims | null | undefined | unknown
): string | null {
  if (!sessionClaims || typeof sessionClaims !== "object") {
    return null;
  }

  const metadata = (sessionClaims as ClerkSessionClaims).metadata;
  return typeof metadata?.role === "string" ? metadata.role : null;
}

export function isAdmin(
  sessionClaims: ClerkSessionClaims | null | undefined | unknown
): boolean {
  return getUserRole(sessionClaims) === "admin";
}

export async function requireAdmin(): Promise<{ userId: string }> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  if (!isAdmin(sessionClaims)) {
    redirect("/unauthorized");
  }

  return { userId };
}
