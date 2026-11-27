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
  Type,
} from "lucide-react";
import { uploadEditorImage } from "@/app/actions/blog";
import { useToast } from "@/components/admin/toast-provider";
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
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://"))
    return true;
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
          ? "bg-gold/30 text-ink shadow-2xs ring-1 ring-gold/60"
          : "text-forest-600 hover:text-ink hover:bg-cream"
      )}
    >
      {children}
    </button>
  );
}

export function TiptapEditor({ content = "", onChange }: TiptapEditorProps) {
  const { toast } = useToast();
  const [promptMode, setPromptMode] = useState<PromptMode>(null);
  const [urlInput, setUrlInput] = useState("");
  const [altInput, setAltInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [liveHtml, setLiveHtml] = useState(content);
  const [selectedImageAlt, setSelectedImageAlt] = useState<string | null>(null);

  const imageFileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadAndInsertImage = async (
    file: File,
    insertFn: (url: string, alt: string) => void
  ) => {
    setUploadError(null);

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      const msg =
        "Formato de imagem inválido. Utilize JPEG, PNG, WebP ou AVIF.";
      setUploadError(msg);
      toast.error("Formato inválido", msg);
      return;
    }

    if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
      const msg = "A imagem deve ter no máximo 5 MB.";
      setUploadError(msg);
      toast.error("Imagem muito grande", msg);
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadEditorImage(formData);
      if (!res.ok || !res.url) {
        const msg = res.error ?? "Não foi possível enviar a imagem.";
        setUploadError(msg);
        toast.error("Erro ao enviar imagem", msg);
        return;
      }

      const cleanBaseName = file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]+/g, " ")
        .trim();
      insertFn(res.url, cleanBaseName);
      toast.success(
        "Imagem inserida",
        "Clique sobre a imagem para editar o texto alternativo (alt)."
      );
    } catch (error: unknown) {
      console.error("Failed to upload editor image:", error);
      const msg = "Erro ao enviar imagem: " + getErrorMessage(error);
      setUploadError(msg);
      toast.error("Erro no upload", msg);
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
        HTMLAttributes: {
          class: "text-gold-dark underline underline-offset-3",
        },
      }),
      ImageExt.configure({
        HTMLAttributes: { class: "rounded-xl max-w-full" },
      }),
      Placeholder.configure({
        placeholder:
          "Comece a escrever seu artigo jurídico aqui... (arraste ou cole imagens diretamente)",
      }),
    ],
    content,
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      setLiveHtml(html);
      onChange?.(html);
    },
    onSelectionUpdate: ({ editor: e }) => {
      if (e.isActive("image")) {
        const currentAlt = (e.getAttributes("image").alt as string) ?? "";
        setSelectedImageAlt(currentAlt);
      } else {
        setSelectedImageAlt(null);
      }
    },
    editorProps: {
      attributes: {
        class: "prose-editorial min-h-[440px] outline-none px-6 py-5",
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;
        const imageFile = Array.from(files).find((f) =>
          f.type.startsWith("image/")
        );
        if (!imageFile) return false;

        event.preventDefault();
        void uploadAndInsertImage(imageFile, (url, alt) => {
          const { schema } = view.state;
          const node = schema.nodes.image?.create({ src: url, alt });
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
        void uploadAndInsertImage(file, (url, alt) => {
          const { schema } = view.state;
          const node = schema.nodes.image?.create({ src: url, alt });
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
        <div className="min-h-[440px] px-6 py-5 space-y-3">
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
      setAltInput("");
    } else {
      setUrlInput("");
      setAltInput("");
    }
    setPromptMode(mode);
  };

  const closePrompt = () => {
    setPromptMode(null);
    setUrlInput("");
    setAltInput("");
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
      editor
        .chain()
        .focus()
        .setImage({ src: trimmed, alt: altInput.trim() || undefined })
        .run();
    }

    closePrompt();
  };

  const handleUpdateSelectedImageAlt = () => {
    if (selectedImageAlt === null) return;
    editor
      .chain()
      .focus()
      .updateAttributes("image", { alt: selectedImageAlt.trim() })
      .run();
    toast.success("Texto alternativo atualizado");
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    void uploadAndInsertImage(file, (url, alt) => {
      editor.chain().focus().setImage({ src: url, alt }).run();
    });
  };

  return (
    <div className="rounded-2xl border border-forest-200 bg-white shadow-2xs">
      <input
        ref={imageFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFileInputChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-20 rounded-t-2xl border-b border-forest-100 bg-cream-light/95 backdrop-blur-sm">
        <div
          className="flex flex-wrap items-center gap-0.5 px-3 py-2"
          role="toolbar"
          aria-label="Formatação do artigo"
        >
          <ToolbarButton
            title="Desfazer (Ctrl+Z)"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Refazer (Ctrl+Y)"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-5 bg-forest-200 mx-1.5" />

          <ToolbarButton
            title="Título H2"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive("heading", { level: 2 })}
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Subtítulo H3"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            active={editor.isActive("heading", { level: 3 })}
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-5 bg-forest-200 mx-1.5" />

          <ToolbarButton
            title="Negrito (Ctrl+B)"
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Itálico (Ctrl+I)"
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
            title="Código / Referência"
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-5 bg-forest-200 mx-1.5" />

          <ToolbarButton
            title="Lista com marcadores"
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
            title="Citação / Destaque jurídico"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Linha divisória"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-5 bg-forest-200 mx-1.5" />

          <ToolbarButton
            title="Inserir ou editar link"
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
              "px-4 py-2 border-t border-forest-100 text-xs flex items-center justify-between gap-2",
              uploadError
                ? "bg-red-50 text-red-700"
                : "bg-champagne-50 text-forest-700"
            )}
            role={uploadError ? "alert" : "status"}
          >
            <span className="flex items-center gap-2">
              {isUploadingImage && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
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

        {/* Inline URL bar for link / image */}
        {promptMode && (
          <div className="px-4 py-3 border-t border-forest-100 bg-forest-50/75 space-y-2">
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
              {promptMode === "image" && (
                <input
                  type="text"
                  value={altInput}
                  onChange={(event) => setAltInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleConfirmUrl();
                    } else if (event.key === "Escape") {
                      closePrompt();
                    }
                  }}
                  placeholder="Texto alternativo (alt) para acessibilidade/SEO"
                  aria-label="Texto alternativo da imagem"
                  className="sm:w-64 rounded-lg border border-forest-200 bg-white px-3 py-1.5 text-xs text-ink placeholder:text-forest-600/60 focus:outline-none focus:ring-2 focus:ring-champagne-500/40 focus:border-gold"
                />
              )}
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
              <p className="text-xs text-red-600" role="alert">
                {urlError}
              </p>
            )}
          </div>
        )}

        {/* Inline Alt-text editor when an image node is selected */}
        {selectedImageAlt !== null && !promptMode && (
          <div className="px-4 py-2.5 border-t border-forest-100 bg-champagne-50/80 flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-forest-700 shrink-0">
              <Type className="h-3.5 w-3.5 text-gold-dark" />
              Alt da imagem selecionada:
            </span>
            <input
              type="text"
              value={selectedImageAlt}
              onChange={(e) => setSelectedImageAlt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleUpdateSelectedImageAlt();
                }
              }}
              placeholder="Descreva a imagem para leitores de tela e SEO..."
              className="flex-1 rounded-lg border border-forest-200 bg-white px-3 py-1 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-champagne-500/40 focus:border-gold"
            />
            <button
              type="button"
              onClick={handleUpdateSelectedImageAlt}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-xs font-medium text-cream hover:bg-forest-800 transition-colors shrink-0"
            >
              <Check className="h-3 w-3" />
              Salvar Alt
            </button>
          </div>
        )}
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />

      {/* Live word count & reading time footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-b-2xl border-t border-forest-100 bg-cream/35 text-[11px] text-forest-600/85">
        <span>
          Arraste ou cole imagens no editor · Clique numa imagem para editar o Alt
        </span>
        <div className="flex items-center gap-3 font-semibold tabular-nums text-ink/80">
          <span>
            {stats.words} {stats.words === 1 ? "palavra" : "palavras"}
          </span>
          <span aria-hidden="true" className="text-forest-300">
            ·
          </span>
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
