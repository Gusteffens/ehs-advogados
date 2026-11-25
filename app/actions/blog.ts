"use server";

import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { sanitizeBlogHtml } from "@/lib/sanitize-blog-html";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";
import { getBlogActionRatelimit, getViewRatelimit } from "@/lib/upstash";
import { calculateReadingTime } from "@/lib/utils";

const ALLOWED_IMAGE_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const MAX_COVER_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const uuidSchema = z.string().uuid("Identificador inválido.");

const optionalTrimmedString = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z.string().max(max)
  );

const coverImageUrlSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : ""),
  z
    .string()
    .max(2048)
    .refine(
      (val) =>
        val === "" ||
        val.startsWith("https://") ||
        val.startsWith("http://") ||
        val.startsWith("/"),
      "URL de imagem de capa inválida."
    )
);

const postFormSchema = z.object({
  title: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z.string().min(1, "O título é obrigatório.").max(300, "Título muito longo.")
  ),
  slug: optionalTrimmedString(200),
  content: z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z.string().max(200_000, "Conteúdo excede o limite permitido.")
  ),
  excerpt: optionalTrimmedString(1000),
  category_id: optionalTrimmedString(100),
  status: z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim() : "draft"),
    z.enum(["draft", "published"])
  ),
  cover_image_url: coverImageUrlSchema,
  author_id: optionalTrimmedString(100),
});

async function enforceBlogActionRatelimit(userId: string) {
  const ratelimit = getBlogActionRatelimit();

  if (!ratelimit) {
    return;
  }

  let allowed = true;
  try {
    const result = await ratelimit.limit(`blog_action_${userId}`);
    allowed = result.success;
  } catch (error) {
    console.error("Falha ao consultar rate limit do blog:", error);
    return;
  }

  if (!allowed) {
    throw new Error("Muitas operações em sequência. Aguarde um instante e tente novamente.");
  }
}

function revalidatePublicBlog(slugs: Array<string | null | undefined> = []) {
  updateTag("blog-posts");
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");

  const uniqueSlugs = new Set(slugs.filter((s): s is string => Boolean(s)));
  for (const slug of uniqueSlugs) {
    revalidatePath(`/blog/${slug}`);
  }
}

function normalizeSlug(source: string): string {
  return (
    slugify(source, {
      lower: true,
      strict: true,
      locale: "pt",
    }) || `artigo-${Date.now()}`
  );
}

async function getUniquePostSlug(
  supabase: ReturnType<typeof createAdminClient>,
  preferredSource: string,
  excludePostId?: string
): Promise<string> {
  const baseSlug = normalizeSlug(preferredSource);

  let query = supabase
    .from("posts")
    .select("id, slug")
    .or(`slug.eq.${baseSlug},slug.like.${baseSlug}-%`);

  if (excludePostId) {
    query = query.neq("id", excludePostId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to check slug uniqueness:", error);
    throw new Error("Não foi possível gerar um link único para o artigo.");
  }

  const existingSlugs = new Set((data ?? []).map((post) => post.slug));

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  let candidate = `${baseSlug}-${suffix}`;

  while (existingSlugs.has(candidate)) {
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }

  return candidate;
}

async function resolveAuthorId(
  supabase: ReturnType<typeof createAdminClient>,
  formAuthorId: string,
  clerkUserId: string
): Promise<string | null> {
  if (formAuthorId) {
    return formAuthorId;
  }

  const { data: byClerk } = await supabase
    .from("authors")
    .select("id")
    .eq("id", clerkUserId)
    .maybeSingle();

  if (byClerk?.id) {
    return byClerk.id;
  }

  const { data: first } = await supabase
    .from("authors")
    .select("id")
    .order("full_name")
    .limit(1)
    .maybeSingle();

  return first?.id ?? null;
}

export async function uploadCoverImage(formData: FormData): Promise<string> {
  const { userId } = await requireAdmin();
  await enforceBlogActionRatelimit(userId);

  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("Nenhum arquivo enviado.");
  }

  const ext = ALLOWED_IMAGE_MIME_TO_EXT[file.type];
  if (!ext) {
    throw new Error("Formato de imagem inválido. Utilize JPEG, PNG, WebP ou AVIF.");
  }

  if (file.size <= 0 || file.size > MAX_COVER_IMAGE_BYTES) {
    throw new Error("A imagem deve ter no máximo 5 MB.");
  }

  const supabase = createAdminClient();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const { error } = await supabase.storage.from("blog-covers").upload(fileName, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("Failed to upload cover image:", error);
    throw new Error("Não foi possível enviar a imagem de capa.");
  }

  const { data } = supabase.storage.from("blog-covers").getPublicUrl(fileName);
  return data.publicUrl;
}

export async function createPost(formData: FormData) {
  const { userId } = await requireAdmin();
  await enforceBlogActionRatelimit(userId);

  const parsed = postFormSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    content: formData.get("content"),
    excerpt: formData.get("excerpt"),
    category_id: formData.get("category_id"),
    status: formData.get("status"),
    cover_image_url: formData.get("cover_image_url"),
    author_id: formData.get("author_id"),
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Dados do artigo inválidos.";
    throw new Error(firstIssue);
  }

  const supabase = createAdminClient();
  const sanitizedContent = sanitizeBlogHtml(parsed.data.content);
  const reading_time_min = calculateReadingTime(sanitizedContent);
  const author_id = await resolveAuthorId(supabase, parsed.data.author_id, userId);
  const slug = await getUniquePostSlug(
    supabase,
    parsed.data.slug || parsed.data.title
  );

  const { error } = await supabase.from("posts").insert({
    title: parsed.data.title,
    slug,
    content: sanitizedContent,
    excerpt: parsed.data.excerpt || null,
    category_id: parsed.data.category_id || null,
    status: parsed.data.status,
    cover_image_url: parsed.data.cover_image_url || null,
    author_id,
    reading_time_min,
    published_at: parsed.data.status === "published" ? new Date().toISOString() : null,
  });

  if (error) {
    console.error("Failed to create post:", error);
    throw new Error("Não foi possível criar o artigo. Tente novamente.");
  }

  revalidatePublicBlog([slug]);
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function updatePost(id: string, formData: FormData) {
  const { userId } = await requireAdmin();
  await enforceBlogActionRatelimit(userId);

  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) {
    throw new Error("Identificador do artigo inválido.");
  }

  const parsed = postFormSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    content: formData.get("content"),
    excerpt: formData.get("excerpt"),
    category_id: formData.get("category_id"),
    status: formData.get("status"),
    cover_image_url: formData.get("cover_image_url"),
    author_id: formData.get("author_id"),
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Dados do artigo inválidos.";
    throw new Error(firstIssue);
  }

  const supabase = createAdminClient();
  const { data: existingPost, error: existingError } = await supabase
    .from("posts")
    .select("slug, published_at")
    .eq("id", idParsed.data)
    .maybeSingle();

  if (existingError || !existingPost) {
    console.error("Failed to load existing post for update:", existingError);
    throw new Error("Artigo não encontrado.");
  }

  const sanitizedContent = sanitizeBlogHtml(parsed.data.content);
  const reading_time_min = calculateReadingTime(sanitizedContent);
  const author_id = await resolveAuthorId(supabase, parsed.data.author_id, userId);

  let nextSlug = existingPost.slug;
  if (parsed.data.slug) {
    const normalizedRequested = normalizeSlug(parsed.data.slug);
    if (normalizedRequested !== existingPost.slug) {
      nextSlug = await getUniquePostSlug(supabase, normalizedRequested, idParsed.data);
    }
  }

  const published_at =
    parsed.data.status === "published"
      ? (existingPost.published_at ?? new Date().toISOString())
      : null;

  const { error } = await supabase
    .from("posts")
    .update({
      title: parsed.data.title,
      slug: nextSlug,
      content: sanitizedContent,
      excerpt: parsed.data.excerpt || null,
      category_id: parsed.data.category_id || null,
      status: parsed.data.status,
      cover_image_url: parsed.data.cover_image_url || null,
      author_id,
      reading_time_min,
      updated_at: new Date().toISOString(),
      published_at,
    })
    .eq("id", idParsed.data);

  if (error) {
    console.error("Failed to update post:", error);
    throw new Error("Não foi possível atualizar o artigo. Tente novamente.");
  }

  revalidatePublicBlog([existingPost.slug, nextSlug]);
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function deletePost(id: string) {
  const { userId } = await requireAdmin();
  await enforceBlogActionRatelimit(userId);

  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) {
    throw new Error("Identificador do artigo inválido.");
  }

  const supabase = createAdminClient();
  const { data: existingPost } = await supabase
    .from("posts")
    .select("slug")
    .eq("id", idParsed.data)
    .maybeSingle();

  const { error } = await supabase.from("posts").delete().eq("id", idParsed.data);

  if (error) {
    console.error("Failed to delete post:", error);
    throw new Error("Não foi possível excluir o artigo. Tente novamente.");
  }

  revalidatePublicBlog([existingPost?.slug]);
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function incrementViews(postId: string): Promise<void> {
  const parsed = uuidSchema.safeParse(postId);
  if (!parsed.success) {
    return;
  }

  const ratelimit = getViewRatelimit();
  if (ratelimit) {
    try {
      const headersList = await headers();
      const ip =
        headersList.get("x-real-ip") ??
        headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
        "unknown";

      const { success } = await ratelimit.limit(`${ip}:${parsed.data}`);
      if (!success) {
        return;
      }
    } catch (error) {
      console.error("Falha ao verificar rate limit de visualizações:", error);
    }
  }

  const supabase = createPublicClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase.rpc("increment_post_views", {
    p_post_id: parsed.data,
  });

  if (error) {
    console.error("Failed to increment post views:", error.message);
  }
}
