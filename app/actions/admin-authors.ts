"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Author } from "@/types/database";

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

export async function updateMyAuthorProfile(
  rawInput: UpdateAuthorProfileInput
): Promise<UpdateAuthorProfileResult> {
  const session = await requireAdmin();

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

  const { data: existing, error: fetchError } = await supabase
    .from("authors")
    .select("id, slug")
    .eq("id", session.userId)
    .maybeSingle();

  if (fetchError) {
    console.error("Failed to fetch author profile:", fetchError.message);
    return { ok: false, error: "Erro ao consultar perfil de autor no banco." };
  }

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
      .eq("id", session.userId)
      .select("*")
      .single();

    if (updateError) {
      console.error("Failed to update author profile:", updateError.message);
      return { ok: false, error: "Não foi possível salvar o perfil de autor." };
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

  revalidatePath("/admin/perfil");
  revalidatePath("/blog");
  revalidatePath("/equipe");

  return { ok: true, author: inserted };
}
