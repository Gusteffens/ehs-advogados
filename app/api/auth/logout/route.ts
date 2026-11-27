import { NextRequest, NextResponse } from "next/server";
import { invalidateAdminUserSessionCache, isAdminUserUuid } from "@/lib/auth";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth-session";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const payload = await verifySessionToken(token);

    if (payload && isAdminUserUuid(payload.sub)) {
      // Best-effort bump of token_version so any copies of this session cookie are immediately revoked
      try {
        const supabase = createAdminClient();
        const { data: row, error: selectError } = await supabase
          .from("admin_users")
          .select("token_version")
          .eq("id", payload.sub)
          .maybeSingle();

        if (!selectError && row) {
          const nextVersion =
            (typeof row.token_version === "number" ? row.token_version : 1) + 1;
          await supabase
            .from("admin_users")
            .update({
              token_version: nextVersion,
              updated_at: new Date().toISOString(),
            })
            .eq("id", payload.sub);
        }
      } catch {
        // Ignore if migration 005 is not yet applied or DB is temporarily unavailable
      }

      await invalidateAdminUserSessionCache(payload.sub);
    }
  } catch {
    // Always clear cookie even if revocation fails
  }

  const response = NextResponse.json(
    { ok: true },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });

  return response;
}
