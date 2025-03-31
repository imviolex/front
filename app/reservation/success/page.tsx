// src/app/reservation/success/page.tsx
'use client';

import { SuccessSection } from '@/components/sections/reservation/SuccessSection';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useReservationState } from '@/states/reservationState';
import { useAuthState } from '@/states/authState';
import { toast } from 'sonner';
import { reservationApi } from '@/lib/api/reservation';

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { token, isAuthenticated } = useAuthState();
    const {
        getPaymentStatus,
        appointmentId
    } = useReservationState();

    const [isLoading, setIsLoading] = useState(true);
    const [paymentVerified, setPaymentVerified] = useState(false);
    const [refId, setRefId] = useState<string | null>(null);

    const authCheckPerformed = useRef(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('path-changed'));
            setTimeout(() => {
                window.dispatchEvent(new Event('path-changed'));
            }, 200);
        }
    }, []);

    useEffect(() => {
        if (authCheckPerformed.current) return;

        if (isAuthenticated && token) {
            authCheckPerformed.current = true;
            return;
        }

        const authCheckTimer = setTimeout(() => {
            if (!isAuthenticated || !token) {
                toast.error('برای مشاهده جزئیات نوبت، وارد حساب کاربری خود شوید');
                router.push('/reservation');
            }
            authCheckPerformed.current = true;
        }, 100);

        return () => clearTimeout(authCheckTimer);
    }, [isAuthenticated, token, router]);

    useEffect(() => {
        const verifyPayment = async () => {
            if (!isAuthenticated || !token) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            try {
                const urlRefId = searchParams.get('ref_id');

                if (urlRefId) {
                    const response = await reservationApi.getAppointmentDetailsByRefId(urlRefId, token);

                    if (response.error) {
                        if (response.status === 403 || response.message.includes('مجاز') ||
                            response.message.includes('دسترسی') || response.message.includes('Forbidden')) {
                            toast.error('شما مجاز به مشاهده اطلاعات این نوبت نیستید');
                            router.push('/reservation');
                            return;
                        }

                        toast.error('خطا در بررسی اطلاعات نوبت');
                        router.push('/reservation/failure');
                        return;
                    }

                    setRefId(urlRefId);
                    setPaymentVerified(true);
                } else if (appointmentId && token) {
                    const response = await getPaymentStatus(appointmentId, token);

                    if (response.error || !response.data) {
                        toast.error('خطا در بررسی وضعیت پرداخت');
                        router.push('/reservation/failure');
                        return;
                    }

                    const { status, ref_id } = response.data;

                    if (status === 'PAID' && ref_id) {
                        const ownershipResponse = await reservationApi.getAppointmentDetailsByRefId(ref_id, token);

                        if (ownershipResponse.error) {
                            toast.error('خطا در تایید مالکیت نوبت');
                            router.push('/reservation/failure');
                            return;
                        }

                        setRefId(ref_id);
                        setPaymentVerified(true);
                    } else {
                        toast.error('پرداخت شما تایید نشده است');
                        router.push('/reservation/failure');
                    }
                } else {
                    toast.error('اطلاعات پرداخت یافت نشد');
                    router.push('/reservation');
                }
            } catch (error) {
                console.error('خطا در بررسی وضعیت پرداخت:', error);
                toast.error('خطا در بررسی وضعیت پرداخت');
                router.push('/reservation/failure');
            } finally {
                setIsLoading(false);
            }
        };

        if (authCheckPerformed.current) {
            verifyPayment();
        } else {
            // کاهش زمان انتظار به 500ms
            const waitForAuthCheck = setTimeout(() => {
                verifyPayment();
            }, 500);

            return () => clearTimeout(waitForAuthCheck);
        }
    }, [searchParams, router, appointmentId, token, isAuthenticated, getPaymentStatus]);

    // نمایش اسکلتون در حالت لودینگ
    if (!paymentVerified && !isLoading) {
        return null;
    }

    return (
        <main className="flex min-h-screen flex-col items-center p-2 gap-3">
            <SuccessSection refId={refId} isPageLoading={isLoading} />
        </main>
    );
}