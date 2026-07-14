import Link from "next/link";
import { ArrowRight, Instagram } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section-title";
import { Button } from "@/components/ui/button";
import { getInstagramFeed } from "@/lib/instagram";

export async function InstagramSection() {
    const feed = await getInstagramFeed();
    
    // Duplica os itens para fazer o efeito de loop contínuo e sem emendas
    const marqueeItems = [...feed, ...feed];

    return (
        <section className="py-24 lg:py-32 bg-[#F9F8F5] relative overflow-hidden border-t border-[#3B5A3C]/10">
            {/* Elemento de iluminação decorativa leve */}
            <div className="absolute top-0 right-[15%] w-96 h-96 bg-[#E8D49A]/4 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-[10%] w-72 h-72 bg-[#3B5A3C]/3 rounded-full blur-[80px] pointer-events-none" />

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
                        href="https://www.instagram.com/ehs.adv/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-6 lg:mt-0 shrink-0"
                    >
                        <Button variant="outline" className="group border-[#877249]/30 text-[#877249] hover:bg-[#877249] hover:text-[#EEEDE5]">
                            <Instagram className="h-4 w-4 mr-2" />
                            Seguir @ehs.adv
                            <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </a>
                </div>
            </Container>

            {/* Viewport do Marquee (largura total) */}
            <div className="w-full overflow-hidden relative py-4 mask-gradient">
                <div className="marquee-content flex gap-6 w-max">
                    {marqueeItems.map((post, idx) => (
                        <a
                            key={`${post.id}-${idx}`}
                            href={post.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col w-[300px] shrink-0 bg-white rounded-2xl border border-[#3B5A3C]/8 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 no-underline"
                        >
                            {/* Imagem do Post (1:1 Aspect Ratio) */}
                            <div className="relative aspect-square w-full overflow-hidden bg-[#EEEDE5]">
                                <img
                                    src={post.media_url}
                                    alt={post.caption || "Publicação do Instagram"}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                                
                                {/* Overlay Escuro com Ícone do Instagram ao Hover */}
                                <div className="absolute inset-0 bg-[#0D1812]/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8D49A] text-[#0D1812] shadow-md transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                        <Instagram className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>

                            {/* Conteúdo / Legenda do Post */}
                            <div className="p-5 flex flex-col flex-grow">
                                <p className="text-[#3B5A3C] text-xs font-semibold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                    <Instagram className="h-3.5 w-3.5" />
                                    Instagram
                                </p>
                                {post.caption ? (
                                    <p className="text-[#0D1812] text-sm leading-relaxed line-clamp-3 flex-1 font-body">
                                        {post.caption}
                                    </p>
                                ) : (
                                    <p className="text-[#0D1812]/50 text-sm italic flex-1 font-body">
                                        Ver publicação no Instagram...
                                    </p>
                                )}
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* Estilos CSS do Marquee encapsulados */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes marqueeLoop {
                    0% {
                        transform: translate3d(0, 0, 0);
                    }
                    100% {
                        transform: translate3d(-50%, 0, 0);
                    }
                }
                
                .marquee-content {
                    animation: marqueeLoop 45s linear infinite;
                }
                
                /* Pausa a animação ao passar o mouse */
                .marquee-content:hover {
                    animation-play-state: paused;
                }

                /* Suaviza as laterais do carrosel infinito criando um degradê nas bordas */
                .mask-gradient::before,
                .mask-gradient::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 120px;
                    z-index: 10;
                    pointer-events: none;
                }
                
                .mask-gradient::before {
                    left: 0;
                    background: linear-gradient(to right, #F9F8F5 10%, transparent 100%);
                }
                
                .mask-gradient::after {
                    right: 0;
                    background: linear-gradient(to left, #F9F8F5 10%, transparent 100%);
                }

                @media (max-width: 768px) {
                    .mask-gradient::before,
                    .mask-gradient::after {
                        width: 50px;
                    }
                    .marquee-content {
                        animation-duration: 35s; /* Um pouco mais rápido em telas menores */
                    }
                }
            `}} />
        </section>
    );
}
