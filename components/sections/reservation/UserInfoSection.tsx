// src/components/sections/reservation/UserInfoSection.tsx
'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ContentCard } from "@/components/ui/custom/content-card";
import { ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";
import { ServicesSummary } from "./ServicesSummary";
import { useReservationState } from '@/states/reservationState';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";
import { formatTimeSlot } from "@/lib/utils/persian-numbers";
import { ThreeDotsLoader } from '@/components/ui/custom/three-dots-loader';
import type { AxiosError } from "axios";

interface ApiErrorResponse {
    detail?: string | object;
    message?: string;
}

// تابع تشخیص خطای نوبت در حال رزرو (فقط برای مسیرهای خطای غیرمنتظره)
const isPendingAppointmentError = (errorMessage: string): boolean => {
    return errorMessage.includes('در حال رزرو') ||
        errorMessage.includes('شخص دیگری') ||
        errorMessage.includes('منتظر بمانید');
};

export function UserInfoSection() {
    const router = useRouter();
    const {
        selectedServices,
        selectedBarber,
        selectedDate,
        selectedTime,
        setUserInfo,
        isLoading,
        createAppointmentAndPayment,
        fetchTimeSlots
    } = useReservationState();

    const { isAuthenticated, user, token } = useAuth();

    useEffect(() => {
        // اگر کاربر احراز هویت نشده است یا اطلاعات رزرو کامل نیست، به صفحه اصلی رزرو هدایت می‌شود
        if (!isAuthenticated || !user || !selectedBarber || !selectedDate || !selectedTime || selectedServices.length === 0) {
            router.push('/reservation');
        } else {
            // تنظیم اطلاعات کاربر از حساب کاربری
            const fullName = `${user.firstname || ''} ${user.lastname || ''}`.trim();

            // ذخیره اطلاعات کاربر در reservationState
            setUserInfo({
                name: fullName,
                phone: user.phone_number || ''
            });
        }
    }, [isAuthenticated, user, selectedBarber, selectedDate, selectedTime, selectedServices, router, setUserInfo]);

    // اگر کاربر احراز هویت نشده یا اطلاعات رزرو کامل نیست، چیزی نمایش داده نمی‌شود
    if (!isAuthenticated || !user || !selectedBarber || !selectedDate || !selectedTime || selectedServices.length === 0) {
        return null;
    }

    const handleBack = () => {
        router.push('/reservation');
    };

    const handlePayment = async () => {
        // اطمینان از اینکه کاربر احراز هویت شده است
        if (!isAuthenticated || !token) {
            toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید");
            router.push('/reservation');
            return;
        }

        toast.info("در حال آماده‌سازی پرداخت...", { duration: 3000 });

        try {
            // ایجاد نوبت و درخواست پرداخت با ارسال توکن
            const result = await createAppointmentAndPayment(token);

            if (result.error) {
                // بررسی آیا خطا مربوط به نوبت در حال رزرو است
                if (result.message && isPendingAppointmentError(result.message)) {
                    // بروزرسانی لیست نوبت‌ها برای نمایش وضعیت‌های به‌روز
                    await fetchTimeSlots();

                    // عدم هدایت به صفحه شکست برای این نوع خطا
                    return;
                }

                // سایر انواع خطا
                toast.error(result.message || "خطا در پردازش پرداخت");
                // در صورت خطا به صفحه شکست هدایت می‌شود
                router.push('/reservation/failure');
                return;
            }

            // هدایت کاربر به صفحه درگاه پرداخت
            if (result.paymentUrl) {
                toast.success("در حال انتقال به درگاه پرداخت...");
                // انتقال به درگاه پرداخت
                window.location.href = result.paymentUrl;
            } else {
                toast.error("خطا در دریافت لینک پرداخت");
                router.push('/reservation/failure');
            }
        } catch (error) {
            console.error("خطا در فرآیند پرداخت:", error);

            let errorMessage = "خطا در برقراری ارتباط با سرور. لطفا بعدا تلاش کنید.";

            // بررسی نوع خطا
            if (error && typeof error === 'object') {
                const axiosError = error as AxiosError<ApiErrorResponse>;
                if (axiosError.response && axiosError.response.data) {
                    const detail = axiosError.response.data.detail;
                    if (typeof detail === 'string') {
                        errorMessage = detail;
                    } else if (detail && typeof detail === 'object') {
                        try {
                            errorMessage = JSON.stringify(detail);
                        } catch {
                            errorMessage = "خطایی در پردازش درخواست رخ داد";
                        }
                    }
                }
            }

            // بررسی آیا خطا مربوط به نوبت در حال رزرو است
            if (isPendingAppointmentError(errorMessage)) {
                // بروزرسانی لیست نوبت‌ها برای نمایش وضعیت‌های به‌روز
                await fetchTimeSlots();

                // عدم هدایت به صفحه شکست برای این نوع خطا
                return;
            }

            toast.error(errorMessage);
            router.push('/reservation/failure');
        }
    };

    const footerContent = (
        <div className="flex flex-col w-full gap-2">
            <button
                onClick={handleBack}
                className="w-full text-sm font-bold text-muted-foreground hover:text-muted-foreground hover:bg-transparent flex items-center justify-center gap-2 h-10"
                disabled={isLoading}
            >
                <ArrowRight size={16} strokeWidth={2.5} className="shrink-0" />
                بازگشت به مرحله قبل
            </button>
            <div className="w-[calc(100%+2rem)] h-px bg-border -mx-4" />
            <button
                onClick={handlePayment}
                className="w-full text-sm font-bold text-primary/70 hover:text-primary/70 hover:bg-transparent flex items-center justify-center gap-2 h-10"
                disabled={isLoading}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <ThreeDotsLoader color="currentColor" size={3} gap={2} />
                    </span>
                ) : (
                    <>
                        <ArrowLeft size={16} strokeWidth={2.5} className="shrink-0" />
                        پرداخت نهایی
                    </>
                )}
            </button>
        </div>
    );

    return (
        <div className="pt-20">
            <ContentCard
                footerContent={footerContent}
            >
                <div className="grid grid-cols-1 gap-8 md:gap-6">
                    <div>
                        <p className="text-sm md:text-base leading-relaxed text-justify [text-align-last:right] [word-spacing:-1px]">
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد.
                        </p>

                        {/* باکس پیام همیشه نمایش داده می‌شود - بدون شرط */}
                        <div className="flex items-start gap-2 mt-4 bg-primary/5 p-4 rounded-xl">
                            <AlertTriangle size={16} strokeWidth={2.5} className="shrink-0 text-primary" />
                            <div>
                                <p className="text-sm font-medium text-primary">اطلاعیه مهم</p>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                    طبق قوانین رزرو، حداقل ۱۰ دقیقه قبل از ساعت انتخابی {formatTimeSlot(selectedTime)} در سالن حاضر باشید. در صورت تاخیر یا عدم حضور، نوبت به‌طور خودکار لغو می‌شود و بیعانه قابل بازگشت نخواهد بود.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:gap-6">
                        {/* خلاصه خدمات */}
                        <ServicesSummary />
                    </div>
                </div>
            </ContentCard>
        </div>
    );
}