// src/components/auth/RegisterStep.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/shadcn/button';
import { InputWithLabel } from '@/components/ui/custom/input';
import { ThreeDotsLoader } from '@/components/ui/custom/three-dots-loader';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// تابع بررسی فارسی بودن متن
const isPersianText = (text: string): boolean => {
    // الگوی تشخیص حروف فارسی، فاصله و برخی علائم نگارشی مجاز
    const persianPattern = /^[\u0600-\u06FF\s\.\،\؛\:\(\)\-]+$/;
    return persianPattern.test(text);
};

export function RegisterStep() {
    const {
        user,
        updateProfile,
        isLoading
    } = useAuth();

    const [firstname, setFirstname] = useState(user?.firstname || '');
    const [lastname, setLastname] = useState(user?.lastname || '');
    const [isFormValid, setIsFormValid] = useState(false);

    // بررسی اعتبار فرم - فقط بررسی میکند آیا فرم معتبر است یا خیر
    useEffect(() => {
        setIsFormValid(
            firstname.trim().length >= 2 &&
            lastname.trim().length >= 2 &&
            isPersianText(firstname) &&
            isPersianText(lastname)
        );
    }, [firstname, lastname]);

    // فقط یک بار در زمان بارگذاری کامپوننت اجرا می‌شود
    // و مقادیر اولیه را از user موجود پر می‌کند
    useEffect(() => {
        // فقط یکبار در شروع اجرا می‌شود
        if (user) {
            setFirstname(user.firstname || '');
            setLastname(user.lastname || '');
        }
    }, [user]);

    const handleFirstnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFirstname(e.target.value);
    };

    const handleLastnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLastname(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid) {
            if (!isPersianText(firstname) || !isPersianText(lastname)) {
                toast.error('لطفاً از حروف فارسی استفاده کنید');
            } else {
                toast.error('لطفاً نام و نام خانوادگی را به درستی وارد کنید');
            }
            return;
        }

        await updateProfile(firstname.trim(), lastname.trim());
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 h-full flex flex-col justify-between">
            <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-4">
                    لطفاً برای تکمیل ثبت‌نام، نام و نام خانوادگی خود را وارد کنید.
                </p>

                <div className="space-y-4">
                    <InputWithLabel
                        label="نام"
                        value={firstname}
                        onChange={handleFirstnameChange}
                        className="text-sm focus:!border-primary"
                        required
                        disabled={isLoading}
                    />

                    <InputWithLabel
                        label="نام خانوادگی"
                        value={lastname}
                        onChange={handleLastnameChange}
                        className="text-sm focus:!border-primary"
                        required
                        disabled={isLoading}
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl"
                disabled={!isFormValid || isLoading}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <ThreeDotsLoader color="white" size={3} gap={2}/>
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        تکمیل ثبت‌نام
                    </span>
                )}
            </Button>
        </form>
    );
}