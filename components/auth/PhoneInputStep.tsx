// src/components/auth/PhoneInputStep.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/shadcn/button';
import { InputWithLabel } from '@/components/ui/custom/input';
import { ThreeDotsLoader } from '@/components/ui/custom/three-dots-loader';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { toPersianNumbers, toEnglishNumbers } from '@/lib/utils/persian-numbers';

export function PhoneInputStep() {
    const {
        phoneNumber,
        setPhoneNumber,
        requestOtp,
        isLoading
    } = useAuth();

    const [localPhone, setLocalPhone] = useState(phoneNumber);
    const [isValid, setIsValid] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // تنظیم مقدار اولیه
    useEffect(() => {
        setLocalPhone(phoneNumber);
    }, [phoneNumber]);

    // بررسی معتبر بودن شماره
    useEffect(() => {
        const englishPhone = toEnglishNumbers(localPhone);
        setIsValid(/^09\d{9}$/.test(englishPhone));
    }, [localPhone]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        value = toEnglishNumbers(value);
        value = value.replace(/\D/g, '');

        if (value.length >= 1) {
            if (value[0] !== '0') {
                value = '';
            } else if (value.length >= 2 && value[1] !== '9') {
                value = value[0];
            }
        }

        if (value.length <= 11) {
            setLocalPhone(value);
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isValid) {
            toast.error('لطفاً شماره موبایل معتبر وارد کنید');
            return;
        }

        // تبدیل اعداد فارسی به انگلیسی برای ارسال به سرور
        const englishPhone = toEnglishNumbers(localPhone);
        setPhoneNumber(englishPhone);

        await requestOtp(englishPhone);
    };

    // نمایش شماره تلفن به صورت فارسی
    const formattedPhone = toPersianNumbers(localPhone);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                    برای ورود یا ثبت‌نام، شماره تلفن همراه خود را وارد کنید. کد تأیید به این شماره ارسال خواهد شد.
                </p>

                <div className={cn(
                    "transition-all duration-200",
                    isFocused ? "transform-none" : "transform-none"
                )}>
                    <InputWithLabel
                        ref={inputRef}
                        label="شماره تلفن همراه"
                        type="tel"
                        value={formattedPhone}
                        onChange={handlePhoneChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className="text-base text-left placeholder:text-right ss02 focus:!border-primary"
                        dir="ltr"
                        required
                        disabled={isLoading}
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl"
                disabled={!isValid || isLoading}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2 w-full">
                        <ThreeDotsLoader color="white" size={3} gap={2} />
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2 w-full">
                        دریافت پیامک ورود
                    </span>
                )}
            </Button>
        </form>
    );
}