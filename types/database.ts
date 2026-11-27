export type PostStatus = "draft" | "published";
export type LeadStatus = "new" | "contacted" | "archived";

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
  raw_views: number;
  created_at: string;
  updated_at: string | null;
};

export type InstagramConfig = {
  id: number;
  access_token: string;
  updated_at: string;
};

export type ContactLead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: LeadStatus;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  gclid: string | null;
  fbclid: string | null;
  source_page: string | null;
  email_sent: boolean;
  created_at: string;
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
  raw_views?: number;
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

export type ContactLeadInsert = {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status?: LeadStatus;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  source_page?: string | null;
  email_sent?: boolean;
  created_at?: string;
};

export type ContactLeadUpdate = Partial<Omit<ContactLeadInsert, "id" | "created_at">>;

export type ArticleViewDedup = {
  post_id: string;
  view_date: string;
  visitor_hash: string;
  created_at: string;
};

export type ArticleViewDedupInsert = {
  post_id: string;
  view_date: string;
  visitor_hash: string;
  created_at?: string;
};

export type ArticleSession = {
  id: string;
  session_id: string;
  post_id: string;
  view_date: string;
  visitor_hash: string;
  is_unique: boolean;
  engaged_seconds: number;
  max_scroll_pct: number;
  reached_25: boolean;
  reached_50: boolean;
  reached_75: boolean;
  reached_100: boolean;
  device_type: "desktop" | "mobile" | "tablet";
  referrer_domain: string | null;
  traffic_source: "direct" | "organic" | "social" | "referral" | "campaign" | "internal";
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  updated_at: string;
};

export type ArticleSessionInsert = {
  id?: string;
  session_id: string;
  post_id: string;
  view_date: string;
  visitor_hash: string;
  is_unique?: boolean;
  engaged_seconds?: number;
  max_scroll_pct?: number;
  reached_25?: boolean;
  reached_50?: boolean;
  reached_75?: boolean;
  reached_100?: boolean;
  device_type?: "desktop" | "mobile" | "tablet";
  referrer_domain?: string | null;
  traffic_source?: "direct" | "organic" | "social" | "referral" | "campaign" | "internal";
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ArticleEvent = {
  id: string;
  post_id: string;
  session_id: string | null;
  event_date: string;
  event_type:
    | "share_whatsapp"
    | "share_linkedin"
    | "share_copy"
    | "cta_whatsapp"
    | "cta_primary"
    | "related_click";
  target: string | null;
  device_type: "desktop" | "mobile" | "tablet";
  created_at: string;
};

export type ArticleEventInsert = {
  id?: string;
  post_id: string;
  session_id?: string | null;
  event_date: string;
  event_type:
    | "share_whatsapp"
    | "share_linkedin"
    | "share_copy"
    | "cta_whatsapp"
    | "cta_primary"
    | "related_click";
  target?: string | null;
  device_type?: "desktop" | "mobile" | "tablet";
  created_at?: string;
};

export type ArticleAnalyticsDaily = {
  post_id: string;
  metric_date: string;
  raw_views: number;
  unique_views: number;
  engaged_sessions: number;
  total_engaged_seconds: number;
  scroll_25_count: number;
  scroll_50_count: number;
  scroll_75_count: number;
  scroll_100_count: number;
  share_clicks: number;
  cta_clicks: number;
};

export type ArticleAnalyticsDailyInsert = {
  post_id: string;
  metric_date: string;
  raw_views?: number;
  unique_views?: number;
  engaged_sessions?: number;
  total_engaged_seconds?: number;
  scroll_25_count?: number;
  scroll_50_count?: number;
  scroll_75_count?: number;
  scroll_100_count?: number;
  share_clicks?: number;
  cta_clicks?: number;
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  author_id: string | null;
  is_active: boolean;
  token_version: number;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminUserInsert = {
  id?: string;
  email: string;
  name: string;
  password_hash: string;
  author_id?: string | null;
  is_active?: boolean;
  token_version?: number;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type AdminUserUpdate = Partial<Omit<AdminUserInsert, "id" | "created_at">>;

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
      contact_leads: {
        Row: ContactLead;
        Insert: ContactLeadInsert;
        Update: ContactLeadUpdate;
        Relationships: [];
      };
      article_view_dedup: {
        Row: ArticleViewDedup;
        Insert: ArticleViewDedupInsert;
        Update: Partial<ArticleViewDedupInsert>;
        Relationships: [
          {
            foreignKeyName: "article_view_dedup_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      article_sessions: {
        Row: ArticleSession;
        Insert: ArticleSessionInsert;
        Update: Partial<ArticleSessionInsert>;
        Relationships: [
          {
            foreignKeyName: "article_sessions_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      article_events: {
        Row: ArticleEvent;
        Insert: ArticleEventInsert;
        Update: Partial<ArticleEventInsert>;
        Relationships: [
          {
            foreignKeyName: "article_events_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      article_analytics_daily: {
        Row: ArticleAnalyticsDaily;
        Insert: ArticleAnalyticsDailyInsert;
        Update: Partial<ArticleAnalyticsDailyInsert>;
        Relationships: [
          {
            foreignKeyName: "article_analytics_daily_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_users: {
        Row: AdminUser;
        Insert: AdminUserInsert;
        Update: AdminUserUpdate;
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
      record_article_view: {
        Args: {
          p_post_id: string;
          p_session_id: string;
          p_view_date: string;
          p_visitor_hash: string;
          p_device_type?: string;
          p_referrer_domain?: string | null;
          p_traffic_source?: string;
          p_utm_source?: string | null;
          p_utm_medium?: string | null;
          p_utm_campaign?: string | null;
          p_count_raw?: boolean;
        };
        Returns: {
          counted_unique: boolean;
          counted_raw: boolean;
        }[];
      };
      record_article_engagement: {
        Args: {
          p_post_id: string;
          p_session_id: string;
          p_engaged_seconds: number;
          p_max_scroll_pct: number;
        };
        Returns: undefined;
      };
      record_article_event: {
        Args: {
          p_post_id: string;
          p_session_id: string | null;
          p_event_date: string;
          p_event_type: string;
          p_target?: string | null;
          p_device_type?: string;
        };
        Returns: undefined;
      };
      get_analytics_breakdowns: {
        Args: {
          p_start: string;
          p_end: string;
          p_post_id?: string | null;
        };
        Returns: {
          trafficSources: { label: string; count: number }[];
          topReferrers: { label: string; count: number }[];
          devices: { label: string; count: number }[];
          eventsBreakdown: { label: string; count: number }[];
          totalSessions: number;
          totalEvents: number;
        };
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
