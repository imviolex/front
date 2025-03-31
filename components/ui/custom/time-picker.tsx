// src/components/ui/custom/time-picker.tsx
'use client';

import { useState, useEffect } from 'react';
import { Clock, CircleCheck } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useReservationState } from '@/states/reservationState';
import { formatTimeSlot } from '@/lib/utils/persian-numbers';
import { CustomDrawer } from "@/components/ui/custom/custom-drawer";
import { TimeSlotGroupSkeleton } from './TimePicker.skeleton';

interface CustomTimeSelectProps {
    onChange?: (time: string) => void;
    requiresDoubleSlot?: boolean;
}

// تعریف interface برای ExtendedTimeSlot
interface ExtendedTimeSlot {
    id: string;
    time: string;
    available: boolean;
    is_past: boolean;
    is_booked: boolean;
    is_pending: boolean;
    next_slot_available: boolean;
    next_slot_pending: boolean;
    is_before_rest?: boolean;
    is_end_of_shift?: boolean;
}

export function CustomTimeSelectDrawer({ onChange, requiresDoubleSlot }: CustomTimeSelectProps) {
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const {
        selectedBarber,
        selectedDate,
        setTime,
        timeGroups,
        needsDoubleSlot,
        totalDuration,
        fetchTimeSlots
    } = useReservationState();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setSelectedTime('');
        setIsConfirmed(false);
        setTime(null);
    }, [selectedBarber, selectedDate, setTime, totalDuration]);

    useEffect(() => {
        if (selectedBarber && selectedDate) {
            setIsLoading(true);
            setHasError(false);

            fetchTimeSlots()
                .then(result => {
                    if (result.error) {
                        setHasError(true);
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [selectedBarber, selectedDate, fetchTimeSlots]);

    if (!mounted) return null;

    // تابع برای ساخت اسلات مجازی بعد از پایان شیفت
    const getVirtualNextSlot = (time: string) => {
        if (time === "13-1330") {
            return "1330-14";
        } else if (time === "21-2130") {
            return "2130-22";
        }
        return null;
    };

    // تابع اصلاح شده برای دریافت نوبت بعدی با فرمت صحیح
    const getNextTimeSlot = (timeStr: string | null, slot: ExtendedTimeSlot) => {
        // اگر نوبت قبل از زمان استراحت است، نوبت بعدی را نشان نده
        if (slot?.is_before_rest) {
            return null;
        }

        if (!timeStr) return null;

        const [, end] = timeStr.split('-');

        // تبدیل اعداد به فرمت ساعت و دقیقه
        const extractTimeComponents = (timeStr: string) => {
            if (timeStr.length <= 2) {
                // اگر فقط ساعت باشد
                return { hour: parseInt(timeStr), minute: 0 };
            } else {
                // اگر ساعت و دقیقه باشد (مثلا 1030)
                const hour = parseInt(timeStr.slice(0, timeStr.length - 2));
                const minute = parseInt(timeStr.slice(-2));
                return { hour, minute };
            }
        };

        const endTime = extractTimeComponents(end);

        // محاسبه زمان بعدی
        let nextHour = endTime.hour;
        let nextMinute = endTime.minute + 30;

        // اگر دقیقه بزرگتر از 60 شد، ساعت رو افزایش بده
        if (nextMinute >= 60) {
            nextHour += 1;
            nextMinute -= 60;
        }

        // ساخت فرمت نهایی
        const formatTime = (hour: number, minute: number) => {
            if (minute === 0) {
                return hour.toString();
            } else {
                return `${hour}${minute}`;
            }
        };

        const nextTimeEnd = formatTime(nextHour, nextMinute);

        return `${end}-${nextTimeEnd}`;
    };

    const handleTimeSelect = (time: string, available: boolean, isPast: boolean, isPending: boolean, nextSlotAvailable: boolean, nextSlotPending: boolean, isBeforeRest: boolean, isEndOfShift: boolean) => {
        if (!available || isPast || isPending ||
            (requiresDoubleSlot && (!nextSlotAvailable || nextSlotPending) && !isEndOfShift)) return;

        setSelectedTime(time);
        setIsConfirmed(true);
        setIsOpen(false);
        if (onChange) {
            onChange(time);
        }
        setTime(time);
    };

    // تابع برای تعیین وضعیت نوبت‌ها
    const getTimeSlotStatus = (slot: ExtendedTimeSlot) => {
        // برای اسلات‌های پایانی شیفت، محدودیت دو نوبتی را اعمال نمی‌کنیم
        if (slot.is_end_of_shift) {
            // اولویت با رزرو شده است
            if (slot.is_booked) {
                return {
                    disabled: true,
                    statusClass: 'opacity-50 pointer-events-none text-muted-foreground bg-muted/50',
                    statusText: 'رزرو شده'
                };
            } else if (slot.is_pending) {
                return {
                    disabled: true,
                    statusClass: 'opacity-50 pointer-events-none text-muted-foreground bg-muted/50',
                    statusText: 'در حال رزرو'
                };
            } else if (slot.is_past) {
                return {
                    disabled: true,
                    statusClass: 'opacity-50 pointer-events-none text-muted-foreground bg-muted/50',
                    statusText: 'زمان گذشته'
                };
            } else {
                return {
                    disabled: false,
                    statusClass: 'hover:bg-primary/10 hover:text-primary',
                    statusText: 'قابل رزرو'
                };
            }
        }

        // برای بقیه اسلات‌ها
        if (slot.is_booked) {
            return {
                disabled: true,
                statusClass: 'opacity-50 pointer-events-none text-muted-foreground bg-muted/50',
                statusText: 'رزرو شده'
            };
        } else if (slot.is_pending) {
            return {
                disabled: true,
                statusClass: 'opacity-50 pointer-events-none text-muted-foreground bg-muted/50',
                statusText: 'در حال رزرو'
            };
        } else if (slot.is_past) {
            return {
                disabled: true,
                statusClass: 'opacity-50 pointer-events-none text-muted-foreground bg-muted/50',
                statusText: 'زمان گذشته'
            };
        } else if (requiresDoubleSlot && (!slot.next_slot_available || slot.next_slot_pending)) {
            let statusText = 'غیرقابل انتخاب';

            if (slot.next_slot_pending) {
                statusText = 'نوبت بعدی در حال رزرو';
            }

            return {
                disabled: true,
                statusClass: 'opacity-50 pointer-events-none text-muted-foreground bg-muted/50',
                statusText: statusText
            };
        }

        return {
            disabled: false,
            statusClass: 'hover:bg-primary/10 hover:text-primary',
            statusText: 'قابل رزرو'
        };
    };

    // تابع برای نمایش زمان‌ها
    const getDisplayTime = () => {
        if (!selectedTime) return "ساعت مورد نظر را انتخاب کنید";

        const selectedSlot = timeGroups
            .flatMap(group => group.slots)
            .find(slot => slot.time === selectedTime) as ExtendedTimeSlot;

        // برای اسلات‌های پایان شیفت با اسلات مجازی بعدی نمایش داده شود
        if (selectedSlot && selectedSlot.is_end_of_shift && needsDoubleSlot) {
            const virtualNextSlot = getVirtualNextSlot(selectedSlot.time);
            if (virtualNextSlot) {
                return `ساعت ${formatTimeSlot(selectedTime)} و ${formatTimeSlot(virtualNextSlot)}`;
            }
        }

        // اگر نیاز به دو نوبت است و نوبت قبل از استراحت نیست
        if (needsDoubleSlot && selectedSlot && !selectedSlot.is_before_rest && !selectedSlot.is_end_of_shift) {
            const nextSlot = getNextTimeSlot(selectedTime, selectedSlot);
            if (nextSlot) {
                return `ساعت ${formatTimeSlot(selectedTime)} و ${formatTimeSlot(nextSlot)}`;
            }
        }

        return `ساعت ${formatTimeSlot(selectedTime)}`;
    };

    return (
        <div className="relative w-full">
            <CustomDrawer
                open={isOpen}
                onOpenChange={setIsOpen}
                direction="bottom"
                title="انتخاب ساعت"
                showCloseButton={true}
                closeButtonText="بستن"
                placement="right"
                size="md"
                minHeight="large" // اضافه کردن minHeight برای تنظیم ارتفاع مناسب
                disableScroll={false} // اجازه دادن به اسکرول محتوا
                trigger={
                    <div
                        className={cn(
                            "flex items-center w-full h-12 px-4 py-2 text-right border rounded-xl transition-all duration-200",
                            isConfirmed
                                ? "bg-primary/10 border-primary hover:bg-primary/15"
                                : "bg-card border-border hover:border-primary hover:ring-[3px] hover:ring-primary/20",
                            "text-foreground cursor-pointer",
                            (!selectedBarber || !selectedDate) && "opacity-50 pointer-events-none"
                        )}
                        style={{ direction: 'rtl' }}
                    >
                        {isConfirmed ? (
                            <CircleCheck strokeWidth={2.5} className="ml-3 h-4 w-4 text-primary" />
                        ) : (
                            <Clock strokeWidth={2.5} className="ml-3 h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={cn(
                            "text-sm",
                            !selectedTime && "text-muted-foreground",
                            isConfirmed && "text-primary font-medium"
                        )}>
                            {getDisplayTime()}
                        </span>
                    </div>
                }
            >
                <div
                    dir="rtl"
                    className="time-scroll-container flex flex-col items-center overflow-y-auto"
                >
                    {isLoading || hasError ? (
                        <TimeSlotGroupSkeleton />
                    ) : timeGroups.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            هیچ زمان خالی برای این روز وجود ندارد
                        </div>
                    ) : (
                        timeGroups.map((group, groupIndex) => (
                            <div key={group.label} className="w-full mb-6 last:mb-0">
                                <div className="text-sm font-medium text-muted-foreground px-4 py-2 text-right">
                                    {group.label}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {group.slots.map((slot) => {
                                        const extendedSlot: ExtendedTimeSlot = slot as ExtendedTimeSlot;
                                        const status = getTimeSlotStatus(extendedSlot);
                                        const isEndOfShift = extendedSlot.is_end_of_shift || false;

                                        return (
                                            <button
                                                key={slot.id}
                                                onClick={() => handleTimeSelect(
                                                    slot.time,
                                                    slot.available,
                                                    slot.is_past,
                                                    !!extendedSlot.is_pending,
                                                    slot.next_slot_available,
                                                    !!extendedSlot.next_slot_pending,
                                                    !!extendedSlot.is_before_rest,
                                                    isEndOfShift
                                                )}
                                                className={cn(
                                                    "relative transition-colors group",
                                                    "py-3 px-3 text-sm my-1 w-full",
                                                    "rounded-xl flex items-center justify-center",
                                                    selectedTime === slot.time && "bg-primary/10 text-primary",
                                                    status.statusClass
                                                )}
                                                disabled={status.disabled}
                                            >
                                                <div className="flex items-center justify-center truncate text-center">
                                                    {status.statusText && (
                                                        <span className={cn(
                                                            "text-[9.2px] leading-none px-2 py-[4px] rounded font-medium ml-1 inline-block",
                                                            status.statusText === "قابل رزرو"
                                                                ? "bg-primary/10 text-primary"
                                                                : status.statusText === "غیرقابل انتخاب" || status.statusText === "نوبت بعدی در حال رزرو" || status.statusText === "در حال رزرو" || status.statusText === "رزرو شده" || status.statusText === "زمان گذشته"
                                                                    ? "bg-muted text-muted-foreground"
                                                                    : "bg-muted text-muted-foreground",
                                                            selectedTime === slot.time && status.statusText === "قابل رزرو" && "text-primary bg-primary/20"
                                                        )}>
                                                            {status.statusText}
                                                        </span>
                                                    )}
                                                    <span className={cn(
                                                        "truncate",
                                                        selectedTime === slot.time ? "font-medium text-primary" : "font-medium group-hover:text-primary"
                                                    )}>
                                                        {formatTimeSlot(slot.time)}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                {groupIndex < timeGroups.length - 1 && (
                                    <div className="h-px bg-border my-4" />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </CustomDrawer>
        </div>
    );
}