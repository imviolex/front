// src/lib/utils/auth.ts
import { User } from '@/types/auth';

// کلید‌های ذخیره‌سازی
const AUTH_TOKEN_KEY = 'barber_auth_token';
const AUTH_TOKEN_EXPIRY_KEY = 'barber_auth_expiry';
const USER_DATA_KEY = 'barber_user_data';

// کلیدهای ذخیره‌سازی برای ثبت‌نام ناقص
const INCOMPLETE_REGISTRATION_KEY = 'barber_incomplete_registration';
const INCOMPLETE_REGISTRATION_EXPIRY_KEY = 'barber_incomplete_registration_expiry';
const INCOMPLETE_REGISTRATION_PHONE_KEY = 'barber_incomplete_registration_phone';

// مدت زمان اعتبار توکن: 30 روز به میلی‌ثانیه
const TOKEN_EXPIRY_TIME = 30 * 24 * 60 * 60 * 1000; // 30 روز

// مدت زمان اعتبار ثبت‌نام ناقص: 12 ساعت به میلی‌ثانیه
const INCOMPLETE_REGISTRATION_EXPIRY_TIME = 12 * 60 * 60 * 1000; // 12 ساعت

// ذخیره توکن در localStorage
export const saveAuthToken = (token: string) => {
    try {
        // ذخیره توکن
        localStorage.setItem(AUTH_TOKEN_KEY, token);

        // محاسبه زمان انقضا (30 روز از حالا)
        const expiryTime = Date.now() + TOKEN_EXPIRY_TIME;
        localStorage.setItem(AUTH_TOKEN_EXPIRY_KEY, expiryTime.toString());
    } catch (error) {
        console.error('Error saving auth token:', error);
    }
};

// ذخیره اطلاعات کاربر در localStorage
export const saveUserData = (user: User) => {
    try {
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
        console.error('Error saving user data:', error);
    }
};

// دریافت توکن از localStorage
export const getAuthToken = (): string | null => {
    try {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
};

// دریافت اطلاعات کاربر از localStorage
export const getUserData = (): User | null => {
    try {
        const userData = localStorage.getItem(USER_DATA_KEY);
        if (!userData) return null;
        return JSON.parse(userData);
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
};

// بررسی آیا توکن منقضی شده است
export const isTokenExpired = (): boolean => {
    try {
        const expiryTimeStr = localStorage.getItem(AUTH_TOKEN_EXPIRY_KEY);
        if (!expiryTimeStr) return true;

        const expiryTime = parseInt(expiryTimeStr);
        return Date.now() > expiryTime;
    } catch (error) {
        console.error('Error checking token expiry:', error);
        return true;
    }
};

// پاک کردن اطلاعات احراز هویت
export const clearAuthData = () => {
    try {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY);
        localStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
        console.error('Error clearing auth data:', error);
    }
};

// ذخیره اطلاعات ثبت‌نام ناقص
export const saveIncompleteRegistrationData = (phoneNumber: string, token: string) => {
    try {
        // ذخیره اطلاعات ثبت‌نام ناقص
        localStorage.setItem(INCOMPLETE_REGISTRATION_KEY, token);
        localStorage.setItem(INCOMPLETE_REGISTRATION_PHONE_KEY, phoneNumber);

        // محاسبه زمان انقضا (12 ساعت از حالا)
        const expiryTime = Date.now() + INCOMPLETE_REGISTRATION_EXPIRY_TIME;
        localStorage.setItem(INCOMPLETE_REGISTRATION_EXPIRY_KEY, expiryTime.toString());
    } catch (error) {
        console.error('Error saving incomplete registration data:', error);
    }
};

// دریافت اطلاعات ثبت‌نام ناقص
export const getIncompleteRegistrationData = () => {
    try {
        const token = localStorage.getItem(INCOMPLETE_REGISTRATION_KEY);
        const phoneNumber = localStorage.getItem(INCOMPLETE_REGISTRATION_PHONE_KEY);

        if (!token || !phoneNumber) return null;

        return {
            token,
            phoneNumber
        };
    } catch (error) {
        console.error('Error getting incomplete registration data:', error);
        return null;
    }
};

// بررسی آیا ثبت‌نام ناقص منقضی شده است
export const isIncompleteRegistrationExpired = (): boolean => {
    try {
        const expiryTimeStr = localStorage.getItem(INCOMPLETE_REGISTRATION_EXPIRY_KEY);
        if (!expiryTimeStr) return true;

        const expiryTime = parseInt(expiryTimeStr);
        return Date.now() > expiryTime;
    } catch (error) {
        console.error('Error checking incomplete registration expiry:', error);
        return true;
    }
};

// پاک کردن اطلاعات ثبت‌نام ناقص
export const clearIncompleteRegistration = () => {
    try {
        localStorage.removeItem(INCOMPLETE_REGISTRATION_KEY);
        localStorage.removeItem(INCOMPLETE_REGISTRATION_EXPIRY_KEY);
        localStorage.removeItem(INCOMPLETE_REGISTRATION_PHONE_KEY);
    } catch (error) {
        console.error('Error clearing incomplete registration data:', error);
    }
};