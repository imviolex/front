// src/lib/api/userAppointments.ts
import axios, { AxiosError } from 'axios';
import type { AppointmentWithServices } from '@/types/reservation';

const BASE_URL = 'https://api.khorshidi.dev/api/v1';

export interface UserAppointmentsResponse {
    total: number;
    appointments: AppointmentWithServices[];
}

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

// تابع بهبود یافته برای پردازش خطای axios
const handleApiError = <T>(error: unknown, defaultMessage: string = 'خطا در برقراری ارتباط با سرور'): ApiResponse<T> => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const statusCode = axiosError.response?.status;

        // بررسی خطای عدم دسترسی (403) یا خطای احراز هویت (401)
        if (statusCode === 403) {
            return {
                data: null,
                error: true,
                message: 'شما مجاز به دسترسی به این اطلاعات نیستید',
                status: 403
            };
        }

        if (statusCode === 401) {
            return {
                data: null,
                error: true,
                message: 'لطفاً وارد حساب کاربری خود شوید',
                status: 401
            };
        }

        // بررسی پیام خطا از پاسخ API
        if (axiosError.response && axiosError.response.data) {
            const errorDetail = axiosError.response.data.detail;
            const errorMessage = typeof errorDetail === 'string'
                ? errorDetail
                : (errorDetail ? JSON.stringify(errorDetail) : defaultMessage);

            return {
                data: null,
                error: true,
                message: errorMessage,
                status: statusCode
            };
        }
    }

    console.error('API Error:', error);
    return {
        data: null,
        error: true,
        message: defaultMessage
    };
};

export const userAppointmentsApi = {
    // دریافت نوبت‌های کاربر
    getUserAppointments: async (token: string, skip: number = 0, limit: number = 10): Promise<ApiResponse<UserAppointmentsResponse>> => {
        try {
            const response = await axios.get<UserAppointmentsResponse>(
                `${BASE_URL}/appointments/my-appointments?skip=${skip}&limit=${limit}`,
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
            return handleApiError<UserAppointmentsResponse>(error, 'خطا در دریافت لیست نوبت‌ها');
        }
    }
};