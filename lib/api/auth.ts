// src/lib/api/auth.ts
import axios, { AxiosError } from 'axios';

const BASE_URL = 'https://api.khorshidi.dev/api/v1';

export interface AuthApiResponse<T> {
    data: T | null;
    error: boolean;
    message: string;
}

export interface UserResponse {
    id: number;
    firstname: string;
    lastname: string;
    phone_number: string;
    created_at: string;
    last_login: string;
    is_blocked: boolean;
    block_until: string | null;
    failed_payments_count: number;
}

export interface OtpResponse {
    success: boolean;
    message: string;
    expires_in: number;
    development_code?: string; // فقط در محیط توسعه
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
    user_id: number;
    expires_at: string;
    is_profile_complete: boolean;
}

export interface UserStatusResponse {
    user_id: number;
    is_blocked: boolean;
    block_until: string | null;
    has_pending_appointment: boolean;
    failed_payments_count: number;
    is_profile_complete: boolean;
    last_login: string | null;
}

interface ApiErrorResponse {
    detail?: string | object;
    message?: string;
}

export const authApi = {
    // درخواست کد OTP
    requestOtp: async (phoneNumber: string): Promise<AuthApiResponse<OtpResponse>> => {
        try {
            const response = await axios.post<OtpResponse>(`${BASE_URL}/user-auth/request-otp`, {
                phone_number: phoneNumber
            });

            return {
                data: response.data,
                error: false,
                message: ''
            };
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorResponse>;

            if (axiosError.response && axiosError.response.data) {
                const errorDetail = axiosError.response.data.detail;
                const errorMessage = typeof errorDetail === 'string'
                    ? errorDetail
                    : (errorDetail ? JSON.stringify(errorDetail) : 'خطا در درخواست کد تأیید');

                return {
                    data: null,
                    error: true,
                    message: errorMessage
                };
            }

            console.error('Error requesting OTP:', error);
            return {
                data: null,
                error: true,
                message: 'خطا در برقراری ارتباط با سرور. لطفا بعدا تلاش کنید.'
            };
        }
    },

    // تأیید کد OTP
    verifyOtp: async (phoneNumber: string, code: string): Promise<AuthApiResponse<TokenResponse>> => {
        try {
            const response = await axios.post<TokenResponse>(`${BASE_URL}/user-auth/verify-otp`, {
                phone_number: phoneNumber,
                code: code
            });

            return {
                data: response.data,
                error: false,
                message: ''
            };
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorResponse>;

            if (axiosError.response && axiosError.response.data) {
                const errorDetail = axiosError.response.data.detail;
                const errorMessage = typeof errorDetail === 'string'
                    ? errorDetail
                    : (errorDetail ? JSON.stringify(errorDetail) : 'خطا در تأیید کد');

                return {
                    data: null,
                    error: true,
                    message: errorMessage
                };
            }

            console.error('Error verifying OTP:', error);
            return {
                data: null,
                error: true,
                message: 'خطا در برقراری ارتباط با سرور. لطفا بعدا تلاش کنید.'
            };
        }
    },

    // دریافت اطلاعات کاربر
    getUserInfo: async (token: string): Promise<AuthApiResponse<UserResponse>> => {
        try {
            const response = await axios.get<UserResponse>(`${BASE_URL}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                data: response.data,
                error: false,
                message: ''
            };
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorResponse>;

            if (axiosError.response && axiosError.response.data) {
                const errorDetail = axiosError.response.data.detail;
                const errorMessage = typeof errorDetail === 'string'
                    ? errorDetail
                    : (errorDetail ? JSON.stringify(errorDetail) : 'خطا در دریافت اطلاعات کاربر');

                return {
                    data: null,
                    error: true,
                    message: errorMessage
                };
            }

            console.error('Error fetching user info:', error);
            return {
                data: null,
                error: true,
                message: 'خطا در برقراری ارتباط با سرور. لطفا بعدا تلاش کنید.'
            };
        }
    },

    // به‌روزرسانی اطلاعات کاربر
    updateUserInfo: async (token: string, firstname: string, lastname: string): Promise<AuthApiResponse<UserResponse>> => {
        try {
            const response = await axios.put<UserResponse>(
                `${BASE_URL}/users/me`,
                { firstname, lastname },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return {
                data: response.data,
                error: false,
                message: ''
            };
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorResponse>;

            if (axiosError.response && axiosError.response.data) {
                const errorDetail = axiosError.response.data.detail;
                const errorMessage = typeof errorDetail === 'string'
                    ? errorDetail
                    : (errorDetail ? JSON.stringify(errorDetail) : 'خطا در به‌روزرسانی اطلاعات کاربر');

                return {
                    data: null,
                    error: true,
                    message: errorMessage
                };
            }

            console.error('Error updating user info:', error);
            return {
                data: null,
                error: true,
                message: 'خطا در برقراری ارتباط با سرور. لطفا بعدا تلاش کنید.'
            };
        }
    },

    // خروج از حساب کاربری
    logout: async (token: string): Promise<AuthApiResponse<{ success: boolean; message: string; }>> => {
        try {
            const response = await axios.post<{ success: boolean; message: string; }>(
                `${BASE_URL}/user-auth/logout`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return {
                data: response.data,
                error: false,
                message: ''
            };
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorResponse>;

            if (axiosError.response && axiosError.response.data) {
                const errorDetail = axiosError.response.data.detail;
                const errorMessage = typeof errorDetail === 'string'
                    ? errorDetail
                    : (errorDetail ? JSON.stringify(errorDetail) : 'خطا در خروج از حساب کاربری');

                return {
                    data: null,
                    error: true,
                    message: errorMessage
                };
            }

            console.error('Error logging out:', error);
            return {
                data: null,
                error: true,
                message: 'خطا در برقراری ارتباط با سرور. لطفا بعدا تلاش کنید.'
            };
        }
    },

    // دریافت وضعیت کاربر
    getUserStatus: async (token: string): Promise<AuthApiResponse<UserStatusResponse>> => {
        try {
            const response = await axios.get<UserStatusResponse>(`${BASE_URL}/users/status`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                data: response.data,
                error: false,
                message: ''
            };
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorResponse>;

            if (axiosError.response && axiosError.response.data) {
                const errorDetail = axiosError.response.data.detail;
                const errorMessage = typeof errorDetail === 'string'
                    ? errorDetail
                    : (errorDetail ? JSON.stringify(errorDetail) : 'خطا در دریافت وضعیت کاربر');

                return {
                    data: null,
                    error: true,
                    message: errorMessage
                };
            }

            console.error('Error fetching user status:', error);
            return {
                data: null,
                error: true,
                message: 'خطا در برقراری ارتباط با سرور. لطفا بعدا تلاش کنید.'
            };
        }
    }
};