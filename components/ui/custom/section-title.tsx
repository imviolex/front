// src/components/ui/custom/section-title.tsx
import { cn } from "@/lib/utils";

interface SectionTitleProps {
    children: React.ReactNode;
    className?: string;
}

export function SectionTitle({ children, className }: SectionTitleProps) {
    return (
        <div className="mb-4 md:mb-5">
            <h3 className={cn(
                "text-sm font-bold text-foreground",
                className
            )}>
                {children}
            </h3>
        </div>
    );
}