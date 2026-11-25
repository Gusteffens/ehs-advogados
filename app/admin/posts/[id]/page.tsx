import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  PostForm,
  type CategorySelectOption,
} from "@/components/admin/post-form";
import type { AuthorOption, EditablePost } from "@/types/blog";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: post, error }, { data: categoriesData }, { data: authorsData }] =
    await Promise.all([
      supabase
        .from("posts")
        .select(
          "id, title, slug, excerpt, content, cover_image_url, status, author_id, category_id"
        )
        .eq("id", id)
        .single(),
      supabase.from("categories").select("id, name").order("name"),
      supabase.from("authors").select("id, full_name, slug").order("full_name"),
    ]);

  if (error || !post) {
    notFound();
  }

  const initialPost: EditablePost = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    cover_image_url: post.cover_image_url,
    status: post.status,
    author_id: post.author_id,
    category_id: post.category_id ? String(post.category_id) : null,
  };

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
    <PostForm
      mode="edit"
      initialPost={initialPost}
      categories={categories}
      authors={authors}
    />
  );
}
