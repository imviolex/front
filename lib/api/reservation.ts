// src/lib/api/reservation.ts
import axios, { AxiosError } from 'axios';
import type { TimeGroup, Barber, Service, AppointmentDetails } from '@/types/reservation';

const BASE_URL = 'https://api.khorshidi.dev/api/v1';

export interface AppointmentData {
    barber_id: number;
    date: string;
    time: string;
    customer_name: string;
    phone: string;
    services: number[];
    total_price: number;
    total_duration: number;
}

// بازنویسی تایپ ApiResponse به شکلی که data بتواند null هم باشد
export interface ApiResponse<T> {
    data: T | null;
    error: boolean;
    message: string;
    status?: number;
}

interface ApiErrorResponse {
    detail?: string | object;
    message?: string;
}

// تعریف اینترفیس برای نوع داده‌های بازگشتی API appointments
interface Appointment {
    id: number;
    barber_id: number;
    barber_name?: string;
    customer_name: string;
    phone: string;
    date: string;
    time: string;
    services: {
        id: number;
        name: string;
        price: number;
        duration: number;
        description?: string;
    }[];
    total_price: number;
    total_duration: number;
    status: string;
    created_at: string;
}

// اینترفیس های جدید برای پرداخت
interface PaymentResponse {
    success: boolean;
    message: string;
    payment_url?: string;
    authority?: string;
}

interface PaymentStatus {
    appointment_id: number;
    payment_id: number;
    status: string;
    amount: number;
    ref_id?: string;
    created_at: string;
    message: string;
}

// تابع بهبود یافته برای پردازش خطای axios - با پشتیبانی از generic type و بدون any
const handleApiError = <T>(error: unknown, defaultMessage: string = 'خطا در برقراری ارتباط با سرور'): ApiResponse<T> => {
    // تابع کمکی برای تشخیص خطای نوبت در حال رزرو
    const isPendingAppointmentError = (message: string): boolean => {
        if (!message) return false;

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
            message.toLowerCase().includes(keyword.toLowerCase())
        );
    };

    // خطای axios با پاسخ از سرور
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;

        // ثبت کد وضعیت HTTP
        const statusCode = axiosError.response?.status;

        // بررسی خطای عدم دسترسی (403)
        if (statusCode === 403) {
            return {
                data: null,
                error: true,
                message: 'شما مجاز به دسترسی به این اطلاعات نیستید',
                status: 403
            };
        }

        // بررسی پیام خطا از پاسخ API
        if (axiosError.response && axiosError.response.data) {
            const errorDetail = axiosError.response.data.detail;
            // تبدیل هر نوع داده detail به رشته
            let errorMessage = typeof errorDetail === 'string'
                ? errorDetail
                : (errorDetail ? JSON.stringify(errorDetail) : defaultMessage);

            // اگر خطای نوبت در حال رزرو است، آن را با یک پیام خاص مشخص کنیم
            if (isPendingAppointmentError(errorMessage)) {
                errorMessage = "این نوبت در حال رزرو توسط شخص دیگری می‌باشد. لطفاً منتظر بمانید یا نوبت دیگری انتخاب کنید";
            }

            return {
                data: null,
                error: true,
                message: errorMessage,
                status: statusCode
            };
        }
    }

    // خطای عمومی
    console.error('API Error:', error);
    return {
        data: null,
        error: true,
        message: defaultMessage
    };
};

export const reservationApi = {
    getBarbers: async (): Promise<ApiResponse<Barber[]>> => {
        try {
            const response = await axios.get<Barber[]>(`${BASE_URL}/barbers/`);
            return {
                data: response.data,
                error: false,
                message: ''
            };
        } catch (error) {
            return handleApiError<Barber[]>(error, 'خطا در دریافت لیست آرایشگرها');
        }
    },

    getServices: async (): Promise<ApiResponse<Service[]>> => {
        try {
            const response = await axios.get<Service[]>(`${BASE_URL}/services/`);
            return {
                data: response.data,
                error: false,
                message: ''
            };
        } catch (error) {
            return handleApiError<Service[]>(error, 'خطا در دریافت لیست خدمات');
        }
    },

    getAvailableTimeSlots: async (barber_id: number, date: string, total_duration: number): Promise<ApiResponse<TimeGroup[]>> => {
        try {
            const response = await axios.get<TimeGroup[]>(
                `${BASE_URL}/appointments/availability?barber_id=${barber_id}&date=${date}&total_duration=${total_duration}`
            );
            return {
                data: response.data,
                error: false,
                message: ''
            };
        } catch (error) {
            return handleApiError<TimeGroup[]>(error, 'خطا در دریافت زمان‌های موجود');
        }
    },

    // به‌روزرسانی تابع برای دریافت و ارسال توکن
    createAppointment: async (data: AppointmentData, token: string): Promise<ApiResponse<{
        success: boolean;
        message: string;
        appointment_id?: number;
    }>> => {
        try {
            const response = await axios.post<{
                success: boolean;
                message: string;
                appointment_id?: number;
            }>(
                `${BASE_URL}/appointments/`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return {
                data: response.data,
                error: false,
                message: '',
                status: response.status
            };
        } catch (error) {
            return handleApiError<{
                success: boolean;
                message: string;
                appointment_id?: number;
            }>(error, 'خطا در ثبت نوبت');
        }
    },

    // متدهای API با پشتیبانی از فیلد description
    getAllAppointments: async (token: string): Promise<ApiResponse<Appointment[]>> => {
        try {
            const response = await axios.get<Appointment[]>(
                `${BASE_URL}/appointments/all`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return {
                data: response.data,
                error: false,
                message: '',
                status: response.status
            };
        } catch (error) {
            return handleApiError<Appointment[]>(error, 'خطا در دریافت لیست نوبت‌ها');
        }
    },

    getBarberAppointments: async (barber_id: number, token: string): Promise<ApiResponse<Appointment[]>> => {
        try {
            const response = await axios.get<Appointment[]>(
                `${BASE_URL}/appointments/${barber_id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return {
                data: response.data,
                error: false,
                message: '',
                status: response.status
            };
        } catch (error) {
            return handleApiError<Appointment[]>(error, `خطا در دریافت نوبت‌های آرایشگر`);
        }
    },

    // به‌روزرسانی متدهای پرداخت برای پشتیبانی از توکن
    createPaymentRequest: async (appointment_id: number, token: string): Promise<ApiResponse<PaymentResponse>> => {
        try {
            const response = await axios.post<PaymentResponse>(
                `${BASE_URL}/payments/create`,
                { appointment_id },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return {
                data: response.data,
                error: false,
                message: '',
                status: response.status
            };
        } catch (error) {
            return handleApiError<PaymentResponse>(error, 'خطا در ایجاد درخواست پرداخت');
        }
    },

    getPaymentStatus: async (appointment_id: number, token: string): Promise<ApiResponse<PaymentStatus>> => {
        try {
            const response = await axios.get<PaymentStatus>(
                `${BASE_URL}/payments/status/${appointment_id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return {
                data: response.data,
                error: false,
                message: '',
                status: response.status
            };
        } catch (error) {
            return handleApiError<PaymentStatus>(error, 'خطا در دریافت وضعیت پرداخت');
        }
    },

    // به‌روزرسانی متد برای دریافت جزئیات نوبت با ref_id با پشتیبانی از توکن و بهبود مدیریت خطا
    getAppointmentDetailsByRefId: async (ref_id: string, token: string): Promise<ApiResponse<AppointmentDetails>> => {
        try {
            const response = await axios.get<AppointmentDetails>(
                `${BASE_URL}/payments/appointment-details/${ref_id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return {
                data: response.data,
                error: false,
                message: '',
                status: response.status
            };
        } catch (error) {
            // تشخیص خطای دسترسی برای ref_id
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                return {
                    data: null,
                    error: true,
                    message: 'شما مجاز به مشاهده اطلاعات این نوبت نیستید',
                    status: 403
                };
            }

            return handleApiError<AppointmentDetails>(error, 'خطا در دریافت جزئیات نوبت');
        }
    },

    // متد جدید برای بررسی مالکیت نوبت
    verifyAppointmentOwnership: async (ref_id: string, token: string): Promise<ApiResponse<boolean>> => {
        try {
            // این API فقط برای بررسی مالکیت استفاده می‌شود، بنابراین فقط وضعیت پاسخ مهم است
            await axios.get(
                `${BASE_URL}/payments/appointment-details/${ref_id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // اگر خطایی رخ نداد، کاربر مالک نوبت است
            return {
                data: true,
                error: false,
                message: ''
            };
        } catch (error) {
            // اگر خطای 403 رخ داد، کاربر مالک نوبت نیست
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                return {
                    data: false,
                    error: true,
                    message: 'شما مجاز به مشاهده اطلاعات این نوبت نیستید',
                    status: 403
                };
            }

            // سایر خطاها - مشکل سرور و غیره
            return handleApiError<boolean>(error, 'خطا در بررسی مالکیت نوبت');
        }
    }
};