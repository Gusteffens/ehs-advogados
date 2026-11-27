import Link from "next/link";
import { AlertCircle, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { PostsTable } from "@/components/admin/posts-table";
import type {
  AdminPostListItem,
  AuthorOption,
  CategoryOption,
} from "@/types/blog";

export const dynamic = "force-dynamic";

interface RawAdminPostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  status: string;
  created_at: string;
  published_at: string | null;
  updated_at: string | null;
  reading_time_min: number | null;
  views: number | null;
  author_id: string | null;
  category_id: string | null;
  categories:
    | { id: string; name: string; color_hex: string | null }
    | Array<{ id: string; name: string; color_hex: string | null }>
    | null;
  authors:
    | { id: string; full_name: string; slug: string | null }
    | Array<{ id: string; full_name: string; slug: string | null }>
    | null;
}

export default async function PostsPage() {
  await requireAdmin();

  const supabase = createAdminClient();
  const [
    { data: posts, error },
    { data: categoriesData },
    { data: authorsData },
  ] = await Promise.all([
    supabase
      .from("posts")
      .select(
        "id, title, slug, excerpt, cover_image_url, status, created_at, published_at, updated_at, reading_time_min, views, author_id, category_id, categories(id, name, color_hex), authors(id, full_name, slug)"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("id, name, slug, color_hex")
      .order("name"),
    supabase.from("authors").select("id, full_name, slug").order("full_name"),
  ]);

  const normalizedPosts: AdminPostListItem[] = (
    (posts ?? []) as unknown as RawAdminPostRow[]
  ).map((post) => {
    const categoryRelation = Array.isArray(post.categories)
      ? (post.categories[0] ?? null)
      : post.categories;
    const authorRelation = Array.isArray(post.authors)
      ? (post.authors[0] ?? null)
      : post.authors;

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      cover_image_url: post.cover_image_url,
      status: post.status,
      created_at: post.created_at,
      published_at: post.published_at,
      updated_at: post.updated_at,
      reading_time_min: post.reading_time_min,
      views: post.views,
      uniqueViews: post.views ?? 0,
      categoryId: post.category_id ? String(post.category_id) : null,
      categoryName: categoryRelation?.name ?? null,
      categoryColor: categoryRelation?.color_hex ?? null,
      authorId: post.author_id,
      authorName: authorRelation?.full_name ?? null,
      authorSlug: authorRelation?.slug ?? null,
    };
  });

  const categories: CategoryOption[] = (categoriesData ?? []).map((c) => ({
    id: String(c.id),
    name: c.name,
    slug: c.slug,
    color_hex: c.color_hex,
  }));

  const authors: AuthorOption[] = (authorsData ?? []).map((a) => ({
    id: a.id,
    full_name: a.full_name,
    slug: a.slug,
  }));

  const publishedCount = normalizedPosts.filter(
    (p) => p.status === "published"
  ).length;
  const draftCount = normalizedPosts.length - publishedCount;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-1">
            Artigos & Publicações
          </h1>
          <p className="text-forest-600 text-sm">
            {normalizedPosts.length}{" "}
            {normalizedPosts.length === 1 ? "artigo" : "artigos"} no acervo ·{" "}
            {publishedCount} publicado{publishedCount === 1 ? "" : "s"} ·{" "}
            {draftCount} rascunho{draftCount === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/admin/posts/novo" className="no-underline">
          <Button variant="secondary" className="group">
            <PenSquare className="h-4 w-4" />
            Novo Artigo
          </Button>
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>
            Não foi possível carregar as postagens. Tente recarregar a página.
          </span>
        </div>
      )}

      <PostsTable
        posts={normalizedPosts}
        categories={categories}
        authors={authors}
      />
    </div>
  );
}
