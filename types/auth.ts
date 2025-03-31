// src/types/auth.ts

export interface User {
    id: number;
    firstname: string;
    lastname: string;
    phone_number: string;
    created_at: string;
    last_login: string | null;
    is_blocked: boolean;
    block_until: string | null;
    failed_payments_count: number;
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

export interface OtpRequest {
    phone_number: string;
}

export interface OtpVerify {
    phone_number: string;
    code: string;
}

export interface OtpResponse {
    success: boolean;
    message: string;
    expires_in: number;
    development_code?: string; // فقط در محیط توسعه
}

export enum AuthStep {
    PHONE = 'phone',
    OTP = 'otp',
    REGISTER = 'register'
}

export interface UserUpdateRequest {
    firstname: string;
    lastname: string;
}

export interface AuthError {
    message: string;
    status?: number;
}