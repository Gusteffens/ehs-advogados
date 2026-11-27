import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/auth-session";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Bloqueia /sign-up — novos administradores são cadastrados internamente no painel
  if (pathname === "/sign-up" || pathname.startsWith("/sign-up/")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (pathname === "/api/admin" || pathname.startsWith("/api/admin/")) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }
    return NextResponse.next();
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
      const signInUrl = new URL("/sign-in", request.url);
      const destination = `${pathname}${search}`;
      if (destination.startsWith("/admin")) {
        signInUrl.searchParams.set("redirect_url", destination);
      }
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/sign-up", "/sign-up/:path*"],
};
