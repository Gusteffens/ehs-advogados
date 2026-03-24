import { cn } from "@/lib/utils";

interface SectionTitleProps extends React.HTMLAttributes<HTMLDivElement> {
 /** Small label text above the heading */
 label?: string;
 /** Main heading text */
 title: string;
 /** Optional subtitle paragraph */
 subtitle?: string;
 /** Text alignment */
 align?: "left" | "center";
 /** Use light colors (for dark backgrounds) */
 light?: boolean;
}

export function SectionTitle({
 label,
 title,
 subtitle,
 align = "center",
 light = false,
 className,
 ...props
}: SectionTitleProps) {
 return (
 <div
 className={cn(
 "mb-12 lg:mb-16",
 align === "center" && "text-center",
 className
 )}
 {...props}
 >
 {label && (
 <span
 className={cn(
 "inline-block font-body text-sm font-semibold uppercase tracking-[0.2em] mb-4",
 light ? "text-[#E8D49A]" : "text-[#C9B06A]"
 )}
 >
 {label}
 </span>
 )}
 <h2
 className={cn(
 "font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight",
 light ? "text-[#EEEDE5]" : "text-[#1B3A2D]"
 )}
 >
 {title}
 </h2>
 {subtitle && (
 <p
 className={cn(
 "mt-4 max-w-2xl text-lg leading-relaxed",
 align === "center" && "mx-auto",
 light ? "text-[#EEEDE5]/70" : "text-[#4A7C5C]"
 )}
 >
 {subtitle}
 </p>
 )}
 </div>
 );
}
