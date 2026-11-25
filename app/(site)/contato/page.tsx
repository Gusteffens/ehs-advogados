import type { Metadata } from "next";
import { MapPin, Mail, Instagram, Facebook, Shield } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SITE_CONFIG } from "@/lib/site-config";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contato",
  description: `Entre em contato com a ${SITE_CONFIG.legalName}. Atendimento via WhatsApp: ${SITE_CONFIG.contact.whatsappDisplay}. ${SITE_CONFIG.address.street}, ${SITE_CONFIG.address.city} - ${SITE_CONFIG.address.state}.`,
  alternates: {
    canonical: "/contato",
  },
};

export default function ContatoPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="pt-32 pb-28 sm:pb-36 lg:pt-40 lg:pb-40 bg-gradient-to-b from-ink to-forest-900 relative overflow-hidden">
        <div className="absolute top-10 left-10 w-80 h-80 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
        <Container className="relative">
          <div className="max-w-3xl">
            <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold mb-4">
              Contato
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-cream leading-tight mb-6">
              Fale com nossa
              <span className="text-gold"> equipe</span>
            </h1>
            <p className="text-lg text-cream/75 leading-relaxed max-w-2xl">
              Atendimento rápido e personalizado. Entre em contato pelo WhatsApp
              e receba retorno em breve.
            </p>
          </div>
        </Container>
        <div
          className="absolute inset-x-0 -bottom-px h-24 sm:h-32 pointer-events-none z-20 fade-to-cream"
          aria-hidden="true"
        />
      </section>

      {/* ── WhatsApp — Primary CTA ── */}
      <section className="py-16 lg:py-20 bg-cream">
        <Container>
          <div className="max-w-2xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden p-8 sm:p-12 text-center bg-forest-900 border border-gold/25 shadow-2xl shadow-ink/40">
              {/* Decorative glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#25D366]/10 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative flex flex-col items-center gap-5">
                {/* WhatsApp icon */}
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#25D366]/15 ring-1 ring-[#25D366]/30">
                  <svg
                    viewBox="0 0 24 24"
                    fill="#25D366"
                    className="w-8 h-8"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream">
                  Prefere falar diretamente?
                </h2>
                <p className="text-cream/75 text-base max-w-md leading-relaxed">
                  Clique abaixo e inicie uma conversa agora mesmo com nossa
                  equipe.
                </p>

                <a
                  href={SITE_CONFIG.contact.whatsappWithText}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-display font-bold text-base text-ink transition-all bg-gradient-to-r from-gold to-champagne-400 hover:from-champagne-400 hover:to-champagne-500 shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Iniciar conversa no WhatsApp
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Form + Info — Secondary ── */}
      <section className="pb-20 lg:pb-28 bg-cream">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Email Form — compact */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl bg-white border border-forest-200 p-8 sm:p-10">
                <h2 className="font-display text-xl font-bold text-ink mb-1">
                  Prefere enviar uma mensagem?
                </h2>
                <p className="text-forest-600 text-sm mb-8">
                  Responderemos assim que possível.
                </p>
                <ContactForm />
              </div>
            </div>

            {/* Info sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Address */}
              <div className="rounded-xl border border-forest-100 bg-white p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cream text-forest-600 shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-forest-600 mb-1">
                      Endereço
                    </p>
                    <p className="text-ink text-sm leading-relaxed">
                      {SITE_CONFIG.address.street}
                      <br />
                      {SITE_CONFIG.address.building},{" "}
                      {SITE_CONFIG.address.neighborhood}
                      <br />
                      {SITE_CONFIG.address.city} - {SITE_CONFIG.address.state}
                    </p>
                  </div>
                </div>
              </div>

              {/* OAB */}
              <div className="rounded-xl border border-forest-100 bg-white p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cream text-forest-600 shrink-0">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-forest-600 mb-1">
                      Registro
                    </p>
                    <p className="text-ink text-sm font-mono tracking-wider">
                      {SITE_CONFIG.oab}
                    </p>
                    <p className="text-ink text-sm font-mono tracking-wider mt-1">
                      CNPJ: {SITE_CONFIG.cnpj}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <a
                href={`mailto:${SITE_CONFIG.contact.email}`}
                className="group flex items-start gap-4 rounded-xl border border-forest-100 bg-white p-5 transition-all hover:border-forest-200 hover:shadow-md no-underline"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cream text-forest-600 shrink-0 group-hover:bg-champagne-300/30 group-hover:text-gold-dark transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-forest-600 mb-1">
                    E-mail
                  </p>
                  <p className="text-ink text-sm">
                    {SITE_CONFIG.contact.email}
                  </p>
                </div>
              </a>

              {/* Social */}
              <div className="rounded-xl border border-forest-100 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-forest-600 mb-3">
                  Redes Sociais
                </p>
                <div className="flex gap-3">
                  <a
                    href={SITE_CONFIG.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-forest-100 text-forest-600 hover:bg-champagne-300/20 hover:text-gold-dark hover:border-gold/40 transition-all"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href={SITE_CONFIG.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-forest-100 text-forest-600 hover:bg-champagne-300/20 hover:text-gold-dark hover:border-gold/40 transition-all"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Map */}
              <div className="rounded-xl overflow-hidden border border-forest-100">
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
