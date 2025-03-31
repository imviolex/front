// src/components/sections/reservation/IntroSection.tsx
'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ContentCard } from "@/components/ui/custom/content-card";
import { Info, ArrowRight, AlertTriangle } from "lucide-react";
import { BarberSelection } from "./BarberSelection";
import { DateSelection } from "./DateSelection";
import { TimeSelection } from "./TimeSelection";
import { ServicesSelection } from "./ServicesSelection";
import { useReservationState } from '@/states/reservationState';
import { toPersianNumbers, formatTimeSlot } from "@/lib/utils/persian-numbers";
import { toast } from "sonner";
import { ThreeDotsLoader } from "@/components/ui/custom/three-dots-loader";
import { AuthInfoBox } from '@/components/auth/AuthInfoBox';
import { AuthDrawer } from '@/components/auth/AuthDrawer';
import { useAuth } from '@/hooks/useAuth';

export function IntroSection() {
    const router = useRouter();
    const {
        selectedBarber,
        selectedDate,
        selectedTime,
        selectedServices,
        setFormStep,
        reset,
        needsDoubleSlot,
        totalDuration
    } = useReservationState();

    const {
        isAuthenticated,
        checkIncompleteRegistration,
        isProfileComplete,
        hasIncompleteRegistration,
        openAuthDrawer
    } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);

    // بررسی وضعیت ثبت‌نام ناقص هنگام بارگذاری صفحه
    useEffect(() => {
        checkIncompleteRegistration();
    }, [checkIncompleteRegistration]);

    // اگر کاربر احراز هویت شده اما ثبت‌نام ناقص دارد، درایور را باز می‌کنیم
    useEffect(() => {
        if (isAuthenticated && hasIncompleteRegistration) {
            openAuthDrawer();
        }
    }, [isAuthenticated, hasIncompleteRegistration, openAuthDrawer]);

    useEffect(() => {
        reset();
        setFormStep('services');
    }, [reset, setFormStep]);

    const getNextTimeSlot = (time: string | null) => {
        if (!time) return '';

        const [, end] = time.split('-'); // استفاده از _ برای نشان دادن عدم استفاده از start

        // تبدیل به ساعت و دقیقه
        const nextSlotStart = end; // استفاده از const به جای let
        let nextSlotEnd;

        if (end.length === 4) { // فرمت 1030
            const hour = parseInt(end.slice(0, 2));
            const minute = parseInt(end.slice(2));

            // محاسبه 30 دقیقه بعد
            let newMinute = minute + 30;
            let newHour = hour;

            if (newMinute >= 60) {
                newHour++;
                newMinute -= 60;
            }

            nextSlotEnd = `${newHour}${newMinute === 0 ? '00' : newMinute}`;
        } else { // فرمت ساده ساعت
            const hour = parseInt(end);
            nextSlotEnd = `${hour + 1}`;
        }

        return `${nextSlotStart}-${nextSlotEnd}`;
    };

    const handleContinue = async () => {
        if (!selectedBarber) {
            toast.error("آرایشگر مورد نظر را انتخاب کنید", {
                duration: 4000,
            });
            return;
        }

        if (selectedServices.length === 0) {
            toast.error("حداقل یک خدمت را انتخاب کنید", {
                duration: 4000,
            });
            return;
        }

        if (!selectedDate) {
            toast.error("تاریخ مورد نظر را انتخاب کنید", {
                duration: 4000,
            });
            return;
        }

        if (!selectedTime) {
            toast.error("ساعت مورد نظر را انتخاب کنید", {
                duration: 4000,
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // شبیه‌سازی تاخیر برای نمایش لودر (در پروژه واقعی این خط حذف شود)
            await new Promise(resolve => setTimeout(resolve, 1500));

            setFormStep('userInfo');
            router.push('/reservation/checkout');
        } catch (error) {
            console.error('خطا در هدایت به صفحه پرداخت:', error);
            toast.error('خطایی رخ داد. لطفاً دوباره تلاش کنید.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // اگر کاربر احراز هویت نشده یا پروفایلش تکمیل نیست، AuthInfoBox و AuthDrawer را نمایش می‌دهیم
    if (!isAuthenticated || !isProfileComplete()) {
        return (
            <div className="w-full max-w-3xl mx-auto px-1 pt-20">
                <AuthInfoBox />
                <AuthDrawer />
            </div>
        );
    }

    // اگر کاربر احراز هویت شده و پروفایلش تکمیل است، فرم رزرو را نمایش می‌دهیم
    return (
        <div className="pt-20">
            <ContentCard
                footerText={
                    isSubmitting ?
                        <span className="flex items-center justify-center gap-2 w-full">
                        <ThreeDotsLoader color="currentColor" size={3} gap={2}/>
                    </span> :
                        "ادامه و ثبت اطلاعات"
                }
                footerIcon={!isSubmitting && <ArrowRight size={16} strokeWidth={2.5} className="shrink-0 text-primary/70" />}
                onFooterClick={handleContinue}
                isFooterDisabled={isSubmitting}
            >
                <div className="grid grid-cols-1 gap-8 md:gap-6">
                    <div>
                        <p className="text-sm md:text-base leading-relaxed text-justify [text-align-last:right] [word-spacing:-1px]">
                            <span className="text-primary font-bold ml-1 inline-block">
                                رزرو نوبت
                            </span>
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد.
                        </p>
                        <div className="flex items-center gap-2 mt-4 bg-muted/50 p-4 rounded-xl">
                            <Info size={16} strokeWidth={2.5} className="shrink-0 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده میکند
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:gap-9">
                        {/* انتخاب آرایشگر */}
                        <BarberSelection />

                        {/* انتخاب خدمات */}
                        <div className="space-y-6">
                            <ServicesSelection />
                        </div>

                        {/* فیلدهای تاریخ و ساعت */}
                        <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
                            <DateSelection />
                            <TimeSelection />
                        </div>

                        {/* هشدار رزرو دو نوبت متوالی */}
                        {needsDoubleSlot && selectedTime && (
                            <div className="flex items-start gap-2 bg-primary/5 p-4 rounded-xl">
                                <AlertTriangle size={16} strokeWidth={2.5} className="shrink-0 text-primary" />
                                <div>
                                    <p className="text-sm font-medium text-primary">رزرو دو نوبت متوالی</p>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                        با توجه به مجموع زمان خدمات انتخابی {toPersianNumbers(totalDuration)}   دقیقه،
                                        دو نوبت متوالی {formatTimeSlot(selectedTime)} و {formatTimeSlot(getNextTimeSlot(selectedTime))} برای شما رزرو خواهد شد.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </ContentCard>
        </div>
    );
}