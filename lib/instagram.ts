import { unstable_cache } from "next/cache";
import { createAdminClient } from "./supabase/admin";

export interface InstagramPost {
    id: string;
    caption?: string;
    media_url: string;
    permalink: string;
    media_type: string;
    thumbnail_url?: string;
    timestamp: string;
}

// Categoria especial de posts com fotos profissionais e legendas alinhadas à EHS Advocacia
const MOCK_INSTAGRAM_POSTS: InstagramPost[] = [
    {
        id: "mock_1",
        caption: "Estratégia e rigor técnico no Direito Penal. Cada detalhe importa na defesa de um caso. Atuação focada em garantir os direitos fundamentais. #direito #criminal #advocacia",
        media_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
        permalink: "https://www.instagram.com/ehs.adv/",
        media_type: "IMAGE",
        timestamp: new Date().toISOString()
    },
    {
        id: "mock_2",
        caption: "A importância do compliance e da governança corporativa no cenário jurídico atual. Protegendo empresas de riscos e estruturando o crescimento seguro. #empresarial #compliance #advogado",
        media_url: "https://images.unsplash.com/photo-1505664194779-8bebcb95c550?w=600&auto=format&fit=crop&q=80",
        permalink: "https://www.instagram.com/ehs.adv/",
        media_type: "IMAGE",
        timestamp: new Date().toISOString()
    },
    {
        id: "mock_3",
        caption: "Reunião de alinhamento estratégico. Atendimento personalizado para cada cliente é o pilar que sustenta o nosso escritório desde 2022. #equipe #trabalho #advocacia",
        media_url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80",
        permalink: "https://www.instagram.com/ehs.adv/",
        media_type: "IMAGE",
        timestamp: new Date().toISOString()
    },
    {
        id: "mock_4",
        caption: "Nossa equipe de sócios e advogados prontos para atender suas demandas nas diversas áreas do direito. Excelência técnica e compromisso. #ehs #advogados #sc",
        media_url: "/images/team/equipe.webp",
        permalink: "https://www.instagram.com/ehs.adv/",
        media_type: "IMAGE",
        timestamp: new Date().toISOString()
    },
    {
        id: "mock_5",
        caption: "Direito Ambiental e Agronegócio: equilibrando a produção e a sustentabilidade no campo com segurança jurídica para o produtor rural. #agronegocio #ambiental #campo",
        media_url: "https://images.unsplash.com/photo-1505664063603-23e56228b36e?w=600&auto=format&fit=crop&q=80",
        permalink: "https://www.instagram.com/ehs.adv/",
        media_type: "IMAGE",
        timestamp: new Date().toISOString()
    },
    {
        id: "mock_6",
        caption: "Sede Erlo, Haas & Steffens Sociedade de Advocacia em São Miguel do Oeste/SC. Um espaço estruturado para receber você com total privacidade e conforto. #sede #escritorio #smo",
        media_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
        permalink: "https://www.instagram.com/ehs.adv/",
        media_type: "IMAGE",
        timestamp: new Date().toISOString()
    }
];

/**
 * Busca o feed do Instagram diretamente via Graph API.
 * Se as chaves ou tabelas não estiverem prontas, retorna os dados mockados de fallback de forma segura.
 */
async function fetchInstagramFeedRaw(): Promise<InstagramPost[]> {
    try {
        const supabase = createAdminClient();
        if (!supabase) {
            console.warn("Supabase Admin Client não pôde ser inicializado. Usando feed de backup do Instagram.");
            return MOCK_INSTAGRAM_POSTS;
        }

        // Tenta buscar o token na tabela instagram_config
        const { data, error } = await supabase
            .from("instagram_config")
            .select("access_token, updated_at")
            .eq("id", 1)
            .maybeSingle();

        if (error) {
            console.warn("Tabela instagram_config não encontrada ou erro na consulta. Usando feed de backup:", error.message);
            return MOCK_INSTAGRAM_POSTS;
        }

        if (!data || !data.access_token || data.access_token === "PLACEHOLDER_TOKEN") {
            console.log("Token do Instagram ainda é placeholder ou inexistente. Usando feed de backup.");
            return MOCK_INSTAGRAM_POSTS;
        }

        let token = data.access_token;
        const lastUpdated = new Date(data.updated_at).getTime();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;

        // Se o token foi atualizado há mais de 30 dias, executa a renovação automática
        if (Date.now() - lastUpdated > thirtyDays) {
            console.log("Token do Instagram tem mais de 30 dias. Iniciando renovação automática...");
            try {
                const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`;
                const refreshRes = await fetch(refreshUrl);
                if (refreshRes.ok) {
                    const refreshData = await refreshRes.json();
                    if (refreshData.access_token) {
                        token = refreshData.access_token;
                        // Atualiza o token no Supabase
                        const { error: updateError } = await supabase
                            .from("instagram_config")
                            .update({
                                access_token: token,
                                updated_at: new Date().toISOString()
                            })
                            .eq("id", 1);
                        
                        if (updateError) {
                            console.error("Falha ao salvar token renovado no banco:", updateError.message);
                        } else {
                            console.log("Token do Instagram renovado e salvo com sucesso!");
                        }
                    }
                } else {
                    console.warn(`Renovação do token retornou status ${refreshRes.status}. Mantendo o atual.`);
                }
            } catch (refreshErr) {
                console.error("Erro na requisição de renovação de token:", refreshErr);
            }
        }

        // Busca o feed de mídia do Instagram
        const mediaUrl = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${token}&limit=20`;
        const res = await fetch(mediaUrl);

        if (!res.ok) {
            console.warn(`Instagram API retornou status ${res.status}. Usando feed de backup.`);
            return MOCK_INSTAGRAM_POSTS;
        }

        const json = await res.json();
        const rawPosts = json.data || [];

        // Filtra posts que contenham a hashtag de ocultação #exclusivo-ig ou #exclusivoig
        const filtered = rawPosts.filter((post: any) => {
            const caption = (post.caption || "").toLowerCase();
            return !caption.includes("#exclusivo-ig") && !caption.includes("#exclusivoig");
        });

        // Mapeia os dados do feed
        return filtered.map((post: any) => ({
            id: post.id,
            caption: post.caption,
            // Se for vídeo, usa a thumbnail_url se existir, senão media_url
            media_url: post.media_type === "VIDEO" && post.thumbnail_url ? post.thumbnail_url : post.media_url,
            permalink: post.permalink,
            media_type: post.media_type,
            thumbnail_url: post.thumbnail_url,
            timestamp: post.timestamp
        })).slice(0, 10);

    } catch (e) {
        console.error("Erro crítico ao obter feed do Instagram, usando dados mockados:", e);
        return MOCK_INSTAGRAM_POSTS;
    }
}

// Cache do feed por 1 hora (3600 segundos) para evitar requisições desnecessárias à API e ao banco
export const getInstagramFeed = unstable_cache(
    async () => fetchInstagramFeedRaw(),
    ["instagram-feed"],
    {
        revalidate: 3600,
        tags: ["instagram-feed"]
    }
);
