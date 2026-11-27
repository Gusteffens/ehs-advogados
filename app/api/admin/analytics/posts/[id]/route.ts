import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth";
import {
  getPostAnalytics,
  parseAnalyticsRange,
} from "@/lib/analytics/queries";

export const dynamic = "force-dynamic";

const uuidSchema = z.string().uuid();

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: Request,
  context: RouteContext
): Promise<NextResponse> {
  const gate = await requireAdminApi();
  if (!gate.ok) {
    return gate.response;
  }

  const { id } = await context.params;
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json(
      { error: "ID do artigo inválido." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { searchParams } = new URL(request.url);
  const range = parseAnalyticsRange(searchParams.get("range"));

  try {
    const data = await getPostAnalytics(parsedId.data, range);
    if (!data) {
      return NextResponse.json(
        { error: "Artigo não encontrado." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[api/admin/analytics/posts/[id]] failed:", err);
    return NextResponse.json(
      { error: "Erro ao carregar métricas do artigo." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
