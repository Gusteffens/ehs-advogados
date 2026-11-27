"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useEditor,
  EditorContent,
  Node,
  mergeAttributes,
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
  type NodeViewProps,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  AlertTriangle,
  Bold,
  BookmarkCheck,
  Check,
  Code,
  Columns2,
  Expand,
  Heading2,
  Heading3,
  ImageIcon,
  ImagePlus,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Loader2,
  Maximize2,
  Minus,
  Quote,
  Redo,
  Scale,
  Sparkles,
  Strikethrough,
  Trash2,
  Type,
  Undo,
  X,
} from "lucide-react";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_UPLOAD_BYTES,
  MAX_IMAGE_UPLOAD_LABEL,
  uploadAdminImage,
} from "@/lib/admin/upload-client";
import { useToast } from "@/components/admin/toast-provider";
import { cn, getErrorMessage } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────
 * Shared Editorial Types & Helpers
 * ────────────────────────────────────────────────────────── */

export type EditorialImageLayout = "normal" | "wide" | "full";
export type CalloutVariant = "attention" | "legal" | "summary";

interface TiptapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  focusMode?: boolean;
}

type PromptMode = "link" | "image" | null;

function normalizeAcceptedTypes(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === "string");
  }
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (raw instanceof Set) {
    return Array.from(raw).filter(
      (item): item is string => typeof item === "string"
    );
  }
  return ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
}

const ACCEPTED_LIST = normalizeAcceptedTypes(ACCEPTED_IMAGE_TYPES);
const ALLOWED_IMAGE_TYPES = new Set(ACCEPTED_LIST);
const ACCEPT_ATTR = ACCEPTED_LIST.join(",");

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

function clampLayout(raw: unknown): EditorialImageLayout {
  if (raw === "wide" || raw === "full") return raw;
  return "normal";
}

function clampCalloutVariant(raw: unknown): CalloutVariant {
  if (raw === "legal" || raw === "summary") return raw;
  return "attention";
}

/* ──────────────────────────────────────────────────────────
 * TipTap Command Declarations
 * ────────────────────────────────────────────────────────── */

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    editorialImage: {
      setEditorialImage: (options: {
        src: string;
        alt?: string;
        caption?: string;
        layout?: EditorialImageLayout;
      }) => ReturnType;
    };
    callout: {
      setCallout: (variant?: CalloutVariant) => ReturnType;
    };
  }
}

/* ──────────────────────────────────────────────────────────
 * Custom NodeView: Editorial Image (<figure data-editorial-image>)
 * ────────────────────────────────────────────────────────── */

const LAYOUT_OPTIONS: Array<{
  value: EditorialImageLayout;
  label: string;
  icon: typeof Columns2;
}> = [
  { value: "normal", label: "Padrão", icon: Columns2 },
  { value: "wide", label: "Ampla", icon: Expand },
  { value: "full", label: "Tela Cheia", icon: Maximize2 },
];

function EditorialImageNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  const src = (node.attrs.src as string) ?? "";
  const alt = (node.attrs.alt as string) ?? "";
  const caption = (node.attrs.caption as string) ?? "";
  const layout = clampLayout(node.attrs.layout);

  const [showAltEditor, setShowAltEditor] = useState(false);
  const [altDraft, setAltDraft] = useState(alt);

  const handleSaveAlt = () => {
    updateAttributes({ alt: altDraft.trim() });
    setShowAltEditor(false);
  };

  return (
    <NodeViewWrapper
      as="figure"
      data-editorial-image-editor="true"
      data-layout={layout}
      contentEditable={false}
      className={cn(
        "group relative my-7 select-none transition-all duration-200",
        layout === "wide" && "sm:-mx-4",
        layout === "full" && "-mx-6"
      )}
    >
      {/* Floating Chancery Control Bar (on hover or selection) */}
      <div
        className={cn(
          "absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-xl bg-ink/95 px-2 py-1.5 text-cream shadow-xl border border-gold/25 backdrop-blur-md transition-all duration-150",
          selected || showAltEditor
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto"
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-forest-700">
          {LAYOUT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = layout === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateAttributes({ layout: opt.value });
                }}
                title={`Largura: ${opt.label}`}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-gold text-ink shadow-2xs"
                    : "text-cream/80 hover:text-cream hover:bg-forest-800"
                )}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setAltDraft(alt);
            setShowAltEditor((prev) => !prev);
          }}
          title="Editar texto alternativo (Alt / SEO)"
          className={cn(
            "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap",
            showAltEditor
              ? "bg-forest-700 text-gold"
              : "text-cream/80 hover:text-cream hover:bg-forest-800"
          )}
        >
          <Type className="h-3 w-3" />
          <span>Alt</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            deleteNode();
          }}
          title="Remover imagem"
          className="inline-flex items-center justify-center rounded-lg p-1.5 text-cream/70 hover:text-red-300 hover:bg-red-950/60 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Inline Quick Alt-Text Popover */}
      {showAltEditor && (
        <div
          className="absolute top-14 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-md rounded-xl bg-ink/98 border border-gold/30 p-3 shadow-2xl backdrop-blur-md"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">
              Texto Alternativo (Acessibilidade & SEO)
            </span>
            <button
              type="button"
              onClick={() => setShowAltEditor(false)}
              className="text-cream/60 hover:text-cream"
              aria-label="Fechar editor de alt"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={altDraft}
              onChange={(e) => setAltDraft(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSaveAlt();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setShowAltEditor(false);
                }
              }}
              placeholder="Descreva a imagem para leitores de tela..."
              className="flex-1 rounded-lg border border-forest-700 bg-forest-950 px-2.5 py-1.5 text-xs text-cream placeholder:text-cream/40 focus:outline-none focus:border-gold"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSaveAlt}
              className="inline-flex items-center gap-1 rounded-lg bg-gold px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-champagne-200 transition-colors shrink-0"
            >
              <Check className="h-3 w-3" />
              OK
            </button>
          </div>
        </div>
      )}

      {/* Image Frame */}
      <div
        className={cn(
          "relative overflow-hidden border transition-all bg-cream-light",
          layout === "full" ? "rounded-none border-x-0" : "rounded-2xl",
          selected
            ? "border-gold ring-2 ring-gold/45 shadow-lg"
            : "border-forest-200/80 shadow-xs group-hover:border-forest-300"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="block w-full h-auto max-h-[560px] object-contain mx-auto !my-0 !rounded-none"
        />

        {/* Subtle layout indicator pill when wide/full */}
        {layout !== "normal" && (
          <span className="pointer-events-none absolute bottom-2.5 right-3 rounded-full bg-ink/75 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold backdrop-blur-xs">
            {layout === "wide" ? "Largura Ampla" : "Tela Cheia"}
          </span>
        )}
      </div>

      {/* Inline Editable Editorial Caption (<figcaption>) */}
      <div
        className={cn(
          "mt-2.5 px-2 transition-opacity",
          caption || selected
            ? "opacity-100"
            : "opacity-55 group-hover:opacity-100"
        )}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          value={caption}
          onChange={(e) => updateAttributes({ caption: e.target.value })}
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
          placeholder="Escreva uma legenda editorial para esta imagem (opcional)..."
          aria-label="Legenda da imagem"
          className="w-full bg-transparent text-center text-xs italic text-forest-700 placeholder:text-forest-400/80 focus:outline-none focus:text-ink border-b border-transparent focus:border-gold/60 pb-1 transition-colors"
        />
      </div>
    </NodeViewWrapper>
  );
}

const EditorialImageExtension = Node.create({
  name: "editorialImage",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      caption: { default: "" },
      layout: { default: "normal" as EditorialImageLayout },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure[data-editorial-image]",
        getAttrs: (dom) => {
          if (typeof dom === "string") return false;
          const img = dom.querySelector("img");
          const src = img?.getAttribute("src");
          if (!src) return false;
          const figcaption = dom.querySelector("figcaption");
          return {
            src,
            alt: img?.getAttribute("alt") ?? "",
            caption: figcaption?.textContent?.trim() ?? "",
            layout: clampLayout(dom.getAttribute("data-layout")),
          };
        },
      },
      {
        tag: "img[src]",
        getAttrs: (dom) => {
          if (typeof dom === "string") return false;
          if (dom.closest("figure[data-editorial-image]")) return false;
          const src = dom.getAttribute("src");
          if (!src) return false;
          return {
            src,
            alt: dom.getAttribute("alt") ?? "",
            caption: "",
            layout: "normal" as EditorialImageLayout,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = (HTMLAttributes.src as string) ?? "";
    const alt = (HTMLAttributes.alt as string) ?? "";
    const caption = ((HTMLAttributes.caption as string) ?? "").trim();
    const layout = clampLayout(HTMLAttributes.layout);

    const figureAttrs = {
      "data-editorial-image": "true",
      "data-layout": layout,
    };

    const imgNode = ["img", { src, alt, loading: "lazy" }];

    if (caption) {
      return ["figure", figureAttrs, imgNode, ["figcaption", {}, caption]];
    }

    return ["figure", figureAttrs, imgNode];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EditorialImageNodeView);
  },

  addCommands() {
    return {
      setEditorialImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent([
            {
              type: this.name,
              attrs: {
                src: options.src,
                alt: options.alt ?? "",
                caption: options.caption ?? "",
                layout: clampLayout(options.layout),
              },
            },
            { type: "paragraph" },
          ]);
        },
    };
  },
});

/* ──────────────────────────────────────────────────────────
 * Custom NodeView: Legal Callout (<div data-callout="...">)
 * ────────────────────────────────────────────────────────── */

const CALLOUT_META: Record<
  CalloutVariant,
  {
    label: string;
    shortLabel: string;
    icon: typeof AlertTriangle;
    wrapperClass: string;
    eyebrowClass: string;
  }
> = {
  attention: {
    label: "Ponto de Atenção",
    shortLabel: "Atenção",
    icon: AlertTriangle,
    wrapperClass:
      "border-l-4 border-l-gold-dark border-champagne-300/80 bg-champagne-50/90",
    eyebrowClass: "text-champagne-800",
  },
  legal: {
    label: "Base Legal & Jurisprudência",
    shortLabel: "Base Legal",
    icon: Scale,
    wrapperClass:
      "border-l-4 border-l-ink border-forest-200/90 bg-forest-50/85",
    eyebrowClass: "text-ink",
  },
  summary: {
    label: "Resumo Prático",
    shortLabel: "Resumo",
    icon: BookmarkCheck,
    wrapperClass:
      "border-l-4 border-l-forest-600 border-forest-200/80 bg-cream-light",
    eyebrowClass: "text-forest-800",
  },
};

function CalloutNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  const variant = clampCalloutVariant(node.attrs.variant);
  const meta = CALLOUT_META[variant];
  const Icon = meta.icon;

  return (
    <NodeViewWrapper
      as="div"
      data-callout-editor={variant}
      className={cn(
        "group relative my-6 rounded-r-2xl rounded-l-md border px-5 py-4 transition-all",
        meta.wrapperClass,
        selected && "ring-2 ring-gold/50"
      )}
    >
      {/* Non-editable Chancery Eyebrow & Quick Switcher */}
      <div
        contentEditable={false}
        className="flex flex-wrap items-center justify-between gap-2 mb-2.5 pb-2 border-b border-forest-200/50 select-none"
      >
        <div
          className={cn(
            "inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em]",
            meta.eyebrowClass
          )}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <span>{meta.label}</span>
        </div>

        <div className="flex items-center gap-1 opacity-75 group-hover:opacity-100 transition-opacity">
          {(["attention", "legal", "summary"] as CalloutVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => updateAttributes({ variant: v })}
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-semibold transition-colors",
                variant === v
                  ? "bg-ink text-cream"
                  : "bg-white/75 text-forest-700 hover:bg-white"
              )}
            >
              {CALLOUT_META[v].shortLabel}
            </button>
          ))}
          <button
            type="button"
            onClick={deleteNode}
            title="Remover bloco de destaque"
            className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-forest-600 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Editable Callout Content */}
      <NodeViewContent className="[&>p:last-child]:mb-0 text-[15px] leading-relaxed" />
    </NodeViewWrapper>
  );
}

const CalloutExtension = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: "attention" as CalloutVariant,
        parseHTML: (element) =>
          clampCalloutVariant(element.getAttribute("data-callout")),
        renderHTML: (attributes) => ({
          "data-callout": clampCalloutVariant(attributes.variant),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-callout]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView);
  },

  addCommands() {
    return {
      setCallout:
        (variant: CalloutVariant = "attention") =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { variant: clampCalloutVariant(variant) },
            content: [{ type: "paragraph" }],
          });
        },
    };
  },
});

/* ──────────────────────────────────────────────────────────
 * Slash Command Definitions
 * ────────────────────────────────────────────────────────── */

interface SlashCommandItem {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  icon: typeof ImagePlus;
  badge?: string;
}

const SLASH_COMMANDS: SlashCommandItem[] = [
  {
    id: "image",
    title: "Imagem no Texto",
    description: `Enviar foto ou gráfico (até ${MAX_IMAGE_UPLOAD_LABEL}) com legenda`,
    keywords: ["imagem", "foto", "figura", "image", "upload", "grafico"],
    icon: ImagePlus,
    badge: "Mídia",
  },
  {
    id: "h2",
    title: "Título de Seção (H2)",
    description: "Abre uma nova seção principal no sumário",
    keywords: ["h2", "titulo", "secao", "heading"],
    icon: Heading2,
    badge: "Estrutura",
  },
  {
    id: "h3",
    title: "Subtítulo (H3)",
    description: "Subdivisão interna de um tópico",
    keywords: ["h3", "subtitulo", "subheading"],
    icon: Heading3,
    badge: "Estrutura",
  },
  {
    id: "callout-attention",
    title: "Ponto de Atenção",
    description: "Caixa dourada para alertas, prazos e riscos",
    keywords: ["atencao", "alerta", "callout", "destaque", "aviso"],
    icon: AlertTriangle,
    badge: "Jurídico",
  },
  {
    id: "callout-legal",
    title: "Base Legal / Jurisprudência",
    description: "Quadro formal para leis, artigos e súmulas",
    keywords: ["legal", "lei", "jurisprudencia", "artigo", "sumula", "stj", "stf"],
    icon: Scale,
    badge: "Jurídico",
  },
  {
    id: "callout-summary",
    title: "Resumo Prático",
    description: "Síntese objetiva com recomendações práticas",
    keywords: ["resumo", "sintese", "pratico", "conclusao", "checklist"],
    icon: BookmarkCheck,
    badge: "Jurídico",
  },
  {
    id: "blockquote",
    title: "Citação Editorial",
    description: "Destaque tipográfico com barra dourada",
    keywords: ["citacao", "quote", "trecho", "epigrafe"],
    icon: Quote,
    badge: "Texto",
  },
  {
    id: "bullet-list",
    title: "Lista com Marcadores",
    description: "Enumeração de tópicos e requisitos",
    keywords: ["lista", "marcadores", "bullet", "ul", "itens"],
    icon: List,
    badge: "Texto",
  },
  {
    id: "ordered-list",
    title: "Lista Numerada",
    description: "Passo a passo ou ordem cronológica",
    keywords: ["numerada", "ordered", "ol", "passos", "etapas"],
    icon: ListOrdered,
    badge: "Texto",
  },
  {
    id: "divider",
    title: "Divisor Dourado",
    description: "Linha sutil para separar blocos narrativos",
    keywords: ["divisor", "linha", "hr", "separador"],
    icon: Minus,
    badge: "Estilo",
  },
];

interface SlashMenuState {
  open: boolean;
  query: string;
  range: { from: number; to: number };
  top: number;
  left: number;
}

/* ──────────────────────────────────────────────────────────
 * Toolbar Button
 * ────────────────────────────────────────────────────────── */

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

/* ──────────────────────────────────────────────────────────
 * Main Component: TiptapEditor ("Estúdio Editorial")
 * ────────────────────────────────────────────────────────── */

export function TiptapEditor({
  content = "",
  onChange,
  focusMode = false,
}: TiptapEditorProps) {
  const { toast } = useToast();
  const [promptMode, setPromptMode] = useState<PromptMode>(null);
  const [urlInput, setUrlInput] = useState("");
  const [altInput, setAltInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [liveHtml, setLiveHtml] = useState(content);

  // Slash command palette state
  const [slashMenu, setSlashMenu] = useState<SlashMenuState | null>(null);
  const [slashIndex, setSlashIndex] = useState(0);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredSlashCommands = useMemo(() => {
    if (!slashMenu?.open) return [];
    const q = slashMenu.query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
    if (!q) return SLASH_COMMANDS;
    return SLASH_COMMANDS.filter((item) => {
      const haystack = `${item.title} ${item.description} ${item.keywords.join(" ")}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return haystack.includes(q);
    });
  }, [slashMenu]);

  // Keep refs fresh for TipTap's editorProps.handleKeyDown closure
  const slashMenuRef = useRef<SlashMenuState | null>(null);
  const slashIndexRef = useRef(0);
  const filteredCommandsRef = useRef<SlashCommandItem[]>([]);
  const executeSlashRef = useRef<(cmd: SlashCommandItem) => void>(() => {});

  useEffect(() => {
    slashMenuRef.current = slashMenu;
  }, [slashMenu]);

  useEffect(() => {
    slashIndexRef.current = slashIndex;
  }, [slashIndex]);

  useEffect(() => {
    filteredCommandsRef.current = filteredSlashCommands;
  }, [filteredSlashCommands]);

  const uploadAndInsertImage = useCallback(
    async (
      file: File,
      insertFn: (url: string, alt: string) => void
    ): Promise<void> => {
      setUploadError(null);

      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        const msg =
          "Formato de imagem inválido. Utilize JPEG, PNG, WebP, AVIF ou GIF.";
        setUploadError(msg);
        toast.error("Formato inválido", msg);
        return;
      }

      if (file.size <= 0 || file.size > MAX_IMAGE_UPLOAD_BYTES) {
        const msg = `A imagem deve ter no máximo ${MAX_IMAGE_UPLOAD_LABEL}.`;
        setUploadError(msg);
        toast.error("Imagem muito grande", msg);
        return;
      }

      setIsUploadingImage(true);
      setUploadProgress(5);
      try {
        const res = await uploadAdminImage(file, "content", (pct) => {
          setUploadProgress(Math.max(5, Math.min(100, Math.round(pct))));
        });

        if (!res.ok) {
          const msg = res.error || "Não foi possível enviar a imagem.";
          setUploadError(msg);
          toast.error("Erro ao enviar imagem", msg);
          return;
        }

        setUploadProgress(100);
        const cleanBaseName = file.name
          .replace(/\.[^.]+$/, "")
          .replace(/[-_]+/g, " ")
          .trim();
        insertFn(res.url, cleanBaseName);
        toast.success(
          "Imagem inserida",
          "Adicione uma legenda abaixo da foto ou ajuste a largura no menu flutuante."
        );
      } catch (error: unknown) {
        console.error("Failed to upload editor image:", error);
        const msg = "Erro ao enviar imagem: " + getErrorMessage(error);
        setUploadError(msg);
        toast.error("Erro no upload", msg);
      } finally {
        setIsUploadingImage(false);
        setUploadProgress(0);
      }
    },
    [toast]
  );

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
      EditorialImageExtension,
      CalloutExtension,
      Placeholder.configure({
        placeholder:
          "Comece a escrever seu artigo jurídico... Digite / para inserir imagens, caixas legais ou títulos.",
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
        class: cn(
          "prose-editorial blog-prose outline-none px-6 sm:px-8 py-6 transition-all",
          focusMode ? "min-h-[62vh]" : "min-h-[460px]"
        ),
      },
      handleKeyDown: (_view, event) => {
        const activeMenu = slashMenuRef.current;
        if (!activeMenu?.open) return false;

        const items = filteredCommandsRef.current;

        if (event.key === "Escape") {
          event.preventDefault();
          setSlashMenu(null);
          return true;
        }

        if (items.length === 0) return false;

        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSlashIndex((prev) => (prev + 1) % items.length);
          return true;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          setSlashIndex((prev) => (prev - 1 + items.length) % items.length);
          return true;
        }

        if (event.key === "Enter") {
          event.preventDefault();
          const chosen = items[slashIndexRef.current] ?? items[0];
          if (chosen) {
            executeSlashRef.current(chosen);
          }
          return true;
        }

        return false;
      },
      handleDrop: (view, event) => {
        setIsDraggingFile(false);
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;
        const imageFile = Array.from(files).find((f) =>
          f.type.startsWith("image/")
        );
        if (!imageFile) return false;

        event.preventDefault();
        const dropCoords = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });

        void uploadAndInsertImage(imageFile, (url, alt) => {
          const { schema } = view.state;
          const imgNode = schema.nodes.editorialImage?.create({
            src: url,
            alt,
            caption: "",
            layout: "normal",
          });
          if (!imgNode) return;

          const insertPos = dropCoords?.pos ?? view.state.selection.from;
          const tr = view.state.tr.insert(insertPos, imgNode);
          view.dispatch(tr);
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
          const imgNode = schema.nodes.editorialImage?.create({
            src: url,
            alt,
            caption: "",
            layout: "normal",
          });
          if (!imgNode) return;

          const tr = view.state.tr.replaceSelectionWith(imgNode);
          view.dispatch(tr);
        });
        return true;
      },
    },
  });

  // Update slash menu position & query whenever selection or text changes
  useEffect(() => {
    if (!editor) return;

    const evaluateSlashMenu = () => {
      const { selection } = editor.state;
      if (!selection.empty) {
        setSlashMenu(null);
        return;
      }

      const { $from } = selection;
      if ($from.parent.type.name !== "paragraph") {
        setSlashMenu(null);
        return;
      }

      const textBefore = $from.parent.textBetween(
        0,
        $from.parentOffset,
        "\n",
        "\0"
      );
      const match = /(?:^|\s)\/([^\s/]*)$/.exec(textBefore);
      if (!match) {
        setSlashMenu(null);
        return;
      }

      const query = match[1] ?? "";
      const slashLength = query.length + 1; // "/" + query
      const to = selection.from;
      const from = to - slashLength;

      const wrapperEl = wrapperRef.current;
      if (!wrapperEl) return;

      try {
        const coords = editor.view.coordsAtPos(to);
        const wrapperRect = wrapperEl.getBoundingClientRect();
        const menuWidth = 320;
        const rawLeft = coords.left - wrapperRect.left;
        const clampedLeft = Math.max(
          12,
          Math.min(rawLeft, Math.max(12, wrapperRect.width - menuWidth - 12))
        );
        const top = coords.bottom - wrapperRect.top + 8;

        setSlashMenu({
          open: true,
          query,
          range: { from, to },
          top,
          left: clampedLeft,
        });
        setSlashIndex(0);
      } catch {
        setSlashMenu(null);
      }
    };

    editor.on("update", evaluateSlashMenu);
    editor.on("selectionUpdate", evaluateSlashMenu);
    return () => {
      editor.off("update", evaluateSlashMenu);
      editor.off("selectionUpdate", evaluateSlashMenu);
    };
  }, [editor]);

  // Execute a slash command item
  const executeSlashCommand = useCallback(
    (cmd: SlashCommandItem) => {
      if (!editor) return;
      const activeRange = slashMenuRef.current?.range;
      setSlashMenu(null);

      const chain = editor.chain().focus();
      if (activeRange) {
        chain.deleteRange(activeRange);
      }

      switch (cmd.id) {
        case "image":
          chain.run();
          imageFileInputRef.current?.click();
          break;
        case "h2":
          chain.toggleHeading({ level: 2 }).run();
          break;
        case "h3":
          chain.toggleHeading({ level: 3 }).run();
          break;
        case "callout-attention":
          chain.setCallout("attention").run();
          break;
        case "callout-legal":
          chain.setCallout("legal").run();
          break;
        case "callout-summary":
          chain.setCallout("summary").run();
          break;
        case "blockquote":
          chain.toggleBlockquote().run();
          break;
        case "bullet-list":
          chain.toggleBulletList().run();
          break;
        case "ordered-list":
          chain.toggleOrderedList().run();
          break;
        case "divider":
          chain.setHorizontalRule().run();
          break;
        default:
          chain.run();
      }
    },
    [editor]
  );

  useEffect(() => {
    executeSlashRef.current = executeSlashCommand;
  }, [executeSlashCommand]);

  // Close slash menu on outside click
  useEffect(() => {
    if (!slashMenu?.open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-slash-palette]")) return;
      setSlashMenu(null);
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [slashMenu?.open]);

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
        <div className="min-h-[460px] px-6 py-5 space-y-3">
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
        .setEditorialImage({
          src: trimmed,
          alt: altInput.trim(),
          caption: "",
          layout: "normal",
        })
        .run();
    }

    closePrompt();
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    void uploadAndInsertImage(file, (url, alt) => {
      editor
        .chain()
        .focus()
        .setEditorialImage({ src: url, alt, caption: "", layout: "normal" })
        .run();
    });
  };

  return (
    <div
      ref={wrapperRef}
      onDragOver={(e) => {
        if (e.dataTransfer?.types?.includes("Files")) {
          setIsDraggingFile(true);
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as globalThis.Node)) {
          setIsDraggingFile(false);
        }
      }}
      onDrop={() => setIsDraggingFile(false)}
      className={cn(
        "relative rounded-2xl border bg-white shadow-2xs transition-all",
        isDraggingFile
          ? "border-gold ring-2 ring-gold/45 bg-champagne-50/20"
          : "border-forest-200"
      )}
    >
      <input
        ref={imageFileInputRef}
        type="file"
        accept={ACCEPT_ATTR}
        onChange={handleFileInputChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Sticky Editorial Toolbar */}
      <div className="sticky top-16 z-10 rounded-t-2xl border-b border-forest-100 bg-cream-light/95 backdrop-blur-sm">
        <div
          className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
          role="toolbar"
          aria-label="Formatação do artigo"
        >
          <div className="flex flex-wrap items-center gap-0.5">
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
              title="Citação editorial"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive("blockquote")}
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Inserir caixa de destaque jurídico"
              onClick={() => editor.chain().focus().setCallout("attention").run()}
              active={editor.isActive("callout")}
            >
              <Scale className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Divisor dourado"
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

            <button
              type="button"
              onClick={() => imageFileInputRef.current?.click()}
              disabled={isUploadingImage}
              title={`Inserir imagem do computador (até ${MAX_IMAGE_UPLOAD_LABEL})`}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-forest-50 border border-forest-200/80 px-2.5 text-xs font-semibold text-forest-800 hover:bg-gold/25 hover:border-gold/60 hover:text-ink transition-all disabled:opacity-45"
            >
              {isUploadingImage ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-gold-dark" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5 text-gold-dark" />
              )}
              <span className="hidden sm:inline">Inserir Imagem</span>
            </button>

            <ToolbarButton
              title="Inserir imagem por URL"
              onClick={() => openPrompt("image")}
              active={promptMode === "image"}
            >
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <span className="hidden xl:inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-1 text-[10px] font-medium text-forest-600 border border-forest-100">
            <Sparkles className="h-3 w-3 text-gold-dark" />
            Digite <kbd className="rounded bg-white px-1 py-0.2 font-mono text-[10px] font-bold text-ink border border-forest-200">/</kbd> para blocos
          </span>
        </div>

        {/* Live Upload Progress Bar / Error Banner */}
        {(isUploadingImage || uploadError) && (
          <div
            className={cn(
              "px-4 py-2.5 border-t border-forest-100 text-xs flex flex-col gap-1.5",
              uploadError
                ? "bg-red-50 text-red-700"
                : "bg-champagne-50 text-forest-800"
            )}
            role={uploadError ? "alert" : "status"}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-medium">
                {isUploadingImage && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-gold-dark" />
                )}
                {uploadError ??
                  `Enviando imagem para o artigo... ${uploadProgress}%`}
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
            {isUploadingImage && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-champagne-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-dark via-gold to-forest-700 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
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
      </div>

      {/* Drag-and-drop overlay cue */}
      {isDraggingFile && (
        <div className="pointer-events-none absolute inset-x-4 bottom-14 top-16 z-30 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gold bg-champagne-50/85 backdrop-blur-xs">
          <ImagePlus className="h-8 w-8 text-gold-dark mb-2" />
          <p className="text-sm font-semibold text-ink">
            Solte a imagem para inserir no artigo
          </p>
          <p className="text-xs text-forest-700 mt-0.5">
            JPEG, PNG, WebP, AVIF ou GIF · Até {MAX_IMAGE_UPLOAD_LABEL}
          </p>
        </div>
      )}

      {/* Editor Canvas */}
      <div className="overflow-x-hidden">
        <EditorContent editor={editor} />
      </div>

      {/* Floating Chancery Slash Command Palette (`/`) */}
      {slashMenu?.open && (
        <div
          data-slash-palette="true"
          role="listbox"
          aria-label="Comandos editoriais"
          style={{ top: slashMenu.top, left: slashMenu.left }}
          className="absolute z-40 w-80 max-w-[calc(100%-1.5rem)] rounded-2xl border border-forest-200 bg-white/98 shadow-2xl backdrop-blur-md overflow-hidden"
        >
          <div className="flex items-center justify-between px-3.5 py-2 bg-cream-light border-b border-forest-100">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-forest-700">
              Blocos Editoriais
            </span>
            <span className="text-[10px] text-forest-500">
              ↑↓ navegar · Enter inserir · Esc sair
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5">
            {filteredSlashCommands.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-forest-500">
                Nenhum bloco encontrado para &ldquo;/{slashMenu.query}&rdquo;
              </div>
            ) : (
              filteredSlashCommands.map((cmd, idx) => {
                const Icon = cmd.icon;
                const isSelected = idx === slashIndex;
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setSlashIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      executeSlashCommand(cmd);
                    }}
                    className={cn(
                      "w-full flex items-start gap-3 rounded-xl px-2.5 py-2 text-left transition-colors",
                      isSelected
                        ? "bg-champagne-100/85 text-ink"
                        : "text-forest-800 hover:bg-cream/70"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors mt-0.5",
                        isSelected
                          ? "bg-ink text-gold border-ink"
                          : "bg-cream-light text-forest-700 border-forest-100"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-ink truncate">
                          {cmd.title}
                        </span>
                        {cmd.badge && (
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-forest-500 shrink-0">
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-forest-600/90 leading-snug line-clamp-1 mt-0.5">
                        {cmd.description}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Live word count & reading time footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-b-2xl border-t border-forest-100 bg-cream/35 text-[11px] text-forest-600/85">
        <span>
          Digite <strong className="text-ink">/</strong> para inserir blocos ·
          Arraste ou cole imagens (até {MAX_IMAGE_UPLOAD_LABEL})
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
