import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import {
  getAnalyticsOverview,
  parseAnalyticsRange,
} from "@/lib/analytics/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  const gate = await requireAdminApi();
  if (!gate.ok) {
    return gate.response;
  }

  const { searchParams } = new URL(request.url);
  const range = parseAnalyticsRange(searchParams.get("range"));

  try {
    const data = await getAnalyticsOverview(range);
    return NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[api/admin/analytics/overview] failed:", err);
    return NextResponse.json(
      { error: "Erro ao carregar métricas de analytics." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
