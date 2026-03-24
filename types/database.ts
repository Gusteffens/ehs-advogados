/* ─────────────────────────────────────────────
 * Supabase Database Types — Erlo, Haas & Steffens
 * ───────────────────────────────────────────── */

export type PostStatus = 'draft' | 'published' | 'archived';

export interface Author {
    id: string;
    clerk_id: string;
    name: string;
    email: string;
    bio: string | null;
    photo_url: string | null;
    specialties: string[];
    oab_number: string | null;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    created_at: string;
}

export interface Tag {
    id: string;
    name: string;
    slug: string;
    created_at: string;
}

export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    cover_image_url: string | null;
    status: PostStatus;
    author_id: string;
    category_id: string | null;
    reading_time: number;
    published_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface PostTag {
    post_id: string;
    tag_id: string;
}

/* ─── Join types for queries ─── */

export interface PostWithAuthor extends Post {
    author: Author;
}

export interface PostWithDetails extends Post {
    author: Author;
    category: Category | null;
    tags: Tag[];
}

/* ─── Insert / Update types ─── */

export type AuthorInsert = Omit<Author, 'id' | 'created_at' | 'updated_at'>;
export type AuthorUpdate = Partial<Omit<Author, 'id' | 'clerk_id' | 'created_at'>>;

export type CategoryInsert = Omit<Category, 'id' | 'created_at'>;
export type CategoryUpdate = Partial<Omit<Category, 'id' | 'created_at'>>;

export type TagInsert = Omit<Tag, 'id' | 'created_at'>;
export type TagUpdate = Partial<Omit<Tag, 'id' | 'created_at'>>;

export type PostInsert = Omit<Post, 'id' | 'created_at' | 'updated_at'>;
export type PostUpdate = Partial<Omit<Post, 'id' | 'author_id' | 'created_at'>>;
