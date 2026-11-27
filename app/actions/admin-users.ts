"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminSession, isDevBootstrapActive } from "@/lib/auth";
import {
  ADMIN_SESSION_COOKIE,
  DEFAULT_SESSION_TTL_SECONDS,
  signSessionToken,
} from "@/lib/auth-session";
import {
  constantTimeEqual,
  hashPassword,
  verifyPassword,
} from "@/lib/auth-password";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

const createAdminUserSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome completo (mínimo 2 caracteres).")
    .max(120, "O nome pode ter no máximo 120 caracteres."),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .max(128, "A senha pode ter no máximo 128 caracteres."),
});

const changeOwnPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Informe sua senha atual."),
  newPassword: z
    .string()
    .min(8, "A nova senha deve ter pelo menos 8 caracteres.")
    .max(128, "A nova senha pode ter no máximo 128 caracteres."),
});

const resetPasswordSchema = z.object({
  id: z.string().uuid("Identificador de administrador inválido."),
  newPassword: z
    .string()
    .min(8, "A nova senha deve ter pelo menos 8 caracteres.")
    .max(128, "A nova senha pode ter no máximo 128 caracteres."),
});

const uuidSchema = z.string().uuid("Identificador de administrador inválido.");

function isMissingTableError(
  error: { code?: string; message?: string } | null | undefined
): boolean {
  if (!error) return false;
  if (error.code === "42P01" || error.code === "PGRST205") {
    return true;
  }
  const msg = (error.message ?? "").toLowerCase();
  return msg.includes("does not exist") || msg.includes("could not find the table");
}

function verifyBootstrapPassword(inputPassword: string): boolean {
  const envPassword = process.env.ADMIN_PASSWORD?.trim();
  if (envPassword) {
    if (envPassword.startsWith("scrypt:")) {
      return verifyPassword(inputPassword, envPassword);
    }
    return constantTimeEqual(inputPassword, envPassword);
  }

  if (isDevBootstrapActive()) {
    return constantTimeEqual(inputPassword, "admin123");
  }

  return false;
}

export async function listAdminUsers(): Promise<{
  ok: boolean;
  migrationReady: boolean;
  users: AdminUserRow[];
  error?: string;
}> {
  const session = await getAdminSession();
  if (!session.userId || !session.isAdmin) {
    return {
      ok: false,
      migrationReady: false,
      users: [],
      error: "Não autenticado.",
    };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, email, name, is_active, last_login_at, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      if (isMissingTableError(error)) {
        return { ok: true, migrationReady: false, users: [] };
      }
      return {
        ok: false,
        migrationReady: true,
        users: [],
        error: "Erro ao listar administradores.",
      };
    }

    return {
      ok: true,
      migrationReady: true,
      users: (data ?? []) as AdminUserRow[],
    };
  } catch (error) {
    console.error("[admin-users] listAdminUsers failed:", error);
    return {
      ok: false,
      migrationReady: false,
      users: [],
      error: "Supabase não está configurado ou inacessível.",
    };
  }
}

export async function createAdminUser(input: {
  email: string;
  name: string;
  password: string;
}): Promise<{ ok: boolean; user?: AdminUserRow; error?: string }> {
  const session = await getAdminSession();
  if (!session.userId || !session.isAdmin) {
    return { ok: false, error: "Não autenticado." };
  }

  const parsed = createAdminUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Dados inválidos.",
    };
  }

  try {
    const supabase = createAdminClient();
    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    const passwordHash = hashPassword(parsed.data.password);

    const { data, error } = await supabase
      .from("admin_users")
      .insert({
        email: normalizedEmail,
        name: parsed.data.name.trim(),
        password_hash: passwordHash,
        is_active: true,
      })
      .select("id, email, name, is_active, last_login_at, created_at")
      .single();

    if (error) {
      if (isMissingTableError(error)) {
        return {
          ok: false,
          error:
            "A tabela admin_users ainda não existe. Aplique a migration 004_admin_auth.sql no Supabase.",
        };
      }
      if (error.code === "23505") {
        return {
          ok: false,
          error: "Já existe um administrador cadastrado com este e-mail.",
        };
      }
      console.error("[admin-users] createAdminUser error:", error.message);
      return { ok: false, error: "Erro ao cadastrar administrador." };
    }

    revalidatePath("/admin/perfil");
    return { ok: true, user: data as AdminUserRow };
  } catch (error) {
    console.error("[admin-users] createAdminUser exception:", error);
    return { ok: false, error: "Erro interno ao cadastrar administrador." };
  }
}

export async function changeOwnPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session.userId || !session.isAdmin || !session.email) {
    return { ok: false, error: "Não autenticado." };
  }

  const parsed = changeOwnPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Dados inválidos.",
    };
  }

  try {
    const supabase = createAdminClient();
    const normalizedEmail = session.email.trim().toLowerCase();

    const { data: existingRow, error: lookupError } = await supabase
      .from("admin_users")
      .select("id, name, password_hash")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (lookupError) {
      if (isMissingTableError(lookupError)) {
        return {
          ok: false,
          error:
            "A tabela admin_users ainda não existe. Aplique a migration 004_admin_auth.sql no Supabase para alterar senhas pelo painel.",
        };
      }
      return { ok: false, error: "Erro ao verificar sua conta." };
    }

    const nowIso = new Date().toISOString();
    const newHash = hashPassword(parsed.data.newPassword);
    let resolvedUserId: string | null = existingRow?.id ?? null;
    const resolvedName = existingRow?.name ?? (session.name?.trim() || "Administrador");

    if (existingRow) {
      if (!verifyPassword(parsed.data.currentPassword, existingRow.password_hash)) {
        return { ok: false, error: "A senha atual está incorreta." };
      }

      const { error: updateError } = await supabase
        .from("admin_users")
        .update({
          password_hash: newHash,
          updated_at: nowIso,
        })
        .eq("id", existingRow.id);

      if (updateError) {
        return { ok: false, error: "Não foi possível atualizar a senha." };
      }
    } else {
      // Logged in via .env bootstrap or local dev fallback: verify bootstrap password and persist in admin_users
      if (!verifyBootstrapPassword(parsed.data.currentPassword)) {
        return { ok: false, error: "A senha atual está incorreta." };
      }

      const { data: upsertedRow, error: upsertError } = await supabase
        .from("admin_users")
        .upsert(
          {
            email: normalizedEmail,
            name: resolvedName,
            password_hash: newHash,
            is_active: true,
            last_login_at: nowIso,
            updated_at: nowIso,
          },
          { onConflict: "email" }
        )
        .select("id")
        .single();

      if (upsertError) {
        console.error("[admin-users] upsert own password failed:", upsertError.message);
        return {
          ok: false,
          error: "Não foi possível salvar a nova senha no banco de dados.",
        };
      }
      resolvedUserId = upsertedRow?.id ?? null;
    }

    // Upgrade .env/dev bootstrap cookie to the persisted DB UUID so session identity stays synced
    if (resolvedUserId && session.userId !== resolvedUserId) {
      try {
        const refreshedToken = await signSessionToken(
          {
            sub: resolvedUserId,
            email: normalizedEmail,
            name: resolvedName,
            role: "admin",
          },
          DEFAULT_SESSION_TTL_SECONDS
        );
        const cookieStore = await cookies();
        cookieStore.set({
          name: ADMIN_SESSION_COOKIE,
          value: refreshedToken,
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: DEFAULT_SESSION_TTL_SECONDS,
        });
      } catch {
        // Non-blocking: password is already persisted in DB
      }
    }

    revalidatePath("/admin/perfil");
    return { ok: true };
  } catch (error) {
    console.error("[admin-users] changeOwnPassword exception:", error);
    return { ok: false, error: "Erro interno ao alterar a senha." };
  }
}

export async function toggleAdminUserActive(
  id: string,
  isActive: boolean
): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session.userId || !session.isAdmin) {
    return { ok: false, error: "Não autenticado." };
  }

  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: "Identificador de administrador inválido." };
  }

  if (!isActive && session.userId === parsedId.data) {
    return {
      ok: false,
      error: "Você não pode desativar sua própria conta.",
    };
  }

  try {
    const supabase = createAdminClient();

    // Prevent self-deactivation even when current session originated from .env bootstrap
    if (!isActive && session.email) {
      const { data: targetRow } = await supabase
        .from("admin_users")
        .select("email")
        .eq("id", parsedId.data)
        .maybeSingle();

      if (
        targetRow?.email &&
        targetRow.email.trim().toLowerCase() === session.email.trim().toLowerCase()
      ) {
        return {
          ok: false,
          error: "Você não pode desativar sua própria conta.",
        };
      }
    }

    const { error } = await supabase
      .from("admin_users")
      .update({
        is_active: Boolean(isActive),
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsedId.data);

    if (error) {
      if (isMissingTableError(error)) {
        return {
          ok: false,
          error:
            "A tabela admin_users ainda não existe. Aplique a migration 004_admin_auth.sql.",
        };
      }
      return { ok: false, error: "Erro ao atualizar status do administrador." };
    }

    revalidatePath("/admin/perfil");
    return { ok: true };
  } catch (error) {
    console.error("[admin-users] toggleAdminUserActive exception:", error);
    return { ok: false, error: "Erro interno ao atualizar administrador." };
  }
}

export async function resetAdminUserPassword(
  id: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session.userId || !session.isAdmin) {
    return { ok: false, error: "Não autenticado." };
  }

  const parsed = resetPasswordSchema.safeParse({ id, newPassword });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Dados inválidos.",
    };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("admin_users")
      .update({
        password_hash: hashPassword(parsed.data.newPassword),
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.id);

    if (error) {
      if (isMissingTableError(error)) {
        return {
          ok: false,
          error:
            "A tabela admin_users ainda não existe. Aplique a migration 004_admin_auth.sql.",
        };
      }
      return { ok: false, error: "Erro ao redefinir senha do administrador." };
    }

    revalidatePath("/admin/perfil");
    return { ok: true };
  } catch (error) {
    console.error("[admin-users] resetAdminUserPassword exception:", error);
    return { ok: false, error: "Erro interno ao redefinir senha." };
  }
}
