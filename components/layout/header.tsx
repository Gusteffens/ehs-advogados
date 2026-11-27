"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/sobre", label: "Sobre" },
  { href: "/areas-de-atuacao", label: "Áreas de Atuação" },
  { href: "/equipe", label: "Equipe" },
  { href: "/blog", label: "Blog" },
  { href: "/contato", label: "Contato" },
];

export function Header() {
  const pathname = usePathname() || "/";
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const closeMobileMenu = () => setIsOpen(false);
  const isLinkActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-cream shadow-md shadow-forest-900/5 py-3 lg:bg-cream/95 lg:backdrop-blur-xl"
          : "bg-transparent py-5"
      )}
    >
      <Container>
        <nav
          className="flex items-center justify-between"
          aria-label="Navegação principal"
        >
          {/* ── Logo ── */}
          <Link
            href="/"
            className="group flex items-center gap-3 no-underline"
            aria-label={`${SITE_CONFIG.legalName} — Página inicial`}
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105">
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
                  "font-display text-lg font-bold leading-tight tracking-tight transition-colors duration-500",
                  scrolled ? "text-ink" : "text-cream"
                )}
              >
                Erlo, Haas & Steffens
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 no-underline",
                    scrolled
                      ? isActive
                        ? "text-ink"
                        : "text-forest-600 hover:text-ink hover:bg-cream"
                      : isActive
                        ? "text-cream"
                        : "text-cream/75 hover:text-cream hover:bg-cream/10"
                  )}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gold origin-center transition-all duration-300 ease-out",
                      isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                    )}
                  />
                </Link>
              );
            })}
          </div>

          {/* ── Desktop CTA ── */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/contato"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              Fale Conosco
            </Link>
          </div>

          {/* ── Mobile Menu Toggle ── */}
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className={cn(
              "lg:hidden relative z-50 flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200",
              isOpen || scrolled
                ? "text-ink hover:bg-forest-100"
                : "text-cream hover:bg-cream/10"
            )}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-nav-drawer"
          >
            <Menu
              aria-hidden="true"
              className={cn(
                "h-5 w-5 absolute transition-all duration-200",
                isOpen ? "rotate-90 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100"
              )}
            />
            <X
              aria-hidden="true"
              className={cn(
                "h-5 w-5 absolute transition-all duration-200",
                isOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-75 opacity-0"
              )}
            />
          </button>
        </nav>
      </Container>

      {/* ── Mobile Menu Overlay ── */}
      <div
        className={cn(
          "fixed inset-0 bg-ink/60 lg:hidden transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* ── Mobile Menu Panel ── */}
      <div
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        aria-hidden={!isOpen}
        className={cn(
          "fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-cream shadow-2xl lg:hidden transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        )}
      >
        <div className="flex flex-col h-full pt-24 px-8 pb-8">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  tabIndex={isOpen ? 0 : -1}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "block px-4 py-3 text-lg font-medium rounded-xl transition-colors no-underline",
                    isActive
                      ? "bg-forest-600 text-cream-light"
                      : "text-ink hover:bg-forest-100"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-auto space-y-3">
            <div className="h-px bg-forest-600/30 mb-4" />

            <Link
              href="/contato"
              onClick={closeMobileMenu}
              tabIndex={isOpen ? 0 : -1}
              className={cn(
                buttonVariants({ variant: "secondary", size: "md" }),
                "w-full"
              )}
            >
              Fale Conosco
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
