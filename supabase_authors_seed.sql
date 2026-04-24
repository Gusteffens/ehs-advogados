-- ============================================================
-- EHS Authors - run this in Supabase SQL Editor
-- Idempotent seed for the real team + firm account.
--
-- This script intentionally does not delete existing rows. Clerk-created
-- authors use Clerk user IDs in authors.id, so destructive cleanup can remove
-- legitimate admin users.
-- ============================================================

-- Firm account used when the post is from the office, not one specific lawyer.
INSERT INTO authors (id, full_name, slug, oab, specialties, bio)
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

-- Jean Tiago Erlo
INSERT INTO authors (id, full_name, slug, oab, specialties, bio)
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

-- Maísa Christ
INSERT INTO authors (id, full_name, slug, oab, specialties, bio)
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

-- Jacson Mateus Erlo
INSERT INTO authors (id, full_name, slug, oab, specialties, bio)
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

-- Luíza Klein Haas
INSERT INTO authors (id, full_name, slug, oab, specialties, bio)
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

-- Alessandra Franke Steffens
INSERT INTO authors (id, full_name, slug, oab, specialties, bio)
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

-- Run SELECT * FROM authors ORDER BY full_name; to verify.
