"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import "./proagro.css";

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

export default function ProagroPageContent() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(1); // FAQ 1 starts open in original HTML
  const [formStatus, setFormStatus] = useState("Os dados não são armazenados nesta página. Ao enviar, o WhatsApp será aberto com a mensagem preenchida.");
  
  const contactFormRef = useRef<HTMLFormElement>(null);
  const mobileMenuDetailsRef = useRef<HTMLDetailsElement>(null);

  // WhatsApp configuration
  const whatsappNumber = "5549984001053";
  const defaultMessage = "Olá, estou com um problema relacionado ao Proagro e gostaria de verificar se meu caso pode ser analisado.";
  const defaultWhatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  useEffect(() => {
    // Scroll listener for header class
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Process Instagram embeds on render and when window.instgrm becomes available
    const processInstagramEmbeds = (attempt = 0) => {
      if (window.instgrm?.Embeds) {
        window.instgrm.Embeds.process();
        return;
      }
      if (attempt < 24) {
        setTimeout(() => processInstagramEmbeds(attempt + 1), 250);
      }
    };
    processInstagramEmbeds();
  }, []);

  // Form submission handler
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contactFormRef.current) return;

    const formData = new FormData(contactFormRef.current);
    const name = formData.get("name")?.toString().trim() || "Não informado";
    const status = formData.get("status")?.toString().trim() || "Não informado";
    const message = formData.get("message")?.toString().trim() || "Não informado";

    const text = [
      "Olá, gostaria de solicitar análise de um caso de Proagro.",
      "",
      `Nome: ${name}`,
      `Situação do Proagro: ${status}`,
      `Resumo do problema: ${message}`,
    ].join("\n");

    setFormStatus("Abrindo o WhatsApp com a mensagem preenchida.");
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  // Close mobile navigation menu
  const handleMenuLinkClick = () => {
    setMenuOpen(false);
    if (mobileMenuDetailsRef.current) {
      mobileMenuDetailsRef.current.removeAttribute("open");
    }
  };

  return (
    <div className="landing-proagro">
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>

      {/* Standalone Header */}
      <header className={`site-header ${scrolled ? "scrolled" : ""}`} id="topo">
        <div className="container header-inner">
          <a className="brand" href="#topo" aria-label="Erlo, Haas & Steffens — início">
            <img src="https://www.ehsadvogados.com.br/images/logo-ehs-monogram.png" width="48" height="48" alt="Logotipo EHS" />
            <span>
              <strong>Erlo, Haas & Steffens</strong>
              <small>Sociedade de Advocacia</small>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Navegação principal">
            <a href="#documentos">Documentos</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#equipe">Equipe</a>
            <a href="#conteudos">Conteúdos</a>
            <a href="#duvidas">Dúvidas</a>
            <a href="#contato">Contato</a>
          </nav>

          <a 
            className="button button-small header-cta" 
            href={defaultWhatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Falar pelo WhatsApp
          </a>

          {/* Mobile Details/Summary Menu */}
          <details 
            className="mobile-menu" 
            ref={mobileMenuDetailsRef}
            open={menuOpen}
            onToggle={(e) => setMenuOpen((e.target as HTMLDetailsElement).open)}
          >
            <summary className="menu-toggle" aria-label="Abrir menu">
              <span></span>
              <span></span>
            </summary>
            <nav className="mobile-nav" aria-label="Navegação móvel">
              <a href="#documentos" onClick={handleMenuLinkClick}>Documentos</a>
              <a href="#como-funciona" onClick={handleMenuLinkClick}>Como funciona</a>
              <a href="#equipe" onClick={handleMenuLinkClick}>Equipe</a>
              <a href="#conteudos" onClick={handleMenuLinkClick}>Conteúdos</a>
              <a href="#duvidas" onClick={handleMenuLinkClick}>Dúvidas</a>
              <a href="#contato" onClick={handleMenuLinkClick}>Contato</a>
              <a 
                className="button" 
                href={defaultWhatsappUrl}
                target="_blank" 
                rel="noopener noreferrer"
                onClick={handleMenuLinkClick}
              >
                Falar pelo WhatsApp
              </a>
            </nav>
          </details>
        </div>
      </header>

      <main id="conteudo">
        {/* Hero Section */}
        <section className="hero" id="inicio">
          <div className="hero-image" role="img" aria-label="Alessandra Haas em fotografia institucional"></div>
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Proagro <span>|</span> Crédito rural <span>|</span> Produtor rural</p>
              <h1>Pedir a revisão do Proagro não precisa significar conflito com o banco.</h1>
              <p className="lead">A análise é feita com base nos documentos da operação, no laudo, na decisão de negativa e nas regras aplicáveis ao Proagro.</p>
              <div className="hero-actions">
                <a 
                  className="button" 
                  href={defaultWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Falar pelo WhatsApp
                </a>
                <a className="button button-ghost" href="#contato">Enviar resumo do caso</a>
              </div>
              <div className="hero-signals" aria-label="Situações que podem ser analisadas">
                <span>Negativa</span>
                <span>Redução</span>
                <span>Glosa</span>
                <span>Encerramento</span>
              </div>
              <p className="microcopy">A análise depende dos documentos disponíveis e das circunstâncias de cada produtor. Não há promessa de resultado.</p>
            </div>

            {/* Embed Instagram Reel */}
            <aside className="hero-reel" aria-label="Reel sobre Proagro do escritório Erlo, Haas & Steffens">
              <div className="hero-reel-label">
                <div>
                  <span>Reel oficial</span>
                </div>
                <a href="https://www.instagram.com/reel/DWze10oie80/" target="_blank" rel="noopener noreferrer">Abrir no Instagram</a>
              </div>
              <div className="instagram-embed-shell">
                <blockquote 
                  className="instagram-media" 
                  data-instgrm-permalink="https://www.instagram.com/reel/DWze10oie80/?utm_source=ig_embed&amp;utm_campaign=loading" 
                  data-instgrm-version="14"
                >
                  <a href="https://www.instagram.com/reel/DWze10oie80/" target="_blank" rel="noopener noreferrer">Assistir ao Reel no Instagram</a>
                </blockquote>
              </div>
            </aside>
          </div>
        </section>

        {/* Documents Section */}
        <section className="section documents" id="documentos">
          <div className="container split">
            <div className="document-copy">
              <p className="eyebrow dark">Documentos</p>
              <h2>Não precisa ter tudo em mãos para fazer o primeiro contato</h2>
              <p>Se tiver contrato, laudo, decisão, comunicação de perdas ou notas fiscais, isso ajuda na análise.</p>
              <p>Se faltar documento, o escritório pode avaliar a busca ou solicitação junto ao banco, cooperativa ou agente financeiro, conforme o caso.</p>
              <a 
                className="button" 
                href={defaultWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Tenho dúvidas sobre meus documentos
              </a>
            </div>

            <div className="document-list" aria-label="Documentos úteis para análise">
              <article>
                <span>Contrato</span>
                <strong>Contrato ou orçamento do custeio rural.</strong>
              </article>
              <article>
                <span>Decisão</span>
                <strong>Laudo, RCP, COP ou decisão de negativa, se houver.</strong>
              </article>
              <article>
                <span>Provas</span>
                <strong>Notas fiscais, fotos, mapas ou mensagens com banco/cooperativa.</strong>
              </article>
            </div>
          </div>
        </section>

        {/* Strategy Steps Section */}
        <section className="section strategy" id="como-funciona">
          <div className="container strategy-compact">
            <div className="strategy-intro">
              <p className="eyebrow dark">Como funciona</p>
              <h2>Três passos para começar</h2>
              <p>Uma jornada curta para entender a situação inicial e orientar os próximos documentos.</p>
            </div>
            <ol className="steps">
              <li>
                <span>01</span>
                <strong>Você envia um resumo</strong>
                <p>Conte o que aconteceu com a lavoura e o que o banco ou a cooperativa informou.</p>
              </li>
              <li>
                <span>02</span>
                <strong>O escritório orienta os documentos</strong>
                <p>São indicados os documentos úteis para entender a negativa, redução ou glosa.</p>
              </li>
              <li>
                <span>03</span>
                <strong>O caso é analisado</strong>
                <p>A análise verifica os fatos, os documentos e os possíveis encaminhamentos.</p>
              </li>
            </ol>
          </div>
        </section>

        {/* Team Section */}
        <section className="section office" id="equipe">
          <div className="container office-grid">
            <div className="office-copy">
              <p className="eyebrow">Equipe</p>
              <h2>Atuação em Direito do Agronegócio</h2>
              <p>O atendimento é feito pelo Erlo, Haas & Steffens Sociedade de Advocacia, com sede em São Miguel do Oeste/SC e atuação em demandas ligadas ao setor produtivo.</p>
            </div>

            <div className="lawyer-list" aria-label="Profissionais com atuação em Direito do Agronegócio">
              <article className="lawyer-card">
                <img src="https://www.ehsadvogados.com.br/images/team/luiza-mesa.jpeg" width="600" height="750" loading="lazy" decoding="async" alt="Dra. Luíza Klein Haas" />
                <div>
                  <h3>Dra. Luíza Klein Haas</h3>
                  <p>OAB/SC 65.939</p>
                  <span>Civil, Agronegócio e Ambiental</span>
                </div>
              </article>
              <article className="lawyer-card">
                <img src="https://www.ehsadvogados.com.br/images/team/jacson-erlo.webp" width="600" height="750" loading="lazy" decoding="async" alt="Dr. Jacson Mateus Erlo" />
                <div>
                  <h3>Dr. Jacson Mateus Erlo</h3>
                  <p>OAB/SC 74.319</p>
                  <span>Agronegócio, Civil e Ambiental</span>
                </div>
              </article>
              <article className="lawyer-card">
                <img src="https://www.ehsadvogados.com.br/images/team/jean-mesa.jpeg" width="600" height="750" loading="lazy" decoding="async" alt="Dr. Jean Tiago Erlo" />
                <div>
                  <h3>Dr. Jean Tiago Erlo</h3>
                  <p>OAB/SC 67.239 | OAB/PR 134.567</p>
                  <span>Agronegócio e Ambiental</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Content Section (Instagram Carousels) */}
        <section className="section social-content" id="conteudos" aria-labelledby="social-content-title">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow dark">Conteúdos do escritório</p>
              <h2 id="social-content-title">Informações sobre Proagro</h2>
              <p>Publicações do perfil do escritório com orientações em linguagem direta para o produtor rural.</p>
            </div>

            <div className="instagram-post-grid" aria-label="Carrosséis do Instagram sobre Proagro">
              <article className="instagram-post-card">
                <div className="instagram-post-label">
                  <span>Carrossel 01</span>
                  <a href="https://www.instagram.com/p/DYxm0qDjbxO/" target="_blank" rel="noopener noreferrer">Abrir no Instagram</a>
                </div>
                <div className="instagram-embed-shell instagram-post-shell">
                  <blockquote 
                    className="instagram-media" 
                    data-instgrm-permalink="https://www.instagram.com/p/DYxm0qDjbxO/?utm_source=ig_embed&amp;utm_campaign=loading" 
                    data-instgrm-version="14"
                  >
                    <a href="https://www.instagram.com/p/DYxm0qDjbxO/" target="_blank" rel="noopener noreferrer">Ver carrossel no Instagram</a>
                  </blockquote>
                </div>
              </article>

              <article className="instagram-post-card">
                <div className="instagram-post-label">
                  <span>Carrossel 02</span>
                  <a href="https://www.instagram.com/p/DWFFlr6CO94/" target="_blank" rel="noopener noreferrer">Abrir no Instagram</a>
                </div>
                <div className="instagram-embed-shell instagram-post-shell">
                  <blockquote 
                    className="instagram-media" 
                    data-instgrm-permalink="https://www.instagram.com/p/DWFFlr6CO94/?utm_source=ig_embed&amp;utm_campaign=loading" 
                    data-instgrm-version="14"
                  >
                    <a href="https://www.instagram.com/p/DWFFlr6CO94/" target="_blank" rel="noopener noreferrer">Ver carrossel no Instagram</a>
                  </blockquote>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="section faq" id="duvidas">
          <div className="container faq-grid">
            <div className="section-heading">
              <p className="eyebrow dark">Dúvidas rápidas</p>
              <h2>Antes de chamar no WhatsApp</h2>
              <p>Respostas objetivas para o produtor dar o primeiro passo com segurança.</p>
            </div>

            <div className="accordion">
              <div className="faq-item">
                <h3>
                  <button 
                    type="button" 
                    aria-expanded={openFaq === 1} 
                    aria-controls="faq-1" 
                    id="faq-btn-1"
                    onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                  >
                    A análise garante indenização?
                    <span aria-hidden="true">+</span>
                  </button>
                </h3>
                <div id="faq-1" role="region" aria-labelledby="faq-btn-1" hidden={openFaq !== 1}>
                  <p>Não. Ela serve para avaliar a viabilidade do caso e os possíveis caminhos, sem promessa de resultado.</p>
                </div>
              </div>

              <div className="faq-item">
                <h3>
                  <button 
                    type="button" 
                    aria-expanded={openFaq === 2} 
                    aria-controls="faq-2" 
                    id="faq-btn-2"
                    onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                  >
                    Posso chamar mesmo sem todos os documentos?
                    <span aria-hidden="true">+</span>
                  </button>
                </h3>
                <div id="faq-2" role="region" aria-labelledby="faq-btn-2" hidden={openFaq !== 2}>
                  <p>Sim. O escritório pode orientar quais documentos procurar e avaliar a busca deles conforme o caso.</p>
                </div>
              </div>

              <div className="faq-item">
                <h3>
                  <button 
                    type="button" 
                    aria-expanded={openFaq === 3} 
                    aria-controls="faq-3" 
                    id="faq-btn-3"
                    onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                  >
                    Atende produtor de outra cidade?
                    <span aria-hidden="true">+</span>
                  </button>
                </h3>
                <div id="faq-3" role="region" aria-labelledby="faq-btn-3" hidden={openFaq !== 3}>
                  <p>Sim. O atendimento pode ser presencial ou digital, conforme a necessidade do produtor.</p>
                </div>
              </div>

              <div className="faq-cta">
                <div>
                  <strong>Ainda tem dúvidas?</strong>
                  <span>Envie uma mensagem e explique brevemente a situação.</span>
                </div>
                <a 
                  className="button" 
                  href={defaultWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Falar com a equipe
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="section contact-form-section" id="contato" aria-labelledby="contact-form-title">
          <div className="container contact-form-grid">
            <div className="contact-form-copy">
              <p className="eyebrow">Contato inicial</p>
              <h2 id="contact-form-title">Envie um resumo do seu caso</h2>
              <p>Use o formulário para montar uma mensagem simples para o WhatsApp. Os dados não são armazenados nesta página.</p>
              <div className="office-info">
                <strong>Erlo, Haas & Steffens Sociedade de Advocacia</strong>
                <span>WhatsApp: +55 (49) 98400-1053</span>
                <span>E-mail: ehs.escritorio@gmail.com</span>
              </div>
            </div>

            <form 
              className="whatsapp-contact-form" 
              id="whatsapp-contact-form"
              ref={contactFormRef}
              onSubmit={handleFormSubmit}
            >
              <div className="form-field">
                <label htmlFor="contact-name">Nome completo</label>
                <input id="contact-name" name="name" type="text" autoComplete="name" required />
              </div>
              <div className="form-field">
                <label htmlFor="contact-status">Situação do Proagro</label>
                <select id="contact-status" name="status">
                  <option value="Negado">Negado</option>
                  <option value="Reduzido">Reduzido</option>
                  <option value="Glosado">Glosado</option>
                  <option value="Encerrado">Encerrado</option>
                  <option value="Em análise">Em análise</option>
                  <option value="Não sei informar">Não sei informar</option>
                </select>
              </div>
              <div className="form-field form-field-wide">
                <label htmlFor="contact-message">Resumo do problema</label>
                <textarea 
                  id="contact-message" 
                  name="message" 
                  rows={5} 
                  required 
                  placeholder="Ex.: perdi a lavoura por seca, o Proagro foi negado e recebi uma decisão do banco."
                ></textarea>
              </div>
              <button className="button" type="submit">Enviar pelo WhatsApp</button>
              <p className="form-privacy" id="form-status" aria-live="polite">{formStatus}</p>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <img src="https://www.ehsadvogados.com.br/images/logo-ehs-monogram.png" width="48" height="48" alt="Logotipo EHS Monogram" />
            <strong>Erlo, Haas & Steffens</strong>
            <span>Sociedade de Advocacia</span>
            <small>OAB/SC 8487 | CNPJ: 48.624.064/0001-90</small>
          </div>
          <nav aria-label="Links do rodapé">
            <a href="#documentos">Documentos</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#conteudos">Conteúdos</a>
            <a href="#duvidas">Dúvidas</a>
          </nav>
          <div className="footer-contact">
            <a href="tel:+5549984001053">+55 (49) 98400-1053</a>
            <a href="mailto:ehs.escritorio@gmail.com">ehs.escritorio@gmail.com</a>
            <span>Rua Itaberaba, 930, Sala 304<br />Centro — São Miguel do Oeste/SC</span>
          </div>
          <div className="footer-links">
            <a href="https://www.ehsadvogados.com.br" target="_blank" rel="noopener noreferrer">Site institucional ↗</a>
            <a href="https://www.instagram.com/ehs.adv/" target="_blank" rel="noopener noreferrer">Instagram do escritório ↗</a>
          </div>
        </div>
        <div className="container footer-bottom">
          <p>Conteúdo informativo. A análise jurídica depende das circunstâncias de cada caso e não representa promessa de resultado.</p>
          <p>© {new Date().getFullYear()} Erlo, Haas & Steffens Sociedade de Advocacia.</p>
        </div>
      </footer>

      {/* Floating WhatsApp Action Button */}
      <a 
        className="floating-whatsapp" 
        href={defaultWhatsappUrl}
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label="Falar com o escritório pelo WhatsApp"
      >
        <span aria-hidden="true">
          <svg viewBox="0 0 16 16" focusable="false">
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93a7.898 7.898 0 0 0-2.327-5.607zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.493.654.666-2.433-.156-.25a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.591-6.593 6.591zm3.615-4.934c-.197-.1-1.17-.578-1.353-.646-.182-.065-.315-.1-.445.1-.133.197-.514.646-.63.775-.116.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.984-.59-.525-.986-1.172-1.102-1.37-.116-.198-.013-.306.087-.405.09-.088.197-.232.296-.347.1-.116.133-.198.198-.33.066-.133.033-.248-.016-.347-.05-.1-.446-1.076-.61-1.47-.16-.389-.323-.336-.445-.342-.116-.006-.248-.006-.38-.006a.729.729 0 0 0-.529.248c-.182.198-.694.678-.694 1.654 0 .976.71 1.916.81 2.049.098.132 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.15.907.129 1.249.078.38-.058 1.171-.48 1.337-.943.164-.462.164-.858.116-.943-.05-.084-.182-.132-.38-.232z" />
          </svg>
        </span>
        <b>WhatsApp</b>
      </a>

      {/* Instagram Embed Lazy Loader Script */}
      <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" />
    </div>
  );
}
