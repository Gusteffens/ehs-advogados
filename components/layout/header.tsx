"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { Show, UserButton } from "@clerk/nextjs";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
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
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
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
        <nav className="flex items-center justify-between" aria-label="Navegação principal">
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
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
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
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gold"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Desktop Auth + CTA ── */}
          <div className="hidden lg:flex items-center gap-3">
            <Show when="signed-in">
              <UserButton />
            </Show>
            <Link href="/contato">
              <Button variant="secondary" size="sm">
                Fale Conosco
              </Button>
            </Link>
          </div>

          {/* ── Mobile Menu Toggle ── */}
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className={cn(
              "lg:hidden relative z-50 flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
              scrolled
                ? "text-ink hover:bg-forest-100"
                : "text-cream hover:bg-cream/10"
            )}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-nav-drawer"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </nav>
      </Container>

      {/* ── Mobile Menu Overlay ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/60 lg:hidden"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navegação"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-cream shadow-2xl lg:hidden"
            >
              <div className="flex flex-col h-full pt-24 px-8 pb-8">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link, i) => {
                    const isActive = pathname === link.href;
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ x: 40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                      >
                        <Link
                          href={link.href}
                          onClick={closeMobileMenu}
                          className={cn(
                            "block px-4 py-3 text-lg font-medium rounded-xl transition-colors no-underline",
                            isActive
                              ? "bg-forest-600 text-cream-light"
                              : "text-ink hover:bg-forest-100"
                          )}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-auto space-y-3">
                  <div className="h-px bg-forest-600/30 mb-4" />

                  <Show when="signed-in">
                    <div className="flex justify-center">
                      <UserButton />
                    </div>
                  </Show>
                  <Link href="/contato" className="block">
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full"
                      onClick={closeMobileMenu}
                    >
                      Fale Conosco
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
