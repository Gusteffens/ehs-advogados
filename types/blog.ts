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
    status?: string;
    views?: number | null;
    author_id?: string | null;
    category_id?: string | null;
    authors: BlogAuthorSummary | null;
    categories: BlogCategorySummary | null;
}

export interface EditablePost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    cover_image_url: string | null;
    status: string;
    author_id: string | null;
    category_id: string | null;
}
