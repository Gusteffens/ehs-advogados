-- ============================================================
-- EHS Advocacia — Idempotent Seed Script
-- Consolidates team/firm authors and initial Instagram config.
--
-- Intentionally non-destructive: Clerk-created authors use Clerk
-- user IDs in authors.id, and existing Instagram tokens must not
-- be overwritten or have their updated_at reset.
-- ============================================================

-- 1. Authors (Firm + Lawyers)
INSERT INTO public.authors (id, full_name, slug, oab, specialties, bio)
VALUES (
  'author_escritorio_ehs',
  'Erlo, Haas & Steffens',
  'escritorio-ehs',
  NULL,
  ARRAY['Direito Civil', 'Direito do Agronegócio', 'Direito Ambiental', 'Direito Criminal'],
  'Escritório de advocacia especializado nas áreas de Direito Civil, Agronegócio, Ambiental e Criminal, com sede em São Miguel do Oeste/SC.'
)
ON CONFLICT (slug) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  oab = EXCLUDED.oab,
  specialties = EXCLUDED.specialties,
  bio = EXCLUDED.bio;

INSERT INTO public.authors (id, full_name, slug, oab, specialties, bio)
VALUES (
  'author_jean_erlo',
  'Jean Tiago Erlo',
  'jean-erlo',
  'OAB/SC 67.239 | OAB/PR 134.567',
  ARRAY['Direito do Agronegócio', 'Direito Ambiental'],
  'Advogado especialista em Direito do Agronegócio e Direito Ambiental.'
)
ON CONFLICT (slug) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  oab = EXCLUDED.oab,
  specialties = EXCLUDED.specialties,
  bio = EXCLUDED.bio;

INSERT INTO public.authors (id, full_name, slug, oab, specialties, bio)
VALUES (
  'author_maisa_christ',
  'Maísa Christ',
  'maisa-christ',
  'OAB/SC 74.365',
  ARRAY['Direito Civil'],
  'Advogada especialista em Direito Civil.'
)
ON CONFLICT (slug) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  oab = EXCLUDED.oab,
  specialties = EXCLUDED.specialties,
  bio = EXCLUDED.bio;

INSERT INTO public.authors (id, full_name, slug, oab, specialties, bio)
VALUES (
  'author_jacson_erlo',
  'Jacson Mateus Erlo',
  'jacson-erlo',
  'OAB/SC 74.319',
  ARRAY['Direito do Agronegócio', 'Direito Civil', 'Direito Ambiental'],
  'Advogado especialista em Direito do Agronegócio, Civil e Ambiental.'
)
ON CONFLICT (slug) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  oab = EXCLUDED.oab,
  specialties = EXCLUDED.specialties,
  bio = EXCLUDED.bio;

INSERT INTO public.authors (id, full_name, slug, oab, specialties, bio)
VALUES (
  'author_luiza_haas',
  'Luíza Klein Haas',
  'luiza-haas',
  'OAB/SC 65.939',
  ARRAY['Direito Civil', 'Direito do Agronegócio', 'Direito Ambiental'],
  'Advogada especialista em Direito Civil, Agronegócio e Ambiental.'
)
ON CONFLICT (slug) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  oab = EXCLUDED.oab,
  specialties = EXCLUDED.specialties,
  bio = EXCLUDED.bio;

INSERT INTO public.authors (id, full_name, slug, oab, specialties, bio)
VALUES (
  'author_alessandra_steffens',
  'Alessandra Franke Steffens',
  'alessandra-steffens',
  'OAB/SC 21.390-B | OAB/RS 55.474',
  ARRAY['Direito Criminal'],
  'Advogada especialista em Direito Criminal.'
)
ON CONFLICT (slug) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  oab = EXCLUDED.oab,
  specialties = EXCLUDED.specialties,
  bio = EXCLUDED.bio;

-- 2. Instagram Config (single-row table)
CREATE TABLE IF NOT EXISTS public.instagram_config (
  id INT PRIMARY KEY DEFAULT 1,
  access_token TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_single_row CHECK (id = 1)
);

-- Insert placeholder only if row does not exist yet (never reset updated_at on re-run)
INSERT INTO public.instagram_config (id, access_token, updated_at)
VALUES (1, 'PLACEHOLDER_TOKEN', NOW())
ON CONFLICT (id) DO NOTHING;
