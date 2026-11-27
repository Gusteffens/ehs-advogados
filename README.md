# EHS Advocacia — Erlo, Haas & Steffens

Site institucional, landing pages jurídicas, blog editorial, CRM de leads e painel administrativo do escritório **Erlo, Haas & Steffens Sociedade de Advocacia** (`https://www.ehsadvogados.com.br`).

## Stack Técnica

- **Framework:** Next.js 16 (App Router + `proxy.ts`) + React 19 + TypeScript (zero `framer-motion`)
- **Estilização & Tipografia:** Tailwind CSS v4 (design tokens em `app/globals.css`) + `next/font/google` (**Unna** e **Mulish**)
- **Autenticação Admin:** Sistema nativo Email + Senha com cookie `HttpOnly` HMAC-SHA256 (`ehs_admin_session`) e tabela `admin_users` (zero Clerk)
- **Banco de Dados & Storage:** Supabase (`@supabase/supabase-js`) com Row-Level Security (RLS) e uploads diretos assinados de até 15 MB (`/api/admin/uploads/sign`)
- **Estúdio Editorial:** TipTap v3 com imagens inline, blocos de callout jurídicos, slash menu (`/`), Modo Foco, limpeza automática de mídias órfãs e redirects 301 automáticos ao alterar slugs publicados (`blog_redirects`) + sanitização server-side com `sanitize-html`
- **Analytics Anti-Inflação:** Coleta first-party em `/api/analytics/collect` com deduplicação via Upstash Redis/HMAC, RPCs seguras no Supabase e dashboard em `/admin/analytics`
- **Leads CRM:** Captura unificada em `/contato`, `/proagro` e `/penal`, gerenciada em `/admin/leads`
- **E-mail & Rate Limiting:** Resend + Upstash Redis
- **Marketing & Ads:** PostHog + GTM/Google Ads + Meta Pixel / Conversions API (CAPI)
- **Deploy:** Vercel (Node.js `>=20`)

## Estrutura Principal

- `app/(site)/` — Site institucional e blog público (`/`, `/sobre`, `/equipe`, `/areas-de-atuacao`, `/blog`, `/blog/[slug]`, `/contato`, `/politica-de-privacidade`, `/termos-de-uso`)
- `app/(landing)/` — Landing pages isoladas com captura unificada de leads (`/penal`, `/proagro`)
- `app/admin/` — Painel administrativo protegido (`ehs_admin_session`):
  - `/admin` — Visão geral
  - `/admin/posts`, `/admin/posts/novo`, `/admin/posts/[id]` — Estúdio Editorial e gestão de artigos
  - `/admin/categorias` — Gestão de categorias
  - `/admin/leads` — Leads CRM
  - `/admin/analytics` — Analytics anti-inflação de artigos
  - `/admin/perfil` e `/admin/sistema` — Perfil e diagnóstico
- `app/sign-in/` — Fluxo de login administrativo nativo
- `app/api/` — Endpoints de analytics (`/api/analytics/collect`), upload assinado (`/api/admin/uploads/sign`) e integrações
- `proxy.ts` — Proteção de rotas Next.js 16 (bloqueio de `/sign-up` e guarda de `/admin/*` e `/api/admin/*`)
- `lib/` — Configurações (`site-config.ts`), sessão/autenticação (`auth.ts`, `auth-session.ts`), clientes Supabase (`public.ts`, `admin.ts`), Upstash Redis, Resend e camada de dados
- `supabase/migrations/` — Migrations SQL versionadas (`001` a `006`)
- `supabase/seed.sql` — Seed idempotente de autores e `instagram_config`

## Setup Local

1. **Pré-requisitos:** Node.js `>=20` e npm.
2. **Instalar dependências:**
   ```bash
   npm install
   ```
3. **Configurar variáveis de ambiente:**
   Copie `.env.example` para `.env.local` e preencha os valores reais (incluindo `ADMIN_SESSION_SECRET`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`):
   ```bash
   cp .env.example .env.local
   ```
4. **Aplicar banco de dados (Supabase):**
   Execute em ordem no Supabase SQL Editor (ou via Supabase CLI):
   - `supabase/migrations/001_security_rls_and_rpc.sql` (políticas RLS base e Storage `blog-covers`)
   - `supabase/migrations/002_contact_leads.sql` (tabela `contact_leads`)
   - `supabase/migrations/003_article_analytics.sql` (analytics anti-inflação de artigos)
   - `supabase/migrations/004_admin_auth.sql` (autenticação nativa `admin_users`)
   - `supabase/migrations/005_security_and_analytics_rpc.sql` (segurança e RPCs de analytics)
   - `supabase/migrations/006_leads_crm_and_redirects.sql` (CRM de leads unificado e tabela `blog_redirects`)
   - `supabase/seed.sql` (seed idempotente de autores e `instagram_config`)
5. **Iniciar servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000).

## Scripts Disponíveis

| Script | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento Next.js |
| `npm run build` | Gera o build de produção |
| `npm run start` | Executa o servidor de produção |
| `npm run typecheck` | Valida tipagem TypeScript (`tsc --noEmit`) |
| `npm run lint` | Executa análise estática com ESLint |

## Variáveis de Ambiente

Todas as variáveis suportadas estão documentadas em [`.env.example`](./.env.example). Nunca faça commit de arquivos `.env*` com credenciais reais.
