"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/app/actions/blog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/admin/toast-provider";
import { getErrorMessage } from "@/lib/utils";
import type { AdminCategoryItem } from "@/types/blog";

export type { AdminCategoryItem };

const COLOR_PRESETS = [
  "#E8D49A",
  "#D4BC78",
  "#BDCEBE",
  "#8FA991",
  "#F0DFB3",
  "#DCE5DC",
];

const inputClasses =
  "w-full rounded-xl border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-forest-600/60 focus:outline-none focus:ring-2 focus:ring-champagne-500/50 focus:border-gold transition-all";

export function CategoriesManager({
  categories,
}: {
  categories: AdminCategoryItem[];
}) {
  const router = useRouter();
  const { toast } = useToast();

  // Create form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [colorHex, setColorHex] = useState("#E8D49A");
  const [formError, setFormError] = useState<string | null>(null);
  const [isCreating, startCreateTransition] = useTransition();

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editColorHex, setEditColorHex] = useState("#E8D49A");
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdating, startUpdateTransition] = useTransition();

  // Delete state
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
        if (description.trim()) {
          formData.append("description", description.trim());
        }
        formData.append("color_hex", colorHex);

        const result = await createCategory(formData);
        if (!result.ok) {
          const msg = result.error ?? "Não foi possível criar a categoria.";
          setFormError(msg);
          toast.error("Erro ao criar categoria", msg);
          return;
        }

        toast.success("Categoria criada", `"${name.trim()}" foi adicionada.`);
        setName("");
        setSlug("");
        setDescription("");
        setColorHex("#E8D49A");
        router.refresh();
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        setFormError(msg);
        toast.error("Erro ao criar categoria", msg);
      }
    });
  };

  const startEditing = (cat: AdminCategoryItem) => {
    setEditError(null);
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditDescription(cat.description ?? "");
    setEditColorHex(cat.color_hex ?? "#E8D49A");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditError(null);
  };

  const handleEditKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    catId: string
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!isUpdating) {
        handleSaveEdit(catId);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (!isUpdating) {
        cancelEditing();
      }
    }
  };

  const handleSaveEdit = (catId: string) => {
    setEditError(null);
    if (!editName.trim()) {
      setEditError("O nome da categoria é obrigatório.");
      return;
    }

    startUpdateTransition(async () => {
      try {
        const res = await updateCategory(catId, {
          name: editName.trim(),
          slug: editSlug.trim(),
          color_hex: editColorHex,
          description: editDescription.trim() || null,
        });

        if (!res.ok) {
          const msg = res.error ?? "Não foi possível atualizar a categoria.";
          setEditError(msg);
          toast.error("Erro ao atualizar", msg);
          return;
        }

        toast.success("Categoria atualizada", `"${editName.trim()}" salva.`);
        setEditingId(null);
        router.refresh();
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        setEditError(msg);
        toast.error("Erro ao atualizar", msg);
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setDeleteError(null);

    startDeleteTransition(async () => {
      try {
        const result = await deleteCategory(deleteTarget.id);
        if (!result.ok) {
          const msg = result.error ?? "Não foi possível excluir a categoria.";
          setDeleteError(msg);
          toast.error("Erro ao excluir", msg);
          return;
        }
        toast.success(
          "Categoria excluída",
          `"${deleteTarget.name}" foi removida.`
        );
        setDeleteTarget(null);
        router.refresh();
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        setDeleteError(msg);
        toast.error("Erro ao excluir", msg);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="rounded-2xl bg-white border border-forest-100 p-6 shadow-2xs space-y-4 h-fit"
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
            className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-600 mb-1.5"
          >
            Nome
          </label>
          <input
            id="cat-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Direito Agrário"
            className={inputClasses}
          />
        </div>

        <div>
          <label
            htmlFor="cat-slug"
            className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-600 mb-1.5"
          >
            Slug (opcional)
          </label>
          <input
            id="cat-slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="direito-agrario"
            className={inputClasses}
          />
        </div>

        <div>
          <label
            htmlFor="cat-desc"
            className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-600 mb-1.5"
          >
            Descrição (opcional)
          </label>
          <textarea
            id="cat-desc"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descrição temática desta categoria..."
            className={`${inputClasses} resize-none text-xs`}
          />
        </div>

        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-600 mb-2">
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
      <div className="lg:col-span-2 rounded-2xl bg-white border border-forest-100 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-forest-100 bg-cream/55 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-ink">
            Categorias Cadastradas ({categories.length})
          </h2>
          <span className="text-xs text-forest-600">
            Clique no lápis para editar inline
          </span>
        </div>

        {categories.length > 0 ? (
          <ul className="divide-y divide-forest-50">
            {categories.map((cat) => {
              const isEditing = editingId === cat.id;

              if (isEditing) {
                return (
                  <li key={cat.id} className="px-6 py-4 bg-champagne-50/50">
                    <div className="space-y-3">
                      {editError && (
                        <p
                          role="alert"
                          className="text-xs text-red-600 font-medium"
                        >
                          {editError}
                        </p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-forest-600 mb-1">
                            Nome
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => handleEditKeyDown(e, cat.id)}
                            className={`${inputClasses} py-2 text-xs`}
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-forest-600 mb-1">
                            Slug
                          </label>
                          <input
                            type="text"
                            value={editSlug}
                            onChange={(e) => setEditSlug(e.target.value)}
                            onKeyDown={(e) => handleEditKeyDown(e, cat.id)}
                            className={`${inputClasses} py-2 text-xs`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-forest-600 mb-1">
                          Descrição (opcional)
                        </label>
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          onKeyDown={(e) => handleEditKeyDown(e, cat.id)}
                          placeholder="Breve descrição da categoria..."
                          className={`${inputClasses} py-2 text-xs`}
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-1.5">
                          {COLOR_PRESETS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setEditColorHex(preset)}
                              aria-label={`Cor ${preset}`}
                              className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110"
                              style={{
                                backgroundColor: preset,
                                borderColor:
                                  editColorHex === preset
                                    ? "#0D1812"
                                    : "transparent",
                              }}
                            />
                          ))}
                          <input
                            type="color"
                            value={editColorHex}
                            onChange={(e) => setEditColorHex(e.target.value)}
                            aria-label="Cor personalizada"
                            className="h-6 w-6 rounded border border-forest-200 cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1 rounded-lg border border-forest-200 bg-white px-3 py-1.5 text-xs font-medium text-forest-700 hover:bg-cream transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(cat.id)}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-cream hover:bg-forest-800 transition-colors disabled:opacity-60"
                          >
                            {isUpdating ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Salvar
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              }

              return (
                <li
                  key={cat.id}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-cream/35 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className="h-4 w-4 rounded-full shrink-0 border border-ink/15 mt-0.5"
                      style={{ backgroundColor: cat.color_hex ?? "#E8D49A" }}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-ink truncate">
                          {cat.name}
                        </p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-cream border border-forest-200/80 px-2 py-0.5 text-[10px] font-semibold text-forest-700 tabular-nums">
                          <FileText className="h-2.5 w-2.5" />
                          {cat.postCount}{" "}
                          {cat.postCount === 1 ? "artigo" : "artigos"}
                        </span>
                      </div>
                      <p className="text-xs text-forest-600/80 truncate mt-0.5">
                        /{cat.slug}
                        {cat.description ? ` · ${cat.description}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditing(cat)}
                      aria-label={`Editar categoria ${cat.name}`}
                      title="Editar categoria"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-forest-600/80 hover:text-ink hover:bg-cream transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError(null);
                        setDeleteTarget(cat);
                      }}
                      aria-label={`Excluir categoria ${cat.name}`}
                      title="Excluir categoria"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500/80 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
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
            ? `Tem certeza que deseja excluir a categoria "${deleteTarget.name}"? ${
                deleteTarget.postCount > 0
                  ? `${deleteTarget.postCount} artigo(s) vinculados ficarão sem categoria.`
                  : "Nenhum artigo está vinculado a esta categoria."
              }`
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
