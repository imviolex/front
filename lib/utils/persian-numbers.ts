// src/lib/utils/persian-numbers.ts

export const toPersianNumbers = (str: string | number): string => {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    str = str.toString();
    return str.replace(/[0-9]/g, (d) => persianNumbers[parseInt(d)]);
};

export const toPersianPrice = (price: number | string): string => {
    return toPersianNumbers(price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
};

export const toPersianTime = (duration: string): string => {
    return toPersianNumbers(duration) + " دقیقه";
};

export const formatTimeSlot = (time: string): string => {
    if (!time) return '';

    // تغییر: فقط زمان شروع نمایش داده می‌شود
    // استفاده از [start] به جای [start, _] برای جلوگیری از خطای متغیر بلااستفاده
    const [start] = time.split('-');

    // برای شروع زمان
    let startHour, startMinute;
    if (start.length === 4) {
        startHour = start.slice(0, 2);
        startMinute = start.slice(2);
    } else {
        startHour = start;
        startMinute = "00";
    }

    return `${toPersianNumbers(startHour)}:${toPersianNumbers(startMinute)}`;
};

export const toEnglishNumbers = (str: string): string => {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    return str.split('').map(char => {
        const index = persianNumbers.indexOf(char);
        return index !== -1 ? englishNumbers[index] : char;
    }).join('');
};

export const convertToNumber = (persianPrice: string): number => {
    const englishNumbers = toEnglishNumbers(persianPrice);
    return parseInt(englishNumbers.replace(/[^0-9]/g, ''));
};

// تابع اصلاح شده برای فرمت‌دهی تاریخ به فارسی با ترتیب صحیح
export const formatPersianDate = (date: string | Date | undefined): string => {
    if (!date) return '-';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    try {
        // استفاده از Intl.DateTimeFormat برای دریافت اجزای تاریخ
        const weekdayFormatter = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' });
        const dayFormatter = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' });
        const monthFormatter = new Intl.DateTimeFormat('fa-IR', { month: 'long' });
        const yearFormatter = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' });

        // ترکیب اجزا با ترتیب دلخواه
        const weekday = weekdayFormatter.format(dateObj);
        const day = dayFormatter.format(dateObj);
        const month = monthFormatter.format(dateObj);
        const year = yearFormatter.format(dateObj);

        // تنظیم ترتیب صحیح: روز هفته، روز ماه، ماه، سال
        return `${weekday}، ${day} ${month} ${year}`;
    } catch (error) {
        console.error("Error formatting date:", error);
        return '-';
    }
};