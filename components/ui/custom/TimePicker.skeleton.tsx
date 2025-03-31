// src/components/ui/custom/TimePicker.skeleton.tsx
import { Skeleton } from "@/components/ui/shadcn/skeleton";

export function TimeSlotGroupSkeleton() {
    // ساختار دقیق اسلات‌ها مطابق با پایگاه داده
    const timeGroups = [
        { label: 'صبح', slots: Array(4).fill(0) }, // 4 اسلات: 10-1030، 1030-11، 11-1130، 1130-12
        { label: 'ظهر', slots: Array(3).fill(0) }, // 3 اسلات: 12-1230، 1230-13، 13-1330
        { label: 'عصر', slots: Array(5).fill(0) }, // 5 اسلات: 1630-17، 17-1730، 1730-18، 18-1830، 1830-19
        { label: 'شب', slots: Array(5).fill(0) }  // 5 اسلات: 19-1930، 1930-20، 20-2030، 2030-21، 21-2130
    ];

    return (
        <>
            {timeGroups.map((group, groupIndex) => (
                <div key={group.label} className="w-full mb-6 last:mb-0">
                    {/* عنوان گروه زمانی - دقیقاً مطابق با استایل اصلی */}
                    <div className="text-sm font-medium text-muted-foreground px-4 py-2 text-right">
                        <Skeleton className="h-4 w-16" />
                    </div>

                    {/* گرید تایم‌ها */}
                    <div className="grid grid-cols-2 gap-2">
                        {group.slots.map((_, slotIndex) => (
                            <Skeleton
                                key={`${group.label}-${slotIndex}`}
                                className="py-3 px-3 text-sm my-1 w-full rounded-xl h-[46px]"
                            />
                        ))}
                    </div>

                    {/* خط جداکننده بین گروه‌ها - دقیقاً مطابق با اصلی */}
                    {groupIndex < timeGroups.length - 1 && (
                        <div className="h-px bg-border my-4" />
                    )}
                </div>
            ))}
        </>
    );
}