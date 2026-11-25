import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center font-medium transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "bg-forest-100 text-forest-900 border border-forest-200",
        accent: "bg-champagne-300/30 text-gold-dark border border-champagne-200",
        outline: "border border-forest-300 text-forest-600 bg-transparent",
        dark: "bg-forest-900 text-gold",
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
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  );
}
