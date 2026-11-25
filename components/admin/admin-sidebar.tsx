"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  FileText,
  PenSquare,
  User,
  ArrowLeft,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Postagens", icon: FileText },
  { href: "/admin/posts/novo", label: "Novo Artigo", icon: PenSquare },
  { href: "/admin/perfil", label: "Meu Perfil", icon: User },
];

function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  if (href === "/admin/posts") {
    return (
      pathname === "/admin/posts" ||
      (pathname.startsWith("/admin/posts/") && pathname !== "/admin/posts/novo")
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col bg-ink border-r border-forest-800">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-forest-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark shadow-lg">
            <Scale className="h-4 w-4 text-ink" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-cream tracking-tight">
              Erlo, Haas
            </p>
            <p className="text-[10px] text-cream/55 uppercase tracking-[0.15em] font-medium">
              Painel Admin
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1" aria-label="Navegação do painel">
          {navItems.map((item) => {
            const isActive = isNavItemActive(item.href, pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 no-underline",
                  isActive
                    ? "bg-gold/15 text-gold shadow-sm"
                    : "text-cream/70 hover:text-cream hover:bg-primary/60"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-gold" : "text-cream/50"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-forest-800 space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-cream/65 hover:text-gold transition-colors no-underline px-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao site
          </Link>
          <div className="flex items-center gap-3 px-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 rounded-lg",
                },
              }}
            />
            <span className="text-xs text-cream/70">Minha conta</span>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 bg-ink border-b border-forest-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-gold-dark">
              <Scale className="h-3.5 w-3.5 text-ink" />
            </div>
            <span className="font-display text-sm font-bold text-cream">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs text-cream/70 hover:text-gold transition-colors no-underline mr-1"
            >
              Site
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-7 w-7 rounded-lg",
                },
              }}
            />
          </div>
        </div>
        <nav
          className="flex gap-1 mt-3 overflow-x-auto no-scrollbar pb-1"
          aria-label="Navegação mobile do painel"
        >
          {navItems.map((item) => {
            const isActive = isNavItemActive(item.href, pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 shrink-0 rounded-lg px-3 py-2 text-xs font-medium no-underline transition-all",
                  isActive
                    ? "bg-gold/15 text-gold"
                    : "text-cream/65 hover:text-cream"
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
