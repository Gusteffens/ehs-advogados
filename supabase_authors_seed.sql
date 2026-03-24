-- ============================================================
-- EHS Authors – run this in Supabase SQL Editor
-- Removes test rows and upserts the real team + firm account
-- ============================================================

-- 1. Delete any test/orphan authors that are NOT in the slug list below
--    (safe because posts.author_id will be reassigned before this runs,
--     or you can skip this line if you prefer to keep old rows)
DELETE FROM authors
WHERE slug NOT IN (
  'escritorio-ehs',
  'jean-erlo',
  'maisa-christ',
  'jacson-erlo',
  'luiza-haas',
  'alessandra-steffens'
);

-- 2. Upsert the firm account (used when the post is from the office, not one specific lawyer)
INSERT INTO authors (id, full_name, slug, oab, specialties, bio)
VALUES (
  gen_random_uuid(),
  'Erlo, Haas & Steffens',
  'escritorio-ehs',
  NULL,
  ARRAY['Direito Civil', 'Direito do Agronegócio', 'Direito Ambiental', 'Direito Criminal'],
  'Escritório de advocacia especializado nas áreas de Direito Civil, Agronegócio, Ambiental e Criminal, com sede em Chapecó/SC.'
)
ON CONFLICT (slug) DO UPDATE SET
  full_name   = EXCLUDED.full_name,
  oab         = EXCLUDED.oab,
  specialties = EXCLUDED.specialties,
  bio         = EXCLUDED.bio;

-- 3. Jean Tiago Erlo
INSERT INTO authors (id, full_name, slug, oab, specialties, bio)
VALUES (
  gen_random_uuid(),
  'Jean Tiago Erlo',
  'jean-erlo',
  'OAB/SC 67.239 | OAB/PR 134.567',
  ARRAY['Direito do Agronegócio', 'Direito Ambiental'],
  'Advogado especialista em Direito do Agronegócio e Direito Ambiental.'
)
ON CONFLICT (slug) DO UPDATE SET
  full_name   = EXCLUDED.full_name,
  oab         = EXCLUDED.oab,
  specialties = EXCLUDED.specialties,
  bio         = EXCLUDED.bio;

-- 4. Maísa Christ
INSERT INTO authors (id, full_name, slug, oab, specialties, bio)
VALUES (
  gen_random_uuid(),
  'Maísa Christ',
  'maisa-christ',
  'OAB/SC 74.365',
  ARRAY['Direito Civil'],
  'Advogada especialista em Direito Civil.'
)
ON CONFLICT (slug) DO UPDATE SET
  full_name   = EXCLUDED.full_name,
  oab         = EXCLUDED.oab,
  specialties = EXCLUDED.specialties,
  bio         = EXCLUDED.bio;

-- 5. Jacson Mateus Erlo
INSERT INTO authors (id, full_name, slug, oab, specialties, bio)
VALUES (
  gen_random_uuid(),
  'Jacson Mateus Erlo',
  'jacson-erlo',
  'OAB/SC 74.319',
  ARRAY['Direito do Agronegócio', 'Direito Civil', 'Direito Ambiental'],
  'Advogado especialista em Direito do Agronegócio, Civil e Ambiental.'
)
ON CONFLICT (slug) DO UPDATE SET
  full_name   = EXCLUDED.full_name,
  oab         = EXCLUDED.oab,
  specialties = EXCLUDED.specialties,
  bio         = EXCLUDED.bio;

-- 6. Luíza Klein Haas
INSERT INTO authors (id, full_name, slug, oab, specialties, bio)
VALUES (
  gen_random_uuid(),
  'Luíza Klein Haas',
  'luiza-haas',
  'OAB/SC 65.939',
  ARRAY['Direito Civil', 'Direito do Agronegócio', 'Direito Ambiental'],
  'Advogada especialista em Direito Civil, Agronegócio e Ambiental.'
)
ON CONFLICT (slug) DO UPDATE SET
  full_name   = EXCLUDED.full_name,
  oab         = EXCLUDED.oab,
  specialties = EXCLUDED.specialties,
  bio         = EXCLUDED.bio;

-- 7. Alessandra Franke Steffens
INSERT INTO authors (id, full_name, slug, oab, specialties, bio)
VALUES (
  gen_random_uuid(),
  'Alessandra Franke Steffens',
  'alessandra-steffens',
  'OAB/SC 21.390-B | OAB/RS 55.474',
  ARRAY['Direito Criminal'],
  'Advogada especialista em Direito Criminal.'
)
ON CONFLICT (slug) DO UPDATE SET
  full_name   = EXCLUDED.full_name,
  oab         = EXCLUDED.oab,
  specialties = EXCLUDED.specialties,
  bio         = EXCLUDED.bio;

-- Done! Run SELECT * FROM authors ORDER BY full_name; to verify.
