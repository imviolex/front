// src/components/ui/custom/service-card.tsx
'use client';

import { Timer, Percent } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toPersianPrice, toPersianTime } from '@/lib/utils/persian-numbers';

interface ServiceCardProps {
    id: string | number;
    selected: boolean;
    onSelect: (id: string | number) => void;
    title: string;
    description?: string;
    price: string;
    duration: string;
}

export function ServiceCard(props: ServiceCardProps) {
    const { price, duration, title, description, selected, id, onSelect } = props;
    const isSpecial = id === 1; // شناسایی سرویس ویژه با ایدی 1

    return (
        <div className={cn(
            "relative group",
            isSpecial ? "ring-2 ring-red-500 rounded-xl" : ""
        )}>
            {/* Price Badge*/}
            <div className={cn(
                "absolute -top-2 -left-2 z-10 py-1 px-3 border border-card/10 rounded-[0.4rem] text-xs font-medium",
                isSpecial
                    ? "bg-red-500 text-primary-foreground"
                    : "bg-primary text-primary-foreground",
                "shadow-sm transition-all duration-200",
                "min-w-[90px] text-center"
            )}>
                {toPersianPrice(price)} تومان
            </div>

            {/* Service Card */}
            <div
                onClick={() => onSelect(id)}
                className={cn(
                    "cursor-pointer rounded-xl p-4 transition-colors duration-200",
                    selected && isSpecial
                        ? "bg-red-500 text-primary-foreground"
                        : selected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50"
                )}
            >
                <div className="flex flex-col">
                    {/* محتوا */}
                    <div>
                        <p className={cn(
                            "text-sm",
                            selected ? "text-primary-foreground" : "text-foreground"
                        )}>
                            {title}
                        </p>

                        <div className={cn(
                            "text-xs mt-2",
                            selected ? "text-primary-foreground/90" : "text-muted-foreground"
                        )}>
                            {/* توضیحات */}
                            <p className="text-xs line-clamp-2">
                                {description || ""}
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                                {/* Time Badge */}
                                <span className={cn(
                                    "inline-flex items-center justify-center h-[26px] px-2 rounded-[0.4rem] text-[11px]",
                                    "transition-all duration-200",
                                    selected
                                        ? "bg-primary-foreground/10 text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    <span className="flex items-center justify-center">
                                        <Timer
                                            className="h-3.5 w-3.5 flex-shrink-0"
                                            strokeWidth={2.5}
                                        />
                                        <span className="inline-block mr-1 leading-[1] flex-shrink-0 translate-y-[1.5px]">
                                            {toPersianTime(duration)}
                                        </span>
                                    </span>
                                </span>

                                {/* Discount Badge - فقط برای سرویس ویژه */}
                                {isSpecial && (
                                    <span className={cn(
                                        "inline-flex items-center justify-center h-[26px] px-2 rounded-[0.4rem] text-[11px]",
                                        "transition-all duration-200",
                                        selected
                                            ? "bg-primary-foreground/10 text-primary-foreground"
                                            : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                    )}>
                                        <span className="flex items-center justify-center">
                                            <Percent
                                                className="h-3.5 w-3.5 flex-shrink-0"
                                                strokeWidth={2.5}
                                            />
                                            <span className="inline-block mr-1 leading-[1] flex-shrink-0 translate-y-[1.5px]">
                                                تخفیف
                                            </span>
                                        </span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}