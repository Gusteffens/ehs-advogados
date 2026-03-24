import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
 /** Adds hover lift effect */
 hoverable?: boolean;
 /** Background variant */
 variant?: "default" | "elevated" | "bordered" | "glass";
 /** Padding size */
 padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
 none: "",
 sm: "p-4",
 md: "p-6 lg:p-8",
 lg: "p-8 lg:p-10",
};

const variantMap = {
 default: "bg-white border border-forest-100",
 elevated: "bg-white shadow-lg shadow-forest-900/5",
 bordered: "bg-transparent border-2 border-forest-200",
 glass: "bg-white/80 border border-white/30 shadow-lg lg:bg-white/60 lg:backdrop-blur-md",
};

export function Card({
 hoverable = false,
 variant = "default",
 padding = "md",
 className,
 children,
 ...props
}: CardProps) {
 return (
 <div
 className={cn(
 "rounded-2xl transition-all duration-300",
 variantMap[variant],
 paddingMap[padding],
 hoverable &&
 "hover:-translate-y-1 hover:shadow-xl hover:shadow-forest-900/8",
 className
 )}
 {...props}
 >
 {children}
 </div>
 );
}

/* ── Sub-components ── */

export function CardHeader({
 className,
 ...props
}: React.HTMLAttributes<HTMLDivElement>) {
 return <div className={cn("mb-4", className)} {...props} />;
}

export function CardTitle({
 className,
 ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
 return (
 <h3
 className={cn(
 "font-display text-xl font-bold text-[#0D1812]",
 className
 )}
 {...props}
 />
 );
}

export function CardDescription({
 className,
 ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
 return (
 <p
 className={cn("text-sm text-[#3B5A3C] leading-relaxed", className)}
 {...props}
 />
 );
}

export function CardContent({
 className,
 ...props
}: React.HTMLAttributes<HTMLDivElement>) {
 return <div className={cn(className)} {...props} />;
}

export function CardFooter({
 className,
 ...props
}: React.HTMLAttributes<HTMLDivElement>) {
 return (
 <div
 className={cn("mt-6 flex items-center gap-3", className)}
 {...props}
 />
 );
}
