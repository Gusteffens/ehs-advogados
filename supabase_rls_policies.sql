-- ============================================================
-- EHS Row-Level Security policies
-- Run this in the Supabase SQL Editor for project kypsmdjogvvvwornxmqp.
--
-- Public users can only read public blog data.
-- Admin writes continue to work through SUPABASE_SERVICE_ROLE_KEY, which
-- bypasses RLS and is only used in server-side code.
-- ============================================================

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
