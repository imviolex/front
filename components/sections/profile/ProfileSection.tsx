// src/components/sections/profile/ProfileSection.tsx
'use client';

import { AuthInfoBox } from '@/components/auth/AuthInfoBox';
import { AuthDrawer } from '@/components/auth/AuthDrawer';
import { AppointmentCard } from '@/components/sections/profile/AppointmentCard';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export function ProfileSection() {
    const {
        checkIncompleteRegistration,
        isAuthenticated,
        hasIncompleteRegistration,
        openAuthDrawer
    } = useAuth();

    // اطمینان از بررسی وضعیت ثبت‌نام ناقص هنگام بارگذاری صفحه
    useEffect(() => {
        checkIncompleteRegistration();
    }, [checkIncompleteRegistration]);

    // اگر کاربر احراز هویت شده اما ثبت‌نام ناقص دارد، درایور را باز می‌کنیم
    useEffect(() => {
        if (isAuthenticated && hasIncompleteRegistration) {
            openAuthDrawer();
        }
    }, [isAuthenticated, hasIncompleteRegistration, openAuthDrawer]);

    return (
        <div className="w-full max-w-3xl mx-auto px-1 pt-20 pb-10 space-y-6">
            <AuthInfoBox />
            <AppointmentCard />
            <AuthDrawer />
        </div>
    );
}