import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { EditPostForm } from "@/components/admin/edit-post-form";

export const revalidate = 0;

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = createAdminClient();
    const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !post) {
        notFound();
    }

    return <EditPostForm post={post} />;
}
