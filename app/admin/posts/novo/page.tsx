import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { PostForm } from "@/components/admin/post-form";
import type { AuthorOption, CategoryOption } from "@/types/blog";

export const dynamic = "force-dynamic";

export default async function NovoPostPage() {
  await requireAdmin();

  const supabase = createAdminClient();
  const [{ data: categoriesData }, { data: authorsData }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, color_hex")
      .order("name"),
    supabase.from("authors").select("id, full_name, slug").order("full_name"),
  ]);

  const categories: CategoryOption[] = (categoriesData ?? []).map((item) => ({
    id: String(item.id),
    name: item.name,
    slug: item.slug,
    color_hex: item.color_hex,
  }));

  const authors: AuthorOption[] = (authorsData ?? []).map((item) => ({
    id: item.id,
    full_name: item.full_name,
    slug: item.slug,
  }));

  return <PostForm mode="create" categories={categories} authors={authors} />;
}
