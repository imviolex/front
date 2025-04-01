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

const isPendingAppointmentError = (errorMessage: string): boolean => {
    if (!errorMessage) return false;

    const pendingKeywords = [
        'در حال رزرو',
        'شخص دیگری',
        'منتظر بمانید',
        'نوبت دیگری',
        'انتخاب کنید',
        'پندینگ',
        'در دسترس نیست',
        'قبلاً رزرو شده',
        'pending'
    ];

    return pendingKeywords.some(keyword =>
        errorMessage.toLowerCase().includes(keyword.toLowerCase())
    );
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
        if (!isAuthenticated || !user || !selectedBarber || !selectedDate || !selectedTime || selectedServices.length === 0) {
            router.push('/reservation');
        } else {
            const fullName = `${user.firstname || ''} ${user.lastname || ''}`.trim();
            setUserInfo({
                name: fullName,
                phone: user.phone_number || ''
            });
        }
    }, [isAuthenticated, user, selectedBarber, selectedDate, selectedTime, selectedServices, router, setUserInfo]);

    if (!isAuthenticated || !user || !selectedBarber || !selectedDate || !selectedTime || selectedServices.length === 0) {
        return null;
    }

    const handleBack = () => {
        router.push('/reservation');
    };

    const handlePayment = async () => {
        if (!isAuthenticated || !token) {
            toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید");
            router.push('/reservation');
            return;
        }

        toast.info("در حال آماده‌سازی پرداخت...", { duration: 3000 });

        try {
            const result = await createAppointmentAndPayment(token);

            if (result.error) {
                if (result.message && isPendingAppointmentError(result.message)) {
                    await fetchTimeSlots();
                    toast.error("این نوبت در حال رزرو توسط شخص دیگری است. لطفاً منتظر بمانید یا نوبت دیگری انتخاب کنید.", {
                        duration: 4000,
                        position: 'top-center'
                    });
                    return;
                }

                if (result.message && result.message.toLowerCase().includes('نوبت')) {
                    toast.error(result.message, { duration: 4000 });
                    return;
                }

                toast.error(result.message || "خطا در پردازش پرداخت");
                router.push(`/reservation/failure?error=${encodeURIComponent(result.message || '')}`);
                return;
            }

            if (result.paymentUrl) {
                toast.success("در حال انتقال به درگاه پرداخت...");
                window.location.href = result.paymentUrl;
            } else {
                toast.error("خطا در دریافت لینک پرداخت");
                router.push('/reservation/failure');
            }
        } catch (error) {
            console.error("خطا در فرآیند پرداخت:", error);

            let errorMessage = "خطا در برقراری ارتباط با سرور. لطفا بعدا تلاش کنید.";

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

            if (isPendingAppointmentError(errorMessage)) {
                await fetchTimeSlots();
                toast.error("این نوبت در حال رزرو توسط شخص دیگری است. لطفاً منتظر بمانید یا نوبت دیگری انتخاب کنید.", {
                    duration: 4000,
                    position: 'top-center'
                });
                return;
            }

            toast.error(errorMessage);
            router.push(`/reservation/failure?error=${encodeURIComponent(errorMessage)}`);
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
                    {/* باکس پیام مهم */}
                    <div className="flex items-start gap-2 bg-primary/5 p-4 rounded-xl">
                        <AlertTriangle size={16} strokeWidth={2.5} className="shrink-0 text-primary" />
                        <div>
                            <p className="text-sm font-medium text-primary">اطلاعیه مهم</p>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                طبق قوانین رزرو، حداقل ۱۰ دقیقه قبل از ساعت انتخابی {formatTimeSlot(selectedTime)} در سالن حاضر باشید. در صورت تاخیر یا عدم حضور، نوبت به‌طور خودکار لغو می‌شود و بیعانه قابل بازگشت نخواهد بود.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:gap-6">
                        <ServicesSummary />
                    </div>
                </div>
            </ContentCard>
        </div>
    );
}