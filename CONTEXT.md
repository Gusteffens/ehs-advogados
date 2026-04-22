# Contexto do Projeto — Erlo Haas & Steffens

## Visão Geral
Site institucional + blog para o escritório de advocacia "Erlo Haas & Steffens".
URL: https://www.ehsadvogados.com.br
Repositório: GitHub (privado)
Deploy: Vercel (automático via push)

## Stack Técnica
- **Frontend/Deploy:** Next.js 15 App Router + TypeScript + Tailwind CSS
- **Autenticação:** Clerk (modo produção — chaves pk_live_/sk_live_)
- **Banco de dados:** Supabase (PostgreSQL)
- **Email:** Resend
- **Cache/Rate Limiting:** Upstash Redis
- **Analytics:** PostHog
- **Erros:** Sentry
- **DNS/CDN:** Cloudflare
- **Domínio:** Registro.br → Cloudflare → Vercel

## Identidade Visual
- Verde escuro (primary): #0D1812 / #1B2D1E
- Verde médio: #3B5A3C
- Dourado (accent): #E8D49A / #877249
- Creme (background): #EEEDE5
- Fontes: Unna (display/headlines), Mulish (body), Outfit (UI)

## Estrutura de Rotas
### Públicas
- `/` — Home
- `/sobre` — Sobre o escritório
- `/equipe` — Equipe de advogados
- `/areas-de-atuacao` — Áreas de atuação
- `/blog` — Listagem do blog
- `/blog/[slug]` — Artigo individual
- `/contato` — Contato
- `/politica-de-privacidade`
- `/termos-de-uso`
- `/sign-in` — Login customizado com Clerk

### Protegidas (role: admin)
- `/admin` — Dashboard
- `/admin/posts` — Gerenciar posts
- `/admin/posts/novo` — Criar post (editor Tiptap)
- `/admin/posts/[id]` — Editar post
- `/admin/perfil` — Perfil do autor

## Schema Supabase
```sql
-- Autores (id = Clerk user_id em formato TEXT)
authors: id TEXT PK, full_name, slug, bio, oab,
         specialties TEXT[], avatar_url, created_at

-- Categorias do blog
categories: id SERIAL PK, name, slug, color_hex

-- Posts
posts: id UUID PK, title, slug, content (HTML Tiptap),
       excerpt, cover_image_url, author_id TEXT FK,
       category_id INT FK, status (draft|published),
       published_at, reading_time_min, views INT,
       created_at, updated_at

-- Tags
tags: id, name, slug
post_tags: post_id FK, tag_id FK
```

### Observações críticas do banco:
- RLS **desabilitado** em todas as tabelas — segurança feita via middleware Clerk
- `authors.id` e `posts.author_id` são TEXT (não UUID) para compatibilidade com Clerk user IDs
- Extensão `unaccent` habilitada para busca sem acentos

## Autenticação e Autorização
- Clerk em modo **produção** (pk_live_/sk_live_)
- Role admin definida via Public Metadata no Clerk Dashboard: `{"role": "admin"}`
- Middleware protege `/admin/*` verificando role
- `/sign-up` bloqueado — cadastro apenas via Clerk Dashboard
- Session token customizado para incluir metadata

## Equipe (advogados)
1. Alessandra Franke Steffens — Direito Criminal — OAB/SC 21.390-B | OAB/RS 55.474
2. Jacson Mateus Erlo — Agronegócio, Civil, Ambiental — OAB/SC 74.319
3. Jean Tiago Erlo — Agronegócio, Ambiental — OAB/SC 67.239 | OAB/PR 134.567
4. Luíza Klein Haas — Civil, Agronegócio, Ambiental — OAB/SC 65.939
5. Maísa Christ — Direito Civil — OAB/SC 74.365

## Dados Oficiais
- Razão Social: Erlo, Haas & Steffens Sociedade de Advocacia
- CNPJ: 48.624.064/0001-90
- OAB/SC: 8487
- Endereço: Rua Itaberaba, 930, Sala 304, Ed. Fransozi, Centro, São Miguel do Oeste - SC, CEP 89900-000
- WhatsApp: +5549984001053 (https://wa.me/+5549984001053)
- Email: ehs.escritorio@gmail.com
- Instagram: https://www.instagram.com/ehs.adv/
- Facebook: https://www.facebook.com/ehs.adv
- Fundado: 2022

## Imagens da Equipe
Localizadas em `public/images/team/`:
- `alessandra-steffens.webp` — foto formal
- `alessandra-mesa.jpg` — foto na mesa (usada em /equipe)
- `jacson-erlo.webp` — foto formal
- `jacson-mesa.jpeg` — foto na mesa
- `jean-erlo.webp` — foto formal
- `jean-mesa.jpeg` — foto na mesa
- `luiza-haas.webp` — foto formal
- `luiza-mesa.jpeg` — foto na mesa
- `maisa-christ.webp` — foto formal
- `maisa-mesa.jpg` — foto na mesa (usada em /equipe)
- `equipe.webp` — foto coletiva (usada no Hero)

Logo: `public/images/logo-ehs-monogram.png` (fundo transparente)
Logo com fundo: `public/images/logo-ehs-transparent.png`

## Problemas Conhecidos e Pendentes
1. **CRÍTICO — Performance:** Site está muito lento em produção (~20s TTFB em algumas páginas). Suspeita: imagens grandes sendo otimizadas em runtime pelo serverless da Vercel. Imagens já foram convertidas para WebP mas o problema persiste. Investigar causa raiz.
2. **Upload de imagem no Tiptap:** Retorna erro de RLS ao tentar fazer upload para o bucket `blog-images`. Verificar políticas do Storage no Supabase.
3. **Embed de YouTube:** Bloqueado pelo X-Frame-Options. Investigar conflito entre header e CSP.
4. **Clerk no localhost:** Ambiente de desenvolvimento do Clerk foi desativado ao subir para produção. Criar novo ambiente de dev e atualizar chaves no .env.local.

## Variáveis de Ambiente Necessárias
```env
# Clerk (produção)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://kypsmdjogvvvwornxmqp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App
NEXT_PUBLIC_SITE_URL=https://www.ehsadvogados.com.br
CONTACT_EMAIL=ehs.escritorio@gmail.com

# Opcionais (não configurados ainda)
RESEND_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_SENTRY_DSN=
```

## Segurança Implementada
- Headers HTTP: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- CSP configurada no next.config.ts
- Rate limiting no formulário de contato via Upstash
- Sanitização de HTML do Tiptap via regex (isomorphic-dompurify removido — incompatível com Vercel serverless)
- Validação de inputs do formulário de contato com Zod
- .env.local no .gitignore

## Observações para o Agente
- **Nunca modificar .env.local** — apenas instruir o usuário a editar manualmente
- **Não gerar arquivos completos** — apenas trechos modificados para economizar tokens
- O `authors.id` é TEXT (Clerk user ID), não UUID — não alterar esse tipo
- O RLS está desabilitado intencionalmente — não reativar sem revisar todas as Server Actions
- Clerk de desenvolvimento está com problema — testar em produção
- `isomorphic-dompurify` foi removido por incompatibilidade com Vercel — não reinstalar
