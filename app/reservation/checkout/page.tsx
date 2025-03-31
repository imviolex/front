// src/app/reservation/checkout/page.tsx
'use client';

import { UserInfoSection } from '@/components/sections/reservation/UserInfoSection';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useReservationState } from '@/states/reservationState';
import { useAuthState } from '@/states/authState';

export default function CheckoutPage() {
    const router = useRouter();
    const { selectedBarber, selectedDate, selectedTime, selectedServices } = useReservationState();
    const { isAuthenticated } = useAuthState();

    useEffect(() => {
        // اطمینان از اینکه کاربر احراز هویت شده است
        if (!isAuthenticated) {
            router.push('/reservation');
            return;
        }

        // اطمینان از اینکه کاربر تمام مراحل قبل را تکمیل کرده است
        if (!selectedBarber || !selectedDate || !selectedTime || selectedServices.length === 0) {
            router.push('/reservation');
        }
    }, [isAuthenticated, selectedBarber, selectedDate, selectedTime, selectedServices, router]);

    // اگر احراز هویت نشده یا اطلاعات ناقص است، چیزی رندر نشود
    if (!isAuthenticated || !selectedBarber || !selectedDate || !selectedTime || selectedServices.length === 0) {
        return null;
    }

    return (
        <main className="flex min-h-screen flex-col items-center p-2 gap-3">
            <UserInfoSection />
        </main>
    );
}