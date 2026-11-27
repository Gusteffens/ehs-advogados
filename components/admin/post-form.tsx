"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  ExternalLink,
  Eye,
  Loader2,
  Maximize2,
  MessageCircle,
  Minimize2,
  RotateCcw,
  Save,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { CoverUploadZone } from "@/components/admin/cover-upload-zone";
import { PostSeoPanel } from "@/components/admin/post-seo-panel";
import { PostPreviewModal } from "@/components/admin/post-preview-modal";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/admin/toast-provider";
import { createPost, deletePost, updatePost } from "@/app/actions/blog";
import { TEAM_IMAGES } from "@/lib/site-config";
import { cn, getErrorMessage } from "@/lib/utils";
import type {
  AuthorOption,
  CategoryOption,
  EditablePost,
  PostStatus,
} from "@/types/blog";

const inputClasses =
  "w-full rounded-xl border border-forest-200 bg-white px-4 py-3 text-ink text-sm placeholder:text-forest-600/65 focus:outline-none focus:ring-2 focus:ring-champagne-500/50 focus:border-gold transition-all";

export type CategorySelectOption = CategoryOption;

interface PostFormProps {
  mode: "create" | "edit";
  categories: CategoryOption[];
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
  coverUrl: string;
  publishedAtLocal: string;
  tags: string[];
  savedAt: number;
}

interface SavedSnapshot {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  status: PostStatus;
  authorId: string;
  coverUrl: string;
  publishedAtLocal: string;
  tagsKey: string;
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

function countWords(html: string): number {
  const plain = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .trim();
  return plain ? plain.split(/\s+/).filter(Boolean).length : 0;
}

function toDatetimeLocalValue(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatTimeHHMM(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PostForm({
  mode,
  categories,
  authors,
  initialPost,
}: PostFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const isEdit = mode === "edit" && Boolean(initialPost);
  const draftStorageKey = `ehs-post-draft:${isEdit && initialPost ? initialPost.id : "new"}`;

  const initialAuthorId =
    initialPost?.author_id ?? (mode === "create" ? (authors[0]?.id ?? "") : "");
  const initialStatus: PostStatus =
    initialPost?.status === "published" ? "published" : "draft";
  const initialPublishedAtLocal = toDatetimeLocalValue(
    initialPost?.published_at
  );
  const initialTags = initialPost?.tags ?? [];

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [category, setCategory] = useState(initialPost?.category_id ?? "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "");
  const [content, setContent] = useState(initialPost?.content ?? "");
  const [editorResetKey, setEditorResetKey] = useState(0);
  const [status, setStatus] = useState<PostStatus>(initialStatus);
  const [coverUrl, setCoverUrl] = useState(initialPost?.cover_image_url ?? "");
  const [authorId, setAuthorId] = useState(initialAuthorId);
  const [publishedAtLocal, setPublishedAtLocal] = useState(
    initialPublishedAtLocal
  );
  const [tags, setTags] = useState<string[]>(initialTags);

  const [savedSnapshot, setSavedSnapshot] = useState<SavedSnapshot>({
    title: initialPost?.title ?? "",
    slug: initialPost?.slug ?? "",
    category: initialPost?.category_id ?? "",
    excerpt: initialPost?.excerpt ?? "",
    content: initialPost?.content ?? "",
    status: initialStatus,
    authorId: initialAuthorId,
    coverUrl: initialPost?.cover_image_url ?? "",
    publishedAtLocal: initialPublishedAtLocal,
    tagsKey: initialTags.join("|"),
  });

  const [liveSlug, setLiveSlug] = useState(initialPost?.slug ?? "");
  const [livePublishedStatus, setLivePublishedStatus] =
    useState<PostStatus>(initialStatus);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(() => {
    if (initialPost?.updated_at) {
      const d = new Date(initialPost.updated_at);
      if (!Number.isNaN(d.getTime())) return formatTimeHHMM(d);
    }
    return null;
  });

  const [recoveredDraft, setRecoveredDraft] =
    useState<LocalDraftPayload | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isSubmittingRef = useRef(false);

  const isDirty = useMemo(() => {
    return (
      title !== savedSnapshot.title ||
      slug !== savedSnapshot.slug ||
      category !== savedSnapshot.category ||
      excerpt !== savedSnapshot.excerpt ||
      content !== savedSnapshot.content ||
      status !== savedSnapshot.status ||
      authorId !== savedSnapshot.authorId ||
      coverUrl !== savedSnapshot.coverUrl ||
      publishedAtLocal !== savedSnapshot.publishedAtLocal ||
      tags.join("|") !== savedSnapshot.tagsKey
    );
  }, [
    title,
    slug,
    category,
    excerpt,
    content,
    status,
    authorId,
    coverUrl,
    publishedAtLocal,
    tags,
    savedSnapshot,
  ]);

  const wordCount = useMemo(() => countWords(content), [content]);
  const readingMin = useMemo(
    () => (wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 200)) : 0),
    [wordCount]
  );

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
        const initialTagsKey = (initialPost?.tags ?? []).join("|");
        const parsedTagsKey = Array.isArray(parsed.tags)
          ? parsed.tags.join("|")
          : "";
        const differsFromInitial =
          parsed.title !== (initialPost?.title ?? "") ||
          parsed.content !== (initialPost?.content ?? "") ||
          parsed.excerpt !== (initialPost?.excerpt ?? "") ||
          (parsed.coverUrl ?? "") !== (initialPost?.cover_image_url ?? "") ||
          (parsed.category ?? "") !== (initialPost?.category_id ?? "") ||
          parsedTagsKey !== initialTagsKey ||
          (parsed.publishedAtLocal ?? "") !== initialPublishedAtLocal;
        if (differsFromInitial) {
          queueMicrotask(() => setRecoveredDraft(parsed));
        }
      }
    } catch {
      // Ignore invalid localStorage payload
    }
  }, [draftStorageKey, initialPost, initialPublishedAtLocal]);

  // Debounced localStorage autosave when dirty
  useEffect(() => {
    if (!isDirty || isSubmittingRef.current || recoveredDraft !== null) return;

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
          coverUrl,
          publishedAtLocal,
          tags,
          savedAt: Date.now(),
        };
        window.localStorage.setItem(draftStorageKey, JSON.stringify(payload));
      } catch {
        // Ignore storage quota errors
      }
    }, 900);

    return () => window.clearTimeout(timer);
  }, [
    isDirty,
    recoveredDraft,
    title,
    slug,
    category,
    excerpt,
    content,
    status,
    authorId,
    coverUrl,
    publishedAtLocal,
    tags,
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

  const clearLocalDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(draftStorageKey);
    } catch {
      // Ignore storage errors
    }
    setRecoveredDraft(null);
  }, [draftStorageKey]);

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
    if (typeof recoveredDraft.coverUrl === "string") {
      setCoverUrl(recoveredDraft.coverUrl);
    }
    if (typeof recoveredDraft.publishedAtLocal === "string") {
      setPublishedAtLocal(recoveredDraft.publishedAtLocal);
    }
    if (Array.isArray(recoveredDraft.tags)) {
      setTags(recoveredDraft.tags);
    }
    setEditorResetKey((prev) => prev + 1);
    setRecoveredDraft(null);
    toast.info("Rascunho restaurado", "As alterações locais foram recuperadas.");
  };

  const handleSubmit = useCallback(
    (targetStatus: PostStatus, actionKey: PendingAction) => {
      setErrorMessage(null);

      if (!title.trim()) {
        const msg = "O título do artigo é obrigatório.";
        setErrorMessage(msg);
        toast.error("Campo obrigatório", msg);
        return;
      }

      if (!hasVisibleHtmlContent(content)) {
        const msg = "O conteúdo do artigo não pode estar vazio.";
        setErrorMessage(msg);
        toast.error("Conteúdo vazio", msg);
        return;
      }

      isSubmittingRef.current = true;
      setPendingAction(actionKey);

      startTransition(async () => {
        try {
          const formData = new FormData();
          formData.append("title", title.trim());
          formData.append("slug", slug.trim());
          formData.append("content", content);
          formData.append("excerpt", excerpt.trim());
          formData.append("category_id", category);
          formData.append("status", targetStatus);
          formData.append("cover_image_url", coverUrl);
          if (authorId) {
            formData.append("author_id", authorId);
          }
          if (publishedAtLocal) {
            const parsedDate = new Date(publishedAtLocal);
            if (!Number.isNaN(parsedDate.getTime())) {
              formData.append("published_at", parsedDate.toISOString());
            }
          }
          if (tags.length > 0 || (initialPost?.tags?.length ?? 0) > 0) {
            formData.append("tags", JSON.stringify(tags));
          }

          if (isEdit && initialPost) {
            const res = await updatePost(initialPost.id, formData);
            if (!res.ok) {
              const msg = res.error ?? "Não foi possível atualizar o artigo.";
              setErrorMessage(msg);
              toast.error("Erro ao salvar", msg);
              return;
            }

            // CRITICAL: Clear localStorage draft ONLY after confirmed server save
            clearLocalDraft();

            const nextSlug = res.slug ?? slug;
            const nextPubLocal = res.published_at
              ? toDatetimeLocalValue(res.published_at)
              : publishedAtLocal;

            setSlug(nextSlug);
            setLiveSlug(nextSlug);
            setStatus(targetStatus);
            setLivePublishedStatus(targetStatus);
            setPublishedAtLocal(nextPubLocal);
            setLastSavedAt(formatTimeHHMM(new Date()));
            setSavedSnapshot({
              title: title.trim(),
              slug: nextSlug,
              category,
              excerpt: excerpt.trim(),
              content,
              status: targetStatus,
              authorId,
              coverUrl,
              publishedAtLocal: nextPubLocal,
              tagsKey: tags.join("|"),
            });

            toast.success(
              targetStatus === "published"
                ? "Artigo salvo e publicado"
                : "Alterações salvas",
              "Você pode continuar editando normalmente."
            );
            router.refresh();
          } else {
            const res = await createPost(formData);
            if (!res.ok || !res.id) {
              const msg = res.error ?? "Não foi possível criar o artigo.";
              setErrorMessage(msg);
              toast.error("Erro ao criar artigo", msg);
              return;
            }

            // CRITICAL: Clear localStorage draft ONLY after confirmed server save
            clearLocalDraft();

            toast.success(
              targetStatus === "published"
                ? "Artigo publicado!"
                : "Rascunho criado!",
              "Redirecionando para o editor..."
            );
            router.push(`/admin/posts/${res.id}`);
          }
        } catch (error: unknown) {
          console.error(error);
          const msg =
            (isEdit
              ? "Erro ao atualizar o artigo: "
              : "Erro ao salvar o artigo: ") + getErrorMessage(error);
          setErrorMessage(msg);
          toast.error("Falha na operação", msg);
        } finally {
          isSubmittingRef.current = false;
          setPendingAction(null);
        }
      });
    },
    [
      title,
      slug,
      content,
      excerpt,
      category,
      coverUrl,
      authorId,
      publishedAtLocal,
      tags,
      isEdit,
      initialPost,
      clearLocalDraft,
      toast,
      router,
    ]
  );

  // Ctrl+S / Cmd+S shortcut to save
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!isPending) {
          handleSubmit(
            isEdit ? status : "draft",
            isEdit ? "save" : "draft"
          );
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSubmit, isEdit, status, isPending]);

  const handleConfirmDelete = () => {
    if (!initialPost) return;
    setDeleteError(null);
    isSubmittingRef.current = true;
    setPendingAction("delete");

    startTransition(async () => {
      try {
        const res = await deletePost(initialPost.id);
        if (!res.ok) {
          const msg = res.error ?? "Não foi possível excluir o artigo.";
          setDeleteError(msg);
          toast.error("Erro ao excluir", msg);
          return;
        }

        clearLocalDraft();
        toast.success("Artigo excluído", `"${initialPost.title}" foi removido.`);
        router.push("/admin/posts");
      } catch (error: unknown) {
        console.error(error);
        const msg = "Erro ao excluir: " + getErrorMessage(error);
        setDeleteError(msg);
        toast.error("Erro ao excluir", msg);
      } finally {
        isSubmittingRef.current = false;
        setPendingAction(null);
      }
    });
  };

  const selectedAuthor = authors.find((author) => author.id === authorId);
  const selectedAuthorPhoto = selectedAuthor?.slug
    ? (TEAM_IMAGES[selectedAuthor.slug] ?? "/images/logo-ehs-monogram.png")
    : null;
  const selectedCategory = categories.find((c) => c.id === category);

  const shareSlug = (liveSlug || slug).trim();
  const canCopyWhatsAppSummary = Boolean(title.trim() && shareSlug);

  const handleCopyWhatsAppSummary = async () => {
    if (!canCopyWhatsAppSummary) return;
    const summaryParts = [
      `*${title.trim()}*`,
      ...(excerpt.trim() ? [excerpt.trim()] : []),
      `Leia completo: https://ehsadvogados.com.br/blog/${shareSlug}`,
    ];
    try {
      await navigator.clipboard.writeText(summaryParts.join("\n\n"));
      setCopiedWhatsApp(true);
      toast.success(
        "Resumo copiado para WhatsApp!",
        "Pronto para colar e compartilhar com clientes ou redes sociais."
      );
      window.setTimeout(() => setCopiedWhatsApp(false), 2000);
    } catch {
      toast.error(
        "Não foi possível copiar",
        "Permita o acesso à área de transferência no navegador."
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Studio Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 pb-5 border-b border-forest-100">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <Link
            href="/admin/posts"
            aria-label="Voltar para postagens"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-forest-200 bg-white text-forest-600 hover:text-ink hover:bg-cream transition-all no-underline"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-2xl font-bold text-ink">
                {isEdit ? "Estúdio Editorial" : "Novo Artigo"}
              </h1>
              <span
                className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                  status === "published"
                    ? "bg-forest-100 text-forest-800"
                    : "bg-champagne-200/80 text-champagne-900"
                )}
              >
                {status === "published" ? "Publicado" : "Rascunho"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs">
              {isDirty ? (
                <span className="inline-flex items-center gap-1.5 text-amber-700 font-medium">
                  <CircleDot className="h-3 w-3 animate-pulse" />
                  Alterações não salvas
                </span>
              ) : lastSavedAt ? (
                <span className="inline-flex items-center gap-1.5 text-forest-600">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Salvo às {lastSavedAt}
                </span>
              ) : (
                <span className="text-forest-600/80">
                  Atalho Ctrl+S para salvar rapidamente
                </span>
              )}

              {isEdit && livePublishedStatus === "published" && liveSlug && (
                <>
                  <span className="text-forest-300">·</span>
                  <Link
                    href={`/blog/${liveSlug}`}
                    className="inline-flex items-center gap-1 text-gold-dark hover:text-ink font-medium no-underline transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Ver no site
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            className={cn(
              "text-sm transition-colors",
              focusMode
                ? "bg-ink text-cream border-ink hover:bg-forest-900 hover:text-cream"
                : "bg-white"
            )}
            onClick={() => setFocusMode((prev) => !prev)}
            title={
              focusMode
                ? "Sair do Modo Foco e mostrar painel lateral"
                : "Ativar Modo Foco (ocultar barra lateral)"
            }
          >
            {focusMode ? (
              <Minimize2 className="h-4 w-4 text-gold" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
            {focusMode ? "Sair do Foco" : "Modo Foco"}
          </Button>

          {canCopyWhatsAppSummary && (
            <Button
              type="button"
              variant="outline"
              className="text-sm bg-white"
              onClick={() => void handleCopyWhatsAppSummary()}
              disabled={isPending}
              title="Copiar resumo formatado com título, resumo e link para WhatsApp"
            >
              {copiedWhatsApp ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <MessageCircle className="h-4 w-4 text-gold-dark" />
              )}
              {copiedWhatsApp ? "Copiado!" : "Copiar p/ WhatsApp"}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            className="text-sm bg-white"
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
                className="group text-sm bg-white"
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
                  <Send className="h-4 w-4" />
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

      {/* Two-column Chancery Studio Grid (collapses to centered Focus Canvas) */}
      <div
        className={cn(
          "grid grid-cols-1 gap-7 transition-all duration-200",
          focusMode ? "max-w-4xl mx-auto pb-24" : "lg:grid-cols-12"
        )}
      >
        {/* Main Editorial Canvas */}
        <div className={cn("space-y-6", focusMode ? "col-span-1" : "lg:col-span-8")}>
          <div className="rounded-2xl bg-white border border-forest-100 p-5 shadow-2xs">
            <label
              htmlFor="title"
              className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-600 mb-2"
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
              placeholder="Ex: Novas regras para o crédito rural em 2026"
              className={cn(
                inputClasses,
                "font-display font-bold",
                focusMode ? "text-2xl sm:text-3xl py-3.5" : "text-xl"
              )}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-600">
                Corpo Editorial
              </label>
              {focusMode && (
                <span className="text-[11px] font-medium text-gold-dark">
                  Modo Foco ativo · Escrita livre de distrações
                </span>
              )}
            </div>
            <TiptapEditor
              key={editorResetKey}
              content={content}
              onChange={setContent}
              focusMode={focusMode}
            />
          </div>
        </div>

        {/* Right Inspector Sidebar (4 cols — hidden in Focus Mode) */}
        {!focusMode && (
          <div className="lg:col-span-4 space-y-5">
          {/* Status control */}
          <div className="rounded-2xl bg-white border border-forest-100 p-5 shadow-2xs">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-600 mb-3">
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
                    ? "bg-champagne-200/80 text-champagne-900 border-champagne-400 shadow-2xs"
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
                    ? "bg-primary text-cream border-primary shadow-2xs"
                    : "bg-white text-forest-600 border-forest-200 hover:bg-cream/60"
                )}
              >
                Publicado
              </button>
            </div>
            <p className="text-[11px] text-forest-600/80 mt-2.5">
              {status === "published"
                ? "O artigo ficará visível publicamente no blog ao salvar."
                : "Salvo apenas no painel administrativo; a data de publicação original é preservada."}
            </p>
          </div>

          {/* Immediate Drag-and-Drop Cover Upload */}
          <CoverUploadZone
            value={coverUrl}
            onChange={setCoverUrl}
            disabled={isPending}
          />

          {/* Author */}
          <div className="rounded-2xl bg-white border border-forest-100 p-5 shadow-2xs">
            <label
              htmlFor="author"
              className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-600 mb-3"
            >
              Autor
            </label>
            <div className="relative">
              <select
                id="author"
                value={authorId}
                onChange={(event) => setAuthorId(event.target.value)}
                className={`${inputClasses} py-2.5 appearance-none pr-10`}
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
              <div className="mt-3.5 flex items-center gap-3 p-2.5 rounded-xl border border-forest-100 bg-cream/40">
                <div className="relative w-9 h-9 overflow-hidden rounded-full border border-forest-200 shrink-0">
                  <Image
                    src={selectedAuthorPhoto}
                    alt={selectedAuthor.full_name}
                    fill
                    sizes="36px"
                    className="object-cover object-top"
                  />
                </div>
                <span className="text-sm font-medium text-ink truncate">
                  {selectedAuthor.full_name}
                </span>
              </div>
            )}
          </div>

          {/* SEO, Taxonomy, Published Date & SERP Preview */}
          <PostSeoPanel
            title={title}
            slug={slug}
            onSlugChange={(next) => {
              setSlugTouched(true);
              setSlug(next);
            }}
            onRegenerateSlug={() => {
              setSlugTouched(true);
              setSlug(generateSlug(title));
            }}
            excerpt={excerpt}
            onExcerptChange={setExcerpt}
            categoryId={category}
            onCategoryChange={setCategory}
            categories={categories}
            coverUrl={coverUrl}
            wordCount={wordCount}
            publishedAtLocal={publishedAtLocal}
            onPublishedAtLocalChange={setPublishedAtLocal}
            tags={tags}
            onTagsChange={setTags}
          />
          </div>
        )}
      </div>

      {/* Floating Focus Mode Status Bar */}
      {focusMode && (
        <div className="fixed bottom-5 left-1/2 lg:left-[calc(50%+8rem)] -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl rounded-2xl bg-ink/95 text-cream border border-gold/30 shadow-2xl backdrop-blur-md px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="font-semibold tabular-nums text-cream">
              {wordCount} {wordCount === 1 ? "palavra" : "palavras"}
            </span>
            <span className="text-cream/35" aria-hidden="true">
              ·
            </span>
            <span className="tabular-nums text-cream/80">
              {readingMin > 0 ? `~${readingMin} min` : "0 min"}
            </span>
            <span className="text-cream/35 hidden sm:inline" aria-hidden="true">
              ·
            </span>
            {isDirty ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-gold font-medium">
                <CircleDot className="h-3 w-3 animate-pulse" />
                Não salvo
              </span>
            ) : lastSavedAt ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Salvo às {lastSavedAt}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-forest-700 bg-forest-900/80 px-3 py-1.5 text-xs font-medium text-cream hover:bg-forest-800 transition-colors disabled:opacity-50"
            >
              <Eye className="h-3.5 w-3.5 text-gold" />
              Pré-visualizar
            </button>
            <button
              type="button"
              onClick={() =>
                handleSubmit(isEdit ? status : "draft", isEdit ? "save" : "draft")
              }
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gold px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-champagne-200 transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {isPending ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => setFocusMode(false)}
              title="Sair do Modo Foco"
              aria-label="Sair do Modo Foco"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-cream/70 hover:text-cream hover:bg-forest-800 transition-colors"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Sanitized Editorial Preview Modal */}
      <PostPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={title}
        excerpt={excerpt}
        content={content}
        coverUrl={coverUrl}
        categoryName={selectedCategory?.name ?? null}
        categoryColor={selectedCategory?.color_hex ?? null}
        authorName={selectedAuthor?.full_name ?? "Equipe EHS"}
        authorPhoto={selectedAuthorPhoto}
        publishedAt={publishedAtLocal || initialPost?.published_at || null}
        tags={tags}
      />

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
