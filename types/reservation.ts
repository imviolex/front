// src/types/reservation.ts
export interface TimeSlot {
    id: string;
    time: string;
    available: boolean;
    is_past: boolean;
    is_booked: boolean;
    is_pending: boolean;
    next_slot_available: boolean;
    next_slot_pending: boolean;
    is_before_rest?: boolean;
    is_end_of_shift?: boolean;
}

export interface TimeGroup {
    label: string;
    slots: TimeSlot[];
}

export interface Barber {
    id: number;
    first_name: string;
    last_name: string;
    specialty: string;
    available: boolean;
}

export interface Service {
    id: number;
    name: string;
    price: string;
    duration: string;
    description?: string;
}

export interface DateValue {
    date: Date;
    formatted: string;
    weekDay: {
        index: number;
    };
    toUnix: () => number;
}

export interface UserInfo {
    name: string;
    phone: string;
}

export interface APIError {
    response?: {
        data?: {
            detail?: string;
        }
    }
}

// تایپ‌های مربوط به پرداخت
export interface Payment {
    id: number;
    appointment_id: number;
    amount: number;
    authority?: string;
    ref_id?: string;
    status: PaymentStatus;
    card_pan?: string;
    created_at: string;
    updated_at?: string;
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED'
}

export interface PaymentResponse {
    success: boolean;
    message: string;
    payment_url?: string;
    authority?: string;
}

export interface PaymentStatusResponse {
    appointment_id: number;
    payment_id: number;
    status: PaymentStatus;
    amount: number;
    ref_id?: string;
    created_at: string;
    message: string;
}

export interface PaymentVerification {
    authority: string;
    status: string;
}

export interface AppointmentWithServices {
    id: number;
    barber_id: number;
    date: string;
    time: string;
    total_price: number;
    total_duration: number;
    deposit_amount?: number;
    double_slot: boolean;
    second_slot?: string;
    is_before_rest: boolean;
    is_end_of_shift: boolean;
    created_at: string;
    services: Service[];
    user_id: number;
    barber?: Barber;
    user?: {
        id: number;
        firstname: string;
        lastname: string;
        phone_number: string;
    };
    payment?: {
        id: number;
        status: string;
        amount: number;
        ref_id?: string;
        created_at: string;
    };
}

// اینترفیس برای جزئیات نوبت
export interface AppointmentDetails {
    id: number;
    barber_id: number;
    barber_name: string;
    customer_name: string;
    phone: string;
    date: string;
    time: string;
    double_slot: boolean;
    second_slot?: string;
    total_price: number;
    total_duration: number;
    services: {
        id: number;
        name: string;
        price: string;
        duration: string;
        description?: string; // اضافه کردن فیلد توضیحات به سرویس‌های نوبت
    }[];
    payment: {
        id: number;
        status: string;
        ref_id: string;
        created_at: string;
    };
}