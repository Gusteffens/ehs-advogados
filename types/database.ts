export type PostStatus = "draft" | "published";

export type Author = {
  id: string;
  full_name: string;
  slug: string;
  bio: string | null;
  oab: string | null;
  specialties: string[] | null;
  avatar_url: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  color_hex: string | null;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author_id: string | null;
  category_id: string | null;
  status: PostStatus;
  published_at: string | null;
  reading_time_min: number | null;
  views: number;
  created_at: string;
  updated_at: string | null;
};

export type InstagramConfig = {
  id: number;
  access_token: string;
  updated_at: string;
};

export type AuthorInsert = {
  id: string;
  full_name: string;
  slug: string;
  bio?: string | null;
  oab?: string | null;
  specialties?: string[] | null;
  avatar_url?: string | null;
  created_at?: string;
};

export type AuthorUpdate = Partial<Omit<AuthorInsert, "id">>;

export type CategoryInsert = {
  id?: string;
  name: string;
  slug: string;
  color_hex?: string | null;
};

export type CategoryUpdate = Partial<Omit<CategoryInsert, "id">>;

export type PostInsert = {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  cover_image_url?: string | null;
  author_id?: string | null;
  category_id?: string | null;
  status?: PostStatus;
  published_at?: string | null;
  reading_time_min?: number | null;
  views?: number;
  created_at?: string;
  updated_at?: string | null;
};

export type PostUpdate = Partial<Omit<PostInsert, "id" | "created_at">>;

export type InstagramConfigInsert = {
  id?: number;
  access_token: string;
  updated_at?: string;
};

export type InstagramConfigUpdate = Partial<Omit<InstagramConfigInsert, "id">>;

export type Database = {
  public: {
    Tables: {
      authors: {
        Row: Author;
        Insert: AuthorInsert;
        Update: AuthorUpdate;
        Relationships: [];
      };
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
        Relationships: [];
      };
      posts: {
        Row: Post;
        Insert: PostInsert;
        Update: PostUpdate;
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "authors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      instagram_config: {
        Row: InstagramConfig;
        Insert: InstagramConfigInsert;
        Update: InstagramConfigUpdate;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_post_views: {
        Args: {
          p_post_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
