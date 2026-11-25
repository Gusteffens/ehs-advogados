"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Eye, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PostActions } from "@/components/admin/post-actions";
import { cn } from "@/lib/utils";

export interface AdminPostListItem {
  id: string;
  title: string;
  status: string;
  created_at: string;
  views: number | null;
  categoryName: string | null;
}

type StatusFilter = "all" | "published" | "draft";

interface PostsTableProps {
  posts: AdminPostListItem[];
}

function formatAdminDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

export function PostsTable({ posts }: PostsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const counts = useMemo(() => {
    let published = 0;
    let draft = 0;
    for (const post of posts) {
      if (post.status === "published") published += 1;
      else draft += 1;
    }
    return { all: posts.length, published, draft };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return posts.filter((post) => {
      if (statusFilter === "published" && post.status !== "published") {
        return false;
      }
      if (statusFilter === "draft" && post.status === "published") {
        return false;
      }
      if (query) {
        const matchesTitle = post.title.toLowerCase().includes(query);
        const matchesCategory = post.categoryName?.toLowerCase().includes(query);
        return Boolean(matchesTitle || matchesCategory);
      }
      return true;
    });
  }, [posts, search, statusFilter]);

  const filterButtons: Array<{ key: StatusFilter; label: string; count: number }> = [
    { key: "all", label: "Todos", count: counts.all },
    { key: "published", label: "Publicados", count: counts.published },
    { key: "draft", label: "Rascunhos", count: counts.draft },
  ];

  return (
    <>
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-600 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar artigos por título ou categoria..."
            aria-label="Buscar artigos"
            className="w-full rounded-xl border border-forest-200 bg-white pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-forest-600/70 focus:outline-none focus:ring-2 focus:ring-champagne-500/50 focus:border-gold transition-all"
          />
        </div>
        <div className="flex gap-2" role="group" aria-label="Filtrar por status">
          {filterButtons.map((btn) => {
            const active = statusFilter === btn.key;
            return (
              <button
                key={btn.key}
                type="button"
                onClick={() => setStatusFilter(btn.key)}
                aria-pressed={active}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap",
                  active
                    ? "bg-primary text-cream shadow-xs"
                    : "border border-forest-200 bg-white text-forest-700 hover:bg-cream"
                )}
              >
                {btn.label} ({btn.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-forest-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-forest-100 bg-cream/50">
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-forest-600">
                  Título
                </th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-forest-600 hidden sm:table-cell">
                  Categoria
                </th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-forest-600 hidden md:table-cell">
                  Data
                </th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-forest-600">
                  Status
                </th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-forest-600 hidden lg:table-cell">
                  Views
                </th>
                <th className="px-6 py-3.5 w-24">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-50">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="group hover:bg-cream/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="no-underline"
                      >
                        <p className="text-sm font-medium text-ink group-hover:text-forest-600 transition-colors line-clamp-1 max-w-xs lg:max-w-md">
                          {post.title}
                        </p>
                        <span className="flex items-center gap-1.5 text-xs text-forest-600 mt-1 sm:hidden">
                          {post.categoryName || "Sem categoria"}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <Badge variant="outline" size="sm">
                        {post.categoryName || "Sem categoria"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="flex items-center gap-1.5 text-xs text-forest-600">
                        <Calendar className="h-3 w-3" />
                        {formatAdminDate(post.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider",
                          post.status === "published"
                            ? "bg-forest-100 text-forest-800"
                            : "bg-champagne-200/70 text-champagne-800"
                        )}
                      >
                        {post.status === "published" ? "Publicado" : "Rascunho"}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="flex items-center gap-1.5 text-xs text-forest-600">
                        <Eye className="h-3 w-3" />
                        {post.views ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <PostActions id={post.id} title={post.title} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-forest-600"
                  >
                    {search.trim() || statusFilter !== "all"
                      ? "Nenhum artigo corresponde aos filtros selecionados."
                      : "Nenhum artigo cadastrado ainda."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
