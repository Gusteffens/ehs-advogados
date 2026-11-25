-- ============================================================
-- 001_security_rls_and_rpc.sql
-- EHS Advocacia — Row-Level Security policies, Storage guidance,
-- and secure RPC for incrementing post views.
-- ============================================================

-- 1. Protect Instagram credentials table (server-only via service_role)
ALTER TABLE public.instagram_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.instagram_config FROM anon, authenticated;

-- 2. Enable RLS on all blog tables
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read authors" ON public.authors;
DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
DROP POLICY IF EXISTS "Public can read published posts" ON public.posts;
DROP POLICY IF EXISTS "Public can read tags" ON public.tags;
DROP POLICY IF EXISTS "Public can read tags for published posts" ON public.post_tags;

CREATE POLICY "Public can read authors"
ON public.authors
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public can read categories"
ON public.categories
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public can read published posts"
ON public.posts
FOR SELECT
TO anon, authenticated
USING (status = 'published');

CREATE POLICY "Public can read tags"
ON public.tags
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public can read tags for published posts"
ON public.post_tags
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.posts
    WHERE posts.id = post_tags.post_id
      AND posts.status = 'published'
  )
);

-- 3. Storage bucket "blog-covers"
-- Public users may only read cover images; uploads/deletes happen exclusively
-- server-side via SUPABASE_SERVICE_ROLE_KEY (which bypasses RLS).
DROP POLICY IF EXISTS "Public can read blog covers" ON storage.objects;
CREATE POLICY "Public can read blog covers"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'blog-covers');

-- 4. Atomic & safe view counter RPC for published posts
CREATE OR REPLACE FUNCTION public.increment_post_views(post_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.posts
  SET views = COALESCE(views, 0) + 1
  WHERE id = post_id
    AND status = 'published';
$$;

REVOKE ALL ON FUNCTION public.increment_post_views(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_post_views(uuid) TO anon, authenticated;
