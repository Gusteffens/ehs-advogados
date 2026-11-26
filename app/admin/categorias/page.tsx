import { AlertCircle } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CategoriesManager,
  type AdminCategoryItem,
} from "@/components/admin/categories-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, color_hex")
    .order("name");

  const categories: AdminCategoryItem[] = (data ?? []).map((item) => ({
    id: String(item.id),
    name: item.name,
    slug: item.slug,
    color_hex: item.color_hex,
  }));

  return (
    <div className="max-w-5xl mx-auto pt-28 lg:pt-0">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">
          Categorias do Blog
        </h1>
        <p className="text-forest-600 text-sm">
          Organize os temas jurídicos exibidos nos artigos e filtros do blog.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>
            Não foi possível carregar as categorias. Tente recarregar a página.
          </span>
        </div>
      )}

      <CategoriesManager categories={categories} />
    </div>
  );
}
