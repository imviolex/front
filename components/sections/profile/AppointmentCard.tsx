// src/components/sections/profile/AppointmentCard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { userAppointmentsApi } from '@/lib/api/userAppointments';
import { reservationApi } from '@/lib/api/reservation';
import type { UserAppointment, AppointmentService } from '@/types/appointments';
import type { Barber } from '@/types/reservation';
import { CustomDrawer } from '@/components/ui/custom/custom-drawer';
import { formatTimeSlot, toPersianPrice, formatPersianDate } from '@/lib/utils/persian-numbers';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { Info } from 'lucide-react';
import { toast } from 'sonner';
import { AppointmentCardSkeleton } from './AppointmentCard.skeleton';

// تعداد نوبت‌های قابل بارگذاری در هر مرحله
const APPOINTMENTS_PER_PAGE = 6;

export function AppointmentCard() {
    const { token, isAuthenticated } = useAuth();
    const [appointments, setAppointments] = useState<UserAppointment[]>([]);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [loading, setLoading] = useState(true);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<UserAppointment | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // متغیرهای state جدید برای قابلیت "نمایش بیشتر"
    const [currentSkip, setCurrentSkip] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreToLoad, setHasMoreToLoad] = useState(true);

    // دریافت لیست آرایشگرها یکبار در زمان بارگذاری
    useEffect(() => {
        async function fetchBarbers() {
            try {
                const response = await reservationApi.getBarbers();
                if (!response.error && response.data) {
                    setBarbers(response.data);
                }
            } catch (error) {
                console.error('Error fetching barbers:', error);
            }
        }

        if (isAuthenticated) {
            fetchBarbers();
        }
    }, [isAuthenticated]);

    // دریافت نوبت‌های کاربر
    useEffect(() => {
        async function fetchUserAppointments() {
            if (!isAuthenticated || !token) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await userAppointmentsApi.getUserAppointments(token, 0, APPOINTMENTS_PER_PAGE);

                if (response.error || !response.data) {
                    toast.error(response.message || 'خطا در دریافت نوبت‌ها');
                    setDataLoaded(false);
                    return;
                }

                // مرتب‌سازی نوبت‌ها بر اساس تاریخ و زمان (از جدید به قدیم)
                const sortedAppointments = [...response.data.appointments].sort((a, b) => {
                    // اولویت اول: تاریخ ایجاد (created_at) از جدید به قدیم
                    const createdAtComparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    if (createdAtComparison !== 0) {
                        return createdAtComparison;
                    }

                    // اگر created_at یکسان بود، بر اساس تاریخ نوبت (date) از جدید به قدیم
                    const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
                    if (dateComparison !== 0) {
                        return dateComparison;
                    }

                    // اگر تاریخ نوبت هم یکسان بود، بر اساس زمان (time) از جدید به قدیم
                    const timeA = parseInt(a.time.split('-')[0].replace(':', ''));
                    const timeB = parseInt(b.time.split('-')[0].replace(':', ''));
                    return timeB - timeA;
                });

                const mappedAppointments = sortedAppointments.map(app => {
                    return {
                        ...app,
                        barber: app.barber || {
                            id: app.barber_id,
                            first_name: '',
                            last_name: '',
                            specialty: '',
                            available: true
                        }
                    } as UserAppointment;
                });

                setAppointments(mappedAppointments);
                setCurrentSkip(mappedAppointments.length);
                setDataLoaded(true);

                // تنظیم وضعیت دکمه "نمایش بیشتر"
                setHasMoreToLoad(response.data.appointments.length >= APPOINTMENTS_PER_PAGE);
            } catch (error) {
                console.error('Error fetching user appointments:', error);
                toast.error('خطا در دریافت نوبت‌ها');
                setDataLoaded(false);
            } finally {
                setLoading(false);
            }
        }

        fetchUserAppointments();
    }, [isAuthenticated, token]);

    // تابع جدید برای بارگذاری نوبت‌های بیشتر
    const loadMoreAppointments = async () => {
        if (!token || isLoadingMore) return;

        setIsLoadingMore(true);
        try {
            const response = await userAppointmentsApi.getUserAppointments(
                token,
                currentSkip,
                APPOINTMENTS_PER_PAGE
            );

            if (response.error || !response.data) {
                toast.error(response.message || 'خطا در دریافت نوبت‌های بیشتر');
                return;
            }

            // مرتب‌سازی نوبت‌های جدید
            const sortedNewAppointments = [...response.data.appointments].sort((a, b) => {
                const createdAtComparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                if (createdAtComparison !== 0) return createdAtComparison;

                const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
                if (dateComparison !== 0) return dateComparison;

                const timeA = parseInt(a.time.split('-')[0].replace(':', ''));
                const timeB = parseInt(b.time.split('-')[0].replace(':', ''));
                return timeB - timeA;
            });

            // تبدیل نوبت‌های جدید به فرمت مناسب
            const mappedNewAppointments = sortedNewAppointments.map(app => {
                return {
                    ...app,
                    barber: app.barber || {
                        id: app.barber_id,
                        first_name: '',
                        last_name: '',
                        specialty: '',
                        available: true
                    }
                } as UserAppointment;
            });

            // اضافه کردن نوبت‌های جدید به لیست موجود
            setAppointments(prevAppointments => [...prevAppointments, ...mappedNewAppointments]);

            // بروزرسانی شاخص پرش
            setCurrentSkip(prev => prev + mappedNewAppointments.length);

            // بررسی آیا نوبت بیشتری وجود دارد یا خیر
            const noMoreAppointments = mappedNewAppointments.length < APPOINTMENTS_PER_PAGE;
            setHasMoreToLoad(!noMoreAppointments);

            // فقط اگر نوبت جدیدی دریافت نشد، پیام نمایش دهیم
            if (mappedNewAppointments.length === 0) {
                toast.info('نوبت بیشتری وجود ندارد');
                setHasMoreToLoad(false);
            }
        } catch (error) {
            console.error('Error loading more appointments:', error);
            toast.error('خطا در بارگذاری نوبت‌های بیشتر');
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleOpenDetails = (appointment: UserAppointment) => {
        setSelectedAppointment(appointment);
        setDrawerOpen(true);
    };

    // تابع برای نمایش نام کامل آرایشگر با استفاده از barber_id
    const getBarberFullName = (appointment: UserAppointment): string => {
        // ابتدا بررسی می‌کنیم آیا آرایشگر در خود appointment موجود است
        if (appointment.barber && typeof appointment.barber === 'object') {
            if (appointment.barber.first_name && appointment.barber.last_name) {
                return `${appointment.barber.first_name} ${appointment.barber.last_name}`.trim();
            }
        }

        // اگر barber در appointment نبود، با استفاده از barber_id از لیست barbers می‌گیریم
        const barber_id = appointment.barber_id || (appointment.barber && typeof appointment.barber === 'object' ? appointment.barber.id : null);

        if (barber_id && barbers.length > 0) {
            const barber = barbers.find(b => b.id === barber_id);
            if (barber) {
                return `${barber.first_name} ${barber.last_name}`.trim();
            }
        }

        return 'نامشخص';
    };

    // تابع نمایش جزئیات خدمات با قیمت
    const renderServiceDetails = (services: AppointmentService[]) => {
        if (!services || services.length === 0) return null;

        return (
            <div className="space-y-2">
                {services.map((service, index) => (
                    <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center">
                            <span className="text-sm">{service.name}</span>
                        </div>
                        <span className="text-sm font-medium">{toPersianPrice(service.price)} تومان</span>
                    </div>
                ))}
            </div>
        );
    };

    // اگر در حال بارگذاری هستیم
    if (loading) {
        return <AppointmentCardSkeleton />;
    }

    // اگر لاگین نشده است، هیچ چیز نمایش نمی‌دهیم
    if (!isAuthenticated) {
        return null;
    }

    // اگر نوبتی وجود ندارد
    if (!dataLoaded || appointments.length === 0) {
        return (
            <div className="mt-8 space-y-4">
                <div className="flex flex-col items-center justify-center p-8 border border-border rounded-xl bg-muted/30">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-muted-foreground"
                        >
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2">هیچ نوبت رزرو شده‌ای یافت نشد</h3>
                    <p className="text-sm text-muted-foreground text-center">
                        شما هنوز هیچ نوبت رزرو شده‌ای ندارید
                    </p>
                </div>
            </div>
        );
    }

    // مدیریت بستن درایور
    const handleDrawerOpenChange = (open: boolean) => {
        setDrawerOpen(open);
        if (!open) {
            setSelectedAppointment(null);
        }
    };

    return (
        <div className="mt-8 space-y-4">
            {/* نمایش کارت‌های نوبت */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map((appointment) => (
                    <div
                        key={appointment.id}
                        className="p-5 border border-border rounded-xl bg-card shadow-sm hover:shadow transition-shadow"
                    >
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-sm md:text-base">{formatPersianDate(appointment.date)}</h3>
                            <Badge className="px-2 py-1 bg-primary text-primary-foreground border-0 rounded-[0.4rem]">
                                {getBarberFullName(appointment)}
                            </Badge>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground font-bold">زمان:</span>
                                <div className="text-right">
                                    <span className="text-sm font-bold">{formatTimeSlot(appointment.time)}</span>
                                    {appointment.double_slot && appointment.second_slot && (
                                        <span className="mr-1 text-muted-foreground text-xs">
                                            + {formatTimeSlot(appointment.second_slot)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground font-bold">مبلغ کل:</span>
                                <span className="text-sm font-medium">{toPersianPrice(appointment.total_price)} تومان</span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <Button
                                size="sm"
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-[0.5rem] flex items-center justify-center gap-2"
                                onClick={() => handleOpenDetails(appointment)}
                            >
                                <Info className="h-4 w-4" />
                                <span>جزئیات بیشتر</span>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* دکمه نمایش بیشتر به صورت متن ساده */}
            {appointments.length > 0 && hasMoreToLoad && (
                <div className="mt-6 text-center">
                    {isLoadingMore ? (
                        <p className="text-sm text-muted-foreground cursor-wait">
                            در حال بارگذاری...
                        </p>
                    ) : (
                        <p
                            className="text-sm text-muted-foreground cursor-pointer hover:text-muted-foreground/80 transition-colors"
                            onClick={loadMoreAppointments}
                        >
                            نمایش نوبت‌های بیشتر
                        </p>
                    )}
                </div>
            )}

            {/* درآور جزئیات نوبت با استفاده از CustomDrawer */}
            <CustomDrawer
                open={drawerOpen}
                onOpenChange={handleDrawerOpenChange}
                direction="bottom"
                title="جزئیات نوبت"
                showCloseButton={true}
                closeButtonText="بستن"
                placement="right"
                size="md"
                minHeight="medium"
                disableScroll={false}
                contentClassName="bg-card"
            >
                {selectedAppointment && (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground font-bold">آرایشگر:</span>
                                <span className="text-sm font-medium">
                                    {getBarberFullName(selectedAppointment)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground font-bold">تاریخ رزرو:</span>
                                <span className="text-sm font-medium">
                                    {formatPersianDate(selectedAppointment.date)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground font-bold">زمان نوبت:</span>
                                <div>
                                    <span className="text-sm font-bold">
                                        {formatTimeSlot(selectedAppointment.time)}
                                    </span>
                                    {selectedAppointment.double_slot && selectedAppointment.second_slot && (
                                        <span className="mr-2 text-xs text-muted-foreground">
                                            + {formatTimeSlot(selectedAppointment.second_slot)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* لیست خدمات با قیمت */}
                        <div className="pt-4 border-t border-border">
                            <h4 className="text-sm font-bold mb-3">خدمات انتخاب شده:</h4>
                            {renderServiceDetails(selectedAppointment.services)}
                        </div>

                        {/* قیمت کل و قیمت پرداختی */}
                        <div className="pt-4 border-t border-border space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold">مبلغ کل:</span>
                                <span className="text-sm font-medium">
                                    {toPersianPrice(selectedAppointment.total_price)} تومان
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold">مبلغ پرداخت شده:</span>
                                <span className="text-sm font-medium">
                                    {toPersianPrice(selectedAppointment.deposit_amount)} تومان
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </CustomDrawer>
        </div>
    );
}