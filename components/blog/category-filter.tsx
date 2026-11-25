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

export function CategoryFilter({
  categories,
  currentCategory,
}: CategoryFilterProps) {
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
    const qs = params.toString();
    const nextUrl = qs ? `/blog?${qs}` : "/blog";
    startTransition(() => {
      router.push(nextUrl, { scroll: false });
    });
  };

  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto no-scrollbar pb-1 transition-opacity duration-200",
        isPending && "opacity-60"
      )}
      role="group"
      aria-label="Filtrar artigos por categoria"
    >
      <button
        type="button"
        onClick={() => handleCategoryClick("")}
        aria-pressed={!currentCategory}
        className={cn(
          "shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-150 border",
          !currentCategory
            ? "bg-ink text-cream border-transparent shadow-sm"
            : "bg-transparent text-ink border-forest-600/30 hover:bg-ink/5"
        )}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => handleCategoryClick(cat.slug)}
          aria-pressed={currentCategory === cat.slug}
          className={cn(
            "shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-150 border",
            currentCategory === cat.slug
              ? "bg-ink text-cream border-transparent shadow-sm"
              : "bg-transparent text-ink border-forest-600/30 hover:bg-ink/5"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
