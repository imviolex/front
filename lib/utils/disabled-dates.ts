// src/lib/utils/disabled-dates.ts

import { format } from 'date-fns-jalali';

export const disabledDates: string[] = [
    '2025-07-05',
    '2025-07-06',

    '2026-06-25',
    '2026-06-26',

    '2027-06-15',
    '2027-06-16',

    '2028-06-03',
    '2028-06-04',

    '2029-05-23',
    '2029-05-24',
]

export const isDateDisabled = (date: Date): boolean => {
    // تبدیل تاریخ به فرمت YYYY-MM-DD میلادی
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    // تبدیل تاریخ به شمسی برای نمایش (فقط برای اشکال‌زدایی)
    const persianDate = format(date, 'yyyy/MM/dd');

    // در محیط توسعه، اطلاعات اشکال‌زدایی را نمایش دهید
    if (process.env.NODE_ENV === 'development') {
        console.log(`بررسی تاریخ: ${formattedDate} (شمسی: ${persianDate})`);
        if (disabledDates.includes(formattedDate)) {
            console.log(`تاریخ ${formattedDate} (شمسی: ${persianDate}) غیرفعال است.`);
        }
    }

    return disabledDates.includes(formattedDate);
};