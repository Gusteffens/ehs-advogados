"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { SITE_CONFIG } from "@/lib/site-config";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBlogActionRatelimit } from "@/lib/upstash";
import type { Author } from "@/types/database";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const authorProfileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Informe o nome completo (mínimo 2 caracteres).")
    .max(120, "Nome muito longo."),
  oab: z
    .string()
    .trim()
    .max(80, "Registro OAB muito longo.")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(1500, "Biografia deve ter no máximo 1500 caracteres.")
    .optional()
    .or(z.literal("")),
  specialties: z
    .array(z.string().trim().min(1).max(60))
    .max(12, "Informe no máximo 12 especialidades.")
    .optional(),
  avatar_url: z
    .string()
    .trim()
    .max(500, "URL do avatar muito longa.")
    .refine(
      (val) =>
        val === "" ||
        val.startsWith("/") ||
        val.startsWith("https://") ||
        val.startsWith("http://"),
      "Informe uma URL válida (https://...) ou caminho local (/images/...)."
    )
    .optional()
    .or(z.literal("")),
});

export type UpdateAuthorProfileInput = z.infer<typeof authorProfileSchema>;

export interface UpdateAuthorProfileResult {
  ok: boolean;
  error?: string;
  author?: Author;
}

function slugifyName(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

async function resolveSessionAuthor(session: {
  userId: string;
  name: string | null;
  email: string | null;
}): Promise<{ author: Author | null; adminUserId: string | null; adminAuthorId: string | null }> {
  const supabase = createAdminClient();
  let adminUserId: string | null = null;
  let adminAuthorId: string | null = null;
  let resolvedEmail = session.email?.trim().toLowerCase() ?? null;
  let resolvedName = session.name?.trim() ?? null;

  // 1. If session.userId is a UUID in admin_users, check admin_users.author_id first
  if (UUID_REGEX.test(session.userId)) {
    try {
      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("id, author_id, email, name")
        .eq("id", session.userId)
        .maybeSingle();

      if (adminUser) {
        adminUserId = adminUser.id;
        adminAuthorId = adminUser.author_id;
        resolvedEmail = resolvedEmail || adminUser.email?.trim().toLowerCase() || null;
        resolvedName = resolvedName || adminUser.name?.trim() || null;

        if (adminUser.author_id) {
          const { data: linkedAuthor } = await supabase
            .from("authors")
            .select("*")
            .eq("id", adminUser.author_id)
            .maybeSingle();

          if (linkedAuthor) {
            return {
              author: linkedAuthor as Author,
              adminUserId,
              adminAuthorId,
            };
          }
        }
      }
    } catch {
      // admin_users table may not exist yet before migration 004
    }
  }

  // 2. Direct id match in authors (legacy or seeded id === userId)
  const { data: directAuthor } = await supabase
    .from("authors")
    .select("*")
    .eq("id", session.userId)
    .maybeSingle();

  if (directAuthor) {
    return { author: directAuthor as Author, adminUserId, adminAuthorId };
  }

  // 3. Fallback: match by normalized email (via SITE_CONFIG.team) or slug candidates
  const candidateSlugs: string[] = [];
  if (resolvedEmail) {
    const teamMatch = SITE_CONFIG.team.find(
      (member) => member.email.trim().toLowerCase() === resolvedEmail
    );
    if (teamMatch?.slug) {
      candidateSlugs.push(teamMatch.slug);
    }
    const emailLocal = slugifyName(resolvedEmail.split("@")[0] ?? "");
    if (emailLocal) {
      candidateSlugs.push(emailLocal);
    }
  }
  if (resolvedName) {
    const nameSlug = slugifyName(resolvedName);
    if (nameSlug) {
      candidateSlugs.push(nameSlug);
    }
  }

  const uniqueSlugs = Array.from(new Set(candidateSlugs));
  if (uniqueSlugs.length > 0) {
    const { data: matchedAuthors } = await supabase
      .from("authors")
      .select("*")
      .in("slug", uniqueSlugs);

    if (matchedAuthors && matchedAuthors.length > 0) {
      // Respect priority order of uniqueSlugs
      for (const candidateSlug of uniqueSlugs) {
        const hit = matchedAuthors.find((row) => row.slug === candidateSlug);
        if (hit) {
          return { author: hit as Author, adminUserId, adminAuthorId };
        }
      }
    }
  }

  return { author: null, adminUserId, adminAuthorId };
}

export async function getMyAuthorProfile(): Promise<Author | null> {
  const session = await requireAdmin();
  try {
    const { author } = await resolveSessionAuthor(session);
    return author;
  } catch {
    return null;
  }
}

export async function updateMyAuthorProfile(
  rawInput: UpdateAuthorProfileInput
): Promise<UpdateAuthorProfileResult> {
  const session = await requireAdmin();

  const ratelimit = getBlogActionRatelimit();
  if (ratelimit) {
    try {
      const { success } = await ratelimit.limit(`author-profile:${session.userId}`);
      if (!success) {
        return {
          ok: false,
          error:
            "Muitas atualizações em sequência. Aguarde alguns segundos e tente novamente.",
        };
      }
    } catch (err) {
      console.error("Falha ao verificar rate limit de perfil de autor:", err);
    }
  }

  const parsed = authorProfileSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Dados inválidos.",
    };
  }

  const { full_name, oab, bio, specialties, avatar_url } = parsed.data;
  const cleanedSpecialties = (specialties ?? [])
    .map((item) => item.trim())
    .filter(Boolean);

  const supabase = createAdminClient();

  let resolved: Awaited<ReturnType<typeof resolveSessionAuthor>>;
  try {
    resolved = await resolveSessionAuthor(session);
  } catch (err) {
    console.error("Failed to resolve author profile:", err);
    return { ok: false, error: "Erro ao consultar perfil de autor no banco." };
  }

  const { author: existing, adminUserId, adminAuthorId } = resolved;

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from("authors")
      .update({
        full_name,
        oab: oab || null,
        bio: bio || null,
        specialties: cleanedSpecialties.length > 0 ? cleanedSpecialties : null,
        avatar_url: avatar_url || null,
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (updateError) {
      console.error("Failed to update author profile:", updateError.message);
      return { ok: false, error: "Não foi possível salvar o perfil de autor." };
    }

    // Persist author_id link on admin_users if missing or outdated
    if (adminUserId && adminAuthorId !== existing.id) {
      try {
        await supabase
          .from("admin_users")
          .update({ author_id: existing.id })
          .eq("id", adminUserId);
      } catch {
        // Non-blocking link sync
      }
    }

    revalidatePath("/admin/perfil");
    revalidatePath("/blog");
    revalidatePath("/equipe");

    return { ok: true, author: updated };
  }

  const baseSlug = slugifyName(full_name) || `autor-${session.userId.slice(-6)}`;
  const { data: slugConflict } = await supabase
    .from("authors")
    .select("id")
    .eq("slug", baseSlug)
    .maybeSingle();

  const finalSlug = slugConflict
    ? `${baseSlug}-${session.userId.slice(-5).toLowerCase()}`
    : baseSlug;

  const { data: inserted, error: insertError } = await supabase
    .from("authors")
    .insert({
      id: session.userId,
      full_name,
      slug: finalSlug,
      oab: oab || null,
      bio: bio || null,
      specialties: cleanedSpecialties.length > 0 ? cleanedSpecialties : null,
      avatar_url: avatar_url || null,
    })
    .select("*")
    .single();

  if (insertError) {
    console.error("Failed to create author profile:", insertError.message);
    return { ok: false, error: "Não foi possível criar o perfil de autor." };
  }

  // Persist author_id link on admin_users so future lookups stay bound to this row
  if (adminUserId) {
    try {
      await supabase
        .from("admin_users")
        .update({ author_id: inserted.id })
        .eq("id", adminUserId);
    } catch {
      // Non-blocking link sync
    }
  }

  revalidatePath("/admin/perfil");
  revalidatePath("/blog");
  revalidatePath("/equipe");

  return { ok: true, author: inserted };
}
