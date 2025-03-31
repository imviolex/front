// src/components/sections/reservation/BarberSelection.skeleton.tsx
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import { SectionTitle } from "@/components/ui/custom/section-title";
import { cn } from "@/lib/utils";

export function BarberSelectionSkeleton() {
    return (
        <div className="space-y-5">
            <SectionTitle>انتخاب آرایشگر</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((id) => (
                    <div
                        key={id}
                        className={cn(
                            "cursor-pointer rounded-xl",
                            "bg-muted/50",
                            "p-4", // پدینگ دقیق مطابق با SelectorCard
                            "min-h-[76px]" // حداقل ارتفاع برای تطبیق
                        )}
                    >
                        <div className="flex items-center gap-3">
                            {/* Icon Container */}
                            <div className={cn(
                                "p-2 rounded-xl bg-background",
                                "flex items-center justify-center",
                                "w-[36px] h-[36px]" // سایز دقیق کانتینر آیکون
                            )}>
                                <Skeleton className="h-5 w-5" />
                            </div>

                            <div className="flex flex-col justify-between flex-1 min-h-[40px]">
                                {/* Name */}
                                <Skeleton className="h-[18px] w-[120px] mb-2" />
                                {/* Specialty */}
                                <Skeleton className="h-[14px] w-[90px]" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}