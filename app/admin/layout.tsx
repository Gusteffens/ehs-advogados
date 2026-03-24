import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: {
        default: "Painel Administrativo",
        template: "%s | Admin — Erlo, Haas & Steffens",
    },
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as any)?.role;

    if (role !== 'admin') {
        redirect("/");
    }
    return (
        <div className="flex min-h-screen bg-[#EEEDE5]">
            <AdminSidebar />
            <div className="flex-1 lg:ml-64">
                <div className="p-6 lg:p-10">{children}</div>
            </div>
        </div>
    );
}
