// src/components/ui/custom/api-error-message.tsx
import { AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
    message: string;
    className?: string;
}

export function ApiErrorMessage({ message, className }: ErrorMessageProps) {
    return (
        <div className={cn(
            "flex items-center gap-2 mb-4 p-4 rounded-xl",
            "bg-red-100/70 text-red-700 border border-red-200",
            "dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60",
            className
        )}>
            <AlertCircle size={16} strokeWidth={2.5} className="shrink-0" />
            <p className="text-xs font-medium">{message}</p>
        </div>
    );
}