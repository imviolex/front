// src/components/sections/reservation/ServiceCard.skeleton.tsx
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import { cn } from "@/lib/utils";

interface ServiceCardSkeletonProps {
    index?: number;
}

export function ServiceCardSkeleton({ index = -1 }: ServiceCardSkeletonProps) {
    const isSpecial = index === 0;

    return (
        <div className={cn(
            "relative group",
            isSpecial ? "ring-2 ring-red-500/30 rounded-xl" : ""
        )}>
            {/* Price Badge */}
            <div className={cn(
                "absolute -top-2 -left-2 z-10 py-1 px-3 border border-card/10 rounded-[0.4rem] text-xs font-medium",
                isSpecial
                    ? "bg-red-500/20"
                    : "bg-primary/20",
                "shadow-sm transition-all duration-200",
                "min-w-[100px] text-center h-[26px]"
            )}>
                <Skeleton className={cn(
                    "h-4 w-16 mx-auto",
                    isSpecial ? "bg-red-500/20" : "bg-primary/20"
                )} />
            </div>

            {/* Service Card - تضمین ارتفاع یکسان با کامپوننت اصلی */}
            <div className={cn(
                "cursor-pointer rounded-xl p-4 transition-colors duration-200",
                "bg-muted/50",
                "h-[111px]" // ارتفاع ثابت برای جلوگیری از پرش - باید با ارتفاع کامپوننت اصلی منطبق باشد
            )}>
                <div className="flex flex-col h-full justify-between">
                    {/* محتوا */}
                    <div>
                        <div className="text-sm">
                            <Skeleton className={cn(
                                "h-4 w-28",
                                isSpecial ? "bg-red-500/20" : "bg-primary/20"
                            )} />
                        </div>

                        <div className="text-xs mt-2">
                            {/* توضیحات - فقط یک خط */}
                            <div className="text-xs mb-2">
                                <Skeleton className={cn(
                                    "h-5 w-4/5",
                                    isSpecial ? "bg-red-500/20" : "bg-primary/20"
                                )} />
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                                {/* Time Badge */}
                                <span className={cn(
                                    "inline-flex items-center justify-center h-[26px] px-2 rounded-[0.4rem] text-[11px]",
                                    "transition-all duration-200",
                                    "bg-muted"
                                )}>
                                    <div className="flex items-center justify-center">
                                        <Skeleton className={cn(
                                            "h-3.5 w-3.5 rounded-full",
                                            isSpecial ? "bg-red-500/20" : "bg-primary/20"
                                        )} />
                                        <Skeleton className={cn(
                                            "h-3 w-10 mr-1 ml-1",
                                            isSpecial ? "bg-red-500/20" : "bg-primary/20"
                                        )} />
                                    </div>
                                </span>

                                {/* Discount Badge - فقط برای سرویس ویژه */}
                                {isSpecial && (
                                    <span className={cn(
                                        "inline-flex items-center justify-center h-[26px] px-2 rounded-[0.4rem] text-[11px]",
                                        "transition-all duration-200",
                                        "bg-red-100/50 dark:bg-red-900/20"
                                    )}>
                                        <div className="flex items-center justify-center">
                                            <Skeleton className="h-3.5 w-3.5 rounded-full bg-red-500/20" />
                                            <Skeleton className="h-3 w-8 mr-1 ml-1 bg-red-500/20" />
                                        </div>
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