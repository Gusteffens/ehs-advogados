'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { auth } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/auth'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import DOMPurify from 'isomorphic-dompurify'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
})

const sanitizeHtml = (html: string) =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      's',
      'h2',
      'h3',
      'ul',
      'ol',
      'li',
      'blockquote',
      'a',
      'img',
      'hr',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel'],
  })

async function requireAdminUser() {
  const { userId, sessionClaims } = await auth()

  if (!userId || !isAdmin(sessionClaims)) {
    redirect('/')
  }

  return { userId }
}

function revalidatePublicBlog(slug?: string | null) {
  revalidateTag('blog-posts', 'max')
  revalidatePath('/')
  revalidatePath('/blog')

  if (slug) {
    revalidatePath(`/blog/${slug}`)
  }
}

async function getPostSlugById(
  supabase: ReturnType<typeof createAdminClient>,
  id: string
): Promise<string | null> {
  const { data } = await supabase
    .from('posts')
    .select('slug')
    .eq('id', id)
    .maybeSingle()

  return data?.slug ?? null
}

export async function uploadCoverImage(formData: FormData): Promise<string> {
  await requireAdminUser()

  const supabase = createAdminClient()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    throw new Error('Nenhum arquivo enviado')
  }

  const ext = file.name.split('.').pop() || 'bin'
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

  const { error } = await supabase.storage
    .from('blog-covers')
    .upload(fileName, file, { upsert: true })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage.from('blog-covers').getPublicUrl(fileName)
  return data.publicUrl
}

async function resolveAuthorId(
  supabase: ReturnType<typeof createAdminClient>,
  formAuthorId: string,
  clerkUserId: string
): Promise<string | null> {
  if (formAuthorId) return formAuthorId

  const { data: byClerk } = await supabase
    .from('authors')
    .select('id')
    .eq('id', clerkUserId)
    .maybeSingle()

  if (byClerk?.id) return byClerk.id

  const { data: first } = await supabase
    .from('authors')
    .select('id')
    .order('full_name')
    .limit(1)
    .maybeSingle()

  return first?.id ?? null
}

export async function createPost(formData: FormData) {
  const { userId } = await requireAdminUser()
  const { success } = await ratelimit.limit(`blog_action_${userId}`)

  if (!success) {
    throw new Error('Muitas operações. Tente novamente.')
  }

  const supabase = createAdminClient()
  const title = String(formData.get('title') ?? '')
  let content = String(formData.get('content') ?? '')
  content = sanitizeHtml(content)

  const excerpt = String(formData.get('excerpt') ?? '')
  const category_id = String(formData.get('category_id') ?? '')
  const status = String(formData.get('status') ?? '')
  const cover_image_url = String(formData.get('cover_image_url') ?? '')
  const formAuthorId = String(formData.get('author_id') ?? '')

  const author_id = await resolveAuthorId(supabase, formAuthorId, userId)
  const slug = slugify(title, {
    lower: true,
    strict: true,
    locale: 'pt',
  })

  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
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

  if (error) {
    throw new Error(error.message)
  }

  revalidatePublicBlog(slug)
  revalidatePath('/admin/posts')
  redirect('/admin/posts')
}

export async function updatePost(id: string, formData: FormData) {
  const { userId } = await requireAdminUser()
  const { success } = await ratelimit.limit(`blog_action_${userId}`)

  if (!success) {
    throw new Error('Muitas operações. Tente novamente.')
  }

  const supabase = createAdminClient()
  const currentSlug = await getPostSlugById(supabase, id)
  const title = String(formData.get('title') ?? '')
  let content = String(formData.get('content') ?? '')
  content = sanitizeHtml(content)

  const excerpt = String(formData.get('excerpt') ?? '')
  const category_id = String(formData.get('category_id') ?? '')
  const status = String(formData.get('status') ?? '')
  const cover_image_url = String(formData.get('cover_image_url') ?? '')
  const formAuthorId = String(formData.get('author_id') ?? '')

  const author_id = await resolveAuthorId(supabase, formAuthorId, userId)
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
  const reading_time_min = Math.ceil(words / 200)

  const { error } = await supabase
    .from('posts')
    .update({
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
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePublicBlog(currentSlug)
  revalidatePath('/admin/posts')
  redirect('/admin/posts')
}

export async function deletePost(id: string) {
  await requireAdminUser()

  const supabase = createAdminClient()
  const currentSlug = await getPostSlugById(supabase, id)
  const { error } = await supabase.from('posts').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePublicBlog(currentSlug)
  revalidatePath('/admin/posts')
  redirect('/admin/posts')
}

export async function incrementViews(postId: string) {
  const supabase = createAdminClient()

  try {
    const { error } = await supabase.rpc('increment_views', { post_id: postId })

    if (!error) {
      return
    }
  } catch {
    // Fall through to the manual increment below.
  }

  const { data } = await supabase
    .from('posts')
    .select('views')
    .eq('id', postId)
    .maybeSingle()

  const currentViews = typeof data?.views === 'number' ? data.views : 0

  await supabase
    .from('posts')
    .update({ views: currentViews + 1 })
    .eq('id', postId)
}
