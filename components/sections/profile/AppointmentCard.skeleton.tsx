// src/components/sections/profile/AppointmentCard.skeleton.tsx
export function AppointmentCardSkeleton() {
    return (
        <div className="mt-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array(4).fill(0).map((_, index) => (
                    <div key={index} className="p-5 border border-border rounded-xl bg-card shadow-sm">
                        {/* همان ساختار برای دسکتاپ و موبایل */}
                        <div className="flex justify-between items-center">
                            <div className="h-5 bg-muted animate-pulse rounded w-28" />
                            <div className="h-6 px-2 py-1 bg-muted animate-pulse rounded-[0.4rem] min-w-24" />
                        </div>

                        <div className="mt-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground font-bold">زمان:</span>
                                <div className="h-4 bg-muted animate-pulse rounded w-20" />
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground font-bold">مبلغ کل:</span>
                                <div className="h-4 bg-muted animate-pulse rounded w-24" />
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="h-9 w-full bg-muted animate-pulse rounded-[0.5rem] flex items-center justify-center gap-2">
                                <div className="h-4 w-4 bg-muted-foreground/20 rounded-full"></div>
                                <div className="h-4 bg-muted-foreground/20 animate-pulse rounded w-24"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}