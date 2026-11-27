"use client";

import { useState, useTransition } from "react";
import {
  BadgeCheck,
  BookOpen,
  Loader2,
  Plus,
  Save,
  Shield,
  User as UserIcon,
  X,
} from "lucide-react";
import { updateMyAuthorProfile } from "@/app/actions/admin-authors";
import type { AdminUserRow } from "@/app/actions/admin-users";
import { AdminSecurityPanel } from "@/components/admin/admin-security-panel";
import { useToast } from "@/components/admin/toast-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Author } from "@/types/database";

interface AuthorProfileFormProps {
  initialAuthor: Author | null;
  userDefaults: {
    userId: string;
    name: string | null;
    email: string | null;
    imageUrl: string | null;
  };
  securityData: {
    users: AdminUserRow[];
    migrationReady: boolean;
    error?: string;
  };
}

type ProfileTab = "author" | "account";

export function AuthorProfileForm({
  initialAuthor,
  userDefaults,
  securityData,
}: AuthorProfileFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ProfileTab>("author");
  const [isPending, startTransition] = useTransition();

  const [fullName, setFullName] = useState(
    initialAuthor?.full_name ?? userDefaults.name ?? ""
  );
  const [oab, setOab] = useState(initialAuthor?.oab ?? "");
  const [bio, setBio] = useState(initialAuthor?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(
    initialAuthor?.avatar_url ?? userDefaults.imageUrl ?? ""
  );
  const [specialties, setSpecialties] = useState<string[]>(
    initialAuthor?.specialties ?? []
  );
  const [specialtyDraft, setSpecialtyDraft] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleAddSpecialty = () => {
    const cleaned = specialtyDraft.trim();
    if (!cleaned) return;
    if (specialties.includes(cleaned)) {
      setSpecialtyDraft("");
      return;
    }
    if (specialties.length >= 12) {
      toast.info("Limite atingido", "Você pode adicionar até 12 especialidades.");
      return;
    }
    setSpecialties((prev) => [...prev, cleaned]);
    setSpecialtyDraft("");
  };

  const handleRemoveSpecialty = (target: string) => {
    setSpecialties((prev) => prev.filter((item) => item !== target));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    startTransition(async () => {
      const result = await updateMyAuthorProfile({
        full_name: fullName,
        oab,
        bio,
        specialties,
        avatar_url: avatarUrl,
      });

      if (!result.ok) {
        const message = result.error || "Não foi possível salvar as alterações.";
        setFormError(message);
        toast.error("Erro ao salvar perfil", message);
        return;
      }

      toast.success(
        "Perfil de autor atualizado",
        "As informações públicas do blog foram salvas com sucesso."
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div
        role="tablist"
        aria-label="Seções do perfil"
        className="inline-flex flex-wrap gap-1.5 rounded-2xl border border-forest-200/80 bg-white p-1.5 shadow-xs"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "author"}
          onClick={() => setActiveTab("author")}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
            activeTab === "author"
              ? "bg-ink text-gold shadow-xs"
              : "text-forest-700 hover:bg-cream hover:text-ink"
          )}
        >
          <BookOpen className="h-4 w-4" />
          Perfil de Autor no Blog
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "account"}
          onClick={() => setActiveTab("account")}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
            activeTab === "account"
              ? "bg-ink text-gold shadow-xs"
              : "text-forest-700 hover:bg-cream hover:text-ink"
          )}
        >
          <Shield className="h-4 w-4" />
          Conta & Segurança
        </button>
      </div>

      {/* Author profile tab */}
      {activeTab === "author" && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white border border-forest-200/80 p-6 sm:p-8 shadow-xs space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-100 pb-5">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-forest-200 bg-cream flex items-center justify-center">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={fullName || "Avatar do autor"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-7 w-7 text-forest-500" />
                )}
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-ink">
                  {fullName || "Seu Perfil Editorial"}
                </h2>
                <p className="text-xs text-forest-600 mt-0.5 flex items-center gap-1.5">
                  <BadgeCheck className="h-3.5 w-3.5 text-gold-dark" />
                  {oab || "Adicione seu registro OAB"}
                </p>
              </div>
            </div>

            {initialAuthor?.slug && (
              <span className="inline-flex items-center rounded-xl bg-cream px-3 py-1.5 text-xs font-mono text-forest-700 border border-forest-200/70">
                slug: {initialAuthor.slug}
              </span>
            )}
          </div>

          {formError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label
                htmlFor="author-full-name"
                className="block text-xs font-semibold uppercase tracking-[0.12em] text-forest-700"
              >
                Nome Completo *
              </label>
              <input
                id="author-full-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex.: Dra. Luíza Klein Haas"
                className="w-full rounded-xl border border-forest-200 bg-cream-light px-4 py-2.5 text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-champagne-400/30"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="author-oab"
                className="block text-xs font-semibold uppercase tracking-[0.12em] text-forest-700"
              >
                Registro OAB
              </label>
              <input
                id="author-oab"
                type="text"
                value={oab}
                onChange={(e) => setOab(e.target.value)}
                placeholder="Ex.: OAB/SC 65.939"
                className="w-full rounded-xl border border-forest-200 bg-cream-light px-4 py-2.5 text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-champagne-400/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="author-avatar"
              className="block text-xs font-semibold uppercase tracking-[0.12em] text-forest-700"
            >
              URL da Foto / Avatar
            </label>
            <input
              id="author-avatar"
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="/images/team/luiza-haas.webp ou https://..."
              className="w-full rounded-xl border border-forest-200 bg-cream-light px-4 py-2.5 text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-champagne-400/30"
            />
            <p className="text-[11px] text-forest-500">
              Aceita caminhos locais do site (ex.: <code>/images/team/...</code>)
              ou URLs HTTPS públicas.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="author-bio"
              className="block text-xs font-semibold uppercase tracking-[0.12em] text-forest-700"
            >
              Biografia Editorial
            </label>
            <textarea
              id="author-bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Breve apresentação profissional exibida nos artigos assinados por você..."
              className="w-full rounded-xl border border-forest-200 bg-cream-light px-4 py-3 text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-champagne-400/30 leading-relaxed"
            />
            <p className="text-[11px] text-forest-500 text-right">
              {bio.length} / 1500 caracteres
            </p>
          </div>

          <div className="space-y-2.5">
            <label
              htmlFor="author-specialty-input"
              className="block text-xs font-semibold uppercase tracking-[0.12em] text-forest-700"
            >
              Áreas de Especialidade
            </label>

            <div className="flex gap-2">
              <input
                id="author-specialty-input"
                type="text"
                value={specialtyDraft}
                onChange={(e) => setSpecialtyDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSpecialty();
                  }
                }}
                placeholder="Ex.: Direito do Agronegócio"
                className="flex-1 rounded-xl border border-forest-200 bg-cream-light px-4 py-2.5 text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-champagne-400/30"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSpecialty}
                className="h-auto px-4"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>

            {specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {specialties.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-champagne-300 bg-champagne-50 px-3 py-1 text-xs font-medium text-ink"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialty(item)}
                      aria-label={`Remover ${item}`}
                      className="text-forest-600 hover:text-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-forest-100">
            <Button
              type="submit"
              variant="secondary"
              size="md"
              disabled={isPending}
              className="bg-ink text-gold hover:bg-primary hover:text-gold"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Perfil de Autor
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Native Account & Security tab */}
      {activeTab === "account" && (
        <AdminSecurityPanel
          currentUserId={userDefaults.userId}
          currentUserEmail={userDefaults.email}
          initialUsers={securityData.users}
          migrationReady={securityData.migrationReady}
          initialLoadError={securityData.error}
        />
      )}
    </div>
  );
}
