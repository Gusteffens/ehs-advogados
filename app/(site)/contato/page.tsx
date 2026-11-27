import type { Metadata } from "next";
import { Suspense } from "react";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  Instagram,
  Facebook,
  Shield,
  ExternalLink,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { WhatsAppLink } from "@/components/tracking/whatsapp-link";
import { SITE_CONFIG } from "@/lib/site-config";
import { ContactForm } from "./contact-form";

const pageTitle = "Contato";
const pageDescription = `Entre em contato com a ${SITE_CONFIG.legalName}. Atendimento via WhatsApp: ${SITE_CONFIG.contact.whatsappDisplay}. ${SITE_CONFIG.address.street}, ${SITE_CONFIG.address.city} - ${SITE_CONFIG.address.state}.`;

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/contato",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${SITE_CONFIG.url}/contato`,
    siteName: "Erlo, Haas & Steffens Advocacia",
    title: `${pageTitle} | Erlo, Haas & Steffens`,
    description: pageDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Contato — Erlo, Haas & Steffens Advocacia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${pageTitle} | Erlo, Haas & Steffens`,
    description: pageDescription,
    images: ["/og-image.png"],
  },
};

const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  `${SITE_CONFIG.address.street}, ${SITE_CONFIG.address.neighborhood}, ${SITE_CONFIG.address.city}, ${SITE_CONFIG.address.state}`
)}`;

export default function ContatoPage() {
  return (
    <>
      {/* Tighter Hero — brings form & direct WhatsApp channel above the fold */}
      <section className="pt-28 pb-16 sm:pb-20 lg:pt-36 lg:pb-24 bg-gradient-to-b from-ink to-forest-900 relative overflow-hidden">
        <div
          className="absolute top-10 left-10 w-80 h-80 bg-gold/10 rounded-full blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
        <Container className="relative">
          <div className="max-w-3xl">
            <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold mb-3">
              Contato
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-cream leading-tight mb-4">
              Fale com nossa
              <span className="text-gold"> equipe</span>
            </h1>
            <p className="text-base sm:text-lg text-cream/80 leading-relaxed max-w-2xl">
              Envie sua demanda pelo formulário ou inicie um atendimento direto
              pelo WhatsApp com total discrição e sigilo profissional.
            </p>
          </div>
        </Container>
        <div
          className="absolute inset-x-0 -bottom-px h-16 sm:h-20 pointer-events-none z-20 fade-to-cream"
          aria-hidden="true"
        />
      </section>

      {/* Main Split: Contact Form (left 7 cols) + Dark WhatsApp & Office Details Card (right 5 cols) */}
      <section className="py-12 lg:py-16 bg-cream">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left: Contact Form */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-white border border-forest-200/80 p-7 sm:p-10 shadow-sm">
                <h2 className="font-display text-2xl font-bold text-ink mb-1.5">
                  Envie uma mensagem
                </h2>
                <p className="text-forest-600 text-sm mb-7">
                  Relate brevemente sua situação. Nossa equipe retorna com
                  orientação inicial assim que possível.
                </p>
                <Suspense fallback={<div className="min-h-[420px]" />}>
                  <ContactForm />
                </Suspense>
              </div>
            </div>

            {/* Right: Dark WhatsApp + Office Hours + Address + Phones Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative rounded-2xl overflow-hidden bg-forest-900 border border-gold/25 p-7 sm:p-8 text-cream shadow-xl shadow-ink/20">
                <div
                  className="absolute -top-12 right-0 w-56 h-56 bg-gold/10 rounded-full blur-[80px] pointer-events-none"
                  aria-hidden="true"
                />

                <div className="relative">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-3">
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    Atendimento Direto
                  </span>
                  <h2 className="font-display text-2xl font-bold text-cream mb-2">
                    Prefere falar pelo WhatsApp?
                  </h2>
                  <p className="text-sm text-cream/75 leading-relaxed mb-6">
                    Inicie uma conversa diretamente com a nossa equipe jurídica
                    para agendar sua consulta.
                  </p>

                  <WhatsAppLink
                    href={SITE_CONFIG.contact.whatsappWithText}
                    page="/contato"
                    placement="contato-sidebar-card"
                    label="WhatsApp Principal Contato"
                    className="inline-flex w-full items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-display font-bold text-base text-ink transition-all bg-gradient-to-r from-gold to-champagne-400 hover:from-champagne-400 hover:to-champagne-500 shadow-lg shadow-gold/15 no-underline"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0" />
                    Iniciar conversa no WhatsApp
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </WhatsAppLink>

                  <div className="mt-7 pt-6 border-t border-forest-600/50 space-y-5 text-sm">
                    {/* Office Hours */}
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                        <Clock className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-gold/90 mb-0.5">
                          Horário de Atendimento
                        </p>
                        <p className="text-cream/90">
                          {SITE_CONFIG.contact.officeHours}
                        </p>
                      </div>
                    </div>

                    {/* Telefones */}
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                        <Phone className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-gold/90 mb-0.5">
                          Telefones
                        </p>
                        <p className="text-cream/90">
                          <a
                            href={SITE_CONFIG.contact.phone}
                            className="hover:text-gold transition-colors no-underline text-cream/90"
                          >
                            {SITE_CONFIG.contact.whatsappDisplay}
                          </a>
                        </p>
                        <p className="text-cream/75 text-xs mt-0.5">
                          Secundário:{" "}
                          <a
                            href={SITE_CONFIG.contact.secondaryPhone}
                            className="hover:text-gold transition-colors no-underline text-cream/85"
                          >
                            {SITE_CONFIG.contact.secondaryPhoneDisplay}
                          </a>
                        </p>
                      </div>
                    </div>

                    {/* E-mail */}
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                        <Mail className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-gold/90 mb-0.5">
                          E-mail
                        </p>
                        <a
                          href={`mailto:${SITE_CONFIG.contact.email}`}
                          className="text-cream/90 hover:text-gold transition-colors no-underline break-all"
                        >
                          {SITE_CONFIG.contact.email}
                        </a>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                        <MapPin className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-gold/90 mb-0.5">
                          Endereço
                        </p>
                        <p className="text-cream/90 leading-relaxed">
                          {SITE_CONFIG.address.street}
                          <br />
                          {SITE_CONFIG.address.building},{" "}
                          {SITE_CONFIG.address.neighborhood}
                          <br />
                          {SITE_CONFIG.address.city} -{" "}
                          {SITE_CONFIG.address.state}
                        </p>
                        <a
                          href={googleMapsDirectionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-gold hover:text-cream transition-colors no-underline"
                        >
                          Abrir rota no Google Maps
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* OAB & Social */}
                    <div className="pt-4 border-t border-forest-600/50 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs font-mono text-cream/75">
                        <Shield
                          className="h-3.5 w-3.5 text-gold shrink-0"
                          aria-hidden="true"
                        />
                        <span>
                          {SITE_CONFIG.oab} · CNPJ {SITE_CONFIG.cnpj}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={SITE_CONFIG.social.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-forest-600/60 text-cream/80 hover:text-gold hover:border-gold/40 transition-colors"
                          aria-label="Instagram"
                        >
                          <Instagram className="h-4 w-4" />
                        </a>
                        <a
                          href={SITE_CONFIG.social.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-forest-600/60 text-cream/80 hover:text-gold hover:border-gold/40 transition-colors"
                          aria-label="Facebook"
                        >
                          <Facebook className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="rounded-2xl overflow-hidden border border-forest-200/80 bg-white shadow-sm">
                <iframe
                  src="https://maps.google.com/maps?q=Rua+Itaberaba,+930,+Centro,+São+Miguel+do+Oeste,+SC&output=embed"
                  width="100%"
                  height="220"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Localização ${SITE_CONFIG.legalName}`}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
