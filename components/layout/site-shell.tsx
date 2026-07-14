"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isAdmin = pathname.startsWith("/admin");
	const isLanding = 
		pathname === "/penal" || 
		pathname.startsWith("/penal/") || 
		pathname === "/proagro" || 
		pathname.startsWith("/proagro/") || 
		pathname === "/proagro-negado" || 
		pathname.startsWith("/proagro-negado/");
	const hideShell = isAdmin || isLanding;

	return (
		<>
			{!hideShell && <Header />}
			<main className="min-h-screen">{children}</main>
			{!hideShell && <Footer />}
		</>
	);
}
