// src/app/reservation/failure/page.tsx
'use client';

import { FailureSection } from '@/components/sections/reservation/FailureSection';
import { useEffect } from 'react';

export default function FailurePage() {
    // اثر جانبی برای ارسال رویداد به‌روزرسانی مسیر
    useEffect(() => {
        // ارسال رویداد برای به‌روزرسانی منوی فعال
        if (typeof window !== 'undefined') {
            // ارسال رویداد دو بار به فاصله زمانی کوتاه برای اطمینان از دریافت آن
            window.dispatchEvent(new Event('path-changed'));

            // ارسال مجدد با تأخیر برای اطمینان از به‌روزرسانی پس از هیدراسیون کامل
            setTimeout(() => {
                window.dispatchEvent(new Event('path-changed'));
            }, 200);
        }
    }, []);

    return (
        <main className="flex min-h-screen flex-col items-center p-2 gap-3">
            <FailureSection />
        </main>
    );
}