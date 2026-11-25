import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  ArrowUpRight,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { FooterAdminLink } from "@/components/layout/footer-admin-link";
import { SITE_CONFIG } from "@/lib/site-config";

const quickLinks = [
  { label: "Sobre o Escritório", href: "/sobre" },
  { label: "Nossa Equipe", href: "/equipe" },
  { label: "Blog Jurídico", href: "/blog" },
  { label: "Fale Conosco", href: "/contato" },
];

const socialLinks = [
  { icon: Instagram, href: SITE_CONFIG.social.instagram, label: "Instagram" },
  { icon: Facebook, href: SITE_CONFIG.social.facebook, label: "Facebook" },
];

export function Footer() {
  return (
    <footer className="relative bg-forest-900 text-cream/85 overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />

      {/* Decorative subtle pattern */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

      <Container className="relative">
        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 py-16 lg:py-20">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 no-underline mb-6"
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
                <span className="font-display text-[11px] font-medium uppercase tracking-[0.25em] leading-none text-gold/85">
                  Sociedade de Advocacia
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-cream/75 max-w-xs">
              Advocacia com tradição, expertise e dedicação aos nossos clientes
              desde {SITE_CONFIG.founded}.
            </p>

            {/* Social */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-600 text-cream/85 transition-all duration-200 hover:bg-gold hover:text-ink hover:scale-105"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Practice Areas */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-gold mb-5">
              Áreas de Atuação
            </h4>
            <ul className="space-y-3">
              {SITE_CONFIG.practiceAreas.map((area) => (
                <li key={area.id}>
                  <Link
                    href={area.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-cream/80 hover:text-gold transition-colors no-underline"
                  >
                    {area.title}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0.5 transition-all group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-gold mb-5">
              Links Rápidos
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-cream/80 hover:text-gold transition-colors no-underline"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0.5 transition-all group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0" />
                  </Link>
                </li>
              ))}
              <li>
                <FooterAdminLink />
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-gold mb-5">
              Contato
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 text-gold shrink-0" />
                <p className="text-sm text-cream/80 leading-relaxed">
                  {SITE_CONFIG.address.street}
                  <br />
                  {SITE_CONFIG.address.building}, {SITE_CONFIG.address.neighborhood}
                  <br />
                  {SITE_CONFIG.address.city} - {SITE_CONFIG.address.state}
                  <br />
                  <span className="text-cream/65 text-xs font-mono">
                    CNPJ: {SITE_CONFIG.cnpj} | {SITE_CONFIG.oab}
                  </span>
                </p>
              </div>
              <a
                href={SITE_CONFIG.contact.phone}
                className="flex items-center gap-3 text-sm text-cream/80 hover:text-gold transition-colors no-underline"
              >
                <Phone className="h-4 w-4 text-gold shrink-0" />
                {SITE_CONFIG.contact.whatsappDisplay}
              </a>
              <a
                href={`mailto:${SITE_CONFIG.contact.email}`}
                className="flex items-center gap-3 text-sm text-cream/80 hover:text-gold transition-colors no-underline"
              >
                <Mail className="h-4 w-4 text-gold shrink-0" />
                {SITE_CONFIG.contact.email}
              </a>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="border-t border-forest-600/60 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream/65">
            © {new Date().getFullYear()} {SITE_CONFIG.legalName}. Todos os
            direitos reservados.
          </p>
          <div className="flex gap-6">
            <Link
              href="/politica-de-privacidade"
              className="text-xs text-cream/65 hover:text-cream transition-colors no-underline"
            >
              Política de Privacidade
            </Link>
            <Link
              href="/termos-de-uso"
              className="text-xs text-cream/65 hover:text-cream transition-colors no-underline"
            >
              Termos de Uso
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
