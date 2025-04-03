// src/components/sections/profile/AppointmentCard.skeleton.tsx
export function AppointmentCardSkeleton() {
    return (
        <div className="mt-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array(6).fill(0).map((_, index) => (
                    <div key={index} className="p-5 border border-border rounded-xl bg-card shadow-sm">
                        {/* هدر کارت - تاریخ و نام آرایشگر */}
                        <div className="flex justify-between items-center">
                            <div className="h-[26px] bg-muted animate-pulse rounded w-36" />
                            <div className="h-[24px] px-2 py-1 bg-muted animate-pulse rounded-[0.4rem] w-20" />
                        </div>

                        <div className="mt-4 space-y-3">
                            {/* زمان نوبت - فقط یک عنصر */}
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground font-bold">زمان:</span>
                                <div className="h-[20px] bg-muted animate-pulse rounded w-20" />
                            </div>

                            {/* مبلغ کل */}
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground font-bold">مبلغ کل:</span>
                                <div className="h-[23px] bg-muted animate-pulse rounded w-24" />
                            </div>
                        </div>

                        {/* دکمه جزئیات بیشتر */}
                        <div className="mt-4">
                            <div className="h-8 w-full bg-muted animate-pulse rounded-[0.5rem] flex items-center justify-center gap-2">
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}