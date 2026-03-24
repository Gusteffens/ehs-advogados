import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
 as?: React.ElementType;
 narrow?: boolean;
}

export function Container({
 as: Component = "div",
 narrow = false,
 className,
 children,
 ...props
}: ContainerProps) {
 return (
 <Component
 className={cn(
 "mx-auto w-full px-5 sm:px-8 lg:px-12",
 narrow ? "max-w-4xl" : "max-w-7xl",
 className
 )}
 {...props}
 >
 {children}
 </Component>
 );
}
