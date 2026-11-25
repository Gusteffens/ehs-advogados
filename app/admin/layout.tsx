import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/auth";

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
  await requireAdmin();

  return (
    <ClerkProvider signInUrl="/sign-in">
      <div className="flex min-h-screen bg-cream">
        <AdminSidebar />
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-10">{children}</div>
        </div>
      </div>
    </ClerkProvider>
  );
}
