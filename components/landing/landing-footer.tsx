import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SITE_CONFIG } from "@/lib/site-config";
import type { LandingNavLink } from "./landing-header";

export interface LandingFooterProps {
  navLinks: readonly LandingNavLink[];
  disclaimer?: string;
}

export function LandingFooter({
  navLinks,
  disclaimer = "Conteúdo informativo. A análise jurídica depende das circunstâncias de cada caso e não representa promessa de resultado.",
}: LandingFooterProps) {
  return (
    <footer className="relative bg-ink text-cream/85 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

      <Container className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 py-14 lg:py-16">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="group inline-flex items-center gap-3 no-underline mb-5"
            >
              <Image
                src="/images/logo-ehs-monogram.png"
                alt={SITE_CONFIG.legalName}
                width={44}
                height={44}
                className="object-contain brightness-[3] transition-transform duration-300 group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold leading-tight tracking-tight text-cream">
                  Erlo, Haas & Steffens
                </span>
                <span className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] leading-none text-gold/85 mt-1">
                  Sociedade de Advocacia
                </span>
              </div>
            </Link>
            <p className="text-xs font-mono text-cream/70 leading-relaxed">
              {SITE_CONFIG.oab} · CNPJ: {SITE_CONFIG.cnpj}
            </p>
            <p className="mt-3 flex items-center gap-2 text-xs text-cream/70">
              <Clock className="h-3.5 w-3.5 text-gold shrink-0" />
              <span>Seg a Sex · 08h às 18h</span>
            </p>
          </div>

          {/* Page Anchors */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-gold mb-4">
              Nesta página
            </h4>
            <nav aria-label="Links do rodapé" className="flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-cream/80 hover:text-gold transition-colors no-underline"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact & Address */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-gold mb-4">
              Contato
            </h4>
            <div className="space-y-3 text-sm text-cream/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                <p className="leading-relaxed m-0">
                  {SITE_CONFIG.address.street}
                  <br />
                  {SITE_CONFIG.address.building},{" "}
                  {SITE_CONFIG.address.neighborhood}
                  <br />
                  {SITE_CONFIG.address.city} - {SITE_CONFIG.address.state}
                </p>
              </div>
              <a
                href={SITE_CONFIG.contact.phone}
                className="flex items-center gap-2.5 text-cream/80 hover:text-gold transition-colors no-underline"
              >
                <Phone className="h-4 w-4 text-gold shrink-0" />
                {SITE_CONFIG.contact.whatsappDisplay}
              </a>
              <a
                href={`mailto:${SITE_CONFIG.contact.email}`}
                className="flex items-center gap-2.5 text-cream/80 hover:text-gold transition-colors no-underline"
              >
                <Mail className="h-4 w-4 text-gold shrink-0" />
                {SITE_CONFIG.contact.email}
              </a>
            </div>
          </div>

          {/* Institutional & Legal Links */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-gold mb-4">
              Institucional
            </h4>
            <div className="flex flex-col gap-2.5 text-sm text-cream/80">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-cream/80 hover:text-gold transition-colors no-underline"
              >
                Site institucional
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href={SITE_CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-cream/80 hover:text-gold transition-colors no-underline"
              >
                Instagram do escritório
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <Link
                href="/politica-de-privacidade"
                className="text-cream/80 hover:text-gold transition-colors no-underline"
              >
                Política de Privacidade
              </Link>
              <Link
                href="/termos-de-uso"
                className="text-cream/80 hover:text-gold transition-colors no-underline"
              >
                Termos de Uso
              </Link>
              <Link
                href="/seguranca"
                className="text-cream/80 hover:text-gold transition-colors no-underline"
              >
                Cartilha de Segurança
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-cream/15 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-cream/65">
          <p className="m-0 max-w-2xl leading-relaxed">{disclaimer}</p>
          <p className="m-0 shrink-0">
            © {new Date().getFullYear()} {SITE_CONFIG.legalName}. Todos os
            direitos reservados.
          </p>
        </div>
      </Container>
    </footer>
  );
}
