# EHS Advocacia — Erlo, Haas & Steffens

Site institucional, landing pages jurídicas, blog editorial e painel administrativo do escritório **Erlo, Haas & Steffens Sociedade de Advocacia** (`https://www.ehsadvogados.com.br`).

## Stack Técnica

- **Framework:** Next.js 16 (App Router + `proxy.ts`) + React 19 + TypeScript
- **Estilização:** Tailwind CSS v4 (design tokens em `app/globals.css`) + Fontes locais (`@fontsource/unna`, `@fontsource/mulish`)
- **Autenticação:** Clerk (`@clerk/nextjs` v7) isolado nas rotas administrativas (`/admin`, `/sign-in`)
- **Banco de Dados & Storage:** Supabase (`@supabase/supabase-js`) com Row-Level Security (RLS)
- **Editor de Blog:** TipTap v3 + sanitização server-side com `sanitize-html`
- **E-mail & Rate Limiting:** Resend + Upstash Redis
- **Analytics:** PostHog + Meta Conversions API (CAPI)
- **Deploy:** Vercel (Node.js `>=20`)

## Estrutura Principal

- `app/(site)/` — Site institucional e blog público (`/`, `/sobre`, `/equipe`, `/areas-de-atuacao`, `/blog`, `/contato`, `/politica-de-privacidade`, `/termos-de-uso`)
- `app/(landing)/` — Landing pages isoladas (`/penal`, `/proagro`)
- `app/admin/` — Painel administrativo protegido (`role: admin`)
- `app/sign-in/` e `app/unauthorized/` — Fluxo de login e acesso negado
- `proxy.ts` — Proteção de rotas Next.js 16 (bloqueio de `/sign-up` e guarda de `/admin/*`)
- `lib/` — Configurações (`site-config.ts`), clientes Supabase (`public.ts`, `admin.ts`), integrações e camada de dados
- `supabase/migrations/` — Migrations SQL (RLS, políticas de Storage e RPC `increment_post_views`)
- `supabase/seed.sql` — Seed idempotente de autores e tabela `instagram_config`

## Setup Local

1. **Pré-requisitos:** Node.js `>=20` e npm.
2. **Instalar dependências:**
   ```bash
   npm install
   ```
3. **Configurar variáveis de ambiente:**
   Copie `.env.example` para `.env.local` e preencha os valores reais:
   ```bash
   cp .env.example .env.local
   ```
4. **Aplicar banco de dados (Supabase):**
   Execute no Supabase SQL Editor (ou via Supabase CLI):
   - `supabase/migrations/001_security_rls_and_rpc.sql` (políticas RLS, Storage `blog-covers` e RPC `increment_post_views`)
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
