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

export function AdminSidebar() {
 const pathname = usePathname();

 return (
 <>
 {/* Desktop sidebar */}
 <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col bg-[#0D1812] border-r border-[#0D1812]/50">
 {/* Brand */}
 <div className="flex items-center gap-3 px-6 py-6 border-b border-[#0D1812]/50">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#E8D49A] to-[#877249] shadow-lg">
 <Scale className="h-4 w-4 text-[#0D1812]" />
 </div>
 <div>
 <p className="font-display text-sm font-bold text-[#EEEDE5] tracking-tight">Erlo, Haas</p>
 <p className="text-[10px] text-[#EEEDE5]/30 uppercase tracking-[0.15em] font-medium">Painel Admin</p>
 </div>
 </div>

 {/* Nav */}
 <nav className="flex-1 px-3 py-6 space-y-1">
 {navItems.map((item) => {
 const isActive = item.href === "/admin"
 ? pathname === "/admin"
 : pathname.startsWith(item.href);

 return (
 <Link
 key={item.href}
 href={item.href}
 className={cn(
 "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 no-underline",
 isActive
 ? "bg-[#E8D49A]/12 text-[#877249]/70 shadow-sm"
 : "text-[#EEEDE5]/40 hover:text-[#EEEDE5]/70 hover:bg-[#1B2D1E]/50"
 )}
 >
 <item.icon className={cn("h-4 w-4", isActive ? "text-[#E8D49A]" : "text-[#EEEDE5]/30")} />
 {item.label}
 </Link>
 );
 })}
 </nav>

 {/* Footer */}
 <div className="px-4 py-4 border-t border-[#0D1812]/50 space-y-3">
 <Link href="/" className="flex items-center gap-2 text-xs text-[#EEEDE5]/30 hover:text-[#EEEDE5]/50 transition-colors no-underline px-2">
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
 <span className="text-xs text-[#EEEDE5]/40">Minha conta</span>
 </div>
 </div>
 </aside>

 {/* Mobile top bar */}
 <header className="lg:hidden fixed top-0 inset-x-0 z-30 bg-[#0D1812] border-b border-[#0D1812]/50 px-4 py-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#E8D49A] to-[#877249]">
 <Scale className="h-3.5 w-3.5 text-[#0D1812]" />
 </div>
 <span className="font-display text-sm font-bold text-[#EEEDE5]">Admin</span>
 </div>
 <div className="flex items-center gap-2">
 <UserButton
 appearance={{
 elements: {
 avatarBox: "h-7 w-7 rounded-lg",
 },
 }}
 />
 </div>
 </div>
 <nav className="flex gap-1 mt-3 overflow-x-auto no-scrollbar pb-1">
 {navItems.map((item) => {
 const isActive = item.href === "/admin"
 ? pathname === "/admin"
 : pathname.startsWith(item.href);

 return (
 <Link
 key={item.href}
 href={item.href}
 className={cn(
 "flex items-center gap-2 shrink-0 rounded-lg px-3 py-2 text-xs font-medium no-underline transition-all",
 isActive
 ? "bg-[#E8D49A]/15 text-[#877249]/70"
 : "text-[#EEEDE5]/35 hover:text-[#EEEDE5]/60"
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
