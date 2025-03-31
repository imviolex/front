// src/types/appointments.ts
import { Barber } from './reservation';

/**
 * این فایل حاوی تایپ‌های مورد نیاز برای بخش نوبت‌های کاربر است
 */

// تایپ اصلی برای نوبت‌های برگشتی از API
export interface UserAppointment {
    id: number;
    barber_id: number;
    date: string;
    time: string;
    total_price: number;
    total_duration: number;
    deposit_amount: number;
    double_slot: boolean;
    second_slot?: string;
    is_before_rest: boolean;
    is_end_of_shift: boolean;
    created_at: string;
    services: AppointmentService[];
    barber: Barber;
    user: AppointmentUser;
    payment?: AppointmentPayment;
}

// تایپ برای خدمات انتخاب شده در هر نوبت
export interface AppointmentService {
    id: number;
    name: string;
    price: string;
    duration: string;
    description?: string;
}

// تایپ برای کاربر مربوط به نوبت
export interface AppointmentUser {
    id: number;
    firstname: string;
    lastname: string;
    phone_number: string;
}

// تایپ برای اطلاعات پرداخت نوبت
export interface AppointmentPayment {
    id: number;
    status: 'PENDING' | 'PAID' | 'FAILED';
    ref_id?: string;
    amount: number;
    created_at: string;
}

// تایپ پاسخ API برای لیست نوبت‌های کاربر
export interface UserAppointmentsResponse {
    total: number;
    appointments: UserAppointment[];
}

// تایپ برای وضعیت لودینگ نوبت‌ها
export enum LoadingStatus {
    IDLE = 'idle',
    LOADING = 'loading',
    SUCCESS = 'success',
    ERROR = 'error'
}