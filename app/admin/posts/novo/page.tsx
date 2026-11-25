import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  PostForm,
  type CategorySelectOption,
} from "@/components/admin/post-form";
import type { AuthorOption } from "@/types/blog";

export const dynamic = "force-dynamic";

export default async function NovoPostPage() {
  await requireAdmin();

  const supabase = createAdminClient();
  const [{ data: categoriesData }, { data: authorsData }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("authors").select("id, full_name, slug").order("full_name"),
  ]);

  const categories: CategorySelectOption[] = (categoriesData ?? []).map(
    (item) => ({
      id: String(item.id),
      name: item.name,
    })
  );

  const authors: AuthorOption[] = (authorsData ?? []).map((item) => ({
    id: item.id,
    full_name: item.full_name,
    slug: item.slug,
  }));

  return (
    <PostForm mode="create" categories={categories} authors={authors} />
  );
}
