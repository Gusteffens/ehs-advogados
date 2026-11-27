import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: {
    default: "Painel Administrativo",
    template: "%s | Admin — Erlo, Haas & Steffens",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  let unreadLeadsCount = 0;
  try {
    const supabase = createAdminClient();
    const { count } = await supabase
      .from("contact_leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "new");
    unreadLeadsCount = count ?? 0;
  } catch (error) {
    console.error("Failed to count unread leads in AdminLayout:", error);
  }

  return (
    <AdminShell
      unreadLeadsCount={unreadLeadsCount}
      user={{
        name: session.name,
        email: session.email,
        imageUrl: session.imageUrl,
      }}
    >
      {children}
    </AdminShell>
  );
}
