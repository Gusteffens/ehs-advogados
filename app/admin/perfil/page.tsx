import { requireAdmin } from "@/lib/auth";
import { listAdminUsers } from "@/app/actions/admin-users";
import { createAdminClient } from "@/lib/supabase/admin";
import { AuthorProfileForm } from "@/components/admin/author-profile-form";
import type { Author } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const session = await requireAdmin();

  const [authorResult, adminUsersResult] = await Promise.all([
    (async (): Promise<Author | null> => {
      try {
        const supabase = createAdminClient();
        const { data } = await supabase
          .from("authors")
          .select("*")
          .eq("id", session.userId)
          .maybeSingle();
        return (data as Author | null) ?? null;
      } catch {
        return null;
      }
    })(),
    listAdminUsers(),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">
          Perfil & Autor
        </h1>
        <p className="text-forest-600 text-sm mt-1">
          Edite sua assinatura editorial exibida nos artigos do blog ou gerencie
          as credenciais e segurança da sua conta.
        </p>
      </div>

      <AuthorProfileForm
        initialAuthor={authorResult}
        userDefaults={{
          userId: session.userId,
          name: session.name,
          email: session.email,
          imageUrl: session.imageUrl,
        }}
        securityData={{
          users: adminUsersResult.users,
          migrationReady: adminUsersResult.migrationReady,
          error: adminUsersResult.error,
        }}
      />
    </div>
  );
}
