import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
    {
        variants: {
            variant: {
                primary:
                    "bg-[#3B5A3C] text-[#EEEDE5] hover:bg-[#1B2D1E] shadow-md hover:shadow-lg",
                secondary:
                    "bg-[#E8D49A] text-[#0D1812] hover:bg-[#877249] shadow-md hover:shadow-lg",
                outline:
                    "border-2 border-[#3B5A3C] text-[#0D1812] hover:bg-[#3B5A3C] hover:text-[#EEEDE5]",
                ghost:
                    "text-[#0D1812] hover:bg-[#EEEDE5]/40 hover:text-[#0D1812]",
                link:
                    "text-[#877249] underline-offset-4 hover:underline hover:text-[#E8D49A] p-0 h-auto",
            },
            size: {
                sm: "h-9 px-4 text-sm rounded-lg",
                md: "h-11 px-6 text-base rounded-xl",
                lg: "h-13 px-8 text-lg rounded-xl",
                icon: "h-10 w-10 rounded-full",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> { }

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
