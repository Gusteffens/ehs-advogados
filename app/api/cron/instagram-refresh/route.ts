import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { refreshInstagramTokenIfNeeded } from "@/lib/instagram";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
        return false;
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
        return false;
    }

    const expected = `Bearer ${cronSecret}`;
    const expectedBuf = Buffer.from(expected, "utf8");
    const providedBuf = Buffer.from(authHeader, "utf8");

    if (expectedBuf.length !== providedBuf.length) {
        return false;
    }

    return timingSafeEqual(expectedBuf, providedBuf);
}

const FAILURE_REASONS = new Set([
    "db_error",
    "db_update_error",
    "network_error",
    "missing_access_token_in_response",
]);

function isRefreshFailure(reason: string): boolean {
    return (
        FAILURE_REASONS.has(reason) ||
        reason.startsWith("instagram_api_status_")
    );
}

export async function GET(req: NextRequest) {
    if (!isAuthorized(req)) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401, headers: { "Cache-Control": "no-store" } }
        );
    }

    try {
        const result = await refreshInstagramTokenIfNeeded();
        if (!result.refreshed && isRefreshFailure(result.reason)) {
            console.error("Instagram refresh cron failed with reason:", result.reason);
            return NextResponse.json(
                {
                    status: "error",
                    ...result,
                    timestamp: new Date().toISOString(),
                },
                { status: 500, headers: { "Cache-Control": "no-store" } }
            );
        }

        return NextResponse.json(
            {
                status: "ok",
                ...result,
                timestamp: new Date().toISOString(),
            },
            { status: 200, headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("Instagram refresh cron failed:", error);
        return NextResponse.json(
            {
                status: "error",
                error: "Failed to refresh Instagram token",
                timestamp: new Date().toISOString(),
            },
            { status: 500, headers: { "Cache-Control": "no-store" } }
        );
    }
}
