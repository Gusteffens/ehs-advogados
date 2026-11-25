import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  Eye,
  FileText,
  PenSquare,
  User,
} from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatAdminDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

export default async function AdminDashboard() {
  await requireAdmin();

  const supabase = createAdminClient();
  const [user, { data: posts, error }] = await Promise.all([
    currentUser(),
    supabase
      .from("posts")
      .select("id, title, status, created_at, views")
      .order("created_at", { ascending: false }),
  ]);

  const safePosts = posts ?? [];

  const totalPosts = safePosts.filter((p) => p.status === "published").length;
  const totalDrafts = safePosts.filter((p) => p.status === "draft").length;
  const totalViews = safePosts.reduce((acc, curr) => acc + (curr.views ?? 0), 0);

  const recentPosts = safePosts.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto pt-28 lg:pt-0">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-ink mb-2">
          Olá, {user?.firstName || "Administrador"}
        </h1>
        <p className="text-forest-600 text-sm">
          Bem-vindo(a) ao seu painel de gerenciamento.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>
            Não foi possível carregar as métricas dos artigos. Tente recarregar a página.
          </span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <div className="relative rounded-2xl bg-white border border-forest-200/70 p-5 overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-ink">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <p className="font-display text-2xl font-bold text-ink mb-1">
            {totalPosts}
          </p>
          <p className="text-forest-700 text-xs">Total de Posts Publicados</p>
        </div>

        <div className="relative rounded-2xl bg-white border border-forest-200/70 p-5 overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-ink">
              <PenSquare className="h-5 w-5" />
            </div>
          </div>
          <p className="font-display text-2xl font-bold text-ink mb-1">
            {totalDrafts}
          </p>
          <p className="text-forest-700 text-xs">Total de Rascunhos</p>
        </div>

        <div className="relative rounded-2xl bg-white border border-forest-200/70 p-5 overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-ink">
              <Eye className="h-5 w-5" />
            </div>
          </div>
          <p className="font-display text-2xl font-bold text-ink mb-1">
            {totalViews}
          </p>
          <p className="text-forest-700 text-xs">Total de Visualizações</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-forest-200/70 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-bold text-ink">
              Artigos Recentes
            </h2>
            <Link
              href="/admin/posts"
              className="flex items-center gap-1.5 text-xs text-gold-dark font-medium hover:text-ink no-underline transition-colors"
            >
              Ver todos
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-1">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/admin/posts/${post.id}`}
                  className="flex items-center gap-4 rounded-xl p-3 -mx-1 hover:bg-cream/70 transition-colors group no-underline"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate group-hover:text-forest-600 transition-colors">
                      {post.title}
                    </p>
                    <p className="text-xs text-forest-600 mt-0.5">
                      {post.created_at
                        ? formatAdminDate(post.created_at)
                        : "Sem data"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider",
                      post.status === "published"
                        ? "bg-forest-600 text-cream"
                        : "bg-champagne-200/70 text-champagne-800"
                    )}
                  >
                    {post.status === "published" ? "Publicado" : "Rascunho"}
                  </span>
                  {(post.views ?? 0) > 0 && (
                    <span className="shrink-0 flex items-center gap-1 text-xs text-forest-600">
                      <Eye className="h-3 w-3" />
                      {post.views}
                    </span>
                  )}
                </Link>
              ))
            ) : (
              <p className="text-sm text-forest-600 py-4">
                Nenhum artigo encontrado.
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-5">
          <div className="rounded-2xl bg-primary p-6">
            <h3 className="font-display text-base font-bold text-cream mb-4">
              Ações Rápidas
            </h3>
            <div className="space-y-2">
              <Link
                href="/admin/posts/novo"
                className="flex items-center gap-3 rounded-xl bg-gold border border-gold/15 px-4 py-3 text-sm font-medium text-ink hover:bg-gold-dark hover:text-cream transition-all no-underline"
              >
                <PenSquare className="h-4 w-4" />
                Novo Post
              </Link>
              <Link
                href="/admin/posts"
                className="flex items-center gap-3 rounded-xl bg-forest-600/50 px-4 py-3 text-sm text-cream hover:text-ink hover:bg-cream transition-all no-underline"
              >
                <FileText className="h-4 w-4" />
                Gerenciar Posts
              </Link>
              <Link
                href="/admin/perfil"
                className="flex items-center gap-3 rounded-xl bg-forest-600/50 px-4 py-3 text-sm text-cream hover:text-ink hover:bg-cream transition-all no-underline"
              >
                <User className="h-4 w-4" />
                Meu Perfil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
