'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { PenSquare, Trash2, EyeOff, Eye } from 'lucide-react';
import { deletePost, updatePost } from '@/app/actions/blog';

interface PostActionsProps {
    id: string;
    currentStatus: string;
}

export function PostActions({ id, currentStatus }: PostActionsProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm("Tem certeza que deseja excluir este artigo?")) {
            startTransition(async () => {
                try {
                    await deletePost(id);
                } catch (err: any) {
                    if (
                      err?.message === 'NEXT_REDIRECT' ||
                      err?.digest?.startsWith('NEXT_REDIRECT')
                    ) return
                    console.error(err);
                    alert('Erro ao excluir: ' + err.message);
                }
            });
        }
    };

    const handleToggleStatus = () => {
        startTransition(async () => {
            const newStatus = currentStatus === 'published' ? 'draft' : 'published';
            const formData = new FormData();
            formData.append('status', newStatus);
            // the rest will be updated in DB by coalescing or ignoring the fields in the updatePost signature? Wait, updatePost requires title, content, etc.
            // Oh, the updatePost signature I wrote strictly requires title and content from form data!
            // I should create a specific Server Action `togglePostStatus` to make this easier, or just use what I have. Let's build `togglePostStatus`.
        });
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
