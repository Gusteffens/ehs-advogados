"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ImagePlus,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { uploadCoverImage } from "@/app/actions/blog";
import { useToast } from "@/components/admin/toast-provider";
import { cn, getErrorMessage } from "@/lib/utils";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const MAX_COVER_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

interface CoverUploadZoneProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function CoverUploadZone({
  value,
  onChange,
  disabled = false,
}: CoverUploadZoneProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      const msg =
        "Formato inválido. Utilize JPEG, PNG, WebP ou AVIF.";
      setError(msg);
      toast.error("Formato não suportado", msg);
      return;
    }

    if (file.size <= 0 || file.size > MAX_COVER_IMAGE_BYTES) {
      const msg = "A imagem de capa deve ter no máximo 5 MB.";
      setError(msg);
      toast.error("Arquivo muito grande", msg);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadCoverImage(formData);

      if (!res.ok || !res.url) {
        const msg = res.error ?? "Não foi possível enviar a imagem de capa.";
        setError(msg);
        toast.error("Falha no upload da capa", msg);
        return;
      }

      onChange(res.url);
      toast.success("Capa enviada", "A imagem foi carregada no servidor.");
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Erro ao enviar a imagem de capa.");
      setError(msg);
      toast.error("Erro no upload", msg);
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    const file = event.dataTransfer.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const handleRemove = () => {
    setError(null);
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-forest-100 p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-600">
          Imagem de Capa
        </span>
        {value && !isUploading && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              className="inline-flex items-center gap-1 text-xs font-medium text-forest-700 hover:text-ink transition-colors disabled:opacity-50"
            >
              <RefreshCw className="h-3 w-3" />
              Substituir
            </button>
            <span className="text-forest-200">·</span>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3 w-3" />
              Remover
            </button>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        id="cover-upload-input"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleInputChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {value ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled && !isUploading) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "group relative aspect-video w-full overflow-hidden rounded-xl border transition-all",
            isDragging
              ? "border-gold ring-2 ring-gold/40"
              : "border-forest-100"
          )}
        >
          <Image
            src={value}
            alt="Prévia da imagem de capa"
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover"
          />

          {isUploading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/65 backdrop-blur-xs text-cream">
              <Loader2 className="h-6 w-6 animate-spin text-gold" />
              <span className="text-xs font-medium">Enviando nova capa...</span>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 rounded-lg bg-cream px-3 py-1.5 text-xs font-semibold text-ink shadow-sm hover:bg-gold transition-colors"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                Trocar imagem
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled || isUploading ? -1 : 0}
          aria-label="Enviar imagem de capa"
          onClick={() => {
            if (!disabled && !isUploading) inputRef.current?.click();
          }}
          onKeyDown={(e) => {
            if (
              (e.key === "Enter" || e.key === " ") &&
              !disabled &&
              !isUploading
            ) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled && !isUploading) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-7 text-center transition-all cursor-pointer",
            isDragging
              ? "border-gold bg-champagne-50/80 scale-[1.01]"
              : "border-forest-200 bg-cream-light/60 hover:border-gold-dark/60 hover:bg-cream/60",
            (disabled || isUploading) && "opacity-60 pointer-events-none"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-7 w-7 text-gold-dark animate-spin mb-2" />
              <p className="text-xs font-semibold text-ink">
                Enviando imagem...
              </p>
              <p className="text-[11px] text-forest-600/80 mt-0.5">
                Aguarde um instante
              </p>
            </>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream border border-forest-100 text-forest-700 mb-2.5">
                <UploadCloud className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-ink">
                Arraste uma imagem ou clique para enviar
              </p>
              <p className="text-[11px] text-forest-600/80 mt-1">
                JPEG, PNG, WebP ou AVIF · Máximo 5 MB · 16:9 recomendado
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
