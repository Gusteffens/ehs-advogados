import Link from "next/link";
import { AlertCircle, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  PostsTable,
  type AdminPostListItem,
} from "@/components/admin/posts-table";

export const dynamic = "force-dynamic";

interface RawAdminPostRow {
  id: string;
  title: string;
  status: string;
  created_at: string;
  views: number | null;
  categories: { name: string } | Array<{ name: string }> | null;
}

export default async function PostsPage() {
  await requireAdmin();

  const supabase = createAdminClient();
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, status, created_at, views, categories(name)")
    .order("created_at", { ascending: false });

  const normalizedPosts: AdminPostListItem[] = (
    (posts ?? []) as RawAdminPostRow[]
  ).map((post) => {
    const categoryRelation = Array.isArray(post.categories)
      ? (post.categories[0] ?? null)
      : post.categories;

    return {
      id: post.id,
      title: post.title,
      status: post.status,
      created_at: post.created_at,
      views: post.views,
      categoryName: categoryRelation?.name ?? null,
    };
  });

  return (
    <div className="max-w-5xl mx-auto pt-28 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink mb-1">
            Postagens
          </h1>
          <p className="text-forest-600 text-sm">
            {normalizedPosts.length}{" "}
            {normalizedPosts.length === 1
              ? "artigo no total"
              : "artigos no total"}
          </p>
        </div>
        <Link href="/admin/posts/novo">
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

      <PostsTable posts={normalizedPosts} />
    </div>
  );
}
