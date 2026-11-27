import { AlertCircle } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { CategoriesManager } from "@/components/admin/categories-manager";
import type { AdminCategoryItem } from "@/types/blog";

export const dynamic = "force-dynamic";

async function loadCategoriesWithOptionalDescription(
  supabase: ReturnType<typeof createAdminClient>
): Promise<{
  rows: Array<{
    id: string;
    name: string;
    slug: string;
    color_hex: string | null;
    description?: string | null;
  }>;
  error: unknown;
}> {
  // Try selecting optional description column first, gracefully falling back if not in schema
  const untyped = supabase as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        order: (col: string) => Promise<{
          data: Array<{
            id: string;
            name: string;
            slug: string;
            color_hex: string | null;
            description?: string | null;
          }> | null;
          error: { message?: string } | null;
        }>;
      };
    };
  };

  const withDesc = await untyped
    .from("categories")
    .select("id, name, slug, color_hex, description")
    .order("name");

  if (!withDesc.error && withDesc.data) {
    return { rows: withDesc.data, error: null };
  }

  const fallback = await supabase
    .from("categories")
    .select("id, name, slug, color_hex")
    .order("name");

  return { rows: fallback.data ?? [], error: fallback.error };
}

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const supabase = createAdminClient();
  const [{ rows, error }, { data: postCategoryRows }] = await Promise.all([
    loadCategoriesWithOptionalDescription(supabase),
    supabase.from("posts").select("category_id"),
  ]);

  const countByCategoryId = new Map<string, number>();
  for (const row of postCategoryRows ?? []) {
    if (row.category_id) {
      const key = String(row.category_id);
      countByCategoryId.set(key, (countByCategoryId.get(key) ?? 0) + 1);
    }
  }

  const categories: AdminCategoryItem[] = rows.map((item) => {
    const id = String(item.id);
    return {
      id,
      name: item.name,
      slug: item.slug,
      color_hex: item.color_hex,
      description: item.description ?? null,
      postCount: countByCategoryId.get(id) ?? 0,
    };
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-7">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-1">
          Categorias do Blog
        </h1>
        <p className="text-forest-600 text-sm">
          Organize os temas jurídicos exibidos nos artigos e filtros do blog.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-6 flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>
            Não foi possível carregar as categorias. Tente recarregar a página.
          </span>
        </div>
      ) : null}

      <CategoriesManager categories={categories} />
    </div>
  );
}
