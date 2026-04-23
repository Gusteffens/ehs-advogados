"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogSearchProps {
    currentQuery?: string;
}

export function BlogSearch({ currentQuery }: BlogSearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [query, setQuery] = useState(() => currentQuery || "");

    const currentUrlQuery = searchParams.get("q")?.trim() ?? "";

    useEffect(() => {
        const nextQuery = query.trim();

        if (nextQuery === currentUrlQuery) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());

            if (nextQuery) {
                params.set("q", nextQuery);
            } else {
                params.delete("q");
            }

            const nextUrl = params.toString() ? `/blog?${params.toString()}` : "/blog";

            startTransition(() => {
                router.replace(nextUrl, { scroll: false });
            });
        }, 300);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [currentUrlQuery, query, router, searchParams, startTransition]);

    return (
        <div className={cn("relative transition-opacity duration-200", isPending && "opacity-60")}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3B5A3C]/50 pointer-events-none" />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar artigos..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#3B5A3C]/20 bg-white text-[#0D1812] text-sm placeholder:text-[#3B5A3C]/40 focus:outline-none focus:border-[#877249]/50 focus:ring-2 focus:ring-[#E8D49A]/20 transition-all"
            />
        </div>
    );
}
