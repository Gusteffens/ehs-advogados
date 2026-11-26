import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Eye,
  FileText,
  Inbox,
  PenSquare,
  Tag,
  TrendingUp,
  User,
} from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function formatAdminDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

interface EditorialAlert {
  postId: string;
  title: string;
  reasons: string[];
}

export default async function AdminDashboard() {
  await requireAdmin();

  const supabase = createAdminClient();
  const [user, { data: posts, error }] = await Promise.all([
    currentUser(),
    supabase
      .from("posts")
      .select(
        "id, title, status, created_at, updated_at, views, excerpt, cover_image_url, category_id"
      )
      .order("created_at", { ascending: false }),
  ]);

  const safePosts = posts ?? [];

  const totalPosts = safePosts.filter((p) => p.status === "published").length;
  const totalDrafts = safePosts.filter((p) => p.status === "draft").length;
  const totalViews = safePosts.reduce((acc, curr) => acc + (curr.views ?? 0), 0);

  const recentPosts = safePosts.slice(0, 5);

  const topReadPosts = [...safePosts]
    .filter((p) => p.status === "published" && (p.views ?? 0) > 0)
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 5);

  const now = new Date().getTime();
  const editorialAlerts: EditorialAlert[] = [];

  for (const post of safePosts) {
    const reasons: string[] = [];

    if (post.status === "published") {
      if (!post.excerpt || !post.excerpt.trim()) reasons.push("sem resumo (SEO)");
      if (!post.cover_image_url) reasons.push("sem imagem de capa");
      if (!post.category_id) reasons.push("sem categoria");
    } else if (post.status === "draft") {
      const lastTouch = post.updated_at || post.created_at;
      if (lastTouch && now - new Date(lastTouch).getTime() > SEVEN_DAYS_MS) {
        reasons.push("rascunho parado há mais de 7 dias");
      }
    }

    if (reasons.length > 0) {
      editorialAlerts.push({
        postId: post.id,
        title: post.title,
        reasons,
      });
    }
  }

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
            Não foi possível carregar as métricas dos artigos. Tente recarregar a
            página.
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

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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
                href="/admin/categorias"
                className="flex items-center gap-3 rounded-xl bg-forest-600/50 px-4 py-3 text-sm text-cream hover:text-ink hover:bg-cream transition-all no-underline"
              >
                <Tag className="h-4 w-4" />
                Categorias
              </Link>
              <Link
                href="/admin/leads"
                className="flex items-center gap-3 rounded-xl bg-forest-600/50 px-4 py-3 text-sm text-cream hover:text-ink hover:bg-cream transition-all no-underline"
              >
                <Inbox className="h-4 w-4" />
                Leads de Contato
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

      {/* Insights row: Top Read + Editorial/SEO Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Mais Lidos */}
        <div className="rounded-2xl bg-white border border-forest-200/70 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              <TrendingUp className="h-4 w-4 text-gold-dark" />
              Mais Lidos
            </h2>
            <span className="text-[11px] text-forest-600">Top 5 publicados</span>
          </div>

          {topReadPosts.length > 0 ? (
            <ol className="space-y-1.5">
              {topReadPosts.map((post, idx) => (
                <li key={post.id}>
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="flex items-center gap-3 rounded-xl p-2.5 -mx-1 hover:bg-cream/70 transition-colors no-underline group"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cream text-xs font-bold text-forest-700">
                      {idx + 1}
                    </span>
                    <span className="flex-1 min-w-0 text-sm font-medium text-ink truncate group-hover:text-forest-600 transition-colors">
                      {post.title}
                    </span>
                    <span className="shrink-0 flex items-center gap-1 text-xs font-semibold text-forest-700">
                      <Eye className="h-3.5 w-3.5 text-gold-dark" />
                      {post.views ?? 0}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-forest-600 py-4">
              Ainda não há artigos publicados com visualizações registradas.
            </p>
          )}
        </div>

        {/* Alertas Editoriais / SEO */}
        <div className="rounded-2xl bg-white border border-forest-200/70 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              <AlertTriangle className="h-4 w-4 text-champagne-700" />
              Alertas Editoriais / SEO
            </h2>
            <span className="text-[11px] font-medium text-forest-600">
              {editorialAlerts.length}{" "}
              {editorialAlerts.length === 1 ? "pendência" : "pendências"}
            </span>
          </div>

          {editorialAlerts.length > 0 ? (
            <ul className="space-y-2">
              {editorialAlerts.slice(0, 6).map((item) => (
                <li key={item.postId}>
                  <Link
                    href={`/admin/posts/${item.postId}`}
                    className="block rounded-xl border border-champagne-200 bg-champagne-50/60 px-3.5 py-2.5 hover:bg-champagne-100/70 transition-colors no-underline"
                  >
                    <p className="text-sm font-medium text-ink truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-champagne-800 mt-0.5">
                      {item.reasons.join(" · ")}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-forest-600 py-4">
              Tudo em dia! Todos os artigos publicados possuem resumo, capa e
              categoria, e não há rascunhos parados há mais de 7 dias.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
