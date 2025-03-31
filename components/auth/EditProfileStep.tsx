// src/components/auth/EditProfileStep.tsx
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

export function EditProfileStep() {
    const {
        user,
        updateProfile,
        isLoading
        // closeAuthDrawer حذف شده چون استفاده نمی‌شود
    } = useAuth();

    const [firstname, setFirstname] = useState(user?.firstname || '');
    const [lastname, setLastname] = useState(user?.lastname || '');

    // ذخیره مقادیر اولیه برای مقایسه
    const [initialFirstname, setInitialFirstname] = useState(user?.firstname || '');
    const [initialLastname, setInitialLastname] = useState(user?.lastname || '');

    const [isFormValid, setIsFormValid] = useState(false);
    const [isFormChanged, setIsFormChanged] = useState(false);

    // بررسی اعتبار فرم - فقط بررسی میکند آیا فرم معتبر است یا خیر
    useEffect(() => {
        setIsFormValid(
            firstname.trim().length >= 2 &&
            lastname.trim().length >= 2 &&
            isPersianText(firstname) &&
            isPersianText(lastname)
        );

        // بررسی تغییرات فرم
        setIsFormChanged(
            firstname.trim() !== initialFirstname.trim() ||
            lastname.trim() !== initialLastname.trim()
        );
    }, [firstname, lastname, initialFirstname, initialLastname]);

    // فقط یک بار در زمان بارگذاری کامپوننت اجرا می‌شود
    // و مقادیر اولیه را از user موجود پر می‌کند
    useEffect(() => {
        // فقط یکبار در شروع اجرا می‌شود
        if (user) {
            const userFirstname = user.firstname || '';
            const userLastname = user.lastname || '';

            setFirstname(userFirstname);
            setLastname(userLastname);

            // ذخیره مقادیر اولیه
            setInitialFirstname(userFirstname);
            setInitialLastname(userLastname);
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

        if (!isFormChanged) {
            toast.info('تغییری در اطلاعات ایجاد نشده است');
            return;
        }

        // فقط رد کردن درخواست به authState - پیام موفقیت در آنجا نمایش داده می‌شود
        await updateProfile(firstname.trim(), lastname.trim());
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 h-full flex flex-col justify-between">
            <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-4">
                    اطلاعات شخصی خود را ویرایش کنید.
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

            <div className="flex flex-col gap-2">
                <Button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl"
                    disabled={!isFormValid || !isFormChanged || isLoading}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <ThreeDotsLoader color="white" size={3} gap={2}/>
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            ذخیره تغییرات
                        </span>
                    )}
                </Button>
            </div>
        </form>
    );
}