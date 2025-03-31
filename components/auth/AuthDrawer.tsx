// src/components/auth/AuthDrawer.tsx
'use client';

import { useEffect } from 'react';
import { CustomDrawer } from '@/components/ui/custom/custom-drawer';
import { PhoneInputStep } from './PhoneInputStep';
import { OtpInputStep } from './OtpInputStep';
import { RegisterStep } from './RegisterStep';
import { EditProfileStep } from './EditProfileStep';
import { useAuth } from '@/hooks/useAuth';

export function AuthDrawer() {
    const {
        isAuthDrawerOpen,
        currentStep,
        isAuthenticated,
        checkIncompleteRegistration,
        closeAuthDrawer,
        setCurrentStep
    } = useAuth();

    // بررسی وضعیت ثبت‌نام ناقص هنگام باز شدن drawer
    useEffect(() => {
        if (isAuthDrawerOpen) {
            const hasIncomplete = checkIncompleteRegistration();
            if (hasIncomplete) {
                // اگر ثبت‌نام ناقص وجود دارد، مستقیم به مرحله register می‌رویم
                setCurrentStep('register');
            }
        }
    }, [isAuthDrawerOpen, checkIncompleteRegistration, setCurrentStep]);

    // عنوان درایور بر اساس مرحله فعلی
    const getStepTitle = () => {
        switch (currentStep) {
            case 'phone':
                return 'ورود به حساب کاربری';
            case 'otp':
                return 'تأیید کد یکبار مصرف';
            case 'register':
                return 'تکمیل اطلاعات';
            case 'edit':
                return 'ویرایش اطلاعات کاربری';
            default:
                return 'ورود به حساب کاربری';
        }
    };

    // اگر کاربر لاگین شده و پروفایل کامل است، درایور را می‌بندیم
    useEffect(() => {
        // بستن درایور فقط در صورتی که کاربر احراز هویت شده و در مرحله ثبت‌نام نیست
        if (isAuthenticated && currentStep !== 'register' && currentStep !== 'edit') {
            closeAuthDrawer();
        }
    }, [isAuthenticated, currentStep, closeAuthDrawer]);

    // تعیین minHeight بر اساس مرحله فعلی
    const getMinHeight = () => {
        switch (currentStep) {
            case 'otp':
                return 'min';  // برای مرحله OTP ارتفاع متوسط
            case 'register':
            case 'edit':
                return 'medium';  // برای مرحله ثبت‌نام و ویرایش ارتفاع متوسط
            default:
                return 'auto';    // برای مرحله ورود شماره تلفن، ارتفاع پیش‌فرض
        }
    };

    // تابع تغییریافته برای کنترل باز و بسته شدن درایور
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // اگر درایور بسته می‌شود
            closeAuthDrawer();
        } else {
            // اگر درایور باز می‌شود، بررسی می‌کنیم آیا ثبت‌نام ناقص داریم
            const hasIncomplete = checkIncompleteRegistration();

            if (hasIncomplete) {
                // اگر ثبت‌نام ناقص داریم، مستقیم به مرحله register می‌رویم
                setCurrentStep('register');
            }
        }
    };

    return (
        <CustomDrawer
            open={isAuthDrawerOpen}
            onOpenChange={handleOpenChange}
            direction="bottom"
            title={getStepTitle()}
            showCloseButton={true}
            closeButtonText="بستن"
            placement="right"
            size="md"
            minHeight={getMinHeight()}
            disableScroll={false}
        >
            {currentStep === 'phone' && <PhoneInputStep />}
            {currentStep === 'otp' && <OtpInputStep />}
            {currentStep === 'register' && <RegisterStep />}
            {currentStep === 'edit' && <EditProfileStep />}
        </CustomDrawer>
    );
}