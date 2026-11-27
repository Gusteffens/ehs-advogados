import type { PostStatus } from "./database";

export type { PostStatus };

export interface AuthorOption {
  id: string;
  full_name: string;
  slug: string | null;
}

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  color_hex: string | null;
  description?: string | null;
}

export interface BlogAuthorSummary {
  full_name: string | null;
  slug: string | null;
  oab?: string | null;
  specialties?: string[] | null;
  bio?: string | null;
}

export interface BlogCategorySummary {
  name: string;
  slug: string;
  color_hex: string | null;
}

export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content?: string;
  cover_image_url: string | null;
  reading_time_min: number | null;
  published_at: string | null;
  created_at: string;
  updated_at?: string | null;
  status?: PostStatus | string;
  views?: number | null;
  author_id?: string | null;
  category_id?: string | null;
  authors: BlogAuthorSummary | null;
  categories: BlogCategorySummary | null;
}

export interface SitemapPost {
  slug: string;
  updated_at: string | null;
  published_at: string | null;
}

export interface EditablePost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: PostStatus | string;
  author_id: string | null;
  category_id: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  tags?: string[];
}

export interface AdminPostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  status: PostStatus | string;
  created_at: string;
  published_at: string | null;
  updated_at: string | null;
  reading_time_min: number | null;
  views: number | null;
  uniqueViews: number;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  authorId: string | null;
  authorName: string | null;
  authorSlug: string | null;
}

export interface AdminCategoryItem {
  id: string;
  name: string;
  slug: string;
  color_hex: string | null;
  description?: string | null;
  postCount: number;
}

export interface BlogActionResult {
  ok: boolean;
  error?: string;
  id?: string;
  slug?: string;
  published_at?: string | null;
  updated_at?: string | null;
}

export interface BulkActionResult {
  ok: boolean;
  count?: number;
  error?: string;
}

export interface UploadImageResult {
  ok: boolean;
  url?: string;
  error?: string;
}

export interface CategoryActionResult {
  ok: boolean;
  id?: string;
  error?: string;
}
