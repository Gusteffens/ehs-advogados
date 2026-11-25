"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Minus,
  LinkIcon,
  ImageIcon,
  Undo,
  Redo,
  Code,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
}

type PromptMode = "link" | "image" | null;

function isSafeInputUrl(value: string, allowRelative: boolean): boolean {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return false;
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return true;
  if (allowRelative && (trimmed.startsWith("/") || trimmed.startsWith("mailto:") || trimmed.startsWith("tel:"))) {
    return true;
  }
  return false;
}

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition-all disabled:opacity-35 disabled:pointer-events-none",
        active
          ? "bg-gold/25 text-gold-dark shadow-xs"
          : "text-forest-600 hover:text-ink hover:bg-cream"
      )}
    >
      {children}
    </button>
  );
}

export function TiptapEditor({ content = "", onChange }: TiptapEditorProps) {
  const [promptMode, setPromptMode] = useState<PromptMode>(null);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-gold-dark underline underline-offset-3" },
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

  if (!editor) {
    return (
      <div
        className="rounded-2xl border border-forest-200 bg-white overflow-hidden"
        aria-busy="true"
        aria-label="Carregando editor de texto"
      >
        <div className="h-12 border-b border-forest-100 bg-cream/40 animate-pulse" />
        <div className="min-h-[400px] px-6 py-5 space-y-3">
          <div className="h-4 w-2/3 rounded bg-forest-100 animate-pulse" />
          <div className="h-4 w-full rounded bg-forest-50 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-forest-50 animate-pulse" />
        </div>
      </div>
    );
  }

  const openPrompt = (mode: Exclude<PromptMode, null>) => {
    setUrlError(null);
    if (mode === "link") {
      const previousUrl = editor.getAttributes("link").href as string | undefined;
      setUrlInput(previousUrl ?? "");
    } else {
      setUrlInput("");
    }
    setPromptMode(mode);
  };

  const closePrompt = () => {
    setPromptMode(null);
    setUrlInput("");
    setUrlError(null);
  };

  const handleConfirmUrl = () => {
    const trimmed = urlInput.trim();

    if (promptMode === "link" && trimmed === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      closePrompt();
      return;
    }

    const allowRelative = promptMode === "link";
    if (!isSafeInputUrl(trimmed, allowRelative)) {
      setUrlError(
        promptMode === "link"
          ? "Informe uma URL válida começando com https://, http://, mailto: ou /."
          : "Informe uma URL de imagem válida começando com https:// ou http://."
      );
      return;
    }

    if (promptMode === "link") {
      editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
    } else if (promptMode === "image") {
      editor.chain().focus().setImage({ src: trimmed }).run();
    }

    closePrompt();
  };

  return (
    <div className="rounded-2xl border border-forest-200 bg-white overflow-hidden">
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-forest-100 bg-cream/40"
        role="toolbar"
        aria-label="Formatação do artigo"
      >
        <ToolbarButton
          title="Desfazer"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Refazer"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-forest-200 mx-1.5" />

        <ToolbarButton
          title="Título H2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Título H3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-forest-200 mx-1.5" />

        <ToolbarButton
          title="Negrito"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Itálico"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Tachado"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Código"
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-forest-200 mx-1.5" />

        <ToolbarButton
          title="Lista"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Lista numerada"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Citação"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Divisor"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-forest-200 mx-1.5" />

        <ToolbarButton
          title="Inserir link"
          onClick={() => openPrompt("link")}
          active={editor.isActive("link") || promptMode === "link"}
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Inserir imagem"
          onClick={() => openPrompt("image")}
          active={promptMode === "image"}
        >
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Inline URL bar for link/image */}
      {promptMode && (
        <div className="px-4 py-3 border-b border-forest-100 bg-forest-50/70">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(event) => {
                setUrlInput(event.target.value);
                setUrlError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleConfirmUrl();
                } else if (event.key === "Escape") {
                  closePrompt();
                }
              }}
              placeholder={
                promptMode === "link"
                  ? "https://exemplo.com.br (deixe vazio para remover)"
                  : "https://exemplo.com.br/imagem.jpg"
              }
              aria-label={promptMode === "link" ? "URL do link" : "URL da imagem"}
              className="flex-1 rounded-lg border border-forest-200 bg-white px-3 py-1.5 text-xs text-ink placeholder:text-forest-600/60 focus:outline-none focus:ring-2 focus:ring-champagne-500/40 focus:border-gold"
              autoFocus
            />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleConfirmUrl}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-cream hover:bg-forest-800 transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
                Aplicar
              </button>
              <button
                type="button"
                onClick={closePrompt}
                aria-label="Cancelar"
                className="inline-flex items-center justify-center rounded-lg border border-forest-200 bg-white p-1.5 text-forest-600 hover:bg-cream hover:text-ink transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {urlError && (
            <p className="mt-1.5 text-xs text-red-600" role="alert">
              {urlError}
            </p>
          )}
        </div>
      )}

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
