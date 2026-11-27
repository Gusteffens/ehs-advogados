"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBlogActionRatelimit } from "@/lib/upstash";
import type { LeadStatus } from "@/types/database";

const uuidSchema = z.string().uuid("Identificador inválido.");
const uuidListSchema = z
  .array(uuidSchema)
  .min(1, "Selecione pelo menos um lead.")
  .max(100, "Máximo de 100 leads por operação em lote.");

const leadStatusSchema = z.enum(["new", "contacted", "archived"]);

export interface AdminLeadActionResult {
  ok: boolean;
  error?: string;
  count?: number;
}

async function enforceLeadActionRatelimit(userId: string): Promise<string | null> {
  const ratelimit = getBlogActionRatelimit();
  if (!ratelimit) return null;

  try {
    const { success } = await ratelimit.limit(`leads:${userId}`);
    if (!success) {
      return "Muitas operações em sequência. Aguarde alguns segundos e tente novamente.";
    }
  } catch (err) {
    console.error("Falha ao verificar rate limit de ações de leads:", err);
  }

  return null;
}

function revalidateLeadPaths() {
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<AdminLeadActionResult> {
  const session = await requireAdmin();
  const rateLimitError = await enforceLeadActionRatelimit(session.userId ?? "admin");
  if (rateLimitError) {
    return { ok: false, error: rateLimitError };
  }

  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: "Identificador do lead inválido." };
  }

  const parsedStatus = leadStatusSchema.safeParse(status);
  if (!parsedStatus.success) {
    return { ok: false, error: "Status inválido." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("contact_leads")
    .update({ status: parsedStatus.data })
    .eq("id", parsedId.data);

  if (error) {
    console.error("Failed to update lead status:", error);
    return { ok: false, error: "Não foi possível atualizar o status do lead." };
  }

  revalidateLeadPaths();
  return { ok: true, count: 1 };
}

export async function bulkUpdateLeadsStatus(
  ids: string[],
  status: LeadStatus
): Promise<AdminLeadActionResult> {
  const session = await requireAdmin();
  const rateLimitError = await enforceLeadActionRatelimit(session.userId ?? "admin");
  if (rateLimitError) {
    return { ok: false, error: rateLimitError };
  }

  const parsedIds = uuidListSchema.safeParse(ids);
  if (!parsedIds.success) {
    return {
      ok: false,
      error: parsedIds.error.issues[0]?.message ?? "Lista de leads inválida.",
    };
  }

  const parsedStatus = leadStatusSchema.safeParse(status);
  if (!parsedStatus.success) {
    return { ok: false, error: "Status inválido." };
  }

  const uniqueIds = Array.from(new Set(parsedIds.data));
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("contact_leads")
    .update({ status: parsedStatus.data })
    .in("id", uniqueIds);

  if (error) {
    console.error("Failed to bulk update lead statuses:", error);
    return {
      ok: false,
      error: "Não foi possível atualizar os leads selecionados.",
    };
  }

  revalidateLeadPaths();
  return { ok: true, count: uniqueIds.length };
}

export async function deleteLead(id: string): Promise<AdminLeadActionResult> {
  const session = await requireAdmin();
  const rateLimitError = await enforceLeadActionRatelimit(session.userId ?? "admin");
  if (rateLimitError) {
    return { ok: false, error: rateLimitError };
  }

  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: "Identificador do lead inválido." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("contact_leads")
    .delete()
    .eq("id", parsedId.data);

  if (error) {
    console.error("Failed to delete lead:", error);
    return { ok: false, error: "Não foi possível excluir o lead." };
  }

  revalidateLeadPaths();
  return { ok: true, count: 1 };
}

export async function bulkDeleteLeads(
  ids: string[]
): Promise<AdminLeadActionResult> {
  const session = await requireAdmin();
  const rateLimitError = await enforceLeadActionRatelimit(session.userId ?? "admin");
  if (rateLimitError) {
    return { ok: false, error: rateLimitError };
  }

  const parsedIds = uuidListSchema.safeParse(ids);
  if (!parsedIds.success) {
    return {
      ok: false,
      error: parsedIds.error.issues[0]?.message ?? "Lista de leads inválida.",
    };
  }

  const uniqueIds = Array.from(new Set(parsedIds.data));
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("contact_leads")
    .delete()
    .in("id", uniqueIds);

  if (error) {
    console.error("Failed to bulk delete leads:", error);
    return {
      ok: false,
      error: "Não foi possível excluir os leads selecionados.",
    };
  }

  revalidateLeadPaths();
  return { ok: true, count: uniqueIds.length };
}
