export type PostStatus = "draft" | "published";

export interface Author {
    id: string;
    full_name: string;
    slug: string;
    bio: string | null;
    oab: string | null;
    specialties: string[] | null;
    avatar_url: string | null;
    created_at: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    color_hex: string | null;
}

export interface Tag {
    id: number;
    name: string;
    slug: string;
}

export interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    cover_image_url: string | null;
    author_id: string | null;
    category_id: number | null;
    status: PostStatus;
    published_at: string | null;
    reading_time_min: number | null;
    views: number;
    created_at: string;
    updated_at: string;
}

export interface PostTag {
    post_id: string;
    tag_id: number;
}

export interface PostWithDetails extends Post {
    authors: Author | null;
    categories: Category | null;
    tags?: Tag[];
}

export type AuthorInsert = Omit<Author, "created_at">;
export type AuthorUpdate = Partial<Omit<Author, "id" | "created_at">>;

export type CategoryInsert = Omit<Category, "id">;
export type CategoryUpdate = Partial<Omit<Category, "id">>;

export type TagInsert = Omit<Tag, "id">;
export type TagUpdate = Partial<Omit<Tag, "id">>;

export type PostInsert = Omit<Post, "id" | "created_at" | "updated_at" | "views">;
export type PostUpdate = Partial<Omit<Post, "id" | "created_at">>;
