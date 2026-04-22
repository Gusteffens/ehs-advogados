'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { PenSquare, Trash2 } from 'lucide-react';
import { deletePost } from '@/app/actions/blog';
import { getErrorMessage, isNextRedirectError } from '@/lib/utils';

interface PostActionsProps {
    id: string;
}

export function PostActions({ id }: PostActionsProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm('Tem certeza que deseja excluir este artigo?')) {
            startTransition(async () => {
                try {
                    await deletePost(id);
                } catch (error: unknown) {
                    if (isNextRedirectError(error)) return;

                    console.error(error);
                    alert('Erro ao excluir: ' + getErrorMessage(error));
                }
            });
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Link
                href={`/admin/posts/${id}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#3B5A3C]/70 hover:text-[#3B5A3C] hover:bg-[#EEEDE5] transition-all no-underline"
                title="Editar"
            >
                <PenSquare className="h-4 w-4" />
            </Link>

            <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500/70 hover:text-red-600 hover:bg-red-50 transition-all"
                title="Excluir"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
}
