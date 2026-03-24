"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface CategoryFilterProps {
    categories: Category[];
    currentCategory?: string;
}

export function CategoryFilter({ categories, currentCategory }: CategoryFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const handleCategoryClick = (slug: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slug) {
            params.set("categoria", slug);
        } else {
            params.delete("categoria");
        }
        startTransition(() => {
            router.push(`/blog?${params.toString()}`, { scroll: false });
        });
    };

    return (
        <div className={cn("flex gap-2 overflow-x-auto no-scrollbar pb-1 transition-opacity duration-200", isPending && "opacity-60")}>
            <button
                onClick={() => handleCategoryClick("")}
                className={cn(
                    "shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-150 border",
                    !currentCategory
                        ? "bg-[#0D1812] text-[#EEEDE5] border-transparent shadow-sm"
                        : "bg-transparent text-[#0D1812] border-[#3B5A3C]/30 hover:bg-[#0D1812]/5"
                )}
            >
                Todos
            </button>
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.slug)}
                    className={cn(
                        "shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-150 border",
                        currentCategory === cat.slug
                            ? "bg-[#0D1812] text-[#EEEDE5] border-transparent shadow-sm"
                            : "bg-transparent text-[#0D1812] border-[#3B5A3C]/30 hover:bg-[#0D1812]/5"
                    )}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
}
