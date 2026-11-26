"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Plus, Tag, Trash2 } from "lucide-react";
import { createCategory, deleteCategory } from "@/app/actions/blog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { getErrorMessage } from "@/lib/utils";

export interface AdminCategoryItem {
  id: string;
  name: string;
  slug: string;
  color_hex: string | null;
}

const COLOR_PRESETS = [
  "#E8D49A",
  "#D4BC78",
  "#BDCEBE",
  "#8FA991",
  "#F0DFB3",
  "#DCE5DC",
];

export function CategoriesManager({
  categories,
}: {
  categories: AdminCategoryItem[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [colorHex, setColorHex] = useState("#E8D49A");
  const [formError, setFormError] = useState<string | null>(null);
  const [isCreating, startCreateTransition] = useTransition();

  const [deleteTarget, setDeleteTarget] = useState<AdminCategoryItem | null>(
    null
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Informe o nome da categoria.");
      return;
    }

    startCreateTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("name", name.trim());
        if (slug.trim()) formData.append("slug", slug.trim());
        formData.append("color_hex", colorHex);

        const result = await createCategory(formData);
        if (result?.error) {
          setFormError(result.error);
          return;
        }

        setName("");
        setSlug("");
        setColorHex("#E8D49A");
        router.refresh();
      } catch (error: unknown) {
        setFormError(getErrorMessage(error));
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setDeleteError(null);

    startDeleteTransition(async () => {
      try {
        const result = await deleteCategory(deleteTarget.id);
        if (result?.error) {
          setDeleteError(result.error);
          return;
        }
        setDeleteTarget(null);
        router.refresh();
      } catch (error: unknown) {
        setDeleteError(getErrorMessage(error));
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="rounded-2xl bg-white border border-forest-100 p-6 space-y-4 h-fit"
      >
        <h2 className="font-display text-lg font-bold text-ink">
          Nova Categoria
        </h2>

        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="cat-name"
            className="block text-xs font-semibold uppercase tracking-[0.1em] text-forest-600 mb-1.5"
          >
            Nome
          </label>
          <input
            id="cat-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Direito Agrário"
            className="w-full rounded-xl border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-forest-600/60 focus:outline-none focus:ring-2 focus:ring-champagne-500/50 focus:border-gold"
          />
        </div>

        <div>
          <label
            htmlFor="cat-slug"
            className="block text-xs font-semibold uppercase tracking-[0.1em] text-forest-600 mb-1.5"
          >
            Slug (opcional)
          </label>
          <input
            id="cat-slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="direito-agrario"
            className="w-full rounded-xl border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-forest-600/60 focus:outline-none focus:ring-2 focus:ring-champagne-500/50 focus:border-gold"
          />
        </div>

        <div>
          <span className="block text-xs font-semibold uppercase tracking-[0.1em] text-forest-600 mb-2">
            Cor da etiqueta
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setColorHex(preset)}
                aria-label={`Selecionar cor ${preset}`}
                className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: preset,
                  borderColor: colorHex === preset ? "#0D1812" : "transparent",
                }}
              />
            ))}
            <input
              type="color"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              aria-label="Cor personalizada"
              className="h-7 w-7 rounded-lg border border-forest-200 cursor-pointer"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="secondary"
          className="w-full text-sm"
          disabled={isCreating}
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {isCreating ? "Criando..." : "Criar Categoria"}
        </Button>
      </form>

      {/* Categories list */}
      <div className="lg:col-span-2 rounded-2xl bg-white border border-forest-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-forest-100 bg-cream/50 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-ink">
            Categorias Cadastradas ({categories.length})
          </h2>
        </div>

        {categories.length > 0 ? (
          <ul className="divide-y divide-forest-50">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-cream/35 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="h-4 w-4 rounded-full shrink-0 border border-ink/15"
                    style={{ backgroundColor: cat.color_hex ?? "#E8D49A" }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">
                      {cat.name}
                    </p>
                    <p className="text-xs text-forest-600/80 truncate">
                      /{cat.slug}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError(null);
                    setDeleteTarget(cat);
                  }}
                  aria-label={`Excluir categoria ${cat.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500/80 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-forest-600">
            <Tag className="h-6 w-6 mx-auto mb-2 text-forest-400" />
            Nenhuma categoria cadastrada ainda.
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Excluir categoria"
        description={
          deleteTarget
            ? `Tem certeza que deseja excluir a categoria "${deleteTarget.name}"? Artigos vinculados poderão ficar sem categoria.`
            : ""
        }
        confirmLabel="Excluir"
        isPending={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
      />
    </div>
  );
}
