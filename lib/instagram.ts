import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "./supabase/admin";
import { SITE_CONFIG } from "./site-config";

export interface InstagramPost {
  id: string;
  caption?: string;
  media_url: string;
  permalink: string;
  media_type: string;
  thumbnail_url?: string;
  timestamp: string;
}

interface GraphMediaItem {
  id: string;
  caption?: string;
  media_url?: string;
  permalink?: string;
  media_type?: string;
  thumbnail_url?: string;
  timestamp?: string;
}

interface GraphMediaResponse {
  data?: GraphMediaItem[];
}

interface GraphRefreshResponse {
  access_token?: string;
}

const FETCH_TIMEOUT_MS = 8000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function getMockInstagramPosts(): InstagramPost[] {
  const now = new Date().toISOString();
  const profileUrl = SITE_CONFIG.social.instagram;

  return [
    {
      id: "mock_1",
      caption:
        "Estratégia e rigor técnico no Direito Penal. Cada detalhe importa na defesa de um caso. Atuação focada em garantir os direitos fundamentais. #direito #criminal #advocacia",
      media_url: "/images/team/alessandra-steffens.webp",
      permalink: profileUrl,
      media_type: "IMAGE",
      timestamp: now,
    },
    {
      id: "mock_2",
      caption:
        "A importância do compliance e da governança corporativa no cenário jurídico atual. Protegendo empresas de riscos e estruturando o crescimento seguro. #empresarial #compliance #advogado",
      media_url: "/images/team/luiza-haas.webp",
      permalink: profileUrl,
      media_type: "IMAGE",
      timestamp: now,
    },
    {
      id: "mock_3",
      caption:
        "Reunião de alinhamento estratégico. Atendimento personalizado para cada cliente é o pilar que sustenta o nosso escritório desde 2022. #equipe #trabalho #advocacia",
      media_url: "/images/team/maisa-christ.webp",
      permalink: profileUrl,
      media_type: "IMAGE",
      timestamp: now,
    },
    {
      id: "mock_4",
      caption:
        "Nossa equipe de sócios e advogados prontos para atender suas demandas nas diversas áreas do direito. Excelência técnica e compromisso. #ehs #advogados #sc",
      media_url: "/images/team/equipe.webp",
      permalink: profileUrl,
      media_type: "IMAGE",
      timestamp: now,
    },
    {
      id: "mock_5",
      caption:
        "Direito Ambiental e Agronegócio: equilibrando a produção e a sustentabilidade no campo com segurança jurídica para o produtor rural. #agronegocio #ambiental #campo",
      media_url: "/images/team/jean-erlo.webp",
      permalink: profileUrl,
      media_type: "IMAGE",
      timestamp: now,
    },
    {
      id: "mock_6",
      caption:
        "Sede Erlo, Haas & Steffens Sociedade de Advocacia em São Miguel do Oeste/SC. Um espaço estruturado para receber você com total privacidade e conforto. #sede #escritorio #smo",
      media_url: "/images/team/jacson-erlo.webp",
      permalink: profileUrl,
      media_type: "IMAGE",
      timestamp: now,
    },
  ];
}

export async function refreshInstagramTokenIfNeeded(): Promise<{
  refreshed: boolean;
  reason: string;
}> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { refreshed: false, reason: "supabase_not_configured" };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("instagram_config")
    .select("access_token, updated_at")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("Erro ao consultar instagram_config:", error.message);
    return { refreshed: false, reason: "db_error" };
  }

  if (!data || !data.access_token || data.access_token === "PLACEHOLDER_TOKEN") {
    return { refreshed: false, reason: "token_not_configured" };
  }

  const lastUpdated = new Date(data.updated_at).getTime();
  if (Number.isFinite(lastUpdated) && Date.now() - lastUpdated <= THIRTY_DAYS_MS) {
    return { refreshed: false, reason: "token_still_fresh" };
  }

  try {
    const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(data.access_token)}`;
    const refreshRes = await fetch(refreshUrl, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!refreshRes.ok) {
      return { refreshed: false, reason: `instagram_api_status_${refreshRes.status}` };
    }

    const refreshData = (await refreshRes.json()) as GraphRefreshResponse;
    if (!refreshData.access_token) {
      return { refreshed: false, reason: "missing_access_token_in_response" };
    }

    const { error: updateError } = await supabase
      .from("instagram_config")
      .update({
        access_token: refreshData.access_token,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (updateError) {
      console.error("Falha ao salvar token renovado do Instagram:", updateError.message);
      return { refreshed: false, reason: "db_update_error" };
    }

    return { refreshed: true, reason: "refreshed" };
  } catch (error) {
    console.error("Erro na requisição de renovação de token do Instagram:", error);
    return { refreshed: false, reason: "network_error" };
  }
}

/**
 * Busca o feed do Instagram diretamente via Graph API.
 * Retorna null quando não configurado (placeholder) e lança erro em falhas
 * transitórias para evitar que o unstable_cache armazene erros por 1 hora.
 */
async function fetchInstagramFeedRaw(): Promise<InstagramPost[] | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  await refreshInstagramTokenIfNeeded();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("instagram_config")
    .select("access_token")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw new Error(`Instagram config query failed: ${error.message}`);
  }

  if (!data || !data.access_token || data.access_token === "PLACEHOLDER_TOKEN") {
    return null;
  }

  const mediaUrl = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${encodeURIComponent(data.access_token)}&limit=20`;
  const res = await fetch(mediaUrl, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`Instagram API retornou status ${res.status}`);
  }

  const json = (await res.json()) as GraphMediaResponse;
  const rawPosts = Array.isArray(json.data) ? json.data : [];

  const filtered = rawPosts.filter((post) => {
    const caption = (post.caption ?? "").toLowerCase();
    return (
      !caption.includes("#exclusivo-ig") &&
      !caption.includes("#exclusivoig") &&
      Boolean(post.media_url || post.thumbnail_url) &&
      Boolean(post.permalink)
    );
  });

  return filtered.slice(0, 10).map((post) => ({
    id: post.id,
    caption: post.caption,
    media_url:
      post.media_type === "VIDEO" && post.thumbnail_url
        ? post.thumbnail_url
        : (post.media_url ?? post.thumbnail_url ?? ""),
    permalink: post.permalink ?? SITE_CONFIG.social.instagram,
    media_type: post.media_type ?? "IMAGE",
    thumbnail_url: post.thumbnail_url,
    timestamp: post.timestamp ?? new Date().toISOString(),
  }));
}

const fetchCachedInstagramFeed = unstable_cache(
  async () => fetchInstagramFeedRaw(),
  ["instagram-feed"],
  {
    revalidate: 3600,
    tags: ["instagram-feed"],
  }
);

export async function getInstagramFeed(): Promise<InstagramPost[]> {
  try {
    const posts = await fetchCachedInstagramFeed();
    if (!posts || posts.length === 0) {
      return getMockInstagramPosts();
    }
    return posts;
  } catch (error) {
    console.error("Erro ao obter feed do Instagram; usando fallback:", error);
    return getMockInstagramPosts();
  }
}
