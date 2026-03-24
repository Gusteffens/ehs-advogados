"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
 Bold, Italic, Strikethrough, List, ListOrdered,
 Heading2, Heading3, Quote, Minus, LinkIcon,
 ImageIcon, Undo, Redo, Code,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
 content?: string;
 onChange?: (html: string) => void;
}

function ToolbarButton({
 onClick,
 active = false,
 children,
 title,
}: {
 onClick: () => void;
 active?: boolean;
 children: React.ReactNode;
 title: string;
}) {
 return (
 <button
 type="button"
 onClick={onClick}
 title={title}
 className={cn(
 "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
 active
 ? "bg-[#E8D49A]/15 text-[#877249] shadow-sm"
 : "text-[#3B5A3C] hover:text-[#0D1812] hover:bg-[#EEEDE5]"
 )}
 >
 {children}
 </button>
 );
}

export function TiptapEditor({ content = "", onChange }: TiptapEditorProps) {
 const editor = useEditor({
 immediatelyRender: false,
 extensions: [
 StarterKit.configure({
 heading: { levels: [2, 3] },
 }),
 Link.configure({
 openOnClick: false,
 HTMLAttributes: { class: "text-[#877249] underline underline-offset-3" },
 }),
 ImageExt.configure({
 HTMLAttributes: { class: "rounded-xl max-w-full" },
 }),
 Placeholder.configure({
 placeholder: "Comece a escrever seu artigo aqui...",
 }),
 ],
 content,
 onUpdate: ({ editor: e }) => {
 onChange?.(e.getHTML());
 },
 editorProps: {
 attributes: {
 class: "prose-editorial min-h-[400px] outline-none px-6 py-5",
 },
 },
 });

 if (!editor) return null;

 const addLink = () => {
 const url = window.prompt("URL do link:");
 if (url) {
 editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
 }
 };

 const addImage = () => {
 const url = window.prompt("URL da imagem:");
 if (url) {
 editor.chain().focus().setImage({ src: url }).run();
 }
 };

 return (
 <div className="rounded-2xl border border-forest-200 bg-white overflow-hidden">
 {/* Toolbar */}
 <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-forest-100 bg-[#EEEDE5]/40">
 <ToolbarButton title="Desfazer" onClick={() => editor.chain().focus().undo().run()}>
 <Undo className="h-4 w-4" />
 </ToolbarButton>
 <ToolbarButton title="Refazer" onClick={() => editor.chain().focus().redo().run()}>
 <Redo className="h-4 w-4" />
 </ToolbarButton>

 <div className="w-px h-5 bg-[#3B5A3C]/50 mx-1.5" />

 <ToolbarButton title="Título H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
 <Heading2 className="h-4 w-4" />
 </ToolbarButton>
 <ToolbarButton title="Título H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>
 <Heading3 className="h-4 w-4" />
 </ToolbarButton>

 <div className="w-px h-5 bg-[#3B5A3C]/50 mx-1.5" />

 <ToolbarButton title="Negrito" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
 <Bold className="h-4 w-4" />
 </ToolbarButton>
 <ToolbarButton title="Itálico" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
 <Italic className="h-4 w-4" />
 </ToolbarButton>
 <ToolbarButton title="Tachado" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
 <Strikethrough className="h-4 w-4" />
 </ToolbarButton>
 <ToolbarButton title="Código" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")}>
 <Code className="h-4 w-4" />
 </ToolbarButton>

 <div className="w-px h-5 bg-[#3B5A3C]/50 mx-1.5" />

 <ToolbarButton title="Lista" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
 <List className="h-4 w-4" />
 </ToolbarButton>
 <ToolbarButton title="Lista numerada" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
 <ListOrdered className="h-4 w-4" />
 </ToolbarButton>
 <ToolbarButton title="Citação" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
 <Quote className="h-4 w-4" />
 </ToolbarButton>
 <ToolbarButton title="Divisor" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
 <Minus className="h-4 w-4" />
 </ToolbarButton>

 <div className="w-px h-5 bg-[#3B5A3C]/50 mx-1.5" />

 <ToolbarButton title="Link" onClick={addLink} active={editor.isActive("link")}>
 <LinkIcon className="h-4 w-4" />
 </ToolbarButton>
 <ToolbarButton title="Imagem" onClick={addImage}>
 <ImageIcon className="h-4 w-4" />
 </ToolbarButton>
 </div>

 {/* Editor content */}
 <EditorContent editor={editor} />
 </div>
 );
}
