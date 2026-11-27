"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Loader2,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import {
  bulkDeletePosts,
  bulkUpdatePostsStatus,
  togglePostStatus,
} from "@/app/actions/blog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { PostActions } from "@/components/admin/post-actions";
import { useToast } from "@/components/admin/toast-provider";
import { cn, getErrorMessage } from "@/lib/utils";
import type {
  AdminPostListItem,
  AuthorOption,
  CategoryOption,
  PostStatus,
} from "@/types/blog";

export type { AdminPostListItem };

type StatusFilter = "all" | "published" | "draft";
type SortField = "title" | "date" | "views";
type SortDirection = "asc" | "desc";

const PAGE_SIZE = 15;

interface PostsTableProps {
  posts: AdminPostListItem[];
  categories: CategoryOption[];
  authors: AuthorOption[];
}

function formatAdminDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
}

function getSeoReadiness(post: AdminPostListItem): {
  level: "good" | "partial" | "poor";
  score: number;
  tooltip: string;
} {
  const missing: string[] = [];
  let points = 0;

  if (post.title.trim().length >= 25) points += 1;
  else missing.push("título curto (<25 chars)");

  if (post.excerpt && post.excerpt.trim().length >= 80) points += 1;
  else missing.push("resumo/meta descrição");

  if (post.cover_image_url) points += 1;
  else missing.push("imagem de capa");

  if (post.categoryId) points += 1;
  else missing.push("categoria");

  const level = points === 4 ? "good" : points >= 2 ? "partial" : "poor";
  const tooltip =
    missing.length === 0
      ? "SEO completo (4/4)"
      : `SEO ${points}/4 — Falta: ${missing.join(", ")}`;

  return { level, score: points, tooltip };
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

export function PostsTable({ posts, categories, authors }: PostsTableProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkActionPending, setBulkActionPending] = useState<
    "publish" | "draft" | "delete" | null
  >(null);
  const [isBulkTransition, startBulkTransition] = useTransition();
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setNowMs(Date.now());
    });
  }, []);

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
      if (categoryFilter && post.categoryId !== categoryFilter) {
        return false;
      }
      if (authorFilter && post.authorId !== authorFilter) {
        return false;
      }
      if (query) {
        const matchesTitle = post.title.toLowerCase().includes(query);
        const matchesSlug = post.slug.toLowerCase().includes(query);
        const matchesCategory = post.categoryName?.toLowerCase().includes(query);
        const matchesAuthor = post.authorName?.toLowerCase().includes(query);
        return Boolean(
          matchesTitle || matchesSlug || matchesCategory || matchesAuthor
        );
      }
      return true;
    });

    const factor = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortField) {
        case "title":
          return a.title.localeCompare(b.title, "pt-BR") * factor;
        case "views":
          return (a.uniqueViews - b.uniqueViews) * factor;
        case "date":
        default: {
          const dateA = new Date(a.published_at ?? a.created_at).getTime();
          const dateB = new Date(b.published_at ?? b.created_at).getTime();
          return (dateA - dateB) * factor;
        }
      }
    });
  }, [
    posts,
    search,
    statusFilter,
    categoryFilter,
    authorFilter,
    sortField,
    sortDir,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedAndFilteredPosts.length / PAGE_SIZE)
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedPosts = sortedAndFilteredPosts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const pageIds = paginatedPosts.map((p) => p.id);
  const allOnPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        for (const id of pageIds) next.delete(id);
      } else {
        for (const id of pageIds) next.add(id);
      }
      return next;
    });
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleSort = (field: SortField) => {
    setPage(1);
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "title" ? "asc" : "desc");
    }
  };

  const handleInlineStatusToggle = async (post: AdminPostListItem) => {
    if (togglingId) return;
    const nextStatus: PostStatus =
      post.status === "published" ? "draft" : "published";
    setTogglingId(post.id);

    try {
      const res = await togglePostStatus(post.id, nextStatus);
      if (!res.ok) {
        toast.error(
          "Falha ao alterar status",
          res.error ?? "Tente novamente."
        );
        return;
      }
      toast.success(
        nextStatus === "published"
          ? "Artigo publicado"
          : "Movido para rascunho",
        `"${post.title}"`
      );
      router.refresh();
    } catch (err: unknown) {
      toast.error("Erro ao alterar status", getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleBulkStatus = (targetStatus: PostStatus) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setBulkActionPending(targetStatus === "published" ? "publish" : "draft");
    startBulkTransition(async () => {
      try {
        const res = await bulkUpdatePostsStatus(ids, targetStatus);
        if (!res.ok) {
          toast.error("Erro na ação em lote", res.error ?? "Tente novamente.");
          return;
        }
        toast.success(
          targetStatus === "published"
            ? `${res.count ?? ids.length} artigo(s) publicado(s)`
            : `${res.count ?? ids.length} artigo(s) movido(s) para rascunho`
        );
        clearSelection();
        router.refresh();
      } catch (err: unknown) {
        toast.error("Erro na ação em lote", getErrorMessage(err));
      } finally {
        setBulkActionPending(null);
      }
    });
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setBulkError(null);
    setBulkActionPending("delete");
    startBulkTransition(async () => {
      try {
        const res = await bulkDeletePosts(ids);
        if (!res.ok) {
          const msg = res.error ?? "Não foi possível excluir os artigos.";
          setBulkError(msg);
          toast.error("Erro ao excluir em lote", msg);
          return;
        }
        setBulkConfirmOpen(false);
        clearSelection();
        toast.success(
          `${res.count ?? ids.length} artigo(s) excluído(s) com sucesso`
        );
        router.refresh();
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        setBulkError(msg);
        toast.error("Erro ao excluir em lote", msg);
      } finally {
        setBulkActionPending(null);
      }
    });
  };

  const hasActiveFilters = Boolean(
    search.trim() || statusFilter !== "all" || categoryFilter || authorFilter
  );

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
      {/* Filters & Search Bar */}
      <div className="space-y-3 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-600 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar por título, slug, categoria ou autor..."
              aria-label="Buscar artigos"
              className="w-full rounded-xl border border-forest-200 bg-white pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-forest-600/65 focus:outline-none focus:ring-2 focus:ring-champagne-500/50 focus:border-gold transition-all"
            />
          </div>

          {/* Status tabs */}
          <div
            className="flex gap-1.5 rounded-xl bg-cream/70 border border-forest-100 p-1"
            role="group"
            aria-label="Filtrar por status"
          >
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
                    "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap",
                    active
                      ? "bg-primary text-cream shadow-xs"
                      : "text-forest-700 hover:bg-white/70"
                  )}
                >
                  {btn.label}{" "}
                  <span
                    className={cn(
                      "ml-1 tabular-nums",
                      active ? "text-gold" : "text-forest-500"
                    )}
                  >
                    {btn.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category & Author Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filtrar por categoria"
              className="appearance-none rounded-xl border border-forest-200 bg-white pl-3.5 pr-9 py-2 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-champagne-500/50 focus:border-gold transition-all"
            >
              <option value="">Todas as categorias</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-forest-600" />
          </div>

          <div className="relative">
            <select
              value={authorFilter}
              onChange={(e) => {
                setAuthorFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filtrar por autor"
              className="appearance-none rounded-xl border border-forest-200 bg-white pl-3.5 pr-9 py-2 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-champagne-500/50 focus:border-gold transition-all"
            >
              <option value="">Todos os autores</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.full_name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-forest-600" />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setCategoryFilter("");
                setAuthorFilter("");
                setPage(1);
              }}
              className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-gold-dark hover:text-ink hover:bg-cream transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-forest-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-forest-100 bg-cream/55">
                <th className="pl-5 pr-2 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleSelectAllOnPage}
                    aria-label="Selecionar todos os artigos desta página"
                    className="h-4 w-4 rounded border-forest-300 accent-primary cursor-pointer"
                  />
                </th>
                <th className="px-3 py-3.5">
                  <button
                    type="button"
                    onClick={() => handleSort("title")}
                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-forest-600 hover:text-ink transition-colors"
                  >
                    Artigo
                    <SortIcon
                      field="title"
                      activeField={sortField}
                      direction={sortDir}
                    />
                  </button>
                </th>
                <th className="px-4 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-forest-600 hidden md:table-cell">
                  Categoria
                </th>
                <th className="px-4 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-forest-600 hidden xl:table-cell text-center">
                  SEO
                </th>
                <th className="px-4 py-3.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-forest-600">
                    Status
                  </span>
                </th>
                <th className="px-4 py-3.5 hidden sm:table-cell">
                  <button
                    type="button"
                    onClick={() => handleSort("date")}
                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-forest-600 hover:text-ink transition-colors"
                  >
                    Data
                    <SortIcon
                      field="date"
                      activeField={sortField}
                      direction={sortDir}
                    />
                  </button>
                </th>
                <th className="px-4 py-3.5 hidden lg:table-cell">
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
                <th className="pl-2 pr-5 py-3.5 w-36 text-right">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-50">
              {paginatedPosts.length > 0 ? (
                paginatedPosts.map((post) => {
                  const isSelected = selectedIds.has(post.id);
                  const isPublished = post.status === "published";
                  const isScheduled =
                    isPublished &&
                    Boolean(post.published_at) &&
                    nowMs !== null &&
                    new Date(post.published_at!).getTime() > nowMs;
                  const seo = getSeoReadiness(post);

                  return (
                    <tr
                      key={post.id}
                      className={cn(
                        "group transition-colors",
                        isSelected
                          ? "bg-champagne-50/70"
                          : "hover:bg-cream/35"
                      )}
                    >
                      {/* Checkbox */}
                      <td className="pl-5 pr-2 py-3.5 align-middle">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(post.id)}
                          aria-label={`Selecionar ${post.title}`}
                          className="h-4 w-4 rounded border-forest-300 accent-primary cursor-pointer"
                        />
                      </td>

                      {/* Cover thumbnail + Title + Author + Reading time */}
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <Link
                            href={`/admin/posts/${post.id}`}
                            className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-forest-100 bg-cream/70 flex items-center justify-center no-underline"
                          >
                            {post.cover_image_url ? (
                              <Image
                                src={post.cover_image_url}
                                alt={post.title}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            ) : (
                              <FileText className="h-4 w-4 text-forest-400" />
                            )}
                          </Link>

                          <div className="min-w-0">
                            <Link
                              href={`/admin/posts/${post.id}`}
                              className="no-underline block"
                            >
                              <p className="text-sm font-semibold text-ink group-hover:text-forest-700 transition-colors line-clamp-1 max-w-xs lg:max-w-md">
                                {post.title}
                              </p>
                            </Link>
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-0.5 text-[11px] text-forest-600/80">
                              <span>{post.authorName ?? "Sem autor"}</span>
                              <span aria-hidden="true" className="text-forest-300">
                                ·
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {post.reading_time_min ?? 1} min
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        {post.categoryName ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-200/80 bg-cream-light px-2.5 py-0.5 text-[11px] font-medium text-ink whitespace-nowrap">
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{
                                backgroundColor:
                                  post.categoryColor ?? "#E8D49A",
                              }}
                            />
                            {post.categoryName}
                          </span>
                        ) : (
                          <span className="text-xs text-forest-400">—</span>
                        )}
                      </td>

                      {/* SEO Readiness Dot */}
                      <td className="px-4 py-3.5 hidden xl:table-cell text-center">
                        <span
                          title={seo.tooltip}
                          aria-label={seo.tooltip}
                          className="inline-flex items-center justify-center gap-1 cursor-help"
                        >
                          <span
                            className={cn(
                              "h-2.5 w-2.5 rounded-full ring-2",
                              seo.level === "good"
                                ? "bg-emerald-500 ring-emerald-100"
                                : seo.level === "partial"
                                  ? "bg-amber-400 ring-amber-100"
                                  : "bg-red-400 ring-red-100"
                            )}
                          />
                        </span>
                      </td>

                      {/* Inline Publish / Scheduled / Draft Toggle */}
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => void handleInlineStatusToggle(post)}
                          disabled={togglingId === post.id}
                          title={
                            isScheduled
                              ? `Agendado para ${formatAdminDate(post.published_at!)} — Clique para mover para rascunho`
                              : isPublished
                                ? "Clique para mover para rascunho"
                                : "Clique para publicar agora"
                          }
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-60",
                            isScheduled
                              ? "bg-champagne-100 text-champagne-900 border border-champagne-400/70 hover:bg-champagne-200/80"
                              : isPublished
                                ? "bg-forest-100 text-forest-800 hover:bg-forest-200"
                                : "bg-champagne-200/80 text-champagne-900 hover:bg-champagne-300/80"
                          )}
                        >
                          {togglingId === post.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : isScheduled ? (
                            <Clock className="h-3 w-3 text-gold-dark shrink-0" />
                          ) : (
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                isPublished ? "bg-emerald-600" : "bg-amber-600"
                              )}
                            />
                          )}
                          {isScheduled
                            ? "Agendado"
                            : isPublished
                              ? "Publicado"
                              : "Rascunho"}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 hidden sm:table-cell whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-forest-600">
                          <Calendar className="h-3 w-3 text-forest-400" />
                          {formatAdminDate(
                            post.published_at ?? post.created_at
                          )}
                        </span>
                      </td>

                      {/* Views */}
                      <td className="px-4 py-3.5 hidden lg:table-cell whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-forest-700 tabular-nums"
                          title="Visualizações registradas"
                        >
                          <Eye className="h-3.5 w-3.5 text-forest-400" />
                          {post.uniqueViews.toLocaleString("pt-BR")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="pl-2 pr-5 py-3.5">
                        <PostActions
                          id={post.id}
                          title={post.title}
                          slug={post.slug}
                          isPublished={isPublished}
                          onDeleted={(deletedId) => {
                            setSelectedIds((prev) => {
                              const next = new Set(prev);
                              next.delete(deletedId);
                              return next;
                            });
                          }}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-14 text-center text-sm text-forest-600"
                  >
                    {hasActiveFilters
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
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-forest-100 bg-cream/30 text-xs text-forest-600">
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
              <span className="font-medium text-ink tabular-nums">
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

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div
          role="region"
          aria-label="Ações em lote"
          className="fixed bottom-5 left-1/2 lg:left-[calc(50%+8rem)] -translate-x-1/2 z-40 flex flex-wrap items-center justify-center gap-2 sm:gap-3 rounded-2xl bg-ink text-cream border border-gold/30 px-4 py-3 shadow-2xl max-w-[95vw]"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold pr-2 border-r border-forest-700">
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold text-ink px-1.5 text-[11px] font-bold tabular-nums">
              {selectedIds.size}
            </span>
            selecionado{selectedIds.size > 1 ? "s" : ""}
          </span>

          <button
            type="button"
            onClick={() => handleBulkStatus("published")}
            disabled={isBulkTransition}
            className="inline-flex items-center gap-1.5 rounded-xl bg-forest-800 hover:bg-forest-700 px-3 py-1.5 text-xs font-semibold text-cream transition-colors disabled:opacity-50"
          >
            {bulkActionPending === "publish" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
            ) : (
              <Send className="h-3.5 w-3.5 text-gold" />
            )}
            Publicar
          </button>

          <button
            type="button"
            onClick={() => handleBulkStatus("draft")}
            disabled={isBulkTransition}
            className="inline-flex items-center gap-1.5 rounded-xl bg-forest-800 hover:bg-forest-700 px-3 py-1.5 text-xs font-semibold text-cream transition-colors disabled:opacity-50"
          >
            {bulkActionPending === "draft" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
            ) : (
              <Check className="h-3.5 w-3.5 text-gold" />
            )}
            Mover para Rascunho
          </button>

          <button
            type="button"
            onClick={() => {
              setBulkError(null);
              setBulkConfirmOpen(true);
            }}
            disabled={isBulkTransition}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Excluir
          </button>

          <button
            type="button"
            onClick={clearSelection}
            disabled={isBulkTransition}
            aria-label="Limpar seleção"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-cream/65 hover:text-cream hover:bg-forest-800 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <ConfirmDialog
        open={bulkConfirmOpen}
        title={`Excluir ${selectedIds.size} artigo${selectedIds.size > 1 ? "s" : ""}`}
        description={`Tem certeza que deseja excluir permanentemente ${selectedIds.size} artigo${selectedIds.size > 1 ? "s" : ""} selecionado${selectedIds.size > 1 ? "s" : ""}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir selecionados"
        isPending={bulkActionPending === "delete"}
        error={bulkError}
        onConfirm={handleBulkDelete}
        onCancel={() => {
          setBulkConfirmOpen(false);
          setBulkError(null);
        }}
      />
    </>
  );
}
