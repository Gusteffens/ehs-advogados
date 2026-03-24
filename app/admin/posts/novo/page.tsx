"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { createPost, uploadCoverImage } from "@/app/actions/blog";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

const inputClasses =
 "w-full rounded-xl border border-forest-200 bg-white px-4 py-3 text-[#0D1812] text-sm placeholder:text-[#3B5A3C]/70 focus:outline-none focus:ring-2 focus:ring-champagne-500/50 focus:border-[#E8D49A] transition-all";

/* ── Author photo mapping ── */
const teamImages: Record<string, string> = {
    "escritorio-ehs":       "/images/logo-ehs-monogram.png",
    "alessandra-steffens": "/images/team/alessandra-steffens.png",
    "jacson-erlo":         "/images/team/jacson-erlo.png",
    "jean-erlo":           "/images/team/jean-erlo.png",
    "luiza-haas":          "/images/team/luiza-haas.png",
    "maisa-christ":        "/images/team/maisa-christ.png",
};

 export default function NovoPostPage() {
 const [title, setTitle] = useState("");
 const [slug, setSlug] = useState("");
 const [category, setCategory] = useState("");
 const [excerpt, setExcerpt] = useState("");
    const [tags, setTags] = useState("");
    const [content, setContent] = useState("");
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string>("");
    const [authorId, setAuthorId] = useState("");
    const [isPending, startTransition] = useTransition();
    const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
    const [authors, setAuthors] = useState<{id: string, full_name: string, slug: string}[]>([]);

    useEffect(() => {
        const supabase = createClient();
        supabase
            .from('categories')
            .select('id, name')
            .order('name')
            .then(({ data }) => {
                if (data) setCategories(data as any);
            });
            
        supabase
            .from('authors')
            .select('id, full_name, slug')
            .order('full_name')
            .then(({ data }) => {
                if (data) {
                    setAuthors(data as any);
                    // Default to first author if none selected
                    if (!authorId && data.length > 0) setAuthorId((data[0] as any).id);
                }
            });
    }, []);

    const handleSave = (status: "draft" | "published") => {
        if (!title.trim() || !content.trim()) {
            alert("Título e conteúdo são obrigatórios.");
            return;
        }
        startTransition(async () => {
            try {
                let finalCoverUrl = "";
                if (coverFile) {
                    const uploadData = new FormData();
                    uploadData.append("file", coverFile);
                    finalCoverUrl = await uploadCoverImage(uploadData);
                }

                const formData = new FormData();
                formData.append("title", title);
                formData.append("content", content);
                formData.append("excerpt", excerpt);
                formData.append("category_id", category);
                formData.append("status", status);
                if (finalCoverUrl) formData.append("cover_image_url", finalCoverUrl);
                if (authorId) formData.append("author_id", authorId);

                await createPost(formData);
            } catch (err: any) {
                if (
                  err?.message === 'NEXT_REDIRECT' ||
                  err?.digest?.startsWith('NEXT_REDIRECT')
                ) return
                console.error(err);
                alert("Erro ao salvar o post: " + err.message);
            }
        });
    };

 const generateSlug = (text: string) => {
 return text
 .toLowerCase()
 .normalize("NFD")
 .replace(/[\u0300-\u036f]/g, "")
 .replace(/[^a-z0-9\s-]/g, "")
 .replace(/\s+/g, "-")
 .replace(/-+/g, "-")
 .trim();
 };

 const selectedAuthor = authors.find(a => a.id === authorId);
 const selectedAuthorPhoto = selectedAuthor?.slug
     ? teamImages[selectedAuthor.slug] ?? "/images/logo-ehs-monogram.png"
     : null;

 return (
 <div className="max-w-5xl mx-auto pt-28 lg:pt-0">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
 <div className="flex items-center gap-4">
 <Link href="/admin/posts" className="flex h-9 w-9 items-center justify-center rounded-xl border border-forest-200 text-[#3B5A3C] hover:text-[#0D1812] hover:bg-[#EEEDE5] transition-all no-underline">
 <ArrowLeft className="h-4 w-4" />
 </Link>
 <div>
 <h1 className="font-display text-2xl font-bold text-[#0D1812]">Novo Artigo</h1>
 <p className="text-[#3B5A3C] text-xs mt-0.5">Preencha os campos e escreva seu artigo</p>
 </div>
 </div>
 <div className="flex gap-3">
                    <Button 
                        variant="outline" 
                        className="group text-sm"
                        onClick={() => handleSave('draft')}
                        disabled={isPending}
                    >
                        <Eye className="h-4 w-4" />
                        {isPending ? "Salvando..." : "Salvar Rascunho"}
                    </Button>
                    <Button 
                        variant="secondary" 
                        className="group text-sm"
                        onClick={() => handleSave('published')}
                        disabled={isPending}
                    >
                        <Save className="h-4 w-4" />
                        {isPending ? "Salvando..." : "Publicar"}
                    </Button>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Main content */}
 <div className="lg:col-span-2 space-y-6">
 {/* Title */}
 <div>
 <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#3B5A3C] mb-2">
 Título do Artigo
 </label>
 <input
 id="title"
 type="text"
 value={title}
 onChange={(e) => {
 setTitle(e.target.value);
 setSlug(generateSlug(e.target.value));
 }}
 placeholder="Ex: Novas regras para o trabalho remoto"
 className={`${inputClasses} font-display text-lg`}
 />
 </div>

 {/* Slug */}
 <div>
 <label htmlFor="slug" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#3B5A3C] mb-2">
 URL (Slug)
 </label>
 <div className="flex items-center gap-0 rounded-xl border border-forest-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-champagne-500/50 focus-within:border-[#E8D49A] transition-all">
 <span className="px-3 text-xs text-[#3B5A3C]/70 bg-[#EEEDE5]/60 py-3 border-r border-forest-200 shrink-0">/blog/</span>
 <input
 id="slug"
 type="text"
 value={slug}
 onChange={(e) => setSlug(e.target.value)}
 placeholder="url-do-artigo"
 className="flex-1 px-3 py-3 text-sm text-[#0D1812] placeholder:text-[#3B5A3C]/70 focus:outline-none"
 />
 </div>
 </div>

 {/* Editor */}
 <div>
 <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#3B5A3C] mb-2">
 Conteúdo
 </label>
 <TiptapEditor content={content} onChange={setContent} />
 </div>
 </div>

 {/* Sidebar */}
 <div className="space-y-6">

 {/* Imagem de Capa */}
 <div className="rounded-2xl bg-white border border-forest-100 p-5">
 <label htmlFor="coverImage" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#3B5A3C] mb-3">
 Imagem de Capa
 </label>
 <input 
      id="coverImage"
      type="file" 
      accept="image/*"
      onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
              setCoverFile(file);
              setCoverPreview(URL.createObjectURL(file));
          }
      }}
      className="text-xs text-[#3B5A3C] w-full file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#EEEDE5]/60 file:text-[#3B5A3C] hover:file:bg-[#EEEDE5]"
  />
  {coverPreview && (
      <div className="mt-4 relative aspect-video w-full overflow-hidden rounded-xl border border-forest-100">
          <Image src={coverPreview} alt="Capa Preview" fill className="object-cover" />
      </div>
  )}
 </div>

 {/* Autor */}
 <div className="rounded-2xl bg-white border border-forest-100 p-5">
 <label htmlFor="author" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#3B5A3C] mb-3">
 Autor
 </label>
 <select
      id="author"
      value={authorId}
      onChange={(e) => setAuthorId(e.target.value)}
      className={`${inputClasses} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%234A7C5C%22%20d%3D%22M2%204l4%204%204-4%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center]`}
  >
      <option value="">(Conta logada)</option>
      {authors.map((a) => (
          <option key={a.id} value={a.id}>{a.full_name}</option>
      ))}
  </select>
  {selectedAuthor && selectedAuthorPhoto && (
      <div className="mt-4 flex items-center gap-3 p-3 rounded-xl border border-forest-100 bg-[#EEEDE5]/20">
          <div className="relative w-10 h-10 overflow-hidden rounded-full border border-forest-200 shrink-0">
              <Image 
                  src={selectedAuthorPhoto} 
                  alt={selectedAuthor.full_name} 
                  fill 
                  className="object-cover object-top"
              />
          </div>
          <span className="text-sm font-medium text-[#0D1812]">{selectedAuthor.full_name}</span>
      </div>
  )}
 </div>

 {/* Category */}
 <div className="rounded-2xl bg-white border border-forest-100 p-5">
 <label htmlFor="category" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#3B5A3C] mb-3">
 Categoria
 </label>
 <select
 id="category"
 value={category}
 onChange={(e) => setCategory(e.target.value)}
 className={`${inputClasses} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%234A7C5C%22%20d%3D%22M2%204l4%204%204-4%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center]`}
 >
 <option value="">Selecione...</option>
 {categories.map((c) => (
 <option key={c.id} value={c.id}>{c.name}</option>
 ))}
 </select>
 </div>

 {/* Tags */}
 <div className="rounded-2xl bg-white border border-forest-100 p-5">
 <label htmlFor="tags" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#3B5A3C] mb-3">
 <Tag className="h-3.5 w-3.5 inline mr-1.5" />
 Tags
 </label>
 <input
 id="tags"
 type="text"
 value={tags}
 onChange={(e) => setTags(e.target.value)}
 placeholder="remoto, clt, trabalhista"
 className={inputClasses}
 />
 <p className="text-[10px] text-[#3B5A3C]/70 mt-2">Separe as tags com vírgulas</p>
 </div>

 {/* Excerpt */}
 <div className="rounded-2xl bg-white border border-forest-100 p-5">
 <label htmlFor="excerpt" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#3B5A3C] mb-3">
 Resumo
 </label>
 <textarea
 id="excerpt"
 value={excerpt}
 onChange={(e) => setExcerpt(e.target.value)}
 rows={4}
 placeholder="Breve resumo do artigo para listagem e SEO..."
 className={`${inputClasses} resize-none`}
 />
 <p className="text-[10px] text-[#3B5A3C]/70 mt-2">Até 160 caracteres para melhor SEO</p>
 </div>

 {/* SEO Preview */}
 <div className="rounded-2xl bg-[#1B2D1E] p-5">
 <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#877249]/70 mb-3">
 Prévia no Google
 </p>
 <div className="space-y-1">
 <p className="text-blue-400 text-sm font-medium truncate">
 {title || "Título do artigo"} | Erlo, Haas & Steffens
 </p>
 <p className="text-green-400 text-xs truncate">
 erlohaas.com.br/blog/{slug || "url-do-artigo"}
 </p>
 <p className="text-[#EEEDE5]/40 text-xs line-clamp-2">
 {excerpt || "O resumo do artigo será exibido aqui nos resultados de busca..."}
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
