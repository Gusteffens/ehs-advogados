"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, PenSquare, Trash2 } from "lucide-react";
import { deletePost } from "@/app/actions/blog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { getErrorMessage, isNextRedirectError } from "@/lib/utils";

interface PostActionsProps {
  id: string;
  title?: string;
}

export function PostActions({ id, title }: PostActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        await deletePost(id);
      } catch (err: unknown) {
        if (isNextRedirectError(err)) return;

        console.error(err);
        setError("Erro ao excluir: " + getErrorMessage(err));
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
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
          onClick={() => {
            setError(null);
            setConfirmOpen(true);
          }}
          disabled={isPending}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500/80 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
          title="Excluir"
          aria-label={title ? `Excluir ${title}` : "Excluir artigo"}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
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
        isPending={isPending}
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
