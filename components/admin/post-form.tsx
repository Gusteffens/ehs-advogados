"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  Eye,
  Loader2,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  createPost,
  deletePost,
  updatePost,
  uploadCoverImage,
} from "@/app/actions/blog";
import { SITE_CONFIG, TEAM_IMAGES } from "@/lib/site-config";
import { cn, getErrorMessage, isNextRedirectError } from "@/lib/utils";
import type { AuthorOption, EditablePost, PostStatus } from "@/types/blog";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const MAX_COVER_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const inputClasses =
  "w-full rounded-xl border border-forest-200 bg-white px-4 py-3 text-ink text-sm placeholder:text-forest-600/70 focus:outline-none focus:ring-2 focus:ring-champagne-500/50 focus:border-gold transition-all";

export interface CategorySelectOption {
  id: string;
  name: string;
}

interface PostFormProps {
  mode: "create" | "edit";
  categories: CategorySelectOption[];
  authors: AuthorOption[];
  initialPost?: EditablePost;
}

interface LocalDraftPayload {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  status: PostStatus;
  authorId: string;
  savedAt: number;
}

type PendingAction = "draft" | "published" | "save" | "delete" | null;

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function hasVisibleHtmlContent(html: string): boolean {
  const plainText = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .trim();
  if (plainText.length > 0) return true;
  return /<img\b/i.test(html);
}

const displaySiteHost = SITE_CONFIG.url.replace(/^https?:\/\//, "");

export function PostForm({
  mode,
  categories,
  authors,
  initialPost,
}: PostFormProps) {
  const isEdit = mode === "edit" && Boolean(initialPost);
  const draftStorageKey = `ehs-post-draft:${isEdit && initialPost ? initialPost.id : "new"}`;

  const initialAuthorId =
    initialPost?.author_id ?? (mode === "create" ? authors[0]?.id ?? "" : "");
  const initialStatus: PostStatus =
    initialPost?.status === "published" ? "published" : "draft";

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [category, setCategory] = useState(initialPost?.category_id ?? "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "");
  const [content, setContent] = useState(initialPost?.content ?? "");
  const [editorResetKey, setEditorResetKey] = useState(0);
  const [status, setStatus] = useState<PostStatus>(initialStatus);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(
    initialPost?.cover_image_url ?? ""
  );
  const [authorId, setAuthorId] = useState(initialAuthorId);

  const [recoveredDraft, setRecoveredDraft] =
    useState<LocalDraftPayload | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const isSubmittingRef = useRef(false);

  const isDirty = useMemo(() => {
    return (
      title !== (initialPost?.title ?? "") ||
      slug !== (initialPost?.slug ?? "") ||
      category !== (initialPost?.category_id ?? "") ||
      excerpt !== (initialPost?.excerpt ?? "") ||
      content !== (initialPost?.content ?? "") ||
      status !== initialStatus ||
      authorId !== initialAuthorId ||
      coverFile !== null ||
      coverPreview !== (initialPost?.cover_image_url ?? "")
    );
  }, [
    title,
    slug,
    category,
    excerpt,
    content,
    status,
    authorId,
    coverFile,
    coverPreview,
    initialPost,
    initialStatus,
    initialAuthorId,
  ]);

  // Check for existing localStorage draft on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(draftStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as LocalDraftPayload;
      if (
        parsed &&
        typeof parsed.title === "string" &&
        typeof parsed.content === "string"
      ) {
        const differsFromInitial =
          parsed.title !== (initialPost?.title ?? "") ||
          parsed.content !== (initialPost?.content ?? "") ||
          parsed.excerpt !== (initialPost?.excerpt ?? "");
        if (differsFromInitial) {
          queueMicrotask(() => setRecoveredDraft(parsed));
        }
      }
    } catch {
      // Ignore invalid localStorage payload
    }
  }, [draftStorageKey, initialPost]);

  // Debounced localStorage autosave when dirty
  useEffect(() => {
    if (!isDirty || isSubmittingRef.current) return;

    const timer = window.setTimeout(() => {
      try {
        const payload: LocalDraftPayload = {
          title,
          slug,
          category,
          excerpt,
          content,
          status,
          authorId,
          savedAt: Date.now(),
        };
        window.localStorage.setItem(draftStorageKey, JSON.stringify(payload));
      } catch {
        // Ignore storage quota errors
      }
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [
    isDirty,
    title,
    slug,
    category,
    excerpt,
    content,
    status,
    authorId,
    draftStorageKey,
  ]);

  // Warn before closing/leaving with unsaved changes
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isSubmittingRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Revoke any created Object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  // Close preview modal on Escape
  useEffect(() => {
    if (!previewOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewOpen]);

  const clearLocalDraft = () => {
    try {
      window.localStorage.removeItem(draftStorageKey);
    } catch {
      // Ignore storage errors
    }
    setRecoveredDraft(null);
  };

  const handleRestoreDraft = () => {
    if (!recoveredDraft) return;
    setTitle(recoveredDraft.title);
    setSlug(recoveredDraft.slug);
    setSlugTouched(Boolean(recoveredDraft.slug));
    setCategory(recoveredDraft.category);
    setExcerpt(recoveredDraft.excerpt);
    setContent(recoveredDraft.content);
    setStatus(recoveredDraft.status);
    setAuthorId(recoveredDraft.authorId);
    setEditorResetKey((prev) => prev + 1);
    setRecoveredDraft(null);
  };

  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setErrorMessage(
        "Formato de imagem inválido. Utilize JPEG, PNG, WebP ou AVIF."
      );
      event.target.value = "";
      return;
    }

    if (file.size <= 0 || file.size > MAX_COVER_IMAGE_BYTES) {
      setErrorMessage("A imagem de capa deve ter no máximo 5 MB.");
      event.target.value = "";
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const nextObjectUrl = URL.createObjectURL(file);
    objectUrlRef.current = nextObjectUrl;
    setCoverFile(file);
    setCoverPreview(nextObjectUrl);
  };

  const handleRemoveCover = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setCoverFile(null);
    setCoverPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (targetStatus: PostStatus, actionKey: PendingAction) => {
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("O título do artigo é obrigatório.");
      return;
    }

    if (!hasVisibleHtmlContent(content)) {
      setErrorMessage("O conteúdo do artigo não pode estar vazio.");
      return;
    }

    isSubmittingRef.current = true;
    setPendingAction(actionKey);

    startTransition(async () => {
      try {
        let finalCoverUrl = coverPreview.startsWith("blob:")
          ? ""
          : coverPreview;

        if (coverFile) {
          const uploadData = new FormData();
          uploadData.append("file", coverFile);
          finalCoverUrl = await uploadCoverImage(uploadData);
        }

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("slug", slug.trim());
        formData.append("content", content);
        formData.append("excerpt", excerpt.trim());
        formData.append("category_id", category);
        formData.append("status", targetStatus);
        formData.append("cover_image_url", finalCoverUrl);
        if (authorId) {
          formData.append("author_id", authorId);
        }

        clearLocalDraft();

        if (isEdit && initialPost) {
          await updatePost(initialPost.id, formData);
        } else {
          await createPost(formData);
        }
      } catch (error: unknown) {
        if (isNextRedirectError(error)) return;

        isSubmittingRef.current = false;
        console.error(error);
        setErrorMessage(
          (isEdit
            ? "Erro ao atualizar o artigo: "
            : "Erro ao salvar o artigo: ") + getErrorMessage(error)
        );
        setPendingAction(null);
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!initialPost) return;
    setDeleteError(null);
    isSubmittingRef.current = true;
    setPendingAction("delete");

    startTransition(async () => {
      try {
        clearLocalDraft();
        await deletePost(initialPost.id);
      } catch (error: unknown) {
        if (isNextRedirectError(error)) return;

        isSubmittingRef.current = false;
        console.error(error);
        setDeleteError("Erro ao excluir: " + getErrorMessage(error));
        setPendingAction(null);
      }
    });
  };

  const selectedAuthor = authors.find((author) => author.id === authorId);
  const selectedAuthorPhoto = selectedAuthor?.slug
    ? (TEAM_IMAGES[selectedAuthor.slug] ?? "/images/logo-ehs-monogram.png")
    : null;
  const selectedCategoryName =
    categories.find((c) => c.id === category)?.name ?? null;

  return (
    <div className="max-w-5xl mx-auto pt-28 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/posts"
            aria-label="Voltar para postagens"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-forest-200 text-forest-600 hover:text-ink hover:bg-cream transition-all no-underline"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">
              {isEdit ? "Editar Artigo" : "Novo Artigo"}
            </h1>
            {isEdit && initialPost ? (
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider",
                    status === "published"
                      ? "bg-forest-100 text-forest-800"
                      : "bg-champagne-200/70 text-champagne-800"
                  )}
                >
                  {status === "published" ? "Publicado" : "Rascunho"}
                </span>
                {initialPost.status === "published" && (
                  <Link
                    href={`/blog/${initialPost.slug}`}
                    className="flex items-center gap-1 text-xs text-gold-dark hover:text-ink no-underline transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Ver no site
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-forest-600 text-xs mt-0.5">
                Preencha os campos e escreva seu artigo
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            className="text-sm"
            onClick={() => setPreviewOpen(true)}
            disabled={isPending}
          >
            <Eye className="h-4 w-4" />
            Pré-visualizar
          </Button>

          {isEdit ? (
            <>
              <Button
                type="button"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm"
                onClick={() => {
                  setDeleteError(null);
                  setDeleteDialogOpen(true);
                }}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="group text-sm"
                onClick={() => handleSubmit(status, "save")}
                disabled={isPending}
              >
                {pendingAction === "save" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {pendingAction === "save" ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className="group text-sm"
                onClick={() => handleSubmit("draft", "draft")}
                disabled={isPending}
              >
                {pendingAction === "draft" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {pendingAction === "draft" ? "Salvando..." : "Salvar Rascunho"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="group text-sm"
                onClick={() => handleSubmit("published", "published")}
                disabled={isPending}
              >
                {pendingAction === "published" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {pendingAction === "published" ? "Publicando..." : "Publicar"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Local autosave recovery banner */}
      {recoveredDraft && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-champagne-400 bg-champagne-50 px-4 py-3.5 text-sm text-ink">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="h-4 w-4 shrink-0 text-gold-dark" />
            <span>
              Rascunho local encontrado (salvo automaticamente neste navegador).
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-cream hover:bg-forest-800 transition-colors"
            >
              Restaurar
            </button>
            <button
              type="button"
              onClick={clearLocalDraft}
              className="rounded-lg border border-forest-200 bg-white px-3 py-1.5 text-xs font-medium text-forest-700 hover:bg-cream transition-colors"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      {/* Inline error feedback */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            aria-label="Fechar aviso de erro"
            className="text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main editor column */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-xs font-semibold uppercase tracking-[0.1em] text-forest-600 mb-2"
            >
              Título do Artigo
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => {
                const nextTitle = event.target.value;
                setTitle(nextTitle);
                if (!slugTouched) {
                  setSlug(generateSlug(nextTitle));
                }
              }}
              placeholder="Ex: Novas regras para o crédito rural"
              className={`${inputClasses} font-display text-lg`}
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-xs font-semibold uppercase tracking-[0.1em] text-forest-600 mb-2"
            >
              URL (Slug)
            </label>
            <div className="flex items-center rounded-xl border border-forest-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-champagne-500/50 focus-within:border-gold transition-all">
              <span className="px-3 text-xs text-forest-600/80 bg-cream/60 py-3 border-r border-forest-200 shrink-0">
                /blog/
              </span>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(event.target.value);
                }}
                placeholder="url-do-artigo"
                className="flex-1 px-3 py-3 text-sm text-ink placeholder:text-forest-600/70 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-forest-600 mb-2">
              Conteúdo
            </label>
            <TiptapEditor
              key={editorResetKey}
              content={content}
              onChange={setContent}
            />
          </div>
        </div>

        {/* Sidebar settings column */}
        <div className="space-y-6">
          {/* Status control */}
          <div className="rounded-2xl bg-white border border-forest-100 p-5">
            <span className="block text-xs font-semibold uppercase tracking-[0.1em] text-forest-600 mb-3">
              Status de Publicação
            </span>
            <div
              className="grid grid-cols-2 gap-2"
              role="radiogroup"
              aria-label="Status do artigo"
            >
              <button
                type="button"
                role="radio"
                aria-checked={status === "draft"}
                onClick={() => setStatus("draft")}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-xs font-semibold transition-all border",
                  status === "draft"
                    ? "bg-champagne-200/80 text-champagne-900 border-champagne-400 shadow-xs"
                    : "bg-white text-forest-600 border-forest-200 hover:bg-cream/60"
                )}
              >
                Rascunho
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={status === "published"}
                onClick={() => setStatus("published")}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-xs font-semibold transition-all border",
                  status === "published"
                    ? "bg-primary text-cream border-primary shadow-xs"
                    : "bg-white text-forest-600 border-forest-200 hover:bg-cream/60"
                )}
              >
                Publicado
              </button>
            </div>
            <p className="text-[11px] text-forest-600/80 mt-2.5">
              {status === "published"
                ? "O artigo ficará visível publicamente no blog."
                : "O artigo ficará salvo apenas no painel administrativo."}
            </p>
          </div>

          {/* Cover image */}
          <div className="rounded-2xl bg-white border border-forest-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <label
                htmlFor="coverImage"
                className="block text-xs font-semibold uppercase tracking-[0.1em] text-forest-600"
              >
                Imagem de Capa
              </label>
              {coverPreview && (
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Remover
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              id="coverImage"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handleCoverChange}
              className="text-xs text-forest-600 w-full file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cream/80 file:text-forest-700 hover:file:bg-cream"
            />
            <p className="text-[10px] text-forest-600/75 mt-2">
              JPEG, PNG, WebP ou AVIF até 5 MB.
            </p>
            {coverPreview && (
              <div className="mt-4 relative aspect-video w-full overflow-hidden rounded-xl border border-forest-100">
                <Image
                  src={coverPreview}
                  alt="Prévia da imagem de capa"
                  fill
                  unoptimized={coverPreview.startsWith("blob:")}
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>

          {/* Author */}
          <div className="rounded-2xl bg-white border border-forest-100 p-5">
            <label
              htmlFor="author"
              className="block text-xs font-semibold uppercase tracking-[0.1em] text-forest-600 mb-3"
            >
              Autor
            </label>
            <div className="relative">
              <select
                id="author"
                value={authorId}
                onChange={(event) => setAuthorId(event.target.value)}
                className={`${inputClasses} appearance-none pr-10`}
              >
                <option value="">(Conta logada)</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.full_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-600" />
            </div>
            {selectedAuthor && selectedAuthorPhoto && (
              <div className="mt-4 flex items-center gap-3 p-3 rounded-xl border border-forest-100 bg-cream/30">
                <div className="relative w-10 h-10 overflow-hidden rounded-full border border-forest-200 shrink-0">
                  <Image
                    src={selectedAuthorPhoto}
                    alt={selectedAuthor.full_name}
                    fill
                    sizes="40px"
                    className="object-cover object-top"
                  />
                </div>
                <span className="text-sm font-medium text-ink">
                  {selectedAuthor.full_name}
                </span>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="rounded-2xl bg-white border border-forest-100 p-5">
            <label
              htmlFor="category"
              className="block text-xs font-semibold uppercase tracking-[0.1em] text-forest-600 mb-3"
            >
              Categoria
            </label>
            <div className="relative">
              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={`${inputClasses} appearance-none pr-10`}
              >
                <option value="">Selecione...</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-600" />
            </div>
          </div>

          {/* Excerpt */}
          <div className="rounded-2xl bg-white border border-forest-100 p-5">
            <label
              htmlFor="excerpt"
              className="block text-xs font-semibold uppercase tracking-[0.1em] text-forest-600 mb-3"
            >
              Resumo
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              rows={4}
              placeholder="Breve resumo do artigo para listagem e SEO..."
              className={`${inputClasses} resize-none`}
            />
            <p className="text-[10px] text-forest-600/75 mt-2">
              {excerpt.length}/160 caracteres recomendados para SEO
            </p>
          </div>

          {/* Google SEO Preview */}
          <div className="rounded-2xl bg-primary p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gold/80 mb-3">
              Prévia no Google
            </p>
            <div className="space-y-1">
              <p className="text-blue-300 text-sm font-medium truncate">
                {title || "Título do artigo"} | {SITE_CONFIG.name}
              </p>
              <p className="text-emerald-300 text-xs truncate">
                {displaySiteHost}/blog/{slug || "url-do-artigo"}
              </p>
              <p className="text-cream/65 text-xs line-clamp-2">
                {excerpt ||
                  "O resumo do artigo será exibido aqui nos resultados de busca..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Article Preview Modal */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Pré-visualização do artigo"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-cream border border-forest-200 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-ink text-cream border-b border-forest-800">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gold" />
                <span className="text-sm font-semibold">
                  Pré-visualização do Artigo
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                aria-label="Fechar pré-visualização"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-cream/70 hover:text-cream hover:bg-forest-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-ink px-6 sm:px-10 py-10">
              {selectedCategoryName && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gold text-ink mb-4">
                  {selectedCategoryName}
                </span>
              )}
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream leading-tight mb-5">
                {title || "Sem título"}
              </h2>
              <div className="flex items-center gap-3 text-sm text-cream/75">
                {selectedAuthorPhoto && (
                  <div className="relative h-9 w-9 rounded-full overflow-hidden shrink-0 ring-2 ring-gold/20">
                    <Image
                      src={selectedAuthorPhoto}
                      alt={selectedAuthor?.full_name ?? "Autor"}
                      fill
                      sizes="36px"
                      className="object-cover object-top"
                    />
                  </div>
                )}
                <span>{selectedAuthor?.full_name ?? "Equipe EHS"}</span>
              </div>
            </div>

            <div className="px-6 sm:px-10 py-8 space-y-8">
              {coverPreview && (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-forest-200 shadow-md">
                  <Image
                    src={coverPreview}
                    alt={title || "Imagem de capa"}
                    fill
                    unoptimized={coverPreview.startsWith("blob:")}
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="object-cover"
                  />
                </div>
              )}

              <article
                className="prose-editorial max-w-2xl mx-auto"
                dangerouslySetInnerHTML={{
                  __html: content || "<p>Sem conteúdo ainda.</p>",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {isEdit && initialPost && (
        <ConfirmDialog
          open={deleteDialogOpen}
          title="Excluir artigo"
          description={`Tem certeza que deseja excluir "${initialPost.title}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          isPending={pendingAction === "delete"}
          error={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteDialogOpen(false);
            setDeleteError(null);
          }}
        />
      )}
    </div>
  );
}
