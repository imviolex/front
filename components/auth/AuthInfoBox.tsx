// src/components/auth/AuthInfoBox.tsx
'use client';

import { motion } from 'framer-motion';
import { LogIn, LogOut, UserPlus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { useAuth } from '@/hooks/useAuth';

const toPersianNumber = (num: string | number) =>
    num.toString().replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(digit)]);

export function AuthInfoBox() {
    const {
        user,
        isAuthenticated,
        hasIncompleteRegistration,
        openAuthDrawer,
        logout,
        isProfileComplete,
        getFullName,
        openEditProfileDrawer
    } = useAuth();

    // اگر کاربر احراز هویت شده و پروفایل کامل دارد، اطلاعات کاربر را نمایش می‌دهیم
    if (isAuthenticated && isProfileComplete()) {
        return (
            <div className="rounded-2xl p-6 bg-muted/40 border w-full shadow-sm backdrop-blur-md">
                <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-semibold text-foreground">
                            اطلاعات کاربر
                        </div>
                        <div className="flex gap-0.5">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={logout}
                                className="text-muted-foreground hover:bg-transparent hover:text-inherit"
                            >
                                <LogOut size={16} strokeWidth={2.5} className="ml-1" />
                                خروج
                            </Button>
                        </div>
                    </div>

                    <div className="relative bg-muted/30 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-inner">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={openEditProfileDrawer}
                            className="absolute left-2 top-2 text-muted-foreground hover:bg-transparent hover:text-inherit p-1 h-auto"
                        >
                            <Edit size={16} strokeWidth={2.5} />
                        </Button>
                        <div>
                            <p className="text-xs text-muted-foreground">نام و نام خانوادگی</p>
                            <p className="text-sm font-medium">
                                {getFullName() || '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">شماره موبایل</p>
                            <p className="text-sm font-medium ltr text-foreground">
                                {user?.phone_number ? toPersianNumber(user.phone_number) : '—'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // اگر کاربر احراز هویت شده اما پروفایل ناقص دارد، پیام تکمیل پروفایل نمایش می‌دهیم
    if (isAuthenticated && hasIncompleteRegistration) {
        return (
            <motion.div
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="cursor-pointer rounded-xl p-6 bg-muted/40 border w-full"
            >
                <div className="flex flex-col gap-4 items-center">
                    <h3 className="font-bold text-foreground flex items-center gap-2 justify-center">
                        <UserPlus size={20} strokeWidth={2.5} />
                        تکمیل اطلاعات کاربری
                    </h3>

                    <p className="text-xs text-muted-foreground text-center">
                        برای ادامه استفاده از خدمات، لطفاً اطلاعات حساب کاربری خود را تکمیل کنید.
                    </p>

                    <Button
                        onClick={openAuthDrawer}
                        className="mt-2 h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl shadow hover:shadow-md transition-shadow w-64 mx-auto block"
                    >
                        تکمیل اطلاعات
                    </Button>
                </div>
            </motion.div>
        );
    }

    // برای کاربری که لاگین نشده، دکمه ورود/ثبت‌نام را نمایش می‌دهیم
    return (
        <motion.div
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="cursor-pointer rounded-xl p-6 bg-muted/40 border w-full"
        >
            <div className="flex flex-col gap-4 items-center">
                <h3 className="font-bold text-foreground flex items-center gap-2 justify-center">
                    <LogIn size={20} strokeWidth={2.5} />
                    ورود / ثبت‌نام
                </h3>

                <p className="text-xs text-muted-foreground text-center">
                    برای رزرو نوبت، لطفاً وارد حساب کاربری خود شوید یا ثبت‌نام کنید.
                </p>

                <Button
                    onClick={openAuthDrawer}
                    className="mt-2 h-10 bg-primary hover:bg-primary/90 text-white text-sm rounded-xl shadow hover:shadow-md transition-shadow w-48 mx-auto block"
                >
                    ورود / ثبت‌نام
                </Button>
            </div>
        </motion.div>
    );
}