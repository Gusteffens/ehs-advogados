import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
 "inline-flex items-center font-medium transition-colors duration-200",
 {
 variants: {
 variant: {
 default:
 "bg-[#3B5A3C]/50 text-[#0D1812] border border-forest-200",
 accent:
 "bg-[#E8D49A]/30 text-[#877249] border border-champagne-200",
 outline:
 "border border-forest-300 text-[#3B5A3C] bg-transparent",
 dark:
 "bg-[#1B2D1E] text-[#877249]/70",
 },
 size: {
 sm: "px-2 py-0.5 text-xs rounded-md",
 md: "px-3 py-1 text-sm rounded-lg",
 lg: "px-4 py-1.5 text-base rounded-lg",
 },
 },
 defaultVariants: {
 variant: "default",
 size: "md",
 },
 }
);

export interface BadgeProps
 extends React.HTMLAttributes<HTMLSpanElement>,
 VariantProps<typeof badgeVariants> { }

export function Badge({ className, variant, size, ...props }: BadgeProps) {
 return (
 <span
 className={cn(badgeVariants({ variant, size, className }))}
 {...props}
 />
 );
}
