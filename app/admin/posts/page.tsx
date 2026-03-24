import Link from "next/link";
import {
 PenSquare, Search, Eye, MoreHorizontal,
 Calendar, Clock, ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import { PostActions } from "@/components/admin/post-actions";

export const revalidate = 0; // force dynamic cache

export default async function PostsPage() {
    const supabase = createAdminClient();
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*, categories(*)')
        .order('created_at', { ascending: false });

    // Fallback if failed
    const safePosts = posts || [];
 return (
 <div className="max-w-5xl mx-auto pt-28 lg:pt-0">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
 <div>
 <h1 className="font-display text-2xl font-bold text-[#0D1812] mb-1">Postagens</h1>
 <p className="text-[#3B5A3C] text-sm">{safePosts.length} artigos no total</p>
 </div>
 <Link href="/admin/posts/novo">
 <Button variant="secondary" className="group">
 <PenSquare className="h-4 w-4" />
 Novo Artigo
 </Button>
 </Link>
 </div>

 {/* Search + filters */}
 <div className="flex flex-col sm:flex-row gap-3 mb-6">
 <div className="relative flex-1">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3B5A3C]" />
 <input
 type="text"
 placeholder="Buscar artigos..."
 className="w-full rounded-xl border border-forest-200 bg-white pl-10 pr-4 py-2.5 text-sm text-[#0D1812] placeholder:text-[#3B5A3C]/70 focus:outline-none focus:ring-2 focus:ring-champagne-500/50 focus:border-[#E8D49A] transition-all"
 />
 </div>
 <div className="flex gap-2">
 <button className="rounded-xl bg-[#1B2D1E] text-[#EEEDE5] px-4 py-2.5 text-xs font-medium">
 Todos
 </button>
 <button className="rounded-xl border border-forest-200 text-[#3B5A3C] px-4 py-2.5 text-xs font-medium hover:bg-[#EEEDE5] transition-colors">
 Publicados
 </button>
 <button className="rounded-xl border border-forest-200 text-[#3B5A3C] px-4 py-2.5 text-xs font-medium hover:bg-[#EEEDE5] transition-colors">
 Rascunhos
 </button>
 </div>
 </div>

 {/* Table */}
 <div className="rounded-2xl bg-white border border-forest-100 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead>
 <tr className="border-b border-forest-100 bg-[#EEEDE5]/50">
 <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#3B5A3C]">Título</th>
 <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#3B5A3C] hidden sm:table-cell">Categoria</th>
 <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#3B5A3C] hidden md:table-cell">Data</th>
 <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#3B5A3C]">Status</th>
 <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#3B5A3C] hidden lg:table-cell">Views</th>
 <th className="px-6 py-3.5 w-14" />
 </tr>
 </thead>
 <tbody className="divide-y divide-forest-50">
 {safePosts.map((post) => (
 <tr key={post.id} className="group hover:bg-[#EEEDE5]/40 transition-colors">
 <td className="px-6 py-4">
 <Link href={`/admin/posts/${post.id}`} className="no-underline">
 <p className="text-sm font-medium text-[#0D1812] group-hover:text-[#3B5A3C] transition-colors line-clamp-1 max-w-xs lg:max-w-md">
 {post.title}
 </p>
 <span className="flex items-center gap-1.5 text-xs text-[#3B5A3C] mt-1 sm:hidden">
 {post.categories?.name || 'Sem categoria'}
 </span>
 </Link>
 </td>
 <td className="px-6 py-4 hidden sm:table-cell">
 <Badge variant="outline" size="sm">{post.categories?.name || 'Sem categoria'}</Badge>
 </td>
 <td className="px-6 py-4 hidden md:table-cell">
 <span className="flex items-center gap-1.5 text-xs text-[#3B5A3C]">
 <Calendar className="h-3 w-3" />
 {new Date(post.created_at).toLocaleDateString('pt-BR')}
 </span>
 </td>
 <td className="px-6 py-4">
 <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${post.status === "published"
 ? "bg-[#EEEDE5] text-[#3B5A3C]"
 : "bg-[#E8D49A]/30 text-[#877249]"
 }`}>
 {post.status === "published" ? "Publicado" : "Rascunho"}
 </span>
 </td>
 <td className="px-6 py-4 hidden lg:table-cell">
 <span className="flex items-center gap-1.5 text-xs text-[#3B5A3C]">
 <Eye className="h-3 w-3" />
 {post.views || 0}
 </span>
 </td>
 <td className="px-6 py-4">
    <PostActions id={post.id} currentStatus={post.status} />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}
