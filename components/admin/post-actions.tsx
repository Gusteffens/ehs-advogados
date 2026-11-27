"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Copy,
  ExternalLink,
  Loader2,
  PenSquare,
  Trash2,
} from "lucide-react";
import { deletePost, duplicatePost } from "@/app/actions/blog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/admin/toast-provider";
import { getErrorMessage } from "@/lib/utils";

interface PostActionsProps {
  id: string;
  title?: string;
  slug?: string;
  isPublished?: boolean;
  onDeleted?: (id: string) => void;
}

export function PostActions({
  id,
  title,
  slug,
  isPublished = false,
  onDeleted,
}: PostActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [pendingKind, setPendingKind] = useState<"delete" | "duplicate" | null>(
    null
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDuplicate = () => {
    setError(null);
    setPendingKind("duplicate");
    startTransition(async () => {
      try {
        const res = await duplicatePost(id);
        if (!res.ok) {
          const msg = res.error ?? "Não foi possível duplicar o artigo.";
          toast.error("Erro ao duplicar", msg);
          setPendingKind(null);
          return;
        }
        toast.success(
          "Artigo duplicado",
          "Cópia criada como rascunho. Abrindo editor..."
        );
        if (res.id) {
          router.push(`/admin/posts/${res.id}`);
        } else {
          router.refresh();
        }
      } catch (err: unknown) {
        console.error(err);
        toast.error("Erro ao duplicar", getErrorMessage(err));
        setPendingKind(null);
      }
    });
  };

  const handleConfirmDelete = () => {
    setError(null);
    setPendingKind("delete");
    startTransition(async () => {
      try {
        const res = await deletePost(id);
        if (!res.ok) {
          const msg = res.error ?? "Não foi possível excluir o artigo.";
          setError(msg);
          toast.error("Erro ao excluir", msg);
          setPendingKind(null);
          return;
        }

        setConfirmOpen(false);
        setPendingKind(null);
        onDeleted?.(id);
        toast.success(
          "Artigo excluído",
          title ? `"${title}" foi removido.` : "Artigo removido com sucesso."
        );
        router.refresh();
      } catch (err: unknown) {
        console.error(err);
        const msg = getErrorMessage(err);
        setError("Erro ao excluir: " + msg);
        toast.error("Erro ao excluir", msg);
        setPendingKind(null);
      }
    });
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        {isPublished && slug && (
          <Link
            href={`/blog/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gold-dark hover:text-ink hover:bg-champagne-100/70 transition-all no-underline"
            title="Ver no site"
            aria-label={title ? `Ver ${title} no site` : "Ver artigo no site"}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}

        <Link
          href={`/admin/posts/${id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-forest-600/80 hover:text-ink hover:bg-cream transition-all no-underline"
          title="Editar"
          aria-label={title ? `Editar ${title}` : "Editar artigo"}
        >
          <PenSquare className="h-3.5 w-3.5" />
        </Link>

        <button
          type="button"
          onClick={handleDuplicate}
          disabled={isPending}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-forest-600/80 hover:text-ink hover:bg-cream transition-all disabled:opacity-50"
          title="Duplicar como rascunho"
          aria-label={title ? `Duplicar ${title}` : "Duplicar artigo"}
        >
          {isPending && pendingKind === "duplicate" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setConfirmOpen(true);
          }}
          disabled={isPending}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500/80 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
          title="Excluir"
          aria-label={title ? `Excluir ${title}` : "Excluir artigo"}
        >
          {isPending && pendingKind === "delete" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir artigo"
        description={
          title
            ? `Tem certeza que deseja excluir "${title}"? Esta ação não pode ser desfeita.`
            : "Tem certeza que deseja excluir este artigo? Esta ação não pode ser desfeita."
        }
        confirmLabel="Excluir"
        isPending={isPending && pendingKind === "delete"}
        error={error}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setError(null);
        }}
      />
    </>
  );
}
