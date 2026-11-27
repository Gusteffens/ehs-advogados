"use server";

import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import slugify from "slugify";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { sanitizeBlogHtml } from "@/lib/sanitize-blog-html";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";
import { getBlogActionRatelimit, getViewRatelimit } from "@/lib/upstash";
import { calculateReadingTime } from "@/lib/utils";
import type {
  BlogActionResult,
  BulkActionResult,
  CategoryActionResult,
  PostStatus,
  UploadImageResult,
} from "@/types/blog";
import type { LeadStatus } from "@/types/database";

const ALLOWED_IMAGE_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB
const STORAGE_BUCKET = "blog-covers";

const uuidSchema = z.string().uuid("Identificador inválido.");
const uuidListSchema = z
  .array(uuidSchema)
  .min(1, "Selecione ao menos um artigo.")
  .max(100, "Limite de 100 artigos por operação em lote.");

const postStatusSchema = z.enum(["draft", "published"]);

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
    (value) =>
      typeof value === "string" && value.trim() ? value.trim() : "draft",
    postStatusSchema
  ),
  cover_image_url: coverImageUrlSchema,
  author_id: optionalTrimmedString(100),
  published_at: optionalTrimmedString(64),
  tags: optionalTrimmedString(1000),
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
    (value) =>
      typeof value === "string" && value.trim() ? value.trim() : "#E8D49A",
    z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Cor hexadecimal inválida (ex.: #E8D49A).")
  ),
  description: optionalTrimmedString(300),
});

const categoryIdSchema = z
  .string()
  .trim()
  .min(1, "Categoria inválida.")
  .max(100);

const leadStatusSchema = z.enum(["new", "contacted", "archived"]);

async function checkBlogActionRatelimit(
  userId: string
): Promise<string | null> {
  const ratelimit = getBlogActionRatelimit();
  if (!ratelimit) return null;

  try {
    const result = await ratelimit.limit(`blog_action_${userId}`);
    if (!result.success) {
      return "Muitas operações em sequência. Aguarde um instante e tente novamente.";
    }
    return null;
  } catch (error) {
    console.error("Falha ao consultar rate limit do blog:", error);
    return null;
  }
}

function revalidatePublicBlog(slugs: Array<string | null | undefined> = []) {
  try {
    updateTag("blog-posts");
  } catch {
    // Ignore outside request context
  }
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

function parseOptionalIsoDate(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  const parsed = new Date(raw.trim());
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function parseTagsInput(raw: string | null | undefined): string[] | null {
  if (raw === undefined || raw === null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return Array.from(
          new Set(
            parsed
              .filter((t): t is string => typeof t === "string")
              .map((t) => t.trim())
              .filter(Boolean)
              .slice(0, 15)
          )
        );
      }
    } catch {
      // Fallback to comma split
    }
  }

  return Array.from(
    new Set(
      trimmed
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 15)
    )
  );
}

function extractStoragePathFromPublicUrl(
  url: string | null | undefined
): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const rawPath = url.slice(idx + marker.length).split("?")[0];
  if (!rawPath) return null;
  try {
    return decodeURIComponent(rawPath);
  } catch {
    return rawPath;
  }
}

async function cleanupUnusedCoverImages(
  supabase: ReturnType<typeof createAdminClient>,
  urls: Array<string | null | undefined>
): Promise<void> {
  const uniqueUrls = Array.from(
    new Set(urls.filter((u): u is string => Boolean(u)))
  );
  if (uniqueUrls.length === 0) return;

  try {
    const pathsToRemove: string[] = [];

    for (const url of uniqueUrls) {
      const storagePath = extractStoragePathFromPublicUrl(url);
      if (!storagePath) continue;

      // Verify no remaining post still references this exact cover image
      const { count, error: countError } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("cover_image_url", url);

      if (!countError && (count ?? 0) === 0) {
        pathsToRemove.push(storagePath);
      }
    }

    if (pathsToRemove.length > 0) {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(pathsToRemove);
      if (error) {
        console.warn("Storage cover cleanup warning:", error.message);
      }
    }
  } catch (error) {
    console.warn("Best-effort cover cleanup failed:", error);
  }
}

async function syncPostTagsIfSupported(
  supabase: ReturnType<typeof createAdminClient>,
  postId: string,
  tagNames: string[] | null
): Promise<void> {
  if (tagNames === null) return;

  // tags/post_tags tables may or may not exist depending on deployed migrations
  const untyped = supabase as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        in: (
          col: string,
          vals: string[]
        ) => Promise<{
          data: Array<{ id: string; name: string; slug: string }> | null;
          error: { message: string } | null;
        }>;
      };
      upsert: (
        rows: Array<Record<string, unknown>>,
        opts?: Record<string, unknown>
      ) => {
        select: (cols: string) => Promise<{
          data: Array<{ id: string; slug: string }> | null;
          error: { message: string } | null;
        }>;
      };
      delete: () => {
        eq: (
          col: string,
          val: string
        ) => Promise<{ error: { message: string } | null }>;
      };
      insert: (
        rows: Array<Record<string, unknown>>
      ) => Promise<{ error: { message: string } | null }>;
    };
  };

  try {
    const { error: deleteError } = await untyped
      .from("post_tags")
      .delete()
      .eq("post_id", postId);
    if (deleteError) {
      return; // Table likely does not exist yet
    }

    if (tagNames.length === 0) return;

    const tagPayload = tagNames
      .map((name) => ({
        name,
        slug: slugify(name, { lower: true, strict: true, locale: "pt" }),
      }))
      .filter((t) => Boolean(t.slug));

    if (tagPayload.length === 0) return;

    const { data: upsertedTags, error: upsertError } = await untyped
      .from("tags")
      .upsert(tagPayload, { onConflict: "slug" })
      .select("id, slug");

    if (upsertError || !upsertedTags || upsertedTags.length === 0) return;

    await untyped.from("post_tags").insert(
      upsertedTags.map((tag) => ({
        post_id: postId,
        tag_id: tag.id,
      }))
    );
  } catch {
    // Gracefully ignore when tags schema is absent
  }
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

async function uploadBlogImage(
  formData: FormData,
  folder?: string
): Promise<UploadImageResult> {
  const { userId } = await requireAdmin();
  const limitError = await checkBlogActionRatelimit(userId);
  if (limitError) return { ok: false, error: limitError };

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { ok: false, error: "Nenhum arquivo enviado." };
  }

  const ext = ALLOWED_IMAGE_MIME_TO_EXT[file.type];
  if (!ext) {
    return {
      ok: false,
      error: "Formato de imagem inválido. Utilize JPEG, PNG, WebP ou AVIF.",
    };
  }

  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "A imagem deve ter no máximo 15 MB." };
  }

  const supabase = createAdminClient();
  const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const filePath = folder ? `${folder}/${baseName}` : baseName;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Failed to upload blog image:", error);
    return { ok: false, error: "Não foi possível enviar a imagem." };
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return { ok: true, url: data.publicUrl };
}

export async function uploadCoverImage(
  formData: FormData
): Promise<UploadImageResult> {
  return uploadBlogImage(formData);
}

export async function uploadEditorImage(
  formData: FormData
): Promise<UploadImageResult> {
  return uploadBlogImage(formData, "editor");
}

export async function createPost(
  formData: FormData
): Promise<BlogActionResult> {
  const { userId } = await requireAdmin();
  const limitError = await checkBlogActionRatelimit(userId);
  if (limitError) return { ok: false, error: limitError };

  const parsed = postFormSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    content: formData.get("content"),
    excerpt: formData.get("excerpt"),
    category_id: formData.get("category_id"),
    status: formData.get("status"),
    cover_image_url: formData.get("cover_image_url"),
    author_id: formData.get("author_id"),
    published_at: formData.get("published_at"),
    tags: formData.get("tags"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados do artigo inválidos.",
    };
  }

  try {
    const supabase = createAdminClient();
    const sanitizedContent = sanitizeBlogHtml(parsed.data.content);
    const reading_time_min = calculateReadingTime(sanitizedContent);
    const author_id = await resolveAuthorId(
      supabase,
      parsed.data.author_id,
      userId
    );
    const slug = await getUniquePostSlug(
      supabase,
      parsed.data.slug || parsed.data.title
    );

    const customPublishedAt = parseOptionalIsoDate(parsed.data.published_at);
    const published_at =
      customPublishedAt ??
      (parsed.data.status === "published" ? new Date().toISOString() : null);

    const { data: inserted, error } = await supabase
      .from("posts")
      .insert({
        title: parsed.data.title,
        slug,
        content: sanitizedContent,
        excerpt: parsed.data.excerpt || null,
        category_id: parsed.data.category_id || null,
        status: parsed.data.status,
        cover_image_url: parsed.data.cover_image_url || null,
        author_id,
        reading_time_min,
        published_at,
      })
      .select("id, slug, published_at, updated_at")
      .single();

    if (error || !inserted) {
      console.error("Failed to create post:", error);
      return {
        ok: false,
        error: "Não foi possível criar o artigo. Tente novamente.",
      };
    }

    const rawTags = formData.get("tags");
    if (typeof rawTags === "string") {
      await syncPostTagsIfSupported(
        supabase,
        inserted.id,
        parseTagsInput(rawTags)
      );
    }

    revalidatePublicBlog([inserted.slug]);
    revalidatePath("/admin");
    revalidatePath("/admin/posts");

    return {
      ok: true,
      id: inserted.id,
      slug: inserted.slug,
      published_at: inserted.published_at,
      updated_at: inserted.updated_at,
    };
  } catch (err) {
    console.error("createPost exception:", err);
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Não foi possível criar o artigo.",
    };
  }
}

export async function updatePost(
  id: string,
  formData: FormData
): Promise<BlogActionResult> {
  const { userId } = await requireAdmin();
  const limitError = await checkBlogActionRatelimit(userId);
  if (limitError) return { ok: false, error: limitError };

  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) {
    return { ok: false, error: "Identificador do artigo inválido." };
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
    published_at: formData.get("published_at"),
    tags: formData.get("tags"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados do artigo inválidos.",
    };
  }

  try {
    const supabase = createAdminClient();
    const { data: existingPost, error: existingError } = await supabase
      .from("posts")
      .select("slug, published_at, cover_image_url")
      .eq("id", idParsed.data)
      .maybeSingle();

    if (existingError || !existingPost) {
      console.error("Failed to load existing post for update:", existingError);
      return { ok: false, error: "Artigo não encontrado." };
    }

    const sanitizedContent = sanitizeBlogHtml(parsed.data.content);
    const reading_time_min = calculateReadingTime(sanitizedContent);
    const author_id = await resolveAuthorId(
      supabase,
      parsed.data.author_id,
      userId
    );

    let nextSlug = existingPost.slug;
    if (parsed.data.slug) {
      const normalizedRequested = normalizeSlug(parsed.data.slug);
      if (normalizedRequested !== existingPost.slug) {
        nextSlug = await getUniquePostSlug(
          supabase,
          normalizedRequested,
          idParsed.data
        );
      }
    }

    const customPublishedAt = parseOptionalIsoDate(parsed.data.published_at);
    // Preserve original published_at when reverting to draft or republishing
    const published_at =
      customPublishedAt ??
      (parsed.data.status === "published"
        ? (existingPost.published_at ?? new Date().toISOString())
        : existingPost.published_at);

    const nextCoverUrl = parsed.data.cover_image_url || null;
    const nowIso = new Date().toISOString();

    const { error } = await supabase
      .from("posts")
      .update({
        title: parsed.data.title,
        slug: nextSlug,
        content: sanitizedContent,
        excerpt: parsed.data.excerpt || null,
        category_id: parsed.data.category_id || null,
        status: parsed.data.status,
        cover_image_url: nextCoverUrl,
        author_id,
        reading_time_min,
        updated_at: nowIso,
        published_at,
      })
      .eq("id", idParsed.data);

    if (error) {
      console.error("Failed to update post:", error);
      return {
        ok: false,
        error: "Não foi possível atualizar o artigo. Tente novamente.",
      };
    }

    const rawTags = formData.get("tags");
    if (typeof rawTags === "string") {
      await syncPostTagsIfSupported(
        supabase,
        idParsed.data,
        parseTagsInput(rawTags)
      );
    }

    // Best-effort cleanup of replaced/removed cover image
    if (
      existingPost.cover_image_url &&
      existingPost.cover_image_url !== nextCoverUrl
    ) {
      void cleanupUnusedCoverImages(supabase, [existingPost.cover_image_url]);
    }

    revalidatePublicBlog([existingPost.slug, nextSlug]);
    revalidatePath("/admin");
    revalidatePath("/admin/posts");
    revalidatePath(`/admin/posts/${idParsed.data}`);

    return {
      ok: true,
      id: idParsed.data,
      slug: nextSlug,
      published_at,
      updated_at: nowIso,
    };
  } catch (err) {
    console.error("updatePost exception:", err);
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o artigo.",
    };
  }
}

export async function togglePostStatus(
  id: string,
  status: PostStatus
): Promise<BlogActionResult> {
  const { userId } = await requireAdmin();
  const limitError = await checkBlogActionRatelimit(userId);
  if (limitError) return { ok: false, error: limitError };

  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) {
    return { ok: false, error: "Identificador do artigo inválido." };
  }

  const statusParsed = postStatusSchema.safeParse(status);
  if (!statusParsed.success) {
    return { ok: false, error: "Status inválido." };
  }

  const supabase = createAdminClient();
  const { data: existingPost, error: loadError } = await supabase
    .from("posts")
    .select("slug, published_at")
    .eq("id", idParsed.data)
    .maybeSingle();

  if (loadError || !existingPost) {
    return { ok: false, error: "Artigo não encontrado." };
  }

  // Preserve original published_at when reverting to draft or republishing
  const nextPublishedAt =
    statusParsed.data === "published"
      ? (existingPost.published_at ?? new Date().toISOString())
      : existingPost.published_at;

  const nowIso = new Date().toISOString();

  const { error } = await supabase
    .from("posts")
    .update({
      status: statusParsed.data,
      published_at: nextPublishedAt,
      updated_at: nowIso,
    })
    .eq("id", idParsed.data);

  if (error) {
    console.error("Failed to toggle post status:", error);
    return { ok: false, error: "Não foi possível alterar o status do artigo." };
  }

  revalidatePublicBlog([existingPost.slug]);
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${idParsed.data}`);

  return {
    ok: true,
    id: idParsed.data,
    slug: existingPost.slug,
    published_at: nextPublishedAt,
    updated_at: nowIso,
  };
}

export async function bulkUpdatePostsStatus(
  ids: string[],
  status: PostStatus
): Promise<BulkActionResult> {
  const { userId } = await requireAdmin();
  const limitError = await checkBlogActionRatelimit(userId);
  if (limitError) return { ok: false, error: limitError };

  const idsParsed = uuidListSchema.safeParse(ids);
  if (!idsParsed.success) {
    return {
      ok: false,
      error: idsParsed.error.issues[0]?.message ?? "Artigos inválidos.",
    };
  }

  const statusParsed = postStatusSchema.safeParse(status);
  if (!statusParsed.success) {
    return { ok: false, error: "Status inválido." };
  }

  const supabase = createAdminClient();
  const { data: existingPosts, error: fetchError } = await supabase
    .from("posts")
    .select("id, slug, published_at")
    .in("id", idsParsed.data);

  if (fetchError) {
    console.error("Failed to fetch posts for bulk status update:", fetchError);
    return { ok: false, error: "Não foi possível localizar os artigos." };
  }

  const nowIso = new Date().toISOString();
  const targetRows = existingPosts ?? [];

  if (statusParsed.data === "draft") {
    // Preserve published_at on all rows when reverting to draft
    const { error } = await supabase
      .from("posts")
      .update({ status: "draft", updated_at: nowIso })
      .in("id", idsParsed.data);

    if (error) {
      console.error("Failed bulk draft update:", error);
      return { ok: false, error: "Falha ao mover artigos para rascunho." };
    }
  } else {
    // Split into posts that already have published_at vs those that need one
    const withDateIds = targetRows
      .filter((r) => Boolean(r.published_at))
      .map((r) => r.id);
    const withoutDateIds = targetRows
      .filter((r) => !r.published_at)
      .map((r) => r.id);

    if (withDateIds.length > 0) {
      const { error } = await supabase
        .from("posts")
        .update({ status: "published", updated_at: nowIso })
        .in("id", withDateIds);
      if (error) {
        console.error("Failed bulk publish (withDate):", error);
        return { ok: false, error: "Falha ao publicar artigos selecionados." };
      }
    }

    if (withoutDateIds.length > 0) {
      const { error } = await supabase
        .from("posts")
        .update({
          status: "published",
          published_at: nowIso,
          updated_at: nowIso,
        })
        .in("id", withoutDateIds);
      if (error) {
        console.error("Failed bulk publish (withoutDate):", error);
        return { ok: false, error: "Falha ao publicar artigos selecionados." };
      }
    }
  }

  revalidatePublicBlog(targetRows.map((p) => p.slug));
  revalidatePath("/admin");
  revalidatePath("/admin/posts");

  return { ok: true, count: targetRows.length };
}

export async function bulkDeletePosts(ids: string[]): Promise<BulkActionResult> {
  const { userId } = await requireAdmin();
  const limitError = await checkBlogActionRatelimit(userId);
  if (limitError) return { ok: false, error: limitError };

  const idsParsed = uuidListSchema.safeParse(ids);
  if (!idsParsed.success) {
    return {
      ok: false,
      error: idsParsed.error.issues[0]?.message ?? "Artigos inválidos.",
    };
  }

  const supabase = createAdminClient();
  const { data: existingPosts } = await supabase
    .from("posts")
    .select("slug, cover_image_url")
    .in("id", idsParsed.data);

  const { error } = await supabase
    .from("posts")
    .delete()
    .in("id", idsParsed.data);

  if (error) {
    console.error("Failed bulk delete posts:", error);
    return { ok: false, error: "Não foi possível excluir os artigos." };
  }

  const rows = existingPosts ?? [];
  void cleanupUnusedCoverImages(
    supabase,
    rows.map((r) => r.cover_image_url)
  );

  revalidatePublicBlog(rows.map((p) => p.slug));
  revalidatePath("/admin");
  revalidatePath("/admin/posts");

  return { ok: true, count: rows.length || idsParsed.data.length };
}

export async function deletePost(id: string): Promise<BlogActionResult> {
  const { userId } = await requireAdmin();
  const limitError = await checkBlogActionRatelimit(userId);
  if (limitError) return { ok: false, error: limitError };

  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) {
    return { ok: false, error: "Identificador do artigo inválido." };
  }

  const supabase = createAdminClient();
  const { data: existingPost } = await supabase
    .from("posts")
    .select("slug, cover_image_url")
    .eq("id", idParsed.data)
    .maybeSingle();

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", idParsed.data);

  if (error) {
    console.error("Failed to delete post:", error);
    return {
      ok: false,
      error: "Não foi possível excluir o artigo. Tente novamente.",
    };
  }

  if (existingPost?.cover_image_url) {
    void cleanupUnusedCoverImages(supabase, [existingPost.cover_image_url]);
  }

  revalidatePublicBlog([existingPost?.slug]);
  revalidatePath("/admin");
  revalidatePath("/admin/posts");

  return { ok: true, id: idParsed.data, slug: existingPost?.slug };
}

export async function duplicatePost(postId: string): Promise<BlogActionResult> {
  const { userId } = await requireAdmin();
  const limitError = await checkBlogActionRatelimit(userId);
  if (limitError) return { ok: false, error: limitError };

  const idParsed = uuidSchema.safeParse(postId);
  if (!idParsed.success) {
    return { ok: false, error: "Identificador do artigo inválido." };
  }

  try {
    const supabase = createAdminClient();
    const { data: original, error: loadError } = await supabase
      .from("posts")
      .select(
        "title, content, excerpt, cover_image_url, author_id, category_id, reading_time_min"
      )
      .eq("id", idParsed.data)
      .maybeSingle();

    if (loadError || !original) {
      console.error("Failed to load post to duplicate:", loadError);
      return { ok: false, error: "Artigo não encontrado para duplicação." };
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
        reading_time_min:
          original.reading_time_min ?? calculateReadingTime(original.content),
        status: "draft",
        published_at: null,
        views: 0,
      })
      .select("id, slug")
      .single();

    if (insertError || !inserted) {
      console.error("Failed to duplicate post:", insertError);
      return { ok: false, error: "Não foi possível duplicar o artigo." };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/posts");
    return { ok: true, id: inserted.id, slug: inserted.slug };
  } catch (err) {
    console.error("duplicatePost exception:", err);
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Não foi possível duplicar o artigo.",
    };
  }
}

export async function createCategory(
  formData: FormData
): Promise<CategoryActionResult> {
  const { userId } = await requireAdmin();
  const limitError = await checkBlogActionRatelimit(userId);
  if (limitError) return { ok: false, error: limitError };

  const parsed = categoryFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    color_hex: formData.get("color_hex"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados da categoria inválidos.",
    };
  }

  const slug = slugify(parsed.data.slug || parsed.data.name, {
    lower: true,
    strict: true,
    locale: "pt",
  });

  if (!slug) {
    return {
      ok: false,
      error: "Não foi possível gerar um slug válido para a categoria.",
    };
  }

  const supabase = createAdminClient();
  const basePayload = {
    name: parsed.data.name,
    slug,
    color_hex: parsed.data.color_hex,
  };

  let insertedId: string | undefined;
  let insertError: { code?: string; message: string } | null = null;

  if (parsed.data.description) {
    const untyped = supabase as unknown as {
      from: (table: string) => {
        insert: (row: Record<string, unknown>) => {
          select: (cols: string) => {
            single: () => Promise<{
              data: { id: string } | null;
              error: { code?: string; message: string } | null;
            }>;
          };
        };
      };
    };

    const res = await untyped
      .from("categories")
      .insert({ ...basePayload, description: parsed.data.description })
      .select("id")
      .single();

    if (res.error && res.error.message.toLowerCase().includes("description")) {
      const fallback = await supabase
        .from("categories")
        .insert(basePayload)
        .select("id")
        .single();
      insertedId = fallback.data?.id;
      insertError = fallback.error;
    } else {
      insertedId = res.data?.id;
      insertError = res.error;
    }
  } else {
    const res = await supabase
      .from("categories")
      .insert(basePayload)
      .select("id")
      .single();
    insertedId = res.data?.id;
    insertError = res.error;
  }

  if (insertError) {
    console.error("Failed to create category:", insertError);
    if (insertError.code === "23505") {
      return {
        ok: false,
        error: "Já existe uma categoria com este nome ou slug.",
      };
    }
    return { ok: false, error: "Não foi possível criar a categoria." };
  }

  try {
    updateTag("blog-categories");
    updateTag("blog-posts");
  } catch {
    // Ignore outside request context
  }
  revalidatePath("/blog");
  revalidatePath("/admin/categorias");
  return { ok: true, id: insertedId };
}

export async function updateCategory(
  id: string,
  data: {
    name: string;
    slug?: string;
    color_hex?: string;
    description?: string | null;
  }
): Promise<CategoryActionResult> {
  const { userId } = await requireAdmin();
  const limitError = await checkBlogActionRatelimit(userId);
  if (limitError) return { ok: false, error: limitError };

  const parsedId = categoryIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: "Identificador de categoria inválido." };
  }

  const parsed = categoryFormSchema.safeParse({
    name: data.name,
    slug: data.slug ?? "",
    color_hex: data.color_hex ?? "#E8D49A",
    description: data.description ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados da categoria inválidos.",
    };
  }

  const slug = slugify(parsed.data.slug || parsed.data.name, {
    lower: true,
    strict: true,
    locale: "pt",
  });

  if (!slug) {
    return {
      ok: false,
      error: "Não foi possível gerar um slug válido para a categoria.",
    };
  }

  const supabase = createAdminClient();
  const basePayload = {
    name: parsed.data.name,
    slug,
    color_hex: parsed.data.color_hex,
  };

  let updateError: { code?: string; message: string } | null = null;

  if (data.description !== undefined) {
    const untyped = supabase as unknown as {
      from: (table: string) => {
        update: (row: Record<string, unknown>) => {
          eq: (
            col: string,
            val: string
          ) => Promise<{
            error: { code?: string; message: string } | null;
          }>;
        };
      };
    };

    const res = await untyped
      .from("categories")
      .update({
        ...basePayload,
        description: parsed.data.description || null,
      })
      .eq("id", parsedId.data);

    if (res.error && res.error.message.toLowerCase().includes("description")) {
      const fallback = await supabase
        .from("categories")
        .update(basePayload)
        .eq("id", parsedId.data);
      updateError = fallback.error;
    } else {
      updateError = res.error;
    }
  } else {
    const res = await supabase
      .from("categories")
      .update(basePayload)
      .eq("id", parsedId.data);
    updateError = res.error;
  }

  if (updateError) {
    console.error("Failed to update category:", updateError);
    if (updateError.code === "23505") {
      return {
        ok: false,
        error: "Já existe uma categoria com este nome ou slug.",
      };
    }
    return { ok: false, error: "Não foi possível atualizar a categoria." };
  }

  try {
    updateTag("blog-categories");
    updateTag("blog-posts");
  } catch {
    // Ignore outside request context
  }
  revalidatePath("/blog");
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/posts");
  return { ok: true, id: parsedId.data };
}

export async function deleteCategory(
  id: string
): Promise<CategoryActionResult> {
  const { userId } = await requireAdmin();
  const limitError = await checkBlogActionRatelimit(userId);
  if (limitError) return { ok: false, error: limitError };

  const parsedId = categoryIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: "Identificador de categoria inválido." };
  }

  const supabase = createAdminClient();
  const { error: unlinkError } = await supabase
    .from("posts")
    .update({ category_id: null })
    .eq("category_id", parsedId.data);

  if (unlinkError) {
    console.error("Failed to unlink posts from category:", unlinkError);
    return {
      ok: false,
      error: "Não foi possível desvincular os artigos desta categoria.",
    };
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", parsedId.data);

  if (error) {
    console.error("Failed to delete category:", error);
    return { ok: false, error: "Não foi possível excluir a categoria." };
  }

  try {
    updateTag("blog-categories");
    updateTag("blog-posts");
  } catch {
    // Ignore outside request context
  }
  revalidatePath("/blog");
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/posts");
  return { ok: true, id: parsedId.data };
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus
): Promise<{ error?: string }> {
  const { userId } = await requireAdmin();
  const limitError = await checkBlogActionRatelimit(userId);
  if (limitError) return { error: limitError };

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

/**
 * @deprecated Retained as a safe compatibility wrapper for legacy callers.
 * New analytics tracking uses the dedicated /api/analytics endpoints.
 */
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

  try {
    await supabase.rpc("increment_post_views", {
      p_post_id: parsed.data,
    });
  } catch {
    // Non-blocking legacy fallback
  }
}
