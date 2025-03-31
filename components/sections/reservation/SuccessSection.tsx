// src/components/sections/reservation/SuccessSection.tsx
'use client';

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ContentCard } from "@/components/ui/custom/content-card";
import { CheckCircle } from "lucide-react";
import { useReservationState } from '@/states/reservationState';
import { toPersianNumbers, formatTimeSlot, toPersianPrice, formatPersianDate } from "@/lib/utils/persian-numbers";
import { reservationApi } from "@/lib/api/reservation";
import { useAuth } from '@/hooks/useAuth';
import type { AppointmentDetails } from '@/types/reservation';
import { toast } from 'sonner';
import {
    RefIdSkeleton,
    BarberNameSkeleton,
    DateSkeleton,
    TimeSkeleton,
    ServicesSkeleton,
    TotalPriceSkeleton,
    PaidAmountSkeleton
} from "./SuccessSection.skeleton";

// تعریف پراپ‌های کامپوننت با refId و isPageLoading
interface SuccessSectionProps {
    refId: string | null;
    isPageLoading?: boolean;
}

export function SuccessSection({ refId, isPageLoading = false }: SuccessSectionProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null);

    // ترکیب وضعیت بارگذاری کامپوننت و صفحه
    const isFinalLoading = isLoading || isPageLoading;

    const {
        selectedBarber,
        selectedDate,
        selectedTime,
        selectedServices,
        barbers,
        services,
        totalPrice,
        needsDoubleSlot,
        paymentRefId,
        setPaymentRefId
    } = useReservationState();

    // تنظیم مسیر فعال به رزرو
    useEffect(() => {
        if (pathname && pathname.includes('/reservation')) {
            try {
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
        // اگر شماره پیگیری موجود است، آن را در state ذخیره می‌کنیم و جزئیات را دریافت می‌کنیم
        if (refId && token) {
            setPaymentRefId(refId);

            const fetchAppointmentDetails = async () => {
                try {
                    setIsLoading(true);
                    const response = await reservationApi.getAppointmentDetailsByRefId(refId, token);

                    if (!response.error && response.data) {
                        setAppointmentDetails(response.data);
                    } else {
                        console.error("Error fetching appointment details:", response.message);

                        if (response.status === 403 || (response.message && (
                            response.message.includes('مجاز') ||
                            response.message.includes('دسترسی') ||
                            response.message.includes('Forbidden')
                        ))) {
                            toast.error('شما مجاز به مشاهده جزئیات این نوبت نیستید');
                            router.push('/reservation');
                        } else {
                            toast.error('خطا در دریافت جزئیات نوبت');
                        }
                    }
                } catch (error) {
                    console.error("Error fetching appointment details:", error);
                    toast.error('خطا در برقراری ارتباط با سرور');
                } finally {
                    setIsLoading(false);
                }
            };

            fetchAppointmentDetails();
        }
        // به جای آن، فقط لودینگ را متوقف می‌کنیم بدون ریدایرکت
        else {
            // اگر refId نداریم ولی صفحه success هستیم، فقط لودینگ را متوقف کن
            setIsLoading(false);
        }
    }, [refId, setPaymentRefId, router, token]);

    // ایجاد یک تابع کمکی برای دریافت مقدار از appointmentDetails یا state
    const getValue = <T,>(detailsValue: T | undefined, stateValue: T | undefined): T | undefined => {
        // اگر جزئیات نوبت موجود است، از آن استفاده کن
        if (appointmentDetails && detailsValue !== undefined) {
            return detailsValue;
        }
        // در غیر این صورت، از state استفاده کن
        return stateValue;
    };

    // استفاده از first_name و last_name به جای name
    const barberName = getValue(
        appointmentDetails?.barber_name,
        barbers.find(b => String(b.id) === selectedBarber)
            ? `${barbers.find(b => String(b.id) === selectedBarber)?.first_name} ${barbers.find(b => String(b.id) === selectedBarber)?.last_name}`
            : undefined
    );

    const appointmentDate = appointmentDetails?.date || (selectedDate ? selectedDate.formatted : undefined);
    const timeSlot = getValue(appointmentDetails?.time, selectedTime);
    const isDoubleSlot = getValue(appointmentDetails?.double_slot, needsDoubleSlot);
    const secondSlot = getValue(appointmentDetails?.second_slot, undefined);
    const totalAmount = getValue(appointmentDetails?.total_price, totalPrice);
    const refIdToDisplay = refId || paymentRefId || (appointmentDetails?.payment?.ref_id || '');

    // تبدیل لیست خدمات انتخاب شده به نام‌های آنها
    const serviceItems = appointmentDetails?.services ||
        selectedServices
            .map(serviceId => services.find(s => s.id === serviceId))
            .filter((s): s is NonNullable<typeof s> => s !== undefined);

    // تابع دریافت نوبت بعدی
    const getNextTimeSlot = (timeStr: string) => {
        if (!timeStr) return '';
        const [, end] = timeStr.split('-');

        const extractTimeComponents = (timeStr: string) => {
            if (timeStr.length <= 2) {
                return { hour: parseInt(timeStr), minute: 0 };
            } else {
                const hour = parseInt(timeStr.slice(0, timeStr.length - 2));
                const minute = parseInt(timeStr.slice(-2));
                return { hour, minute };
            }
        };

        const endTime = extractTimeComponents(end);

        let nextHour = endTime.hour;
        let nextMinute = endTime.minute + 30;

        if (nextMinute >= 60) {
            nextHour += 1;
            nextMinute -= 60;
        }

        const formatTime = (hour: number, minute: number) => {
            if (minute === 0) {
                return hour.toString();
            } else {
                return `${hour}${minute}`;
            }
        };

        const nextTimeEnd = formatTime(nextHour, nextMinute);

        return `${end}-${nextTimeEnd}`;
    };

    const nextTimeSlot = secondSlot || (timeSlot ? getNextTimeSlot(timeSlot) : '');

    // انتخاب زمان مناسب برای نمایش در پیام هشدار
    const displayTimeSlot = appointmentDetails?.time || selectedTime;

    return (
        <div className="pt-20">
            <ContentCard>
                <div className="grid grid-cols-1 gap-4 md:gap-4">
                    <div className="flex flex-col items-center py-3">
                        <CheckCircle className="w-20 h-20 text-[hsl(166,56%,33%)] mb-3" strokeWidth={1.5} />
                        <h2 className="text-xl font-bold">پرداخت موفق</h2>
                        <div className="text-base mt-1 mb-0">
                            نوبت شما با موفقیت رزرو شد
                        </div>
                        <div className="text-sm mt-2 text-muted-foreground flex items-center gap-2">
                            <span>شماره پیگیری:</span>
                            {isFinalLoading ? (
                                <RefIdSkeleton />
                            ) : (
                                <span>{refIdToDisplay ? toPersianNumbers(refIdToDisplay) : '-'}</span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="cursor-pointer rounded-xl p-6 bg-muted/40 border w-full">
                            <h3 className="font-bold text-foreground mb-4 text-right">جزئیات نوبت رزرو شده</h3>

                            <div className="space-y-2">
                                {/* اطلاعات نوبت */}
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">آرایشگر:</span>
                                    {isFinalLoading ? (
                                        <BarberNameSkeleton />
                                    ) : (
                                        <span className="text-sm text-foreground">
                                            {barberName || '-'}
                                        </span>
                                    )}
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">تاریخ:</span>
                                    {isFinalLoading ? (
                                        <DateSkeleton />
                                    ) : (
                                        <span className="text-sm text-foreground">
                                            {appointmentDate ? formatPersianDate(appointmentDate) : '-'}
                                        </span>
                                    )}
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">ساعت:</span>
                                    {isFinalLoading ? (
                                        <TimeSkeleton />
                                    ) : (
                                        <span className="text-sm text-foreground">
                                            {timeSlot ? (
                                                isDoubleSlot ?
                                                    `${formatTimeSlot(timeSlot)} و ${formatTimeSlot(nextTimeSlot)}` :
                                                    formatTimeSlot(timeSlot)
                                            ) : '-'}
                                        </span>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-border mt-2">
                                    {isFinalLoading ? (
                                        <ServicesSkeleton />
                                    ) : (
                                        // نمایش خدمات واقعی
                                        serviceItems && serviceItems.map((service) => (
                                            <div key={service.id} className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-muted-foreground">
                                                    {service.name}
                                                </span>
                                                <span className="text-sm text-foreground">
                                                    {toPersianPrice(service.price)} تومان
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="border-t border-border pt-4 mt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-foreground">مبلغ کل</span>
                                        {isFinalLoading ? (
                                            <TotalPriceSkeleton />
                                        ) : (
                                            <span className="font-medium text-foreground">
                                                {totalAmount ? toPersianPrice(totalAmount) : '-'} تومان
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm text-muted-foreground">
                                            مبلغ پرداخت شده
                                        </span>
                                        {isFinalLoading ? (
                                            <PaidAmountSkeleton />
                                        ) : (
                                            <span className="text-sm text-foreground">
                                                {totalAmount ? toPersianPrice(Math.floor(totalAmount * 0.5)) : '-'} تومان
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="items-center gap-2 bg-muted/50 p-4 rounded-xl">
                            <span className="text-xs text-muted-foreground text-center">
                                طبق قوانین رزرو، حداقل ۱۰ دقیقه قبل از ساعت انتخابی {displayTimeSlot ? formatTimeSlot(displayTimeSlot) : ''} در سالن حاضر باشید. در صورت تاخیر یا عدم حضور، نوبت به‌طور خودکار لغو می‌شود و بیعانه قابل بازگشت نخواهد بود.
                            </span>
                        </div>
                    </div>
                </div>
            </ContentCard>
        </div>
    );
}