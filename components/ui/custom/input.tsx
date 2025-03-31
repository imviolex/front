// src/components/ui/custom/input.tsx
'use client';

import { cn } from "@/lib/utils";
import { useId } from "react";
import * as React from "react";

interface InputWithLabelProps extends React.ComponentProps<"input"> {
    label: string;
}

export const InputWithLabel = React.forwardRef<HTMLInputElement, InputWithLabelProps>(
    ({ label, className, ...props }, ref) => {
        const id = useId();

        return (
            <div className="relative min-w-[300px] rounded-xl border border-input bg-background shadow-sm shadow-black/5 transition-shadow focus-within:border-ring focus-within:outline-none focus-within:ring-[3px] focus-within:ring-ring/20 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 [&:has(input:is(:disabled))_*]:pointer-events-none">
                <label htmlFor={id} className="block px-3 pt-2 text-xs font-medium text-foreground">
                    {label}
                </label>
                <input
                    id={id}
                    ref={ref}
                    className={cn(
                        "flex h-10 w-full bg-transparent px-3 pb-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none",
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);
InputWithLabel.displayName = "InputWithLabel";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
                    type === "search" &&
                    "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
                    type === "file" &&
                    "p-0 pr-3 italic text-muted-foreground/70 file:me-3 file:h-full file:border-0 file:border-r file:border-solid file:border-input file:bg-transparent file:px-3 file:text-sm file:font-medium file:not-italic file:text-foreground",
                    className,
                )}
                ref={ref}
                {...props}
            />
        );
    },
);
Input.displayName = "Input";

export { Input };