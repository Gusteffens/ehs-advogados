-- ============================================================
-- 006_leads_crm_and_redirects.sql
-- EHS Advocacia — Mini-CRM fields for contact_leads
-- (internal_notes, assigned_to) and 301 blog slug redirects.
-- ============================================================

-- 1. Mini-CRM columns on contact_leads
ALTER TABLE public.contact_leads
  ADD COLUMN IF NOT EXISTS internal_notes text NULL;

ALTER TABLE public.contact_leads
  ADD COLUMN IF NOT EXISTS assigned_to text NULL;

CREATE INDEX IF NOT EXISTS idx_contact_leads_assigned_to
  ON public.contact_leads (assigned_to);

-- 2. Blog 301 slug redirects table
CREATE TABLE IF NOT EXISTS public.blog_redirects (
  old_slug text PRIMARY KEY,
  new_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_redirects ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.blog_redirects FROM anon, authenticated;
GRANT SELECT ON public.blog_redirects TO anon, authenticated;
GRANT ALL ON public.blog_redirects TO service_role;

DROP POLICY IF EXISTS "Public can read blog redirects" ON public.blog_redirects;
CREATE POLICY "Public can read blog redirects"
  ON public.blog_redirects
  FOR SELECT
  USING (true);
