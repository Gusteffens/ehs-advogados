import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
 const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

 if (!WEBHOOK_SECRET) {
 console.warn("CLERK_WEBHOOK_SECRET not configured — webhook skipped");
 return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
 }

 // Get the headers
 const headerPayload = await headers();
 const svix_id = headerPayload.get("svix-id");
 const svix_timestamp = headerPayload.get("svix-timestamp");
 const svix_signature = headerPayload.get("svix-signature");

 if (!svix_id || !svix_timestamp || !svix_signature) {
 return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
 }

 // Get the body
 const payload = await req.json();
 const body = JSON.stringify(payload);

 // Verify the webhook
 const wh = new Webhook(WEBHOOK_SECRET);
 let evt: WebhookEvent;

 try {
 evt = wh.verify(body, {
 "svix-id": svix_id,
 "svix-timestamp": svix_timestamp,
 "svix-signature": svix_signature,
 }) as WebhookEvent;
 } catch {
 console.error("Webhook verification failed");
 return NextResponse.json({ error: "Verification failed" }, { status: 400 });
 }

 const supabase = createAdminClient();
 const eventType = evt.type;

 // Handle user.created and user.updated — sync to authors table
 if (eventType === "user.created" || eventType === "user.updated") {
 const { id, email_addresses, first_name, last_name, image_url } = evt.data;

 const email = email_addresses?.[0]?.email_address ?? "";
 const name = [first_name, last_name].filter(Boolean).join(" ") || "Autor";

 const authorData = {
 clerk_id: id,
 name,
 email,
 photo_url: image_url ?? null,
 };

 const { error } = await supabase
 .from("authors")
 .upsert(authorData, { onConflict: "clerk_id" });

 if (error) {
 console.error("Supabase upsert error:", error);
 return NextResponse.json({ error: "Database sync failed" }, { status: 500 });
 }
 }

 // Handle user.deleted — soft delete or remove from authors
 if (eventType === "user.deleted") {
 const { id } = evt.data;

 if (id) {
 const { error } = await supabase
 .from("authors")
 .delete()
 .eq("clerk_id", id);

 if (error) {
 console.error("Supabase delete error:", error);
 return NextResponse.json({ error: "Database delete failed" }, { status: 500 });
 }
 }
 }

 return NextResponse.json({ received: true }, { status: 200 });
}
