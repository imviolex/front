// src/components/auth/OtpInputStep.tsx
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/shadcn/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { toPersianNumbers, toEnglishNumbers } from '@/lib/utils/persian-numbers';
import { cn } from "@/lib/utils";
import { ThreeDotsLoader } from '@/components/ui/custom/three-dots-loader';

export function OtpInputStep() {
    const {
        phoneNumber,
        otpExpiry,
        verifyOtp,
        requestOtp,
        setCurrentStep,
        isLoading,
        saveIncompleteRegistration,
        user,
        token
    } = useAuth();

    const [otp, setOtp] = useState(['', '', '', '']);

    // تعریف رفرنس‌ها
    const inputRef0 = useRef<HTMLInputElement>(null);
    const inputRef1 = useRef<HTMLInputElement>(null);
    const inputRef2 = useRef<HTMLInputElement>(null);
    const inputRef3 = useRef<HTMLInputElement>(null);

    // استفاده از useMemo برای ایجاد آرایه‌ای که در رندرهای مجدد تغییر نمی‌کند
    const inputRefs = useMemo(() => [inputRef0, inputRef1, inputRef2, inputRef3], []);

    const [remainingTime, setRemainingTime] = useState(0);
    const [canResend, setCanResend] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [autoSubmitEnabled, setAutoSubmitEnabled] = useState(true);
    const [activeInputIndex, setActiveInputIndex] = useState(0);

    // محاسبه زمان باقی‌مانده
    useEffect(() => {
        if (!otpExpiry) return;

        const calculateRemainingTime = () => {
            const diff = otpExpiry - Date.now();
            return Math.max(0, Math.floor(diff / 1000));
        };

        setRemainingTime(calculateRemainingTime());

        const timer = setInterval(() => {
            const newRemainingTime = calculateRemainingTime();
            setRemainingTime(newRemainingTime);

            if (newRemainingTime <= 0) {
                setCanResend(true);
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [otpExpiry]);

    // فوکوس روی اولین اینپوت در هنگام بارگذاری
    useEffect(() => {
        if (inputRefs[0].current) {
            setTimeout(() => {
                inputRefs[0].current?.focus();
            }, 100);
        }
    }, [inputRefs]); // اضافه کردن inputRefs به آرایه وابستگی‌ها

    // فوکوس کردن روی اینپوت فعال هر زمان که شاخص فعال تغییر می‌کند
    useEffect(() => {
        if (activeInputIndex >= 0 && activeInputIndex < 4 && inputRefs[activeInputIndex].current) {
            inputRefs[activeInputIndex].current?.focus();
        }
    }, [activeInputIndex, inputRefs]); // اضافه کردن inputRefs به آرایه وابستگی‌ها

    // به‌روزرسانی شاخص اینپوت فعال بر اساس تغییر otp
    useEffect(() => {
        // پیدا کردن اولین اینپوت خالی
        const firstEmptyIndex = otp.findIndex(digit => digit === '');
        if (firstEmptyIndex !== -1) {
            setActiveInputIndex(firstEmptyIndex);
        }
        // اگر همه پر شده‌اند، آخرین اینپوت را فعال نگه می‌داریم
    }, [otp]);

    // اضافه کردن useEffect برای ذخیره وضعیت ثبت‌نام ناقص
    useEffect(() => {
        // وقتی کاربر و توکن موجود هستند اما احراز هویت ناقص است
        if (user && token && (!user.firstname || !user.lastname)) {
            // ذخیره وضعیت ثبت‌نام ناقص
            saveIncompleteRegistration(user.phone_number, token);
        }
    }, [user, token, saveIncompleteRegistration]);

    const handleVerify = useCallback(async () => {
        const fullOtp = otp.join('');
        if (fullOtp.length !== 4) {
            toast.error('لطفاً کد ۴ رقمی را کامل وارد کنید');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await verifyOtp(phoneNumber, fullOtp);

            // اگر خطا رخ داده باشد (نتیجه نادرست باشد)
            if (!result) {
                // علامت‌گذاری برای جلوگیری از ارسال خودکار مجدد
                setHasError(true);

                // غیرفعال کردن ارسال خودکار برای این نشست
                setAutoSubmitEnabled(false);

                // پاک کردن فیلدها
                setOtp(['', '', '', '']);
                setActiveInputIndex(0);
            } else {
                // اگر تأیید موفق بود و پروفایل ناقص است، وضعیت ثبت‌نام ناقص را ذخیره می‌کنیم
                const currentUser = user;
                const currentToken = token;

                if (currentUser && currentToken && (!currentUser.firstname || !currentUser.lastname)) {
                    saveIncompleteRegistration(currentUser.phone_number, currentToken);
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [otp, phoneNumber, verifyOtp, setHasError, setAutoSubmitEnabled, setOtp, setActiveInputIndex, user, token, saveIncompleteRegistration]);

    // اجرای خودکار submit وقتی کد کامل می‌شود - فقط اگر autoSubmitEnabled فعال باشد
    useEffect(() => {
        const isComplete = otp.every(digit => digit !== '');
        if (isComplete && autoSubmitEnabled && !isSubmitting && !isLoading && !hasError) {
            handleVerify();
        }
    }, [otp, isSubmitting, isLoading, autoSubmitEnabled, hasError, handleVerify]);

    // ریست کردن وضعیت خطا هنگام تغییر کد
    useEffect(() => {
        if (hasError) {
            setHasError(false);
        }
    }, [otp, hasError]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${toPersianNumbers(mins.toString())}:${secs < 10 ? '۰' : ''}${toPersianNumbers(secs.toString())}`;
    };

    const handleResendOtp = async () => {
        if (!canResend) return;

        // ریست کردن وضعیت‌ها
        setCanResend(false);
        setHasError(false);
        setAutoSubmitEnabled(true);
        setOtp(['', '', '', '']);
        setActiveInputIndex(0);

        // درخواست مجدد کد
        await requestOtp(phoneNumber);
    };

    const handleEditPhoneNumber = () => {
        setCurrentStep('phone');
    };

    // فرمت کردن شماره تلفن به فارسی
    const formatPhoneNumber = (phone: string) => {
        if (!phone) return '';
        return toPersianNumbers(phone);
    };

    // پردازش ورودی OTP
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;

        // تبدیل اعداد فارسی به انگلیسی
        const englishValue = toEnglishNumbers(value);

        // فقط اعداد را قبول می‌کنیم
        const lastChar = englishValue.slice(-1).replace(/[^0-9]/g, '');

        if (lastChar) {
            const newOtp = [...otp];
            newOtp[index] = lastChar;
            setOtp(newOtp);

            // انتقال به فیلد بعدی اگر وجود داشته باشد
            if (index < 3) {
                setActiveInputIndex(index + 1);
            }
        } else if (value === '') {
            // در صورت پاک کردن، مقدار را خالی می‌کنیم
            const newOtp = [...otp];
            newOtp[index] = '';
            setOtp(newOtp);
        }
    };

    // پردازش کلید Backspace
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            if (otp[index] === '') {
                // اگر فیلد خالی است و کلید Backspace زده شده، به فیلد قبلی برمی‌گردیم
                if (index > 0) {
                    setActiveInputIndex(index - 1);

                    // خالی کردن فیلد قبلی
                    const newOtp = [...otp];
                    newOtp[index - 1] = '';
                    setOtp(newOtp);
                }
            } else {
                // اگر فیلد پر است، آن را خالی می‌کنیم
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            // حرکت به سمت چپ با کلید جهت‌نما
            setActiveInputIndex(index - 1);
        } else if (e.key === 'ArrowRight' && index < 3) {
            // حرکت به سمت راست با کلید جهت‌نما
            setActiveInputIndex(index + 1);
        }
    };

    // پردازش Paste
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const cleanedData = toEnglishNumbers(pastedData).replace(/[^0-9]/g, '').slice(0, 4);

        if (cleanedData) {
            const newOtp = [...otp];
            for (let i = 0; i < cleanedData.length; i++) {
                if (i < 4) {
                    newOtp[i] = cleanedData[i];
                }
            }
            setOtp(newOtp);

            // تنظیم فوکوس بر اساس تعداد ارقام paste شده
            setActiveInputIndex(Math.min(cleanedData.length, 3));
        }
    };

    // بررسی می‌کند آیا اینپوت باید غیرفعال باشد
    const isInputDisabled = (index: number): boolean => {
        if (isLoading || isSubmitting) return true;
        // اینپوت نباید غیرفعال باشد اگر:
        // 1. این اینپوت فعال است (شاخص آن برابر activeInputIndex است)
        // 2. این اینپوت خودش پر شده است
        return index > activeInputIndex && otp[index] === '';
    };

    return (
        <div className="flex flex-col h-full justify-between">
            <div className="space-y-5">
                <div className="flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground">
                        کد تأیید برای شماره{' '}
                        <button
                            onClick={handleEditPhoneNumber}
                            className="font-medium text-primary ltr inline-block hover:underline focus:outline-none"
                            disabled={isLoading || isSubmitting}
                        >
                            {formatPhoneNumber(phoneNumber)}
                        </button>{' '}
                        ارسال شد. لطفاً کد دریافتی را وارد کنید.
                    </p>

                    <div className="flex justify-center py-3" dir="ltr">
                        <div className="flex items-center justify-center gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={inputRefs[index]}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete={index === 0 ? "one-time-code" : "off"}
                                    maxLength={1}
                                    value={toPersianNumbers(digit)}
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onPaste={index === 0 ? handlePaste : undefined}
                                    disabled={isInputDisabled(index)}
                                    onFocus={() => setActiveInputIndex(index)}
                                    className={cn(
                                        "w-12 h-12 border-2 border-input rounded-xl text-lg",
                                        "flex items-center justify-center bg-card text-center font-semibold",
                                        "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                                        "disabled:cursor-not-allowed disabled:opacity-50",
                                        hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                                        isInputDisabled(index) && "bg-muted cursor-not-allowed",
                                        index === activeInputIndex && "border-primary ring-2 ring-primary/20"
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    {hasError && (
                        <p className="text-sm text-red-500 text-center">
                            کد وارد شده نامعتبر است. لطفاً مجدداً تلاش کنید.
                        </p>
                    )}

                    {/* دکمه ارسال مجدد و تایمر */}
                    <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-3 space-x-reverse">
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                className={cn(
                                    "text-sm font-medium flex items-center",
                                    canResend ? "text-primary hover:underline" : "text-muted-foreground cursor-default"
                                )}
                                disabled={!canResend || isLoading || isSubmitting}
                            >
                                ارسال مجدد کد
                            </button>

                            <div className="flex items-center gap-1 text-sm text-muted-foreground mr-2">
                                <span dir="ltr">{canResend ? '۰:۰۰' : formatTime(remainingTime)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* دکمه تایید */}
            <div className="mt-auto pt-6">
                <Button
                    type="button"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl"
                    onClick={handleVerify}
                    disabled={otp.some(digit => digit === '') || isLoading || isSubmitting}
                >
                    {isLoading || isSubmitting ? (
                        <span className="flex items-center justify-center gap-2 w-full">
                            <ThreeDotsLoader color="white" size={3} gap={2}/>
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2 w-full">
                            تأیید و ادامه
                        </span>
                    )}
                </Button>
            </div>
        </div>
    );
}