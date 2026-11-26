import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

export async function GET() {
    let supabaseStatus: "ok" | "degraded" = "degraded";

    try {
        const supabase = createPublicClient();
        if (supabase) {
            const { error } = await supabase
                .from("categories")
                .select("id")
                .limit(1);

            if (!error) {
                supabaseStatus = "ok";
            }
        }
    } catch {
        supabaseStatus = "degraded";
    }

    return NextResponse.json(
        {
            status: "ok",
            supabase: supabaseStatus,
            timestamp: new Date().toISOString(),
        },
        {
            status: 200,
            headers: {
                "Cache-Control": "no-store",
            },
        }
    );
}
