-- ============================================================
-- 002_contact_leads.sql
-- EHS Advocacia — Persistent storage for contact form leads
-- with attribution metadata and strict server-only access.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.contact_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'archived')),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  gclid text,
  fbclid text,
  source_page text,
  email_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Server-only access via SUPABASE_SERVICE_ROLE_KEY (bypasses RLS)
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.contact_leads FROM anon, authenticated;

-- Indexes for admin inbox ordering and status filtering
CREATE INDEX IF NOT EXISTS idx_contact_leads_created_at_desc
  ON public.contact_leads (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_leads_status
  ON public.contact_leads (status);
