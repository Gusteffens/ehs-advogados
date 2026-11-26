"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Loader2, PenSquare, Trash2 } from "lucide-react";
import { deletePost, duplicatePost } from "@/app/actions/blog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { getErrorMessage, isNextRedirectError } from "@/lib/utils";

interface PostActionsProps {
  id: string;
  title?: string;
}

export function PostActions({ id, title }: PostActionsProps) {
  const router = useRouter();
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
        const result = await duplicatePost(id);
        if (result?.id) {
          router.push(`/admin/posts/${result.id}`);
        } else {
          router.refresh();
        }
      } catch (err: unknown) {
        if (isNextRedirectError(err)) return;
        console.error(err);
        setError("Erro ao duplicar: " + getErrorMessage(err));
        setPendingKind(null);
      }
    });
  };

  const handleConfirmDelete = () => {
    setError(null);
    setPendingKind("delete");
    startTransition(async () => {
      try {
        await deletePost(id);
      } catch (err: unknown) {
        if (isNextRedirectError(err)) return;

        console.error(err);
        setError("Erro ao excluir: " + getErrorMessage(err));
        setPendingKind(null);
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        <Link
          href={`/admin/posts/${id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-forest-600/80 hover:text-ink hover:bg-cream transition-all no-underline"
          title="Editar"
          aria-label={title ? `Editar ${title}` : "Editar artigo"}
        >
          <PenSquare className="h-4 w-4" />
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
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Copy className="h-4 w-4" />
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
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>

      {error && !confirmOpen && (
        <p className="text-[11px] text-red-600 mt-1" role="alert">
          {error}
        </p>
      )}

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
