"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
 id: string;
 text: string;
 level: number;
}

export function TableOfContents({ items }: { items: TocItem[] }) {
 const [activeId, setActiveId] = useState("");

 useEffect(() => {
 const observer = new IntersectionObserver(
 (entries) => {
 for (const entry of entries) {
 if (entry.isIntersecting) {
 setActiveId(entry.target.id);
 }
 }
 },
 { rootMargin: "-80px 0px -60% 0px" }
 );

 for (const item of items) {
 const el = document.getElementById(item.id);
 if (el) observer.observe(el);
 }

 return () => observer.disconnect();
 }, [items]);

 if (items.length === 0) return null;

 return (
 <nav className="space-y-1">
 <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-[#3B5A3C] mb-4">
 Neste artigo
 </p>
 {items.map((item) => (
 <a
 key={item.id}
 href={`#${item.id}`}
 className={cn(
 "block text-sm leading-relaxed transition-all duration-200 py-1 no-underline border-l-2",
 item.level === 3 ? "pl-6" : "pl-4",
 activeId === item.id
 ? "border-[#E8D49A] text-[#0D1812] font-medium"
 : "border-transparent text-[#3B5A3C] hover:text-[#3B5A3C] hover:border-forest-200"
 )}
 >
 {item.text}
 </a>
 ))}
 </nav>
 );
}
