'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import DOMPurify from 'isomorphic-dompurify'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
})

const sanitizeHtml = (html: string) => DOMPurify.sanitize(html, {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's',
    'h2', 'h3', 'ul', 'ol', 'li',
    'blockquote', 'a', 'img', 'hr'
  ],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel'],
})

export async function uploadCoverImage(formData: FormData): Promise<string> {
    const { userId, sessionClaims } = await auth()
    const role = (sessionClaims?.metadata as any)?.role
    if (!userId || role !== 'admin') redirect('/')

    const supabase = createAdminClient()
    const file = formData.get('file') as File
    if (!file) throw new Error("Nenhum arquivo enviado")

    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
    
    const { error } = await supabase.storage
        .from('blog-covers')
        .upload(fileName, file, { upsert: true })
    if (error) throw new Error(error.message)
    
    const { data } = supabase.storage
        .from('blog-covers')
        .getPublicUrl(fileName)
    return data.publicUrl
}

/** Resolve a valid author UUID from the authors table.
 *  Priority: 1) explicitly selected author_id, 2) author with matching clerk_id, 3) first author.
 *  Returns null if the table is empty (post will have no author). */
async function resolveAuthorId(
    supabase: ReturnType<typeof createAdminClient>,
    formAuthorId: string,
    clerkUserId: string
): Promise<string | null> {
    if (formAuthorId) return formAuthorId

    // Try matching by clerk_id column if it exists
    const { data: byClerk } = await supabase
        .from('authors')
        .select('id')
        .eq('clerk_id', clerkUserId)
        .maybeSingle()
    if (byClerk?.id) return byClerk.id

    // Fall back to first author
    const { data: first } = await supabase
        .from('authors')
        .select('id')
        .order('full_name')
        .limit(1)
        .maybeSingle()
    return first?.id ?? null
}

export async function createPost(formData: FormData) {
    const { userId, sessionClaims } = await auth()
    const role = (sessionClaims?.metadata as any)?.role
    if (!userId || role !== 'admin') redirect('/')

    const { success } = await ratelimit.limit(`blog_action_${userId}`)
    if (!success) {
        throw new Error('Muitas operações. Tente novamente.')
    }

    const supabase = createAdminClient()
    const title = formData.get('title') as string
    let content = formData.get('content') as string
    content = sanitizeHtml(content)
    
    const excerpt = formData.get('excerpt') as string
    const category_id = formData.get('category_id') as string
    const status = formData.get('status') as string
    const cover_image_url = formData.get('cover_image_url') as string
    const formAuthorId = formData.get('author_id') as string

    const author_id = await resolveAuthorId(supabase, formAuthorId, userId)

    const slug = slugify(title, {
        lower: true,
        strict: true,
        locale: 'pt'
    })

    const words = content.replace(/<[^>]*>/g, '').split(' ').length
    const reading_time_min = Math.ceil(words / 200)

    const { error } = await supabase.from('posts').insert({
        title,
        slug,
        content,
        excerpt,
        category_id: category_id || null,
        status: status || 'draft',
        cover_image_url: cover_image_url || null,
        author_id,
        reading_time_min,
        published_at: status === 'published' ? new Date().toISOString() : null,
    })

    if (error) throw new Error(error.message)
    redirect('/admin/posts')
}

export async function updatePost(id: string, formData: FormData) {
    const { userId, sessionClaims } = await auth()
    const role = (sessionClaims?.metadata as any)?.role
    if (!userId || role !== 'admin') redirect('/')

    const { success } = await ratelimit.limit(`blog_action_${userId}`)
    if (!success) {
        throw new Error('Muitas operações. Tente novamente.')
    }

    const supabase = createAdminClient()
    const title = formData.get('title') as string
    let content = formData.get('content') as string
    content = sanitizeHtml(content)
    
    const excerpt = formData.get('excerpt') as string
    const category_id = formData.get('category_id') as string
    const status = formData.get('status') as string
    const cover_image_url = formData.get('cover_image_url') as string
    const formAuthorId = formData.get('author_id') as string

    const author_id = await resolveAuthorId(supabase, formAuthorId, userId)

    const words = content.replace(/<[^>]*>/g, '').split(' ').length
    const reading_time_min = Math.ceil(words / 200)

    const { error } = await supabase.from('posts').update({
        title,
        content,
        excerpt,
        category_id: category_id || null,
        status,
        cover_image_url: cover_image_url || null,
        author_id,
        reading_time_min,
        updated_at: new Date().toISOString(),
        published_at: status === 'published' ? new Date().toISOString() : null,
    }).eq('id', id)

    if (error) throw new Error(error.message)
    redirect('/admin/posts')
}

export async function deletePost(id: string) {
    const { userId, sessionClaims } = await auth()
    const role = (sessionClaims?.metadata as any)?.role
    if (!userId || role !== 'admin') redirect('/')

    const supabase = createAdminClient()
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)
    redirect('/admin/posts')
}

export async function incrementViews(postId: string) {
    const supabase = createAdminClient()
    try {
        await supabase.rpc('increment_views', { post_id: postId })
    } catch {
        // Fallback: direct update if RPC not available yet
        await supabase
            .from('posts')
            .update({ views: 1 })
            .eq('id', postId)
    }
}
