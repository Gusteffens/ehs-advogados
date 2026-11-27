"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  ExternalLink,
  FileText,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  PenSquare,
  Tag,
  User,
  X,
} from "lucide-react";
import { ToastProvider } from "@/components/admin/toast-provider";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  children: React.ReactNode;
  unreadLeadsCount: number;
  user: {
    name: string | null;
    email: string | null;
    imageUrl: string | null;
  };
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const ROUTE_TITLES: Array<{ match: (path: string) => boolean; title: string; section: string }> = [
  { match: (p) => p === "/admin", title: "Painel Geral", section: "Visão Executiva" },
  { match: (p) => p === "/admin/posts/novo", title: "Novo Artigo", section: "Editorial" },
  { match: (p) => p.startsWith("/admin/posts/"), title: "Editar Artigo", section: "Editorial" },
  { match: (p) => p === "/admin/posts", title: "Artigos", section: "Editorial" },
  { match: (p) => p.startsWith("/admin/analytics"), title: "Analytics", section: "Audiência" },
  { match: (p) => p.startsWith("/admin/categorias"), title: "Categorias", section: "Editorial" },
  { match: (p) => p.startsWith("/admin/leads"), title: "Contatos & Leads", section: "Relacionamento" },
  { match: (p) => p.startsWith("/admin/perfil"), title: "Perfil & Autor", section: "Conta" },
  { match: (p) => p.startsWith("/admin/sistema"), title: "Saúde do Sistema", section: "Infraestrutura" },
];

function getRouteMeta(pathname: string): { title: string; section: string } {
  const found = ROUTE_TITLES.find((item) => item.match(pathname));
  return found ?? { title: "Painel Administrativo", section: "Chancery" };
}

function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getUserInitials(name: string | null, email: string | null): string {
  const source = (name || email || "AD").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function AdminShell({
  children,
  unreadLeadsCount,
  user,
}: AdminShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const initials = getUserInitials(user.name, user.email);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Redirect even if network fails
    } finally {
      window.location.assign("/sign-in");
    }
  };

  const navItems: NavItem[] = [
    { href: "/admin", label: "Painel", icon: LayoutDashboard },
    { href: "/admin/posts", label: "Artigos", icon: FileText },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/categorias", label: "Categorias", icon: Tag },
    {
      href: "/admin/leads",
      label: "Contatos / Leads",
      icon: Inbox,
      badge: unreadLeadsCount > 0 ? unreadLeadsCount : undefined,
    },
    { href: "/admin/perfil", label: "Perfil & Autor", icon: User },
    { href: "/admin/sistema", label: "Sistema", icon: Activity },
  ];

  const routeMeta = getRouteMeta(pathname);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const renderNavLinks = (onNavigate?: () => void) => (
    <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto" aria-label="Navegação do painel">
      {navItems.map((item) => {
        const isActive = isNavItemActive(item.href, pathname);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 no-underline",
              isActive
                ? "bg-gold/15 text-gold shadow-xs border border-gold/20"
                : "text-cream/75 hover:text-cream hover:bg-primary/70 border border-transparent"
            )}
          >
            <span className="flex items-center gap-3 min-w-0">
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-gold"
                    : "text-cream/50 group-hover:text-cream/85"
                )}
              />
              <span className="truncate">{item.label}</span>
            </span>

            {typeof item.badge === "number" && item.badge > 0 && (
              <span
                className={cn(
                  "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                  isActive
                    ? "bg-gold text-ink"
                    : "bg-gold/90 text-ink"
                )}
              >
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const renderSidebarFooter = () => (
    <div className="px-3 py-4 border-t border-forest-800/90 space-y-2">
      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium text-cream/70 hover:text-gold hover:bg-primary/60 transition-colors no-underline"
      >
        <span>Ver Site Público</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>

      <div className="flex items-center justify-between gap-2 rounded-xl bg-primary/50 border border-forest-800/80 px-3 py-2.5">
        <Link
          href="/admin/perfil"
          className="flex items-center gap-2.5 min-w-0 group no-underline"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 border border-gold/30 font-display text-xs font-bold text-gold group-hover:bg-gold/25 transition-colors">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-cream truncate group-hover:text-gold transition-colors">
              {user.name || "Administrador"}
            </p>
            {user.email && (
              <p className="text-[10px] text-cream/55 truncate">{user.email}</p>
            )}
          </div>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Sair do painel"
          aria-label="Sair do painel"
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-medium text-cream/70 hover:bg-ink hover:text-gold transition-colors disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LogOut className="h-3.5 w-3.5" />
          )}
          <span className="sr-only">Sair</span>
        </button>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-cream-light text-ink">
        {/* Desktop left rail */}
        <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col bg-ink border-r border-forest-800/90">
          <div className="flex items-center gap-3 px-5 py-5 border-b border-forest-800/90">
            <Link
              href="/admin"
              className="flex items-center gap-3 min-w-0 no-underline group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/80 border border-gold/25 p-1.5">
                <Image
                  src="/images/logo-ehs-monogram.png"
                  alt="Erlo, Haas & Steffens"
                  width={32}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="font-display text-sm font-bold text-cream leading-tight truncate group-hover:text-gold transition-colors">
                  Erlo, Haas & Steffens
                </p>
                <p className="text-[10px] text-gold/75 uppercase tracking-[0.16em] font-semibold mt-0.5">
                  Painel Editorial
                </p>
              </div>
            </Link>
          </div>

          {renderNavLinks()}
          {renderSidebarFooter()}
        </aside>

        {/* Mobile slide-over drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu de navegação">
            <div
              className="fixed inset-0 bg-ink/70 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-10 flex w-72 max-w-[85vw] flex-col bg-ink border-r border-forest-800 shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-forest-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/80 border border-gold/25 p-1.5">
                    <Image
                      src="/images/logo-ehs-monogram.png"
                      alt="Erlo, Haas & Steffens"
                      width={28}
                      height={20}
                      className="object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-bold text-cream truncate">
                      Erlo, Haas & Steffens
                    </p>
                    <p className="text-[10px] text-gold/75 uppercase tracking-[0.15em]">
                      Painel Editorial
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Fechar menu"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-cream/70 hover:bg-primary hover:text-cream transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {renderNavLinks(() => setMobileMenuOpen(false))}
              {renderSidebarFooter()}
            </aside>
          </div>
        )}

        {/* Main workspace column */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          {/* Sticky top bar */}
          <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-forest-200/75 bg-cream-light/90 backdrop-blur-md px-4 sm:px-6 lg:px-10">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Abrir menu de navegação"
                className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-forest-200 bg-white text-ink hover:bg-cream transition-colors"
              >
                <Menu className="h-4 w-4" />
              </button>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-dark leading-none">
                  {routeMeta.section}
                </p>
                <p className="font-display text-lg font-bold text-ink truncate leading-tight mt-0.5">
                  {routeMeta.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              {unreadLeadsCount > 0 && (
                <Link
                  href="/admin/leads"
                  className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-champagne-300 bg-champagne-50 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-champagne-100 transition-colors no-underline"
                >
                  <span className="h-2 w-2 rounded-full bg-gold-dark animate-pulse" />
                  <span>
                    {unreadLeadsCount}{" "}
                    {unreadLeadsCount === 1 ? "lead novo" : "leads novos"}
                  </span>
                </Link>
              )}

              <Link
                href="/admin/posts/novo"
                className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-gold hover:bg-primary transition-colors shadow-xs no-underline"
              >
                <PenSquare className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Novo Artigo</span>
              </Link>

              <Link
                href="/admin/perfil"
                title={user.name || user.email || "Perfil"}
                aria-label="Perfil e segurança"
                className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink border border-gold/30 font-display text-xs font-bold text-gold hover:bg-primary transition-colors no-underline"
              >
                {initials}
              </Link>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
