"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-react";
import {
  type AdminUserRow,
  changeOwnPassword,
  createAdminUser,
  listAdminUsers,
  resetAdminUserPassword,
  toggleAdminUserActive,
} from "@/app/actions/admin-users";
import { useToast } from "@/components/admin/toast-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSecurityPanelProps {
  currentUserId: string;
  currentUserEmail: string | null;
  initialUsers: AdminUserRow[];
  migrationReady: boolean;
  initialLoadError?: string;
}

function getInitials(name: string, email: string): string {
  const source = name.trim() || email.trim();
  if (!source) return "AD";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function formatDatePtBr(iso: string | null): string {
  if (!iso) return "Nunca acessou";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "Data indisponível";
  }
}

export function AdminSecurityPanel({
  currentUserId,
  currentUserEmail,
  initialUsers,
  migrationReady: initialMigrationReady,
  initialLoadError,
}: AdminSecurityPanelProps) {
  const { toast } = useToast();

  // Section 1: Change own password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, startPasswordTransition] = useTransition();

  // Section 2: Admin team management
  const [users, setUsers] = useState<AdminUserRow[]>(initialUsers);
  const [migrationReady, setMigrationReady] = useState(initialMigrationReady);
  const [loadError, setLoadError] = useState<string | undefined>(
    initialLoadError
  );
  const [isRefreshingUsers, startRefreshTransition] = useTransition();

  // New admin form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);
  const [addFormError, setAddFormError] = useState<string | null>(null);
  const [isCreatingUser, startCreateTransition] = useTransition();

  // Per-row actions
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [resetTargetId, setResetTargetId] = useState<string | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResettingPassword, startResetTransition] = useTransition();

  const normalizedCurrentEmail = currentUserEmail?.trim().toLowerCase() ?? "";

  const handleChangeOwnPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("A confirmação da nova senha não confere.");
      return;
    }

    startPasswordTransition(async () => {
      const result = await changeOwnPassword({
        currentPassword,
        newPassword,
      });

      if (!result.ok) {
        const message =
          result.error || "Não foi possível alterar sua senha.";
        setPasswordError(message);
        toast.error("Erro ao alterar senha", message);
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(
        "Senha atualizada",
        "Sua nova senha já está ativa para os próximos acessos."
      );
    });
  };

  const handleRefreshUsers = () => {
    startRefreshTransition(async () => {
      const res = await listAdminUsers();
      setMigrationReady(res.migrationReady);
      setLoadError(res.error);
      if (res.ok) {
        setUsers(res.users);
      }
    });
  };

  const handleCreateAdmin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddFormError(null);

    if (newAdminPassword.length < 8) {
      setAddFormError("A senha inicial deve ter pelo menos 8 caracteres.");
      return;
    }

    startCreateTransition(async () => {
      const result = await createAdminUser({
        name: newAdminName,
        email: newAdminEmail,
        password: newAdminPassword,
      });

      if (!result.ok || !result.user) {
        const message =
          result.error || "Não foi possível cadastrar o administrador.";
        setAddFormError(message);
        toast.error("Erro ao adicionar administrador", message);
        return;
      }

      setUsers((prev) => [...prev, result.user!]);
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      setShowAddForm(false);
      toast.success(
        "Administrador adicionado",
        `${result.user.name} já pode acessar o painel editorial.`
      );
    });
  };

  const handleToggleActive = async (user: AdminUserRow) => {
    if (togglingUserId) return;
    setTogglingUserId(user.id);

    try {
      const nextActive = !user.is_active;
      const result = await toggleAdminUserActive(user.id, nextActive);
      if (!result.ok) {
        toast.error(
          "Não foi possível atualizar",
          result.error || "Erro ao alterar status da conta."
        );
        return;
      }

      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, is_active: nextActive } : item
        )
      );
      toast.success(
        nextActive ? "Conta reativada" : "Conta desativada",
        nextActive
          ? `${user.name} voltou a ter acesso ao painel.`
          : `${user.name} teve o acesso ao painel suspenso.`
      );
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleResetPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resetTargetId) return;
    setResetError(null);

    if (resetPasswordValue.length < 8) {
      setResetError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    startResetTransition(async () => {
      const result = await resetAdminUserPassword(
        resetTargetId,
        resetPasswordValue
      );

      if (!result.ok) {
        const message = result.error || "Erro ao redefinir a senha.";
        setResetError(message);
        toast.error("Erro ao redefinir senha", message);
        return;
      }

      const targetUser = users.find((u) => u.id === resetTargetId);
      setResetTargetId(null);
      setResetPasswordValue("");
      setShowResetPassword(false);
      toast.success(
        "Senha redefinida",
        targetUser
          ? `A senha de ${targetUser.name} foi atualizada com sucesso.`
          : "A senha do administrador foi atualizada."
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Change own password */}
      <form
        onSubmit={handleChangeOwnPassword}
        className="rounded-2xl bg-white border border-forest-200/80 p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="flex items-start gap-4 border-b border-forest-100 pb-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-champagne-300 bg-champagne-50 text-gold-dark">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-ink">
              Alterar minha senha
            </h2>
            <p className="text-xs sm:text-sm text-forest-600 mt-0.5">
              Atualize sua credencial de acesso ao painel administrativo
              {currentUserEmail ? (
                <>
                  {" "}
                  (<span className="font-medium text-ink">{currentUserEmail}</span>)
                </>
              ) : null}
              .
            </p>
          </div>
        </div>

        {passwordError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {passwordError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="sec-current-password"
              className="block text-xs font-semibold uppercase tracking-[0.12em] text-forest-700"
            >
              Senha atual *
            </label>
            <div className="relative">
              <input
                id="sec-current-password"
                type={showCurrentPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Sua senha atual"
                className="w-full rounded-xl border border-forest-200 bg-cream-light px-3.5 pr-10 py-2.5 text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne-400/30"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                aria-label={showCurrentPassword ? "Ocultar senha atual" : "Mostrar senha atual"}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg text-forest-500 hover:bg-cream hover:text-ink"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="sec-new-password"
              className="block text-xs font-semibold uppercase tracking-[0.12em] text-forest-700"
            >
              Nova senha *
            </label>
            <div className="relative">
              <input
                id="sec-new-password"
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-xl border border-forest-200 bg-cream-light px-3.5 pr-10 py-2.5 text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne-400/30"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                aria-label={showNewPassword ? "Ocultar nova senha" : "Mostrar nova senha"}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg text-forest-500 hover:bg-cream hover:text-ink"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="sec-confirm-password"
              className="block text-xs font-semibold uppercase tracking-[0.12em] text-forest-700"
            >
              Confirmar nova senha *
            </label>
            <div className="relative">
              <input
                id="sec-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full rounded-xl border border-forest-200 bg-cream-light px-3.5 pr-10 py-2.5 text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne-400/30"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword
                    ? "Ocultar confirmação de senha"
                    : "Mostrar confirmação de senha"
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg text-forest-500 hover:bg-cream hover:text-ink"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-forest-100">
          <p className="text-xs text-forest-500 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-gold-dark shrink-0" />
            Utilize ao menos 8 caracteres combinando letras e números.
          </p>

          <Button
            type="submit"
            variant="secondary"
            size="md"
            disabled={isChangingPassword}
            className="bg-ink text-gold hover:bg-primary hover:text-gold"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Atualizar Senha
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Section 2: Partners & Administrators */}
      <div className="rounded-2xl bg-white border border-forest-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-100 pb-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-forest-200 bg-forest-50 text-forest-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-xl font-bold text-ink">
                  Sócios e Administradores
                </h2>
                {migrationReady && (
                  <span className="inline-flex items-center rounded-full bg-cream px-2.5 py-0.5 text-xs font-semibold text-forest-700 border border-forest-200/70">
                    {users.length}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-forest-600 mt-0.5">
                Gerencie quem possui acesso autorizado ao painel editorial da
                sociedade.
              </p>
            </div>
          </div>

          {migrationReady && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefreshUsers}
                disabled={isRefreshingUsers}
                title="Atualizar lista"
                aria-label="Atualizar lista de administradores"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-forest-200 bg-cream-light text-forest-700 hover:bg-cream hover:text-ink transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4",
                    isRefreshingUsers && "animate-spin"
                  )}
                />
              </button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowAddForm((prev) => !prev);
                  setAddFormError(null);
                }}
                className="bg-ink text-gold hover:bg-primary hover:text-gold"
              >
                {showAddForm ? (
                  <>
                    <X className="h-4 w-4" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Novo Administrador
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Graceful migrationReady === false banner */}
        {!migrationReady && (
          <div className="rounded-2xl border border-champagne-300 bg-champagne-50/80 p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-champagne-200/70 text-gold-dark">
                <Database className="h-4 w-4" />
              </div>
              <div className="space-y-1.5 text-sm">
                <p className="font-semibold text-ink">
                  Tabela de administradores ainda não aplicada no Supabase
                </p>
                <p className="text-xs sm:text-sm text-forest-700 leading-relaxed">
                  Para cadastrar sócios, gerenciar acessos e alterar senhas pelo
                  painel, execute a migration{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-ink border border-champagne-300">
                    supabase/migrations/004_admin_auth.sql
                  </code>{" "}
                  no SQL Editor do seu projeto Supabase.
                </p>
                {loadError && (
                  <p className="text-xs text-gold-dark flex items-center gap-1.5 pt-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {loadError}
                  </p>
                )}
              </div>
            </div>

            <div className="pl-12">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isRefreshingUsers}
                onClick={handleRefreshUsers}
                className="border-champagne-400 bg-white text-ink hover:bg-champagne-100 hover:text-ink"
              >
                <RefreshCw
                  className={cn(
                    "h-3.5 w-3.5",
                    isRefreshingUsers && "animate-spin"
                  )}
                />
                Verificar novamente
              </Button>
            </div>
          </div>
        )}

        {/* Inline Add Admin Form */}
        {migrationReady && showAddForm && (
          <form
            onSubmit={handleCreateAdmin}
            className="rounded-2xl border border-champagne-300/80 bg-cream-light p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-ink flex items-center gap-2">
                <Plus className="h-4 w-4 text-gold-dark" />
                Cadastrar novo administrador
              </h3>
            </div>

            {addFormError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700"
              >
                {addFormError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="new-admin-name"
                  className="block text-xs font-semibold uppercase tracking-[0.12em] text-forest-700"
                >
                  Nome completo *
                </label>
                <input
                  id="new-admin-name"
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Ex.: Dra. Luíza Klein Haas"
                  className="w-full rounded-xl border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-champagne-400/30"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="new-admin-email"
                  className="block text-xs font-semibold uppercase tracking-[0.12em] text-forest-700"
                >
                  E-mail *
                </label>
                <input
                  id="new-admin-email"
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="socio@ehsadvogados.com.br"
                  className="w-full rounded-xl border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-champagne-400/30"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="new-admin-password"
                  className="block text-xs font-semibold uppercase tracking-[0.12em] text-forest-700"
                >
                  Senha inicial *
                </label>
                <div className="relative">
                  <input
                    id="new-admin-password"
                    type={showNewAdminPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full rounded-xl border border-forest-200 bg-white px-3.5 pr-10 py-2.5 text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-champagne-400/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewAdminPassword((prev) => !prev)}
                    aria-label={
                      showNewAdminPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg text-forest-500 hover:bg-cream hover:text-ink"
                  >
                    {showNewAdminPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                disabled={isCreatingUser}
                className="bg-ink text-gold hover:bg-primary hover:text-gold"
              >
                {isCreatingUser ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Salvar Administrador
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Admin Users List */}
        {migrationReady && (
          <div className="space-y-3">
            {loadError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {loadError}
              </div>
            )}

            {users.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-forest-200 bg-cream-light/60 px-6 py-8 text-center">
                <p className="text-sm font-medium text-ink">
                  Nenhum administrador cadastrado na tabela ainda.
                </p>
                <p className="text-xs text-forest-600 mt-1">
                  Clique em &ldquo;Novo Administrador&rdquo; acima para criar o
                  primeiro acesso persistente no Supabase.
                </p>
              </div>
            ) : (
              users.map((user) => {
                const isSelf =
                  user.id === currentUserId ||
                  (normalizedCurrentEmail !== "" &&
                    user.email.toLowerCase() === normalizedCurrentEmail);
                const isResetOpen = resetTargetId === user.id;
                const isToggling = togglingUserId === user.id;

                return (
                  <div
                    key={user.id}
                    className={cn(
                      "rounded-2xl border p-4 transition-colors",
                      user.is_active
                        ? "border-forest-200/80 bg-cream-light/50"
                        : "border-forest-200/60 bg-cream/60 opacity-80"
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold border",
                            user.is_active
                              ? "bg-ink text-gold border-gold/30"
                              : "bg-forest-100 text-forest-600 border-forest-200"
                          )}
                        >
                          {getInitials(user.name, user.email)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-ink truncate">
                              {user.name}
                            </p>
                            {isSelf && (
                              <span className="inline-flex items-center rounded-full bg-champagne-100 border border-champagne-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gold-dark">
                                Você
                              </span>
                            )}
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
                                user.is_active
                                  ? "bg-forest-50 text-forest-700 border border-forest-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              )}
                            >
                              {user.is_active ? "Ativo" : "Inativo"}
                            </span>
                          </div>
                          <p className="text-xs text-forest-600 truncate mt-0.5">
                            {user.email}
                          </p>
                          <p className="text-[11px] text-forest-500 mt-0.5">
                            Último acesso: {formatDatePtBr(user.last_login_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (isResetOpen) {
                              setResetTargetId(null);
                              setResetPasswordValue("");
                              setResetError(null);
                            } else {
                              setResetTargetId(user.id);
                              setResetPasswordValue("");
                              setResetError(null);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-forest-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-cream transition-colors"
                        >
                          <KeyRound className="h-3.5 w-3.5 text-gold-dark" />
                          Redefinir senha
                        </button>

                        <button
                          type="button"
                          disabled={isSelf || isToggling}
                          onClick={() => handleToggleActive(user)}
                          title={
                            isSelf
                              ? "Você não pode desativar sua própria conta"
                              : user.is_active
                                ? "Desativar acesso"
                                : "Reativar acesso"
                          }
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-45 disabled:pointer-events-none",
                            user.is_active
                              ? "border-red-200 bg-white text-red-700 hover:bg-red-50"
                              : "border-forest-300 bg-forest-50 text-forest-800 hover:bg-forest-100"
                          )}
                        >
                          {isToggling ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : user.is_active ? (
                            <UserX className="h-3.5 w-3.5" />
                          ) : (
                            <UserCheck className="h-3.5 w-3.5" />
                          )}
                          {user.is_active ? "Desativar" : "Reativar"}
                        </button>
                      </div>
                    </div>

                    {/* Inline Reset Password Form */}
                    {isResetOpen && (
                      <form
                        onSubmit={handleResetPassword}
                        className="mt-4 pt-4 border-t border-forest-200/70 space-y-3"
                      >
                        {resetError && (
                          <p
                            role="alert"
                            className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                          >
                            {resetError}
                          </p>
                        )}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                          <div className="relative flex-1">
                            <input
                              type={showResetPassword ? "text" : "password"}
                              required
                              minLength={8}
                              value={resetPasswordValue}
                              onChange={(e) =>
                                setResetPasswordValue(e.target.value)
                              }
                              placeholder={`Nova senha para ${user.name} (mín. 8 caracteres)`}
                              className="w-full rounded-xl border border-forest-200 bg-white px-3.5 pr-10 py-2 text-xs sm:text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-champagne-400/30"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowResetPassword((prev) => !prev)
                              }
                              aria-label={
                                showResetPassword
                                  ? "Ocultar senha"
                                  : "Mostrar senha"
                              }
                              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg text-forest-500 hover:bg-cream hover:text-ink"
                            >
                              {showResetPassword ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              type="submit"
                              variant="secondary"
                              size="sm"
                              disabled={isResettingPassword}
                              className="bg-ink text-gold hover:bg-primary hover:text-gold"
                            >
                              {isResettingPassword ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  Salvando...
                                </>
                              ) : (
                                "Salvar senha"
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setResetTargetId(null);
                                setResetPasswordValue("");
                                setResetError(null);
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
