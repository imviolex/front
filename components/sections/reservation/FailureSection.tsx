// src/components/sections/reservation/FailureSection.tsx
'use client';

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ContentCard } from "@/components/ui/custom/content-card";
import { XCircle } from "lucide-react";
import { useReservationState } from '@/states/reservationState';
import { useAuth } from '@/hooks/useAuth';

export function FailureSection() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { userInfo, appointmentId, getPaymentStatus } = useReservationState();
    const { token } = useAuth();

    // دریافت پیام خطا از URL
    const error = searchParams.get('error');

    // تنظیم مسیر فعال به رزرو
    useEffect(() => {
        // اگر در یکی از صفحات زیرمجموعه رزرو هستیم، فعال کردن منوی "رزرو نوبت"
        // این بخش به جاوااسکریپت گلوبال اضافه خواهد شد تا منو را به روز کند
        if (pathname && pathname.includes('/reservation')) {
            try {
                // تلاش برای یافتن و به‌روزرسانی منوی فعال (این کد در سمت کلاینت اجرا می‌شود)
                if (typeof window !== 'undefined') {
                    const event = new CustomEvent('update-active-route', { detail: 'reservation' });
                    window.dispatchEvent(event);
                }
            } catch (e) {
                console.error('Error updating active route', e);
            }
        }
    }, [pathname]);

    useEffect(() => {
        // دریافت جزئیات خطای پرداخت از سرور (فقط برای لاگ کردن در کنسول)
        const checkPaymentError = async () => {
            if (appointmentId && token) {
                try {
                    // اضافه کردن توکن به فراخوانی تابع
                    const response = await getPaymentStatus(appointmentId, token);
                    if (response.error) {
                        console.log("Payment error:", response.message);
                    } else if (response.data?.status === 'FAILED') {
                        console.log("Payment failed:", response.data.message || 'پرداخت با مشکل مواجه شد.');
                    }
                } catch (err) {
                    console.error("Error fetching payment status:", err);
                }
            }
        };

        // فقط اگر خطایی در URL نیست، وضعیت پرداخت را بررسی کن
        if (!error && appointmentId && token) {
            checkPaymentError();
        }

        // فقط اگر هیچ خطایی در URL نیست و کاربر اطلاعات کاربری را وارد نکرده، به صفحه اصلی هدایت کن
        if (!userInfo && !error) {
            router.push('/reservation');
        }
    }, [userInfo, router, error, appointmentId, getPaymentStatus, token]);

    // اگر داده‌های لازم موجود نیست و خطایی در URL نداریم، هیچ چیزی رندر نکن
    if (!userInfo && !error) {
        return null;
    }

    return (
        <div className="pt-20">
            <ContentCard>
                <div className="grid grid-cols-1 gap-4 md:gap-4">
                    <div className="flex flex-col items-center py-3">
                        <XCircle className="w-20 h-20 text-[hsl(0,66%,44%)] mb-3" strokeWidth={1.5} />
                        <h2 className="text-xl font-bold">پرداخت ناموفق</h2>
                        <p className="text-base mt-1 mb-0">
                            متأسفانه پرداخت شما با مشکل مواجه شد
                        </p>
                    </div>

                    <div className="space-y-5">
                        <div className="cursor-pointer rounded-xl p-6 bg-muted/40 border w-full">
                            <div className="flex gap-3">
                                <div>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        متأسفیم! به نظر می‌رسد مشکلی در پردازش پرداخت شما به وجود آمده است. لطفاً از کافی بودن موجودی حساب خود اطمینان حاصل کنید و در صورت امکان، مجدداً تلاش کنید یا روش پرداخت دیگری را امتحان نمایید.
                                    </p>
                                    <p className="text-sm mt-3 leading-relaxed text-muted-foreground">
                                        اگر مبلغی از حساب شما کسر شده اما پرداخت نهایی نشده است، معمولاً طی چند ساعت تا ۷۲ ساعت به حساب شما بازگردانده می‌شود. در صورت نیاز به راهنمایی بیشتر، لطفاً با پشتیبانی تماس بگیرید.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ContentCard>
        </div>
    );
}