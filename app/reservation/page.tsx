// src/app/reservation/page.tsx
'use client';

import { useEffect } from 'react';
import { IntroSection } from '@/components/sections/reservation/IntroSection';
import { useReservationState } from '@/states/reservationState';
import { usePathname } from 'next/navigation';

export default function ReservationPage() {
    const { clearState } = useReservationState();
    const pathname = usePathname();

    useEffect(() => {
        // فقط وقتی مستقیماً به صفحه اصلی رزرو وارد می‌شویم، state را پاک می‌کنیم
        // نه وقتی که از success برمی‌گردیم

        // بررسی می‌کنیم دقیقاً در مسیر /reservation هستیم (نه زیرمسیرها)
        if (pathname === '/reservation') {
            // این تایمر باعث می‌شود آخرین چیزی که اجرا می‌شود clearState باشد
            // تا با سایر کدهای صفحه تداخل نداشته باشد
            setTimeout(() => {
                clearState();
            }, 100);
        }
    }, [pathname, clearState]);

    return (
        <main className="flex min-h-screen flex-col items-center p-2 gap-3">
            <IntroSection />
        </main>
    );
}