import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { PostForm } from "@/components/admin/post-form";
import type { AuthorOption, CategoryOption, EditablePost } from "@/types/blog";

export const dynamic = "force-dynamic";

async function loadPostTagsBestEffort(
  supabase: ReturnType<typeof createAdminClient>,
  postId: string
): Promise<string[]> {
  try {
    const untyped = supabase as unknown as {
      from: (table: string) => {
        select: (cols: string) => {
          eq: (
            col: string,
            val: string
          ) => Promise<{
            data: Array<{
              tags?: { name?: string } | Array<{ name?: string }> | null;
            }> | null;
            error: unknown;
          }>;
        };
      };
    };

    const { data, error } = await untyped
      .from("post_tags")
      .select("tags(name)")
      .eq("post_id", postId);

    if (error || !data) return [];

    const names: string[] = [];
    for (const row of data) {
      const rel = Array.isArray(row.tags) ? row.tags[0] : row.tags;
      if (rel?.name) names.push(rel.name);
    }
    return names;
  } catch {
    return [];
  }
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const supabase = createAdminClient();

  const [
    { data: post, error },
    { data: categoriesData },
    { data: authorsData },
    tags,
  ] = await Promise.all([
    supabase
      .from("posts")
      .select(
        "id, title, slug, excerpt, content, cover_image_url, status, author_id, category_id, published_at, updated_at, created_at"
      )
      .eq("id", id)
      .single(),
    supabase
      .from("categories")
      .select("id, name, slug, color_hex")
      .order("name"),
    supabase.from("authors").select("id, full_name, slug").order("full_name"),
    loadPostTagsBestEffort(supabase, id),
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
    published_at: post.published_at,
    updated_at: post.updated_at,
    created_at: post.created_at,
    tags,
  };

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

  return (
    <PostForm
      mode="edit"
      initialPost={initialPost}
      categories={categories}
      authors={authors}
    />
  );
}
