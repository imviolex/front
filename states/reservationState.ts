// src/states/reservationState.ts
import { create } from 'zustand';
import { reservationApi, ApiResponse } from '@/lib/api/reservation';
import type { Barber, Service, DateValue, UserInfo, TimeGroup } from '@/types/reservation';
import { isFriday } from 'date-fns-jalali';
import { toast } from 'sonner';

// تعریف ساعات مجاز برای روزهای جمعه - همه نوبت‌های صبح و ظهر
const FRIDAY_ALLOWED_SLOTS = [
    '10-1030', '1030-11', '11-1130', '1130-12',
    '12-1230', '1230-13', '13-1330'
];

// اضافه کردن اینترفیس PaymentStatus
interface PaymentStatus {
    appointment_id: number;
    payment_id: number;
    status: string;
    amount: number;
    ref_id?: string;
    created_at: string;
    message: string;
}

interface ReservationState {
    // Data
    barbers: Barber[];
    services: Service[];
    timeGroups: TimeGroup[];

    // Selection
    selectedBarber: string | null;
    selectedDate: DateValue | null;
    selectedTime: string | null;
    selectedServices: number[];

    // Calculations
    totalPrice: number;
    totalDuration: number;
    depositAmount: number;
    needsDoubleSlot: boolean;

    // Payment related
    paymentUrl: string | null;
    paymentAuthority: string | null;
    paymentRefId: string | null;
    appointmentId: number | null;
    paymentStatus: string | null;

    // UI state
    isLoading: boolean;
    formStep: 'services' | 'userInfo';
    userInfo: UserInfo | null;

    // Actions
    fetchBarbers: () => Promise<ApiResponse<Barber[]>>;
    fetchServices: () => Promise<ApiResponse<Service[]>>;
    fetchTimeSlots: () => Promise<{ error: boolean, message?: string }>;
    setBarber: (barberId: string) => void;
    setDate: (date: DateValue | null) => void;
    setTime: (time: string | null) => void;
    toggleService: (serviceId: number) => void;
    calculateTotals: () => void;
    setLoading: (loading: boolean) => void;
    setFormStep: (step: 'services' | 'userInfo') => void;
    setUserInfo: (userInfo: UserInfo) => void;
    reset: () => void;
    clearState: () => void;

    // Payment related actions
    createAppointmentAndPayment: (token: string) => Promise<{ error: boolean; paymentUrl?: string; message?: string }>;
    setAppointmentId: (id: number | null) => void;
    setPaymentData: (url: string | null, authority: string | null) => void;
    setPaymentRefId: (refId: string | null) => void;
    setPaymentStatus: (status: string | null) => void;
    getPaymentStatus: (appointmentId: number, token: string) => Promise<ApiResponse<PaymentStatus>>;
}

export const useReservationState = create<ReservationState>((set, get) => ({
    // Initial state
    barbers: [],
    services: [],
    timeGroups: [],
    selectedBarber: null,
    selectedDate: null,
    selectedTime: null,
    selectedServices: [],
    totalPrice: 0,
    totalDuration: 0,
    depositAmount: 0,
    needsDoubleSlot: false,
    isLoading: false,
    formStep: 'services',
    userInfo: null,

    // Payment related state
    paymentUrl: null,
    paymentAuthority: null,
    paymentRefId: null,
    appointmentId: null,
    paymentStatus: null,

    // Actions
    fetchBarbers: async () => {
        try {
            const response = await reservationApi.getBarbers();
            if (!response.error && response.data) {
                set({ barbers: response.data });
            }
            return response;
        } catch (error) {
            console.error('Error fetching barbers:', error);
            return {
                data: null,
                error: true,
                message: 'خطا در برقراری ارتباط با سرور. لطفا بعدا تلاش کنید.'
            };
        }
    },

    fetchServices: async () => {
        try {
            const response = await reservationApi.getServices();
            if (!response.error && response.data) {
                set({ services: response.data });
            }
            return response;
        } catch (error) {
            console.error('Error fetching services:', error);
            return {
                data: null,
                error: true,
                message: 'خطا در برقراری ارتباط با سرور. لطفا بعدا تلاش کنید.'
            };
        }
    },

    fetchTimeSlots: async () => {
        const state = get();
        if (!state.selectedBarber || !state.selectedDate?.formatted) {
            return {
                error: true,
                message: 'لطفا آرایشگر و تاریخ را انتخاب کنید'
            };
        }

        set({ isLoading: true });
        try {
            const response = await reservationApi.getAvailableTimeSlots(
                Number(state.selectedBarber),
                state.selectedDate.formatted,
                state.totalDuration
            );

            if (response.error || !response.data) {
                set({ timeGroups: [] });
                return { error: true, message: response.message };
            }

            // بررسی آیا روز انتخاب شده جمعه است
            const isFridaySelected = state.selectedDate.date ? isFriday(state.selectedDate.date) : false;

            if (isFridaySelected) {
                // فیلتر کردن زمان‌ها برای روزهای جمعه - فقط صبح و ظهر
                const filteredGroups = response.data.map(group => ({
                    ...group,
                    slots: group.slots.filter(slot => FRIDAY_ALLOWED_SLOTS.includes(slot.time))
                })).filter(group => group.slots.length > 0);

                set({ timeGroups: filteredGroups });

                // اگر قبلاً زمانی انتخاب شده که جزو زمان‌های مجاز جمعه نیست، آن را ریست کنیم
                if (state.selectedTime && !FRIDAY_ALLOWED_SLOTS.includes(state.selectedTime)) {
                    set({ selectedTime: null });
                }
            } else {
                // برای روزهای دیگر همه زمان‌ها را نمایش می‌دهیم
                set({ timeGroups: response.data });
            }

            return { error: false };
        } catch (error) {
            console.error('Error fetching time slots:', error);
            set({ timeGroups: [] });
            return {
                error: true,
                message: 'خطا در برقراری ارتباط با سرور. لطفا بعدا تلاش کنید.'
            };
        } finally {
            set({ isLoading: false });
        }
    },

    setBarber: (barberId) => {
        set({
            selectedBarber: barberId,
            selectedDate: null,
            selectedTime: null
        });
    },

    setDate: (date) => {
        set({
            selectedDate: date,
            selectedTime: null
        });
        get().fetchTimeSlots();
    },

    setTime: (time) => {
        set({ selectedTime: time });
    },

    toggleService: (serviceId) => {
        const currentServices = get().selectedServices;
        const newServices = currentServices.includes(serviceId)
            ? currentServices.filter(id => id !== serviceId)
            : [...currentServices, serviceId];

        set({ selectedServices: newServices });
        get().calculateTotals();
    },

    calculateTotals: () => {
        const { selectedServices, services } = get();
        let totalPrice = 0;
        let totalDuration = 0;

        selectedServices.forEach(id => {
            const service = services.find(s => s.id === id);
            if (service) {
                totalPrice += parseInt(service.price.replace(/,/g, ''));
                totalDuration += parseInt(service.duration);
            }
        });

        const needsDoubleSlot = totalDuration > 40;

        set({
            totalPrice,
            totalDuration,
            depositAmount: Math.floor(totalPrice * 0.5),
            needsDoubleSlot,
            selectedTime: null // Reset selected time when services change
        });

        // Refetch time slots if duration changes
        get().fetchTimeSlots();
    },

    setLoading: (loading) => set({ isLoading: loading }),
    setFormStep: (step) => set({ formStep: step }),
    setUserInfo: (userInfo) => set({ userInfo }),

    // Payment related actions
    setAppointmentId: (id) => set({ appointmentId: id }),
    setPaymentData: (url, authority) => set({ paymentUrl: url, paymentAuthority: authority }),
    setPaymentRefId: (refId) => set({ paymentRefId: refId }),
    setPaymentStatus: (status) => set({ paymentStatus: status }),

    createAppointmentAndPayment: async (token: string) => {
        const state = get();
        set({ isLoading: true });

        try {
            // 1. ابتدا ایجاد نوبت
            if (!state.selectedBarber || !state.selectedDate || !state.selectedTime || !state.userInfo) {
                return { error: true, message: 'اطلاعات نوبت کامل نیست' };
            }

            // اضافه کردن توکن به درخواست ایجاد نوبت
            const appointmentResponse = await reservationApi.createAppointment(
                {
                    barber_id: Number(state.selectedBarber),
                    date: state.selectedDate.formatted,
                    time: state.selectedTime,
                    customer_name: state.userInfo.name,
                    phone: state.userInfo.phone,
                    services: state.selectedServices,
                    total_price: state.totalPrice,
                    total_duration: state.totalDuration
                },
                token // ارسال توکن به API
            );

            if (appointmentResponse.error || !appointmentResponse.data?.appointment_id) {
                // بررسی خطای "در حال رزرو" - نمایش پیام مناسب به کاربر
                if (appointmentResponse.message &&
                    (appointmentResponse.message.includes('در حال رزرو') ||
                        appointmentResponse.message.includes('شخص دیگری'))) {

                    toast.error('این نوبت در حال رزرو توسط شخص دیگری می‌باشد. لطفاً منتظر بمانید یا نوبت دیگری انتخاب کنید', {
                        duration: 4000,
                        position: 'top-center'
                    });

                    // رفرش کردن لیست نوبت‌ها برای نمایش وضعیت صحیح
                    await get().fetchTimeSlots();
                }

                return {
                    error: true,
                    message: appointmentResponse.message || 'خطا در ایجاد نوبت'
                };
            }

            // 2. ذخیره شناسه نوبت
            const appointmentId = appointmentResponse.data.appointment_id;
            set({ appointmentId });

            // 3. ایجاد درخواست پرداخت با ارسال توکن
            const paymentResponse = await reservationApi.createPaymentRequest(appointmentId, token);

            if (paymentResponse.error || !paymentResponse.data?.payment_url) {
                // بررسی خطای "در حال رزرو" در پاسخ پرداخت
                if (paymentResponse.message &&
                    (paymentResponse.message.includes('در حال رزرو') ||
                        paymentResponse.message.includes('شخص دیگری'))) {

                    toast.error('این نوبت در حال رزرو توسط شخص دیگری می‌باشد. لطفاً منتظر بمانید یا نوبت دیگری انتخاب کنید', {
                        duration: 4000,
                        position: 'top-center'
                    });

                    // رفرش کردن لیست نوبت‌ها برای نمایش وضعیت صحیح
                    await get().fetchTimeSlots();
                }

                return {
                    error: true,
                    message: paymentResponse.message || 'خطا در ایجاد درخواست پرداخت'
                };
            }

            // 4. ذخیره اطلاعات پرداخت
            const paymentUrl = paymentResponse.data.payment_url;
            const paymentAuthority = paymentResponse.data.authority || null;

            set({
                paymentUrl: paymentUrl,
                paymentAuthority: paymentAuthority
            });

            return {
                error: false,
                paymentUrl: paymentUrl
            };

        } catch (error) {
            console.error('Error in createAppointmentAndPayment:', error);
            return {
                error: true,
                message: 'خطا در برقراری ارتباط با سرور. لطفا بعدا تلاش کنید.'
            };
        } finally {
            set({ isLoading: false });
        }
    },

    getPaymentStatus: async (appointmentId, token) => {
        try {
            // اضافه کردن توکن به درخواست وضعیت پرداخت
            const response = await reservationApi.getPaymentStatus(appointmentId, token);

            if (!response.error && response.data) {
                // بروزرسانی وضعیت پرداخت در state
                set({
                    paymentStatus: response.data.status,
                    paymentRefId: response.data.ref_id || null
                });
            }

            return response;
        } catch (error) {
            console.error('Error fetching payment status:', error);
            return {
                data: null,
                error: true,
                message: 'خطا در دریافت وضعیت پرداخت. لطفا بعدا تلاش کنید.'
            };
        }
    },

    reset: () => set(state => ({
        ...state,
        selectedBarber: null,
        selectedDate: null,
        selectedTime: null,
        selectedServices: [],
        totalPrice: 0,
        totalDuration: 0,
        depositAmount: 0,
        needsDoubleSlot: false,
        userInfo: null,
        paymentUrl: null,
        paymentAuthority: null,
        paymentRefId: null,
        appointmentId: null,
        paymentStatus: null
    })),

    clearState: () => set(state => ({
        ...state,
        selectedBarber: null,
        selectedDate: null,
        selectedTime: null,
        selectedServices: [],
        totalPrice: 0,
        totalDuration: 0,
        depositAmount: 0,
        needsDoubleSlot: false,
        isLoading: false,
        userInfo: null,
        paymentUrl: null,
        paymentAuthority: null,
        paymentRefId: null,
        appointmentId: null,
        paymentStatus: null
    }))
}));