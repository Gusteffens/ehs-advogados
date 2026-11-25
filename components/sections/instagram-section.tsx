import { ArrowRight, Instagram } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section-title";
import { Button } from "@/components/ui/button";
import { getInstagramFeed } from "@/lib/instagram";
import { SITE_CONFIG } from "@/lib/site-config";

export async function InstagramSection() {
  const feed = await getInstagramFeed();

  // Duplica os itens para fazer o efeito de loop contínuo e sem emendas
  const marqueeItems = [...feed, ...feed];

  return (
    <section className="py-24 lg:py-32 bg-cream-light relative overflow-hidden border-t border-forest-600/10">
      {/* Elemento de iluminação decorativa leve */}
      <div className="absolute top-0 right-[15%] w-96 h-96 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-[10%] w-72 h-72 bg-forest-600/5 rounded-full blur-[80px] pointer-events-none" />

      <Container className="relative">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-14">
          <SectionTitle
            label="@ehs.adv"
            title="Conexão no Instagram"
            subtitle="Acompanhe publicações diárias com orientações jurídicas claras, análise de direitos e bastidores da nossa equipe."
            align="left"
            className="mb-0 lg:max-w-xl"
          />
          <a
            href={SITE_CONFIG.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 lg:mt-0 shrink-0"
          >
            <Button
              variant="outline"
              className="group border-gold-dark/40 text-gold-dark hover:bg-gold-dark hover:text-cream hover:border-gold-dark"
            >
              <Instagram className="h-4 w-4 mr-2" />
              Seguir @ehs.adv
              <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </a>
        </div>
      </Container>

      {/* Viewport do Marquee (largura total; estilos em app/globals.css) */}
      <div className="w-full overflow-hidden relative py-4 mask-gradient">
        <div className="marquee-content flex gap-6 w-max">
          {marqueeItems.map((post, idx) => (
            <a
              key={`${post.id}-${idx}`}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col w-[300px] shrink-0 bg-white rounded-2xl border border-forest-600/10 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 no-underline"
            >
              {/* Imagem do Post (1:1 Aspect Ratio) */}
              <div className="relative aspect-square w-full overflow-hidden bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.media_url}
                  alt={post.caption || "Publicação do Instagram"}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />

                {/* Overlay Escuro com Ícone do Instagram ao Hover */}
                <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-ink shadow-md transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Instagram className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Conteúdo / Legenda do Post */}
              <div className="p-5 flex flex-col flex-grow">
                <p className="text-forest-600 text-xs font-semibold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Instagram className="h-3.5 w-3.5" />
                  Instagram
                </p>
                {post.caption ? (
                  <p className="text-ink text-sm leading-relaxed line-clamp-3 flex-1 font-body">
                    {post.caption}
                  </p>
                ) : (
                  <p className="text-ink/60 text-sm italic flex-1 font-body">
                    Ver publicação no Instagram...
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
