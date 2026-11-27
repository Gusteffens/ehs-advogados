"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Menu, MessageCircle, X } from "lucide-react";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/tracking/whatsapp-link";
import { SITE_CONFIG } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export interface LandingNavLink {
  href: string;
  label: string;
}

export interface LandingHeaderProps {
  subtitle: string;
  navLinks: readonly LandingNavLink[];
  topHref?: string;
  whatsappUrl: string;
  page: "/penal" | "/proagro";
  ctaLabel?: string;
  showCtaIcon?: boolean;
  drawerId?: string;
}

export function LandingHeader({
  subtitle,
  navLinks,
  topHref = "#topo",
  whatsappUrl,
  page,
  ctaLabel = "Falar pelo WhatsApp",
  showCtaIcon = true,
  drawerId = "landing-mobile-drawer",
}: LandingHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-cream/95 backdrop-blur-xl shadow-md shadow-forest-900/5 py-3"
          : "bg-ink/35 backdrop-blur-md border-b border-cream/10 py-4"
      )}
    >
      <Container>
        <nav
          className="flex items-center justify-between gap-4"
          aria-label="Navegação principal"
        >
          <a
            href={topHref}
            className="group flex items-center gap-3 no-underline shrink-0"
            aria-label={`${SITE_CONFIG.legalName} — início`}
          >
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/logo-ehs-monogram.png"
                alt={SITE_CONFIG.shortName}
                width={44}
                height={44}
                className={cn(
                  "object-contain transition-all duration-500",
                  scrolled ? "brightness-0" : "brightness-100"
                )}
                priority
              />
            </div>
            <div className="flex flex-col">
              <span
                className={cn(
                  "font-display text-base sm:text-lg font-bold leading-tight tracking-tight transition-colors duration-500",
                  scrolled ? "text-ink" : "text-cream"
                )}
              >
                Erlo, Haas & Steffens
              </span>
              <span
                className={cn(
                  "font-body text-[10px] font-semibold uppercase tracking-[0.2em] leading-none mt-0.5 transition-colors duration-500",
                  scrolled ? "text-gold-dark" : "text-gold/85"
                )}
              >
                {subtitle}
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-300 no-underline",
                  scrolled
                    ? "text-forest-600 hover:text-ink hover:bg-forest-100/60"
                    : "text-cream/80 hover:text-cream hover:bg-cream/10"
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA (zero nested <button> inside <a>) */}
          <div className="hidden lg:flex items-center gap-3">
            <WhatsAppLink
              href={whatsappUrl}
              page={page}
              placement="header-cta"
              label={`Header ${page}`}
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "no-underline"
              )}
            >
              {showCtaIcon && <MessageCircle className="h-4 w-4" />}
              {ctaLabel}
            </WhatsAppLink>
          </div>

          {/* Mobile Toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={cn(
              "lg:hidden relative z-50 flex h-10 w-10 items-center justify-center rounded-lg transition-colors cursor-pointer",
              scrolled
                ? "text-ink hover:bg-forest-100"
                : "text-cream hover:bg-cream/10"
            )}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            aria-controls={drawerId}
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </nav>
      </Container>

      {/* Mobile Drawer */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs lg:hidden"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <div
            id={drawerId}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            className="fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-sm bg-cream text-ink shadow-2xl lg:hidden"
          >
            <div className="flex flex-col h-full px-6 py-5">
              {/* Visible Drawer Header with high-contrast X button on light cream surface */}
              <div className="flex items-center justify-between pb-4 border-b border-forest-600/15">
                <div className="flex flex-col">
                  <span className="font-display text-base font-bold text-ink leading-tight">
                    Erlo, Haas & Steffens
                  </span>
                  <span className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-dark mt-0.5">
                    {subtitle}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={closeMenu}
                  aria-label="Fechar menu"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-ink bg-forest-100/70 hover:bg-forest-200 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col gap-1 mt-5">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="block px-4 py-3 text-lg font-medium rounded-xl text-ink hover:bg-forest-100 transition-colors no-underline"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="mt-auto space-y-3 pt-6">
                <div className="h-px bg-forest-600/20 mb-4" />
                <WhatsAppLink
                  href={whatsappUrl}
                  page={page}
                  placement="mobile-menu-cta"
                  label={`Menu Mobile ${page}`}
                  onClick={closeMenu}
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "md" }),
                    "w-full no-underline"
                  )}
                >
                  {showCtaIcon && <MessageCircle className="h-4 w-4" />}
                  {ctaLabel}
                </WhatsAppLink>
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-forest-600 hover:text-ink transition-colors no-underline"
                >
                  Site institucional
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
