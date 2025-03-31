// src/components/ui/custom/date-picker.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { format, addDays, startOfToday, isToday, isTomorrow } from 'date-fns-jalali';
import "keen-slider/keen-slider.min.css";
import { Calendar as CalendarIcon, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReservationState } from '@/states/reservationState';
import { isDateDisabled } from '@/lib/utils/disabled-dates';
import { CustomDrawer } from "@/components/ui/custom/custom-drawer";

interface DateWheelPickerProps {
    onChange?: (date: Date) => void;
    maxDays?: number;
}

interface DateValue {
    date: Date;
    label: string;
    simplifiedLabel: string;
    isDisabled: boolean;
}

interface GroupedDates {
    [key: string]: {
        year: string;
        dates: DateValue[];
    };
}

const toFarsiNumber = (n: number | string) => {
    const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return n.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
};

const getDayName = (day: string) => {
    const days: Record<string, string> = {
        Sun: "یکشنبه",
        Mon: "دوشنبه",
        Tue: "سه‌شنبه",
        Wed: "چهارشنبه",
        Thu: "پنجشنبه",
        Fri: "جمعه",
        Sat: "شنبه"
    };
    return days[day] || day;
};

const getMonthName = (month: string) => {
    const months: Record<string, string> = {
        Farvardin: "فروردین",
        Ordibehesht: "اردیبهشت",
        Khordad: "خرداد",
        Tir: "تیر",
        Mordad: "مرداد",
        Shahrivar: "شهریور",
        Mehr: "مهر",
        Aban: "آبان",
        Azar: "آذر",
        Dey: "دی",
        Bahman: "بهمن",
        Esfand: "اسفند"
    };
    return months[month] || month;
};

export function DateWheelPickerDrawer({ onChange, maxDays = 8 }: DateWheelPickerProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { selectedBarber } = useReservationState();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Reset date when barber changes
    useEffect(() => {
        setSelectedDate(null);
        setIsConfirmed(false);
    }, [selectedBarber]);

    const getGroupedDates = useCallback((): GroupedDates => {
        const grouped: GroupedDates = {};
        const today = startOfToday();

        for (let i = 0; i < maxDays; i++) {
            const date = addDays(today, i);
            const baseFormat = format(date, "eee d MMMM yyyy");
            const [dayName, dayNum, monthName, year] = baseFormat.split(" ");

            const persianDayName = getDayName(dayName);
            const persianDayNum = toFarsiNumber(dayNum);
            const persianMonthName = getMonthName(monthName);
            const persianYear = toFarsiNumber(year);

            // بررسی روزهای غیرفعال
            const isDisabled = isDateDisabled(date);

            const monthKey = persianMonthName;

            if (!grouped[monthKey]) {
                grouped[monthKey] = {
                    year: persianYear,
                    dates: []
                };
            }

            grouped[monthKey].dates.push({
                date,
                label: `${persianDayName} ${persianDayNum} ${persianMonthName} ${persianYear}`,
                simplifiedLabel: `${persianDayName} ${persianDayNum} ${persianMonthName}`,
                isDisabled
            });
        }

        return grouped;
    }, [maxDays]);

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setIsConfirmed(true);
        setIsOpen(false);
        if (onChange) {
            onChange(date);
        }
    };

    if (!mounted) return null;

    const displayDate = selectedDate ?
        format(selectedDate, "eeee d MMMM ماه yyyy")
            .split(' ')
            .map(part => toFarsiNumber(part))
            .join(' ')
        : "";

    const groupedDates = getGroupedDates();

    return (
        <div className="relative w-full">
            <CustomDrawer
                open={isOpen}
                onOpenChange={setIsOpen}
                direction="bottom"
                title="انتخاب تاریخ"
                showCloseButton={true}
                closeButtonText="بستن"
                placement="right"
                size="md"
                minHeight="min"
                disableScroll={false}
                trigger={
                    <div
                        className={cn(
                            "flex items-center w-full h-12 px-4 py-2 text-right border rounded-xl transition-all duration-200",
                            isConfirmed
                                ? "bg-primary/10 border-primary hover:bg-primary/15"
                                : "bg-card border-border hover:border-primary hover:ring-[3px] hover:ring-primary/20",
                            "text-foreground cursor-pointer",
                            !selectedBarber && "opacity-50 pointer-events-none"
                        )}
                        style={{ direction: 'rtl' }}
                    >
                        {isConfirmed ? (
                            <CircleCheck strokeWidth={2.5} className="ml-3 h-4 w-4 text-primary" />
                        ) : (
                            <CalendarIcon strokeWidth={2.5} className="ml-3 h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={cn(
                            "text-sm",
                            !selectedDate && "text-muted-foreground",
                            isConfirmed && "text-primary font-medium"
                        )}>
                            {displayDate || "تاریخ مورد نظر را انتخاب کنید"}
                        </span>
                    </div>
                }
            >
                <div
                    dir="rtl"
                    className="time-scroll-container flex flex-col items-center overflow-y-auto"
                >
                    {Object.entries(groupedDates).map(([month, { year, dates }], groupIndex) => (
                        <div key={month} className="w-full">
                            <div className="text-sm font-medium text-muted-foreground px-4 py-2 text-right">
                                {month} {year}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {dates.map((dateObj, idx) => {
                                    const selectedDateFormatted = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
                                    const dateFormatted = format(dateObj.date, 'yyyy-MM-dd');
                                    const isDateToday = isToday(dateObj.date);
                                    const isDateTomorrow = isTomorrow(dateObj.date);

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => !dateObj.isDisabled && handleDateSelect(dateObj.date)}
                                            className={cn(
                                                // استایل عمومی برای همه دکمه‌ها
                                                "relative transition-colors",
                                                "py-3 px-3 text-sm my-1 w-full",
                                                "rounded-xl flex items-center justify-center",

                                                // استایل انتخاب شده
                                                selectedDateFormatted === dateFormatted && "bg-primary/10 text-primary",

                                                // استایل دکمه‌های فعال (هاور فقط برای دکمه‌های فعال)
                                                !dateObj.isDisabled && "hover:bg-primary/10 hover:text-primary group",

                                                // استایل دکمه‌های غیرفعال (مشابه استایل time-picker)
                                                dateObj.isDisabled && "opacity-50 cursor-not-allowed text-muted-foreground bg-muted/50 pointer-events-none"
                                            )}
                                            disabled={dateObj.isDisabled}
                                        >
                                            <div className="flex items-center justify-center truncate text-center">
                                                {/* نمایش badge تعطیل رسمی برای روزهای غیرفعال */}
                                                {dateObj.isDisabled && (
                                                    <span className={cn(
                                                        "text-[9px] leading-none px-2 py-[4px] rounded bg-muted font-bold ml-1 inline-block",
                                                        "text-muted-foreground"
                                                    )}>
                                                         تعطیل
                                                    </span>
                                                )}

                                                {/* نمایش badge امروز یا فردا فقط برای روزهای فعال */}
                                                {(isDateToday || isDateTomorrow) && !dateObj.isDisabled && (
                                                    <span className={cn(
                                                        "text-[9.2px] leading-none px-2 py-[4px] rounded bg-primary/10 font-medium ml-1 inline-block",
                                                        selectedDateFormatted === dateFormatted ? "text-primary" : "text-primary",
                                                        !dateObj.isDisabled && "group-hover:text-primary"
                                                    )}>
                                                        {isDateToday ? "امروز" : "فردا"}
                                                    </span>
                                                )}

                                                <span className={cn(
                                                    "truncate",
                                                    selectedDateFormatted === dateFormatted ? "font-medium text-primary" : "font-medium",
                                                    !dateObj.isDisabled && "group-hover:text-primary",
                                                    dateObj.isDisabled && "text-muted-foreground"
                                                )}>
                                                    {dateObj.simplifiedLabel.split(' ')[0]}
                                                </span>
                                                <span className={cn(
                                                    "mr-1 truncate",
                                                    selectedDateFormatted === dateFormatted ? "text-primary" : "text-foreground/90",
                                                    !dateObj.isDisabled && "group-hover:text-primary",
                                                    dateObj.isDisabled && "text-muted-foreground"
                                                )}>
                                                    {`${dateObj.simplifiedLabel.split(' ')[1]} ${dateObj.simplifiedLabel.split(' ')[2]}`}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            {groupIndex < Object.keys(groupedDates).length - 1 && (
                                <div className="h-px bg-border my-4" />
                            )}
                        </div>
                    ))}
                </div>
            </CustomDrawer>
        </div>
    );
}