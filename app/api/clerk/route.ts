import { Webhook } from "svix";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { type WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import slugify from "slugify";
import { createAdminClient } from "@/lib/supabase/admin";

function baseAuthorSlug(name: string, id: string): string {
  const slug = slugify(name, { lower: true, strict: true, locale: "pt" });
  return slug || id;
}

async function getUniqueAuthorSlug(
  supabase: ReturnType<typeof createAdminClient>,
  name: string,
  id: string
): Promise<string> {
  const base = baseAuthorSlug(name, id);
  const { data } = await supabase
    .from("authors")
    .select("slug")
    .or(`slug.eq.${base},slug.like.${base}-%`)
    .neq("id", id);

  const existing = new Set((data ?? []).map((row) => row.slug));
  if (!existing.has(base)) {
    return base;
  }

  let suffix = 2;
  let candidate = `${base}-${suffix}`;
  while (existing.has(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
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

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch (error) {
    console.error("Failed to initialize Supabase Admin Client in Clerk webhook:", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }

  if (evt.type === "user.created") {
    const { id, first_name, last_name, image_url } = evt.data;
    const fullName = [first_name, last_name].filter(Boolean).join(" ") || "Autor";
    const slug = await getUniqueAuthorSlug(supabase, fullName, id);

    const { error } = await supabase.from("authors").upsert(
      {
        id,
        full_name: fullName,
        slug,
        avatar_url: image_url ?? null,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Supabase author create sync error:", error);
      return NextResponse.json({ error: "Database sync failed" }, { status: 500 });
    }

    revalidateTag("blog-posts", "max");
    revalidatePath("/blog");
  }

  if (evt.type === "user.updated") {
    const { id, first_name, last_name, image_url } = evt.data;
    const fullName = [first_name, last_name].filter(Boolean).join(" ") || "Autor";

    const { data: existing } = await supabase
      .from("authors")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (existing) {
      // Preserva o slug existente para não quebrar URLs nem colidir com UNIQUE(slug)
      const { error } = await supabase
        .from("authors")
        .update({
          full_name: fullName,
          avatar_url: image_url ?? null,
        })
        .eq("id", id);

      if (error) {
        console.error("Supabase author update sync error:", error);
        return NextResponse.json({ error: "Database sync failed" }, { status: 500 });
      }
    } else {
      const slug = await getUniqueAuthorSlug(supabase, fullName, id);
      const { error } = await supabase.from("authors").insert({
        id,
        full_name: fullName,
        slug,
        avatar_url: image_url ?? null,
      });

      if (error) {
        console.error("Supabase author insert-on-update sync error:", error);
        return NextResponse.json({ error: "Database sync failed" }, { status: 500 });
      }
    }

    revalidateTag("blog-posts", "max");
    revalidatePath("/blog");
  }

  if (evt.type === "user.deleted") {
    const { id } = evt.data;

    if (id) {
      // Desvincula posts antes de excluir o autor para evitar violação de FK
      const { error: unlinkError } = await supabase
        .from("posts")
        .update({ author_id: null })
        .eq("author_id", id);

      if (unlinkError) {
        console.error("Supabase author unlink error:", unlinkError);
        return NextResponse.json({ error: "Database unlink failed" }, { status: 500 });
      }

      const { error } = await supabase.from("authors").delete().eq("id", id);

      if (error) {
        console.error("Supabase author delete error:", error);
        return NextResponse.json({ error: "Database delete failed" }, { status: 500 });
      }

      revalidateTag("blog-posts", "max");
      revalidatePath("/blog");
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
