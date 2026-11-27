import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const getCachedUnreadLeadsCount = unstable_cache(
  async (): Promise<number> => {
    try {
      const supabase = createAdminClient();
      const { count } = await supabase
        .from("contact_leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "new");
      return count ?? 0;
    } catch (error) {
      console.error("Failed to count unread leads in AdminLayout:", error);
      return 0;
    }
  },
  ["admin-unread-leads-count"],
  { revalidate: 15, tags: ["admin-leads-count"] }
);

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
  const [session, unreadLeadsCount] = await Promise.all([
    requireAdmin(),
    getCachedUnreadLeadsCount(),
  ]);

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
