"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogSearchProps {
    currentQuery?: string;
}

export function BlogSearch({ currentQuery }: BlogSearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [query, setQuery] = useState(currentQuery || "");

    useEffect(() => {
        setQuery(currentQuery || "");
    }, [currentQuery]);

    const handleSearch = (value: string) => {
        setQuery(value);
        const params = new URLSearchParams(searchParams.toString());
        if (value.trim()) {
            params.set("q", value.trim());
        } else {
            params.delete("q");
        }
        startTransition(() => {
            router.push(`/blog?${params.toString()}`, { scroll: false });
        });
    };

    return (
        <div className={cn("relative transition-opacity duration-200", isPending && "opacity-60")}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3B5A3C]/50 pointer-events-none" />
            <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Pesquisar artigos..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#3B5A3C]/20 bg-white text-[#0D1812] text-sm placeholder:text-[#3B5A3C]/40 focus:outline-none focus:border-[#877249]/50 focus:ring-2 focus:ring-[#E8D49A]/20 transition-all"
            />
        </div>
    );
}
