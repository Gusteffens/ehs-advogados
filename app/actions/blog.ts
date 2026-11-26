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
import type { LeadStatus } from "@/types/database";

const ALLOWED_IMAGE_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

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

const categoryFormSchema = z.object({
  name: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z
      .string()
      .min(2, "O nome da categoria deve ter pelo menos 2 caracteres.")
      .max(80, "Nome da categoria muito longo.")
  ),
  slug: optionalTrimmedString(100),
  color_hex: z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim() : "#E8D49A"),
    z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor hexadecimal inválida (ex.: #E8D49A).")
  ),
});

const categoryIdSchema = z.string().trim().min(1, "Categoria inválida.").max(100);

const leadStatusSchema = z.enum(["new", "contacted", "archived"]);

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

async function uploadBlogImage(formData: FormData, folder?: string): Promise<string> {
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

  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    throw new Error("A imagem deve ter no máximo 5 MB.");
  }

  const supabase = createAdminClient();
  const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const filePath = folder ? `${folder}/${baseName}` : baseName;

  const { error } = await supabase.storage.from("blog-covers").upload(filePath, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("Failed to upload blog image:", error);
    throw new Error("Não foi possível enviar a imagem.");
  }

  const { data } = supabase.storage.from("blog-covers").getPublicUrl(filePath);
  return data.publicUrl;
}

export async function uploadCoverImage(formData: FormData): Promise<string> {
  return uploadBlogImage(formData);
}

export async function uploadEditorImage(formData: FormData): Promise<string> {
  return uploadBlogImage(formData, "editor");
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

export async function duplicatePost(postId: string): Promise<{ id: string }> {
  const { userId } = await requireAdmin();
  await enforceBlogActionRatelimit(userId);

  const idParsed = uuidSchema.safeParse(postId);
  if (!idParsed.success) {
    throw new Error("Identificador do artigo inválido.");
  }

  const supabase = createAdminClient();
  const { data: original, error: loadError } = await supabase
    .from("posts")
    .select("title, content, excerpt, cover_image_url, author_id, category_id, reading_time_min")
    .eq("id", idParsed.data)
    .maybeSingle();

  if (loadError || !original) {
    console.error("Failed to load post to duplicate:", loadError);
    throw new Error("Artigo não encontrado para duplicação.");
  }

  const copyTitle = `Cópia de ${original.title}`.slice(0, 300);
  const uniqueSlug = await getUniquePostSlug(supabase, copyTitle);

  const { data: inserted, error: insertError } = await supabase
    .from("posts")
    .insert({
      title: copyTitle,
      slug: uniqueSlug,
      content: original.content,
      excerpt: original.excerpt,
      cover_image_url: original.cover_image_url,
      author_id: original.author_id,
      category_id: original.category_id,
      reading_time_min: original.reading_time_min ?? calculateReadingTime(original.content),
      status: "draft",
      published_at: null,
      views: 0,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("Failed to duplicate post:", insertError);
    throw new Error("Não foi possível duplicar o artigo.");
  }

  revalidatePath("/admin/posts");
  return { id: inserted.id };
}

export async function createCategory(formData: FormData): Promise<{ error?: string }> {
  const { userId } = await requireAdmin();
  try {
    await enforceBlogActionRatelimit(userId);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Muitas operações em sequência.",
    };
  }

  const parsed = categoryFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    color_hex: formData.get("color_hex"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Dados da categoria inválidos.",
    };
  }

  const slug = slugify(parsed.data.slug || parsed.data.name, {
    lower: true,
    strict: true,
    locale: "pt",
  });

  if (!slug) {
    return { error: "Não foi possível gerar um slug válido para a categoria." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("categories").insert({
    name: parsed.data.name,
    slug,
    color_hex: parsed.data.color_hex,
  });

  if (error) {
    console.error("Failed to create category:", error);
    if (error.code === "23505") {
      return { error: "Já existe uma categoria com este nome ou slug." };
    }
    return { error: "Não foi possível criar a categoria." };
  }

  updateTag("blog-categories");
  updateTag("blog-posts");
  revalidatePath("/blog");
  revalidatePath("/admin/categorias");
  return {};
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  const { userId } = await requireAdmin();
  try {
    await enforceBlogActionRatelimit(userId);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Muitas operações em sequência.",
    };
  }

  const parsedId = categoryIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { error: "Identificador de categoria inválido." };
  }

  const supabase = createAdminClient();
  const { error: unlinkError } = await supabase
    .from("posts")
    .update({ category_id: null })
    .eq("category_id", parsedId.data);

  if (unlinkError) {
    console.error("Failed to unlink posts from category:", unlinkError);
    return { error: "Não foi possível desvincular os artigos desta categoria." };
  }

  const { error } = await supabase.from("categories").delete().eq("id", parsedId.data);

  if (error) {
    console.error("Failed to delete category:", error);
    return { error: "Não foi possível excluir a categoria." };
  }

  updateTag("blog-categories");
  updateTag("blog-posts");
  revalidatePath("/blog");
  revalidatePath("/admin/categorias");
  return {};
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus
): Promise<{ error?: string }> {
  const { userId } = await requireAdmin();
  try {
    await enforceBlogActionRatelimit(userId);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Muitas operações em sequência.",
    };
  }

  const parsedId = uuidSchema.safeParse(leadId);
  if (!parsedId.success) {
    return { error: "Identificador do lead inválido." };
  }

  const parsedStatus = leadStatusSchema.safeParse(status);
  if (!parsedStatus.success) {
    return { error: "Status inválido." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("contact_leads")
    .update({ status: parsedStatus.data })
    .eq("id", parsedId.data);

  if (error) {
    console.error("Failed to update lead status:", error);
    return { error: "Não foi possível atualizar o status do lead." };
  }

  revalidatePath("/admin/leads");
  return {};
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
