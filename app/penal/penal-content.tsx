"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import "./penal.css";

const WHATSAPP_NUMBER = "5549984001053";
const WHATSAPP_BASE_MESSAGE = "Olá, encontrei a página de Direito Penal do escritório Erlo, Haas & Steffens e gostaria de solicitar atendimento.";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_BASE_MESSAGE)}`;

const faqs = [
    {
        question: "Quando devo procurar um advogado criminal?",
        answer: "Assim que houver prisão, intimação, investigação, acusação ou dúvida sobre possível repercussão criminal. A orientação inicial ajuda a avaliar os próximos passos."
    },
    {
        question: "Recebi uma intimação. O que devo fazer?",
        answer: "Preserve o documento e procure orientação antes da data indicada. A providência depende do conteúdo e da finalidade da intimação."
    },
    {
        question: "Posso ser acompanhado antes de prestar depoimento?",
        answer: "Em geral, é possível obter orientação jurídica prévia e acompanhamento. As condições concretas devem ser verificadas conforme o procedimento."
    },
    {
        question: "O escritório atende situações urgentes?",
        answer: "Sim, o escritório recebe contatos urgentes. A disponibilidade e as medidas possíveis são avaliadas conforme cada situação."
    },
    {
        question: "Um familiar pode solicitar atendimento para uma pessoa presa?",
        answer: "Sim. O familiar pode fornecer as informações iniciais para avaliação da situação e das providências possíveis."
    }
];

export default function PenalPageContent() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({});

    // Scroll effect for header
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 24);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close menu on resize or Esc
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1000) {
                setMenuOpen(false);
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setMenuOpen(false);
            }
        };
        window.addEventListener("resize", handleResize, { passive: true });
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // IntersectionObserver for reveal animation
    useEffect(() => {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const elements = document.querySelectorAll(".reveal");

        if (reducedMotion || !("IntersectionObserver" in window)) {
            elements.forEach((element) => element.classList.add("visible"));
        } else {
            const observer = new IntersectionObserver((entries, currentObserver) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        currentObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: "0px 0px -32px" });
            
            elements.forEach((element) => observer.observe(element));
            return () => observer.disconnect();
        }
    }, []);

    // Process Instagram embeds on mount and when script is loaded
    useEffect(() => {
        // @ts-ignore
        if (window.instgrm) {
            // @ts-ignore
            window.instgrm.Embeds.process();
        }
    }, []);

    const toggleFaq = (index: number) => {
        setOpenFaq(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const target = e.currentTarget;
        const name = (target.elements.namedItem("name") as HTMLInputElement).value.trim();
        const phone = (target.elements.namedItem("phone") as HTMLInputElement).value.trim();
        const message = (target.elements.namedItem("message") as HTMLTextAreaElement).value.trim();

        const textLines = [
            "Olá, encontrei a página de Direito Penal da EHS Advocacia e gostaria de solicitar atendimento.",
            "",
            `Nome: ${name}`,
            phone ? `Telefone: ${phone}` : null,
            `Mensagem: ${message}`,
        ].filter(Boolean);

        const text = textLines.join("\n");
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="landing-penal">
            <Script 
                src="https://www.instagram.com/embed.js" 
                strategy="lazyOnload" 
                onLoad={() => {
                    // @ts-ignore
                    if (window.instgrm) {
                        // @ts-ignore
                        window.instgrm.Embeds.process();
                    }
                }}
            />

            <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
            
            <header className={`site-header ${scrolled ? "scrolled" : ""}`} id="topo">
                <div className="container header-inner">
                    <a className="brand" href="#topo" aria-label="Erlo, Haas & Steffens — início">
                        <img src="/landing/penal/assets/logo-ehs.avif" width="48" height="48" alt="Logotipo EHS" />
                        <span>
                            <strong>Erlo, Haas & Steffens</strong>
                            <small>Sociedade de Advocacia</small>
                        </span>
                    </a>
                    <nav className="desktop-nav" aria-label="Navegação principal">
                        <a href="#atuacao">Atuação</a>
                        <a href="#como-ajudar">Como podemos ajudar</a>
                        <a href="#escritorio">Escritório</a>
                        <a href="#duvidas">Dúvidas</a>
                        <a href="#contato">Contato</a>
                    </nav>
                    <a className="button button-small header-cta" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                        Solicitar atendimento
                    </a>
                    
                    <details 
                        className="mobile-menu" 
                        open={menuOpen} 
                        onToggle={(e) => setMenuOpen((e.target as HTMLDetailsElement).open)}
                    >
                        <summary className="menu-toggle" aria-label="Abrir menu">
                            <span></span>
                            <span></span>
                        </summary>
                        <nav className="mobile-nav" id="mobile-menu" aria-label="Navegação móvel">
                            <a href="#atuacao" onClick={() => setMenuOpen(false)}>Atuação</a>
                            <a href="#como-ajudar" onClick={() => setMenuOpen(false)}>Como podemos ajudar</a>
                            <a href="#escritorio" onClick={() => setMenuOpen(false)}>Escritório</a>
                            <a href="#duvidas" onClick={() => setMenuOpen(false)}>Dúvidas</a>
                            <a href="#contato" onClick={() => setMenuOpen(false)}>Contato</a>
                            <a className="button" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>
                                Solicitar atendimento
                            </a>
                        </nav>
                    </details>
                </div>
            </header>

            <main id="conteudo">
                <section className="hero" id="atuacao">
                    <div className="hero-image" role="img" aria-label="Dra. Alessandra Franke Steffens em fotografia institucional"></div>
                    <div className="container hero-grid">
                        <div className="hero-copy reveal">
                            <p className="eyebrow">Dra. Alessandra Franke Steffens <span>|</span> Mestre em Direitos Fundamentais <span>|</span> Mais de 20 anos de experiência na área criminal</p>
                            <h1>Quanto antes começa a defesa, mais estratégica ela pode ser</h1>
                            <p className="lead">Orientação em prisões, investigações e processos criminais, com atuação individualizada e sigilosa.</p>
                            <div className="hero-actions">
                                <a className="button" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">Falar agora pelo WhatsApp</a>
                                <a className="button button-ghost" href="#como-ajudar">Ver como podemos ajudar</a>
                            </div>
                            <div className="hero-signals" aria-label="Situações atendidas">
                                <span>Flagrantes</span>
                                <span>Intimações</span>
                                <span>Investigações</span>
                                <span>Processos</span>
                            </div>
                            <p className="microcopy">Contato direto e sigiloso. OAB/SC 21.390-B · OAB/RS 55.474.</p>
                        </div>
                        <aside className="hero-reel reveal" aria-label="Vídeo sobre estratégia no Direito Penal">
                            <div className="hero-reel-label">
                                <span>Reel oficial</span>
                                <div>
                                    <a href="https://www.instagram.com/reel/DXfNdGXCfYY/" target="_blank" rel="noopener noreferrer">
                                        Abrir no Instagram ↗
                                    </a>
                                </div>
                            </div>
                            <div className="instagram-embed-shell">
                                <blockquote className="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/DXfNdGXCfYY/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14">
                                    <a href="https://www.instagram.com/reel/DXfNdGXCfYY/?utm_source=ig_embed&amp;utm_campaign=loading" target="_blank" rel="noopener noreferrer">
                                        Assistir ao Reel no Instagram
                                    </a>
                                </blockquote>
                            </div>
                            <details className="reel-description">
                                <summary>Ver descrição do Reel</summary>
                                <div>
                                    <p>No Direito Penal, a estratégia adotada logo no início do caso pode definir o rumo de toda a ação judicial.</p>
                                    <p>➡️ Contar com o apoio de profissionais que dominam as nuances do Processo Penal e da Execução Penal é o que assegura que a sua voz seja ouvida tecnicamente dentro da lei.</p>
                                    <a href="https://www.instagram.com/reel/DXfNdGXCfYY/" target="_blank" rel="noopener noreferrer">
                                        Ver publicação completa no Instagram ↗
                                    </a>
                                </div>
                            </details>
                        </aside>
                    </div>
                </section>

                <section className="section help" id="como-ajudar">
                    <div className="container">
                        <div className="section-heading reveal">
                            <p className="eyebrow dark">Orientação desde o início</p>
                            <h2>Como podemos ajudar?</h2>
                            <p>Atuação jurídica desde os primeiros acontecimentos para avaliar os fatos, preservar direitos e definir os próximos passos.</p>
                        </div>
                        <div className="cards">
                            <article className="card reveal">
                                <span>01</span>
                                <h3>Prisão em flagrante e audiência de custódia</h3>
                            </article>
                            <article className="card reveal">
                                <span>02</span>
                                <h3>Intimações, depoimentos e interrogatórios</h3>
                            </article>
                            <article className="card reveal">
                                <span>03</span>
                                <h3>Inquéritos e investigações criminais</h3>
                            </article>
                            <article className="card reveal">
                                <span>04</span>
                                <h3>Busca e apreensão e medidas cautelares</h3>
                            </article>
                            <article className="card reveal">
                                <span>05</span>
                                <h3>Defesa em processos e recursos criminais</h3>
                            </article>
                            <article className="card reveal">
                                <span>06</span>
                                <h3>Assistência jurídica às vítimas</h3>
                            </article>
                        </div>
                        <div className="center reveal">
                            <a className="button" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                                Explicar minha situação pelo WhatsApp
                            </a>
                        </div>
                    </div>
                </section>

                <section className="section strategy">
                    <div className="container strategy-compact reveal">
                        <div className="strategy-intro">
                            <p className="eyebrow dark">Atuação responsável</p>
                            <h2>Cada situação exige uma análise própria</h2>
                            <p>Os fatos e documentos são avaliados para definir a medida juridicamente adequada.</p>
                        </div>
                        <ol className="steps">
                            <li>
                                <span>01</span>
                                <strong>Compreensão da situação</strong>
                            </li>
                            <li>
                                <span>02</span>
                                <strong>Análise jurídica e documental</strong>
                            </li>
                            <li>
                                <span>03</span>
                                <strong>Definição da estratégia</strong>
                            </li>
                        </ol>
                    </div>
                </section>

                <section className="section office" id="escritorio">
                    <div className="container office-grid">
                        <div className="office-copy reveal">
                            <p className="eyebrow">Especialista em destaque</p>
                            <h2>Dra. Alessandra Franke Steffens</h2>
                            <div className="office-profile">
                                <figure className="office-photo">
                                    <img src="https://www.ehsadvogados.com.br/images/team/alessandra-mesa.jpg" alt="Dra. Alessandra Franke Steffens" />
                                </figure>
                                <div className="lawyer">
                                    <span>Especialista em Direito Criminal</span>
                                    <strong>Atuação técnica, estratégica e sigilosa</strong>
                                    <small>Advogada — OAB/SC 21.390-B | OAB/RS 55.474</small>
                                    <p>Responsável pela atuação criminal do escritório, com atendimento próximo e análise individualizada em investigações, processos, júri e recursos.</p>
                                </div>
                            </div>
                        </div>
                        <aside className="contact-card reveal" id="contato">
                            <p className="eyebrow dark">Contato direto e sigiloso</p>
                            <h3>Precisa de orientação em uma situação criminal?</h3>
                            <p>Conte brevemente o que aconteceu. As informações iniciais serão avaliadas para orientar os próximos passos possíveis.</p>
                            <a className="button" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">Conversar pelo WhatsApp</a>
                            <address>
                                <a href="tel:+5549984001053">+55 (49) 98400-1053</a>
                                <a href="mailto:ehs.escritorio@gmail.com">ehs.escritorio@gmail.com</a>
                                <span>São Miguel do Oeste/SC</span>
                            </address>
                        </aside>
                    </div>
                </section>

                <section className="section faq" id="duvidas">
                    <div className="container faq-grid">
                        <div className="section-heading reveal">
                            <p className="eyebrow dark">Antes do contato</p>
                            <h2>Dúvidas frequentes</h2>
                            <p>Informações objetivas para ajudar você a dar o primeiro passo com segurança.</p>
                        </div>
                        <div className="accordion reveal">
                            {faqs.map((faq, idx) => {
                                const isOpen = !!openFaq[idx];
                                return (
                                    <div className="faq-item" key={idx}>
                                        <h3>
                                            <button 
                                                type="button" 
                                                aria-expanded={isOpen} 
                                                aria-controls={`faq-${idx}`} 
                                                id={`faq-btn-${idx}`}
                                                onClick={() => toggleFaq(idx)}
                                            >
                                                {faq.question}
                                                <span aria-hidden="true">+</span>
                                            </button>
                                        </h3>
                                        <div 
                                            id={`faq-${idx}`} 
                                            role="region" 
                                            aria-labelledby={`faq-btn-${idx}`} 
                                            hidden={!isOpen}
                                        >
                                            <p>{faq.answer}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="faq-cta">
                                <div>
                                    <strong>Ainda tem dúvidas?</strong>
                                    <span>Envie uma mensagem e explique brevemente a situação.</span>
                                </div>
                                <a className="button" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                                    Falar com a equipe
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section contact-form-section" aria-labelledby="contact-form-title">
                    <div className="container contact-form-grid">
                        <div className="contact-form-copy">
                            <p className="eyebrow">Contato inicial</p>
                            <h2 id="contact-form-title">Conte brevemente como podemos ajudar</h2>
                            <p>Preencha os campos ao lado para iniciar uma conversa diretamente com a equipe pelo WhatsApp.</p>
                            <small>Atendimento direto, responsável e sigiloso.</small>
                        </div>
                        <form className="whatsapp-contact-form" id="whatsapp-contact-form" onSubmit={handleFormSubmit}>
                            <div className="form-field">
                                <label htmlFor="contact-name">Nome</label>
                                <input id="contact-name" name="name" type="text" autoComplete="name" required placeholder="Como podemos chamar você?" />
                            </div>
                            <div className="form-field">
                                <label htmlFor="contact-phone">Telefone</label>
                                <input id="contact-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required placeholder="(00) 00000-0000" />
                            </div>
                            <div className="form-field form-field-wide">
                                <label htmlFor="contact-message">Mensagem</label>
                                <textarea id="contact-message" name="message" rows={5} maxLength={700} required placeholder="Descreva brevemente a situação, sem incluir documentos ou dados sensíveis."></textarea>
                            </div>
                            <button className="button" type="submit">Enviar pelo WhatsApp</button>
                            <p className="form-privacy">Os dados não são armazenados nesta página. Ao enviar, o WhatsApp será aberto com a mensagem preenchida.</p>
                        </form>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div className="container footer-grid">
                    <div className="footer-brand">
                        <img src="/landing/penal/assets/logo-ehs.avif" width="48" height="48" alt="" />
                        <strong>Erlo, Haas & Steffens</strong>
                        <span>Sociedade de Advocacia</span>
                        <small>OAB/SC 8487</small>
                    </div>
                    <nav aria-label="Links do rodapé">
                        <a href="#atuacao">Atuação</a>
                        <a href="#como-ajudar">Como podemos ajudar</a>
                        <a href="#escritorio">Escritório</a>
                        <a href="#duvidas">Dúvidas</a>
                    </nav>
                    <div className="footer-contact">
                        <a href="tel:+5549984001053">+55 (49) 98400-1053</a>
                        <a href="mailto:ehs.escritorio@gmail.com">ehs.escritorio@gmail.com</a>
                        <span>Rua Itaberaba, 930, Sala 304<br />Centro — São Miguel do Oeste/SC</span>
                    </div>
                    <div className="footer-links">
                        <a href="https://www.ehsadvogados.com.br/politica-de-privacidade">Política de privacidade</a>
                        <a href="https://www.instagram.com/ehs.adv/" target="_blank" rel="noopener noreferrer">Instagram do escritório ↗</a>
                    </div>
                </div>
                <div className="container footer-bottom">
                    <p>Conteúdo informativo. A análise jurídica depende das circunstâncias de cada caso e não representa promessa de resultado.</p>
                    <p>© {new Date().getFullYear()} Erlo, Haas & Steffens Sociedade de Advocacia.</p>
                </div>
            </footer>
            
            <a className="floating-whatsapp" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" aria-label="Solicitar atendimento pelo WhatsApp">
                <span aria-hidden="true">
                    <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: "20px", height: "20px", display: "block" }}>
                        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93a7.898 7.898 0 0 0-2.327-5.607zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.493.654.666-2.433-.156-.25a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.591-6.593 6.591zm3.615-4.934c-.197-.1-1.17-.578-1.353-.646-.182-.065-.315-.1-.445.1-.133.197-.514.646-.63.775-.116.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.984-.59-.525-.986-1.172-1.102-1.37-.116-.198-.013-.306.087-.405.09-.088.197-.232.296-.347.1-.116.133-.198.198-.33.066-.133.033-.248-.016-.347-.05-.1-.446-1.076-.61-1.47-.16-.389-.323-.336-.445-.342-.116-.006-.248-.006-.38-.006a.729.729 0 0 0-.529.248c-.182.198-.694.678-.694 1.654 0 .976.71 1.916.81 2.049.098.132 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.15.907.129 1.249.078.38-.058 1.171-.48 1.337-.943.164-.462.164-.858.116-.943-.05-.084-.182-.132-.38-.232z"/>
                    </svg>
                </span>
                <b>Atendimento</b>
            </a>
        </div>
    );
}
