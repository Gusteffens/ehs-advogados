import { Webhook } from "svix";
import { headers } from "next/headers";
import { type WebhookEvent } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import slugify from "slugify";

function authorSlug(name: string, id: string) {
    const slug = slugify(name, { lower: true, strict: true, locale: "pt" });
    return slug || id;
}

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.warn("CLERK_WEBHOOK_SECRET not configured - webhook skipped");
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const headerPayload = await headers();
    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
        return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
    }

    const body = await req.text();
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature,
        }) as WebhookEvent;
    } catch {
        console.error("Webhook verification failed");
        return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (evt.type === "user.created" || evt.type === "user.updated") {
        const { id, first_name, last_name, image_url } = evt.data;
        const fullName = [first_name, last_name].filter(Boolean).join(" ") || "Autor";

        const { error } = await supabase.from("authors").upsert(
            {
                id,
                full_name: fullName,
                slug: authorSlug(fullName, id),
                avatar_url: image_url ?? null,
            },
            { onConflict: "id" }
        );

        if (error) {
            console.error("Supabase author sync error:", error);
            return NextResponse.json({ error: "Database sync failed" }, { status: 500 });
        }
    }

    if (evt.type === "user.deleted") {
        const { id } = evt.data;

        if (id) {
            const { error } = await supabase.from("authors").delete().eq("id", id);

            if (error) {
                console.error("Supabase author delete error:", error);
                return NextResponse.json({ error: "Database delete failed" }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ received: true }, { status: 200 });
}
