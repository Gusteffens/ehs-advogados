# Contexto do Projeto — Erlo Haas & Steffens

## Visão Geral
Site institucional, landing pages e blog para o escritório de advocacia "Erlo, Haas & Steffens".
- **URL:** https://www.ehsadvogados.com.br
- **Repositório:** GitHub (privado)
- **Deploy:** Vercel (Node.js `>=20`, automático via push)

## Stack Técnica
- **Frontend/Deploy:** Next.js 16.2.4 (App Router + `proxy.ts`) + React 19 + TypeScript + Tailwind CSS v4
- **Autenticação:** Clerk (`@clerk/nextjs` v7) isolado em `/admin/*` e `/sign-in`
- **Banco de dados & Storage:** Supabase (`@supabase/supabase-js`, sem `@supabase/ssr`) com RLS ativo
- **Email:** Resend (`lib/resend.ts`, lazy + `server-only`)
- **Cache/Rate Limiting:** Upstash Redis (`lib/upstash.ts`, lazy + `server-only`)
- **Analytics:** PostHog + Meta Pixel / Conversions API (CAPI)
- **DNS/CDN:** Cloudflare (Registro.br → Cloudflare → Vercel)
- **Monitoramento de erros:** Sentry removido (não utilizado no momento)

## Identidade Visual
- Tokens semânticos declarados em `@theme inline` no `app/globals.css`:
  - `ink` / `forest-950`: `#0D1812`
  - `primary` / `forest-900`: `#1B2D1E`
  - `primary-mid` / `forest-600`: `#3B5A3C`
  - `gold` / `champagne-300`: `#E8D49A`
  - `gold-dark` / `secondary` / `champagne-700`: `#877249`
  - `cream`: `#EEEDE5` | `cream-light`: `#F9F8F5`
- Fontes locais: **Unna** (`@fontsource/unna`, display/headlines) e **Mulish** (`@fontsource/mulish`, body/UI).

## Estrutura de Rotas (Route Groups)

### Site Principal (`app/(site)/`)
- `/` — Home
- `/sobre` — Sobre o escritório
- `/equipe` — Equipe de advogados
- `/areas-de-atuacao` — Áreas de atuação
- `/blog` — Listagem do blog
- `/blog/[slug]` — Artigo individual
- `/contato` — Contato
- `/politica-de-privacidade` — Política de privacidade
- `/termos-de-uso` — Termos de uso

### Landing Pages Isoladas (`app/(landing)/`)
- `/penal` — Landing page Direito Penal
- `/proagro` — Landing page Proagro (com redirect permanente de `/proagro-negado`)

### Autenticação & Painel Admin
- `/sign-in` — Login customizado com Clerk
- `/unauthorized` — Página exibida a usuários autenticados sem role `admin`
- `/admin` — Dashboard (role `admin`)
- `/admin/posts` — Listagem, busca e filtros de posts
- `/admin/posts/novo` — Criar post (editor TipTap)
- `/admin/posts/[id]` — Editar post (controle Rascunho ↔ Publicado)
- `/admin/perfil` — Perfil do autor

## Banco de Dados & Migrations (`supabase/`)
- **Migration:** `supabase/migrations/001_security_rls_and_rpc.sql`
- **Seed idempotente:** `supabase/seed.sql`

### Tabelas principais
```sql
authors: id TEXT PK (Clerk user_id ou author_*), full_name, slug, bio, oab,
         specialties TEXT[], avatar_url, created_at
categories: id SERIAL PK, name, slug, color_hex
posts: id UUID PK, title, slug, content (HTML TipTap), excerpt,
       cover_image_url, author_id TEXT FK, category_id INT FK,
       status (draft|published), published_at, reading_time_min,
       views INT, created_at, updated_at
tags: id, name, slug
post_tags: post_id FK, tag_id FK
instagram_config: id INT PK (single row = 1), access_token TEXT, updated_at
```

### Regras críticas do banco
- **RLS habilitado em todas as tabelas**, incluindo `instagram_config` (`REVOKE ALL FROM anon, authenticated`; acesso somente server-side via `SUPABASE_SERVICE_ROLE_KEY`).
- Usuários públicos (`anon`/`authenticated`) têm permissão apenas de `SELECT` em `authors`, `categories`, `tags`, `posts` publicados, `post_tags` de posts publicados e leitura no bucket `blog-covers`.
- Contagem de visualizações usa a RPC `public.increment_post_views(post_id uuid)` (`SECURITY DEFINER`, apenas `status = 'published'`), chamada via `createPublicClient()` com rate limit.
- Escritas administrativas ocorrem exclusivamente no servidor via `createAdminClient()` (`SUPABASE_SERVICE_ROLE_KEY`).
- `authors.id` e `posts.author_id` são `TEXT` (não `UUID`) para compatibilidade com Clerk user IDs.

## Autenticação e Autorização
- Role `admin` definida via Public Metadata no Clerk Dashboard: `{"role": "admin"}` (incluída no session token).
- `proxy.ts` (convenção Next.js 16) bloqueia `/sign-up` (redirecionando para `/`), exige login em `/admin/*` e redireciona não-admins autenticados para `/unauthorized`.
- Defesa em profundidade: `requireAdmin()` (`lib/auth.ts`) é chamado em `app/admin/layout.tsx` e em todas as Server Pages e Server Actions administrativas.
- `ClerkProvider` fica isolado em `/admin` e `/sign-in` (não é carregado nas páginas públicas/LPs).

## Dados Oficiais & Fonte Única de Verdade
Centralizados em `lib/site-config.ts` (`SITE_CONFIG` e `TEAM_IMAGES`):
- **Razão Social:** Erlo, Haas & Steffens Sociedade de Advocacia
- **CNPJ:** 48.624.064/0001-90 | **OAB/SC:** 8487 | **Fundado:** 2022
- **Endereço:** Rua Itaberaba, 930, Sala 304, Ed. Fransozi, Centro, São Miguel do Oeste - SC, CEP 89900-000
- **WhatsApp:** +5549984001053 (`https://wa.me/+5549984001053`)
- **Email:** ehs.escritorio@gmail.com
- **Redes:** Instagram (`https://www.instagram.com/ehs.adv/`), Facebook (`https://www.facebook.com/ehs.adv`)

### Equipe (advogados)
1. Alessandra Franke Steffens — Direito Criminal — OAB/SC 21.390-B | OAB/RS 55.474
2. Jacson Mateus Erlo — Agronegócio, Civil, Ambiental — OAB/SC 74.319
3. Jean Tiago Erlo — Agronegócio, Ambiental — OAB/SC 67.239 | OAB/PR 134.567
4. Luíza Klein Haas — Civil, Agronegócio, Ambiental — OAB/SC 65.939
5. Maísa Christ — Direito Civil — OAB/SC 74.365

## Variáveis de Ambiente
Ver lista completa em `.env.example`:
- **App:** `NEXT_PUBLIC_SITE_URL`
- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Clerk:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`
- **Email:** `RESEND_API_KEY`, `CONTACT_EMAIL`, `CONTACT_FROM_EMAIL`
- **Rate Limiting:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- **Analytics/Ads:** `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `META_PIXEL_ID`, `META_PIXEL_ACCESS_TOKEN`

## Segurança Implementada
- Headers HTTP em `next.config.ts`: `Content-Security-Policy` (com `frame-ancestors` e origin Supabase derivada de `NEXT_PUBLIC_SUPABASE_URL`), `Strict-Transport-Security` (HSTS), `Permissions-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`.
- Rate limiting via Upstash Redis no formulário de contato, ações administrativas do blog e incremento de visualizações.
- Sanitização de HTML do TipTap via `sanitize-html` com allowlist explícita (`lib/sanitize-blog-html.ts`).
- Validação de inputs com Zod nas Server Actions (`app/contato/actions.ts`, `app/actions/blog.ts`).
- `.env*` (exceto `.env.example`) ignorado no `.gitignore`.

## Observações para Manutenção
- **Nunca modificar ou commitar `.env.local`** — mantenha `.env.example` atualizado ao adicionar novas variáveis.
- `authors.id` é `TEXT` (Clerk user ID) — não alterar para `UUID`.
- Sempre versionar alterações de schema/RLS em `supabase/migrations/` em vez de criar SQLs soltos na raiz.
- Em desenvolvimento, prefira chaves de desenvolvimento/staging separadas das credenciais de produção.
