"use client";

import { useMemo, useRef, useState } from "react";
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
  Upload,
  Undo,
  Redo,
  Code,
  Check,
  Loader2,
  X,
} from "lucide-react";
import { uploadEditorImage } from "@/app/actions/blog";
import { cn, getErrorMessage } from "@/lib/utils";

interface TiptapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
}

type PromptMode = "link" | "image" | null;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

function isSafeInputUrl(value: string, allowRelative: boolean): boolean {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return false;
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return true;
  if (
    allowRelative &&
    (trimmed.startsWith("/") ||
      trimmed.startsWith("mailto:") ||
      trimmed.startsWith("tel:"))
  ) {
    return true;
  }
  return false;
}

function countWordsFromHtml(html: string): number {
  const plain = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .trim();
  if (!plain) return 0;
  return plain.split(/\s+/).filter(Boolean).length;
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [liveHtml, setLiveHtml] = useState(content);

  const imageFileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadAndInsertImage = async (
    file: File,
    insertFn: (url: string) => void
  ) => {
    setUploadError(null);

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setUploadError(
        "Formato de imagem inválido. Utilize JPEG, PNG, WebP ou AVIF."
      );
      return;
    }

    if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
      setUploadError("A imagem deve ter no máximo 5 MB.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const publicUrl = await uploadEditorImage(formData);
      insertFn(publicUrl);
    } catch (error: unknown) {
      console.error("Failed to upload editor image:", error);
      setUploadError("Erro ao enviar imagem: " + getErrorMessage(error));
    } finally {
      setIsUploadingImage(false);
    }
  };

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
      const html = e.getHTML();
      setLiveHtml(html);
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: "prose-editorial min-h-[400px] outline-none px-6 py-5",
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;
        const imageFile = Array.from(files).find((f) =>
          f.type.startsWith("image/")
        );
        if (!imageFile) return false;

        event.preventDefault();
        void uploadAndInsertImage(imageFile, (url) => {
          const { schema } = view.state;
          const node = schema.nodes.image?.create({ src: url });
          if (node) {
            const tr = view.state.tr.replaceSelectionWith(node);
            view.dispatch(tr);
          }
        });
        return true;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        const imageItem = Array.from(items).find((item) =>
          item.type.startsWith("image/")
        );
        if (!imageItem) return false;

        const file = imageItem.getAsFile();
        if (!file) return false;

        event.preventDefault();
        void uploadAndInsertImage(file, (url) => {
          const { schema } = view.state;
          const node = schema.nodes.image?.create({ src: url });
          if (node) {
            const tr = view.state.tr.replaceSelectionWith(node);
            view.dispatch(tr);
          }
        });
        return true;
      },
    },
  });

  const stats = useMemo(() => {
    const words = countWordsFromHtml(liveHtml);
    const readingMin = words > 0 ? Math.max(1, Math.ceil(words / 200)) : 0;
    return { words, readingMin };
  }, [liveHtml]);

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
      const previousUrl = editor.getAttributes("link").href as
        | string
        | undefined;
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
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: trimmed })
        .run();
    } else if (promptMode === "image") {
      editor.chain().focus().setImage({ src: trimmed }).run();
    }

    closePrompt();
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    void uploadAndInsertImage(file, (url) => {
      editor.chain().focus().setImage({ src: url }).run();
    });
  };

  return (
    <div className="rounded-2xl border border-forest-200 bg-white overflow-hidden">
      <input
        ref={imageFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFileInputChange}
        className="hidden"
        aria-hidden="true"
      />

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
          title="Enviar imagem do computador"
          onClick={() => imageFileInputRef.current?.click()}
          disabled={isUploadingImage}
        >
          {isUploadingImage ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </ToolbarButton>
        <ToolbarButton
          title="Inserir imagem por URL"
          onClick={() => openPrompt("image")}
          active={promptMode === "image"}
        >
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Upload status / error */}
      {(isUploadingImage || uploadError) && (
        <div
          className={cn(
            "px-4 py-2 border-b border-forest-100 text-xs flex items-center justify-between gap-2",
            uploadError
              ? "bg-red-50 text-red-700"
              : "bg-champagne-50 text-forest-700"
          )}
          role={uploadError ? "alert" : "status"}
        >
          <span className="flex items-center gap-2">
            {isUploadingImage && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {uploadError ?? "Enviando imagem para o artigo..."}
          </span>
          {uploadError && (
            <button
              type="button"
              onClick={() => setUploadError(null)}
              aria-label="Fechar aviso"
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

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
              aria-label={
                promptMode === "link" ? "URL do link" : "URL da imagem"
              }
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

      {/* Live word count & reading time footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-forest-100 bg-cream/30 text-[11px] text-forest-600/80">
        <span>Arraste ou cole imagens diretamente no editor</span>
        <div className="flex items-center gap-3 font-medium">
          <span>
            {stats.words} {stats.words === 1 ? "palavra" : "palavras"}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {stats.readingMin > 0
              ? `~${stats.readingMin} min de leitura`
              : "0 min de leitura"}
          </span>
        </div>
      </div>
    </div>
  );
}
