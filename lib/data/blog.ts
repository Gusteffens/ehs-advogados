import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  BlogAuthorSummary,
  BlogCategorySummary,
  BlogPostSummary,
  CategoryOption,
  SitemapPost,
} from "@/types/blog";

interface RawCategoryRecord {
  id: number | string;
  name: string;
  slug: string;
  color_hex: string | null;
}

type RawRelation<T> = T | T[] | null | undefined;

interface RawBlogPostRecord {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content?: string | null;
  cover_image_url: string | null;
  reading_time_min: number | null;
  published_at: string | null;
  created_at: string;
  updated_at?: string | null;
  status?: string | null;
  views?: number | null;
  author_id?: string | null;
  category_id?: string | number | null;
  authors?: RawRelation<BlogAuthorSummary>;
  categories?: RawRelation<BlogCategorySummary>;
}

function normalizeRelation<T>(relation: RawRelation<T>): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

function mapPost(record: RawBlogPostRecord): BlogPostSummary {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    excerpt: record.excerpt,
    content: record.content ?? undefined,
    cover_image_url: record.cover_image_url,
    reading_time_min: record.reading_time_min,
    published_at: record.published_at,
    created_at: record.created_at,
    updated_at: record.updated_at ?? null,
    status: record.status ?? undefined,
    views: record.views ?? null,
    author_id: record.author_id ?? null,
    category_id:
      record.category_id === null || record.category_id === undefined
        ? null
        : String(record.category_id),
    authors: normalizeRelation(record.authors),
    categories: normalizeRelation(record.categories),
  };
}

const listSelect =
  "id, title, slug, excerpt, cover_image_url, reading_time_min, published_at, created_at, updated_at, status, views, author_id, category_id, authors(full_name, slug), categories(name, slug, color_hex)";

const detailSelect =
  "id, title, slug, excerpt, content, cover_image_url, reading_time_min, published_at, created_at, updated_at, status, views, author_id, category_id, authors(full_name, slug, oab, specialties, bio), categories(name, slug, color_hex)";

const fetchBlogCategories = unstable_cache(
  async (): Promise<CategoryOption[]> => {
    const supabase = createPublicClient();

    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, color_hex")
      .order("name");

    if (error) {
      throw new Error(`Failed to load blog categories: ${error.message}`);
    }

    return ((data ?? []) as RawCategoryRecord[])
      .map((category) => ({
        id: String(category.id),
        name: category.name,
        slug: category.slug,
        color_hex: category.color_hex,
      }))
      .filter((category) => category.name !== "Direito Trabalhista");
  },
  ["blog-categories"],
  {
    revalidate: 3600,
    tags: ["blog-categories"],
  }
);

const fetchPublishedBlogPosts = unstable_cache(
  async (): Promise<BlogPostSummary[]> => {
    const supabase = createPublicClient();

    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("posts")
      .select(listSelect)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to load published blog posts: ${error.message}`);
    }

    return ((data ?? []) as unknown as RawBlogPostRecord[]).map(mapPost);
  },
  ["published-blog-posts"],
  {
    revalidate: 300,
    tags: ["blog-posts"],
  }
);

const fetchLatestPublishedBlogPosts = unstable_cache(
  async (limit: number): Promise<BlogPostSummary[]> => {
    const supabase = createPublicClient();

    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("posts")
      .select(listSelect)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to load latest blog posts: ${error.message}`);
    }

    return ((data ?? []) as unknown as RawBlogPostRecord[]).map(mapPost);
  },
  ["latest-published-blog-posts"],
  {
    revalidate: 300,
    tags: ["blog-posts"],
  }
);

const fetchPublishedBlogPostBySlug = unstable_cache(
  async (slug: string): Promise<BlogPostSummary | null> => {
    const supabase = createPublicClient();

    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from("posts")
      .select(detailSelect)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load blog post "${slug}": ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return mapPost(data as unknown as RawBlogPostRecord);
  },
  ["published-blog-post-by-slug"],
  {
    revalidate: 300,
    tags: ["blog-posts"],
  }
);

const fetchPublishedBlogSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const supabase = createPublicClient();

    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("posts")
      .select("slug")
      .eq("status", "published");

    if (error) {
      throw new Error(`Failed to load blog slugs: ${error.message}`);
    }

    return (data ?? [])
      .map((post) => post.slug)
      .filter((slug): slug is string => typeof slug === "string" && slug.length > 0);
  },
  ["published-blog-slugs"],
  {
    revalidate: 300,
    tags: ["blog-posts"],
  }
);

const fetchPublishedPostSlugsForSitemap = unstable_cache(
  async (): Promise<SitemapPost[]> => {
    const supabase = createPublicClient();

    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("posts")
      .select("slug, updated_at, published_at")
      .eq("status", "published");

    if (error) {
      throw new Error(`Failed to load sitemap posts: ${error.message}`);
    }

    return (data ?? []).filter(
      (post): post is SitemapPost => typeof post.slug === "string" && post.slug.length > 0
    );
  },
  ["published-blog-sitemap-posts"],
  {
    revalidate: 3600,
    tags: ["blog-posts"],
  }
);

export async function getBlogCategories(): Promise<CategoryOption[]> {
  try {
    return await fetchBlogCategories();
  } catch (error) {
    console.error("Failed to load blog categories", error);
    return [];
  }
}

export async function getPublishedBlogPosts(): Promise<BlogPostSummary[]> {
  try {
    return await fetchPublishedBlogPosts();
  } catch (error) {
    console.error("Failed to load published blog posts", error);
    return [];
  }
}

export async function getLatestPublishedBlogPosts(limit = 3): Promise<BlogPostSummary[]> {
  try {
    return await fetchLatestPublishedBlogPosts(limit);
  } catch (error) {
    console.error("Failed to load latest blog posts", error);
    return [];
  }
}

export const getPublishedBlogPostBySlug = cache(
  async (slug: string): Promise<BlogPostSummary | null> => {
    try {
      return await fetchPublishedBlogPostBySlug(slug);
    } catch (error) {
      console.error(`Failed to load blog post "${slug}"`, error);
      return null;
    }
  }
);

export async function getPublishedBlogSlugs(): Promise<string[]> {
  try {
    return await fetchPublishedBlogSlugs();
  } catch (error) {
    console.error("Failed to load blog slugs", error);
    return [];
  }
}

export async function getPublishedPostSlugsForSitemap(): Promise<SitemapPost[]> {
  try {
    return await fetchPublishedPostSlugsForSitemap();
  } catch (error) {
    console.error("Failed to load sitemap posts", error);
    return [];
  }
}
