"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
} from "lucide-react";
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
type SortField = "title" | "created_at" | "status" | "views";
type SortDirection = "asc" | "desc";

const PAGE_SIZE = 15;

interface PostsTableProps {
  posts: AdminPostListItem[];
}

function formatAdminDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

function SortIcon({
  field,
  activeField,
  direction,
}: {
  field: SortField;
  activeField: SortField;
  direction: SortDirection;
}) {
  if (field !== activeField) {
    return <ArrowUpDown className="h-3 w-3 opacity-45" />;
  }
  return direction === "asc" ? (
    <ArrowUp className="h-3 w-3 text-ink" />
  ) : (
    <ArrowDown className="h-3 w-3 text-ink" />
  );
}

export function PostsTable({ posts }: PostsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    let published = 0;
    let draft = 0;
    for (const post of posts) {
      if (post.status === "published") published += 1;
      else draft += 1;
    }
    return { all: posts.length, published, draft };
  }, [posts]);

  const sortedAndFilteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = posts.filter((post) => {
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

    const factor = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortField) {
        case "title":
          return a.title.localeCompare(b.title, "pt-BR") * factor;
        case "status":
          return a.status.localeCompare(b.status) * factor;
        case "views":
          return ((a.views ?? 0) - (b.views ?? 0)) * factor;
        case "created_at":
        default:
          return (
            (new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()) *
            factor
          );
      }
    });
  }, [posts, search, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedAndFilteredPosts.length / PAGE_SIZE)
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedPosts = sortedAndFilteredPosts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSort = (field: SortField) => {
    setPage(1);
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "title" ? "asc" : "desc");
    }
  };

  const filterButtons: Array<{
    key: StatusFilter;
    label: string;
    count: number;
  }> = [
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
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
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
                onClick={() => {
                  setStatusFilter(btn.key);
                  setPage(1);
                }}
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
                <th className="px-6 py-3.5">
                  <button
                    type="button"
                    onClick={() => handleSort("title")}
                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-forest-600 hover:text-ink transition-colors"
                  >
                    Título
                    <SortIcon
                      field="title"
                      activeField={sortField}
                      direction={sortDir}
                    />
                  </button>
                </th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-forest-600 hidden sm:table-cell">
                  Categoria
                </th>
                <th className="px-6 py-3.5 hidden md:table-cell">
                  <button
                    type="button"
                    onClick={() => handleSort("created_at")}
                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-forest-600 hover:text-ink transition-colors"
                  >
                    Data
                    <SortIcon
                      field="created_at"
                      activeField={sortField}
                      direction={sortDir}
                    />
                  </button>
                </th>
                <th className="px-6 py-3.5">
                  <button
                    type="button"
                    onClick={() => handleSort("status")}
                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-forest-600 hover:text-ink transition-colors"
                  >
                    Status
                    <SortIcon
                      field="status"
                      activeField={sortField}
                      direction={sortDir}
                    />
                  </button>
                </th>
                <th className="px-6 py-3.5 hidden lg:table-cell">
                  <button
                    type="button"
                    onClick={() => handleSort("views")}
                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-forest-600 hover:text-ink transition-colors"
                  >
                    Views
                    <SortIcon
                      field="views"
                      activeField={sortField}
                      direction={sortDir}
                    />
                  </button>
                </th>
                <th className="px-6 py-3.5 w-32">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-50">
              {paginatedPosts.length > 0 ? (
                paginatedPosts.map((post) => (
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

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-forest-100 bg-cream/30 text-xs text-forest-600">
            <span>
              Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(
                currentPage * PAGE_SIZE,
                sortedAndFilteredPosts.length
              )}{" "}
              de {sortedAndFilteredPosts.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-forest-200 bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-cream disabled:opacity-45 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Anterior
              </button>
              <span className="font-medium text-ink">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-forest-200 bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-cream disabled:opacity-45 disabled:pointer-events-none transition-colors"
              >
                Próxima
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
