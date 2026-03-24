import Link from "next/link";
import {
    FileText, Eye, PenSquare, ArrowUpRight,
} from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminDashboard() {
    const user = await currentUser();
    const supabase = createAdminClient();

    // Fetch posts metrics (requires 'posts' table with 'status' and 'views' columns in Supabase)
    const { data: posts, error } = await supabase
        .from("posts")
        .select("id, title, status, created_at, views")
        .order("created_at", { ascending: false });

    // Ensure safe fallbacks
    const safePosts = posts || [];
    
    const totalPosts = safePosts.filter(p => p.status === "published").length;
    const totalDrafts = safePosts.filter(p => p.status === "draft").length;
    const totalViews = safePosts.reduce((acc, curr) => acc + (curr.views || 0), 0);
    
    const recentPosts = safePosts.slice(0, 5);

    return (
        <div className="max-w-6xl mx-auto pt-20 lg:pt-0">
            {/* Header */}
            <div className="mb-10">
                <h1 className="font-display text-3xl font-bold text-[#0D1812] mb-2">
                    Olá, {user?.firstName || "Administrador"}
                </h1>
                <p className="text-[#3B5A3C] text-sm">Bem-vindo(a) ao seu painel de gerenciamento.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
                <div className="relative rounded-2xl bg-white border border-[#3B5A3C]/20 p-5 overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEEDE5] text-[#0D1812]">
                            <FileText className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="font-display text-2xl font-bold text-[#0D1812] mb-1">{totalPosts}</p>
                    <p className="text-[#0D1812] text-xs">Total de Posts Publicados</p>
                </div>
                
                <div className="relative rounded-2xl bg-white border border-[#3B5A3C]/20 p-5 overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEEDE5] text-[#0D1812]">
                            <PenSquare className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="font-display text-2xl font-bold text-[#0D1812] mb-1">{totalDrafts}</p>
                    <p className="text-[#0D1812] text-xs">Total de Rascunhos</p>
                </div>

                <div className="relative rounded-2xl bg-white border border-[#3B5A3C]/20 p-5 overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEEDE5] text-[#0D1812]">
                            <Eye className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="font-display text-2xl font-bold text-[#0D1812] mb-1">{totalViews}</p>
                    <p className="text-[#0D1812] text-xs">Total de Visualizações</p>
                </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Posts */}
                <div className="lg:col-span-2 rounded-2xl bg-white border border-[#3B5A3C]/20 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-display text-lg font-bold text-[#0D1812]">Artigos Recentes</h2>
                        <Link
                            href="/admin/posts"
                            className="flex items-center gap-1.5 text-xs text-[#877249] font-medium hover:text-[#877249] no-underline transition-colors"
                        >
                            Ver todos
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    <div className="space-y-1">
                        {recentPosts.length > 0 ? recentPosts.map((post) => (
                            <div key={post.id} className="flex items-center gap-4 rounded-xl p-3 -mx-1 hover:bg-[#EEEDE5]/70 transition-colors group">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#0D1812] truncate group-hover:text-[#0D1812] transition-colors">
                                        {post.title}
                                    </p>
                                    <p className="text-xs text-[#3B5A3C] mt-0.5">
                                        {post.created_at ? new Date(post.created_at).toLocaleDateString('pt-BR') : "Sem data"}
                                    </p>
                                </div>
                                <span
                                    className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${post.status === "published"
                                        ? "bg-[#3B5A3C] text-[#EEEDE5]"
                                        : "bg-[#EEEDE5] text-[#877249]"
                                        }`}
                                >
                                    {post.status === "published" ? "Publicado" : "Rascunho"}
                                </span>
                                {post.views > 0 && (
                                    <span className="shrink-0 flex items-center gap-1 text-xs text-[#3B5A3C]">
                                        <Eye className="h-3 w-3" />
                                        {post.views}
                                    </span>
                                )}
                            </div>
                        )) : (
                            <p className="text-sm text-[#3B5A3C] py-4">Nenhum artigo encontrado.</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-5">
                    <div className="rounded-2xl bg-[#1B2D1E] p-6">
                        <h3 className="font-display text-base font-bold text-[#EEEDE5] mb-4">Ações Rápidas</h3>
                        <div className="space-y-2">
                            <Link
                                href="/admin/posts/novo"
                                className="flex items-center gap-3 rounded-xl bg-[#E8D49A] border border-[#E8D49A]/15 px-4 py-3 text-sm font-medium text-[#0D1812] hover:bg-[#877249] transition-all no-underline"
                            >
                                <PenSquare className="h-4 w-4" />
                                Novo Post
                            </Link>
                            <Link
                                href="/admin/posts"
                                className="flex items-center gap-3 rounded-xl bg-[#3B5A3C]/50 px-4 py-3 text-sm text-[#EEEDE5] hover:text-[#0D1812] hover:bg-[#EEEDE5] transition-all no-underline"
                            >
                                <FileText className="h-4 w-4" />
                                Gerenciar Posts
                            </Link>
                            <Link
                                href="/admin/perfil"
                                className="flex items-center gap-3 rounded-xl bg-[#3B5A3C]/50 px-4 py-3 text-sm text-[#EEEDE5] hover:text-[#0D1812] hover:bg-[#EEEDE5] transition-all no-underline"
                            >
                                <Eye className="h-4 w-4" />
                                Meu Perfil
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
