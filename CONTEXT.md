# Contexto do Projeto — Erlo Haas & Steffens

## Visão Geral
Site institucional, landing pages jurídicas, blog editorial e painel administrativo para o escritório de advocacia **Erlo, Haas & Steffens Sociedade de Advocacia**.
- **URL:** https://www.ehsadvogados.com.br
- **Repositório:** GitHub (privado)
- **Deploy:** Vercel (Node.js `>=20`, automático via push)

## Stack Técnica
- **Frontend/Deploy:** Next.js 16 (`App Router` + `proxy.ts`) + React 19 + TypeScript + Tailwind CSS v4 (zero `framer-motion`; animações leves em CSS/Tailwind)
- **Tipografia:** `next/font/google` (**Unna** para display/headlines e **Mulish** para corpo/UI, carregadas em `app/layout.tsx`)
- **Autenticação Admin:** Autenticação nativa Email + Senha com cookie `HttpOnly` assinado via HMAC-SHA256 (`ehs_admin_session`), tabela `admin_users` no Supabase e credenciais bootstrap via ambiente (zero Clerk)
- **Banco de Dados & Storage:** Supabase (`@supabase/supabase-js`, sem `@supabase/ssr`) com Row-Level Security (RLS) ativo e uploads diretos assinados de até 15 MB (`/api/admin/uploads/sign`)
- **Editor Editorial (Estúdio Editorial):** TipTap v3 com imagens inline, blocos de callout jurídicos, slash menu (`/`) e Modo Foco, com sanitização server-side via `sanitize-html` (`lib/sanitize-blog-html.ts`)
- **Analytics de Artigos (Anti-Inflação):** Pipeline first-party (`/api/analytics/collect`) com deduplicação diária por visitante (HMAC + Upstash Redis), RPCs seguras no Supabase e dashboard em `/admin/analytics`
- **Email:** Resend (`lib/resend.ts`, lazy + `server-only`)
- **Cache/Rate Limiting:** Upstash Redis (`lib/upstash.ts`, lazy + `server-only`)
- **Marketing/Ads:** PostHog + Google Tag Manager / Google Ads + Meta Pixel / Conversions API (CAPI)
- **DNS/CDN:** Cloudflare (Registro.br → Cloudflare → Vercel)

## Identidade Visual
- Tokens semânticos declarados em `@theme inline` no `app/globals.css`:
  - `ink` / `forest-950`: `#0D1812`
  - `primary` / `forest-900`: `#1B2D1E`
  - `primary-mid` / `forest-600`: `#3B5A3C`
  - `gold` / `champagne-300`: `#E8D49A`
  - `gold-dark` / `secondary` / `champagne-700`: `#877249`
  - `cream`: `#EEEDE5` | `cream-light`: `#F9F8F5`
- Fontes via `next/font/google`: **Unna** (display/títulos) e **Mulish** (body/UI).

## Estrutura de Rotas (Route Groups)

### Site Principal (`app/(site)/`)
- `/` — Home
- `/sobre` — Sobre o escritório
- `/equipe` — Equipe de advogados
- `/areas-de-atuacao` — Áreas de atuação
- `/blog` — Listagem do blog
- `/blog/[slug]` — Artigo individual (com resolução automática de redirects 301 via `blog_redirects`)
- `/contato` — Formulário de contato integrado ao CRM de leads
- `/politica-de-privacidade` — Política de privacidade
- `/termos-de-uso` — Termos de uso

### Landing Pages Isoladas (`app/(landing)/`)
- `/penal` — Landing page Direito Penal (captura de leads unificada no CRM)
- `/proagro` — Landing page Proagro (com redirect permanente de `/proagro-negado` e captura de leads unificada no CRM)

### Autenticação & Painel Admin
- `/sign-in` — Login administrativo nativo (Email + Senha → cookie `ehs_admin_session`)
- `/admin` — Dashboard editorial e visão executiva
- `/admin/posts` — Listagem, busca, filtros e ações em lote de artigos
- `/admin/posts/novo` — **Estúdio Editorial** para criação de artigos (TipTap v3, imagens inline, callouts, slash menu `/`, Modo Foco, upload direto assinado até 15 MB)
- `/admin/posts/[id]` — **Estúdio Editorial** para edição de artigos (Rascunho ↔ Publicado, persistência automática de redirect 301 em `blog_redirects` ao mudar slug publicado, limpeza automática de capa e imagens inline órfãs)
- `/admin/categorias` — Gestão de categorias do blog
- `/admin/leads` — **Leads CRM** (inbox unificado de `/contato`, `/proagro` e `/penal`, triagem de status, notas e resposta rápida via WhatsApp)
- `/admin/analytics` — **Analytics Anti-Inflação** de artigos (leituras válidas, leitores únicos, conclusão de leitura, origem de tráfego)
- `/admin/perfil` — Perfil do autor e gestão de conta
- `/admin/sistema` — Saúde do sistema e integrações

### APIs Principais (`app/api/`)
- `/api/analytics/collect` — Coleta first-party de eventos de leitura anti-inflação (rate-limited via Upstash Redis + deduplicação)
- `/api/admin/uploads/sign` — Emissão de URLs assinadas do Supabase Storage para upload direto (até 15 MB) no bucket `blog-covers` (`covers/` e `content/`)

## Banco de Dados & Migrations (`supabase/`)
Migrations versionadas em `supabase/migrations/`:
1. `001_security_rls_and_rpc.sql` — RLS base, políticas do bucket `blog-covers` e RPC legada
2. `002_contact_leads.sql` — Tabela `contact_leads` para captura inicial de leads
3. `003_article_analytics.sql` — Estrutura de analytics anti-inflação de artigos (eventos/métricas diárias e sessões)
4. `004_admin_auth.sql` — Tabela `admin_users` para autenticação nativa com hash `scrypt`
5. `005_security_and_analytics_rpc.sql` — Endurecimento de segurança/RLS e RPCs de agregação de analytics
6. `006_leads_crm_and_redirects.sql` — Evolução do CRM de leads (origem unificada `/contato`, `/proagro`, `/penal`, notas/triagem) e tabela `blog_redirects` para redirects 301 de slugs

- **Seed idempotente:** `supabase/seed.sql`

### Tabelas principais
```sql
admin_users: id UUID/TEXT PK, email UNIQUE, password_hash (scrypt), full_name, role, is_active, created_at
authors: id TEXT PK, full_name, slug, bio, oab, specialties TEXT[], avatar_url, created_at
categories: id SERIAL PK, name, slug, color_hex
posts: id UUID PK, title, slug, content (HTML TipTap), excerpt,
       cover_image_url, author_id TEXT FK, category_id INT FK,
       status (draft|published), published_at, reading_time_min,
       views INT, created_at, updated_at
tags: id, name, slug
post_tags: post_id FK, tag_id FK
blog_redirects: old_slug TEXT PK, new_slug TEXT, created_at
contact_leads: id UUID PK, name, email, phone, subject, message, source, status, notes, created_at
article_analytics / daily rollups: tabelas e RPCs de métricas anti-inflação (migrations 003 e 005)
instagram_config: id INT PK (single row = 1), access_token TEXT, updated_at
```

### Regras críticas do banco & Storage
- **RLS habilitado em todas as tabelas**, incluindo `admin_users`, `contact_leads`, `blog_redirects` e `instagram_config` (`REVOKE ALL FROM anon, authenticated` onde aplicável; acesso administrativo exclusivamente server-side via `SUPABASE_SERVICE_ROLE_KEY`).
- Usuários públicos (`anon`) têm permissão apenas de `SELECT` em `authors`, `categories`, `tags`, `posts` publicados, `post_tags` de posts publicados e leitura no bucket público `blog-covers`.
- Escritas administrativas ocorrem exclusivamente no servidor via `createAdminClient()` (`SUPABASE_SERVICE_ROLE_KEY`).
- Uploads de mídia usam URLs assinadas (`/api/admin/uploads/sign`, até 15 MB) direto do navegador para `blog-covers/covers/...` e `blog-covers/content/...`. Ao atualizar ou excluir artigos, imagens de capa e imagens inline órfãs são removidas automaticamente do Storage (best-effort, não bloqueante).
- `authors.id` e `posts.author_id` permanecem `TEXT` para compatibilidade histórica com IDs existentes.

## Autenticação e Autorização
- Autenticação 100% nativa (zero Clerk): validação contra `admin_users` (ou credenciais bootstrap `ADMIN_EMAIL` + `ADMIN_PASSWORD` com suporte a `scrypt:<saltHex>:<hashHex>`).
- Sessão mantida em cookie `HttpOnly`, `Secure` (produção), `SameSite=Lax` chamado `ehs_admin_session`, assinado com `ADMIN_SESSION_SECRET` (HMAC-SHA256).
- `proxy.ts` (convenção Next.js 16) bloqueia `/sign-up` (redirecionando para `/sign-in`), valida `ehs_admin_session` em `/admin/*` (redirecionando para `/sign-in`) e retorna `401` em `/api/admin/*`.
- Defesa em profundidade: `requireAdmin()` / `requireAdminApi()` (`lib/auth.ts`) é chamado em `app/admin/layout.tsx`, em todas as Server Pages, Server Actions e Route Handlers administrativos.

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
- **Autenticação Admin Nativa:** `ADMIN_SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- **Cron Jobs:** `CRON_SECRET`
- **Email:** `RESEND_API_KEY`, `CONTACT_EMAIL`, `CONTACT_FROM_EMAIL`
- **Rate Limiting & Deduplicação:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- **Analytics & Marketing:** `ANALYTICS_HASH_SALT`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `META_PIXEL_ID`, `META_PIXEL_ACCESS_TOKEN`

## Segurança Implementada
- Headers HTTP em `next.config.ts`: `Content-Security-Policy` (com `frame-ancestors` e origin Supabase derivada de `NEXT_PUBLIC_SUPABASE_URL`), `Strict-Transport-Security` (HSTS), `Permissions-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`.
- Rate limiting via Upstash Redis no formulário de contato/leads, ações administrativas do blog, assinatura de uploads (`/api/admin/uploads/sign`) e coleta de analytics (`/api/analytics/collect`).
- Sanitização de HTML do TipTap via `sanitize-html` com allowlist explícita (`lib/sanitize-blog-html.ts`), incluindo suporte seguro a imagens inline e blocos de callout.
- Validação de inputs com Zod nas Server Actions e Route Handlers (`app/contato/actions.ts`, `app/actions/blog.ts`, `app/actions/admin-leads.ts`, `app/api/admin/uploads/sign/route.ts`).
- `.env*` (exceto `.env.example`) ignorado no `.gitignore`.

## Observações para Manutenção
- **Nunca modificar ou commitar `.env.local`** — mantenha `.env.example` atualizado ao adicionar novas variáveis.
- `authors.id` é `TEXT` — não alterar para `UUID` sem plano de migração de dados.
- Sempre versionar alterações de schema/RLS em `supabase/migrations/` em vez de criar SQLs soltos na raiz.
- Em desenvolvimento, prefira chaves de desenvolvimento/staging separadas das credenciais de produção.
