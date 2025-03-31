// src/states/authState.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, UserResponse } from '@/lib/api/auth';
import { toast } from 'sonner';
import {
    saveAuthToken,
    saveUserData,
    clearAuthData,
    saveIncompleteRegistrationData,
    clearIncompleteRegistration,
    getIncompleteRegistrationData,
    isIncompleteRegistrationExpired
} from '@/lib/utils/auth';

interface AuthState {
    // State
    user: UserResponse | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    phoneNumber: string;
    otpCode: string;
    otpExpiry: number | null;
    isAuthDrawerOpen: boolean;
    currentStep: 'phone' | 'otp' | 'register' | 'edit';
    hasIncompleteRegistration: boolean; // وضعیت ثبت‌نام ناقص

    // Auth Actions
    setUserAndToken: (user: UserResponse | null, token: string | null) => void;
    login: (phoneNumber: string, otpCode: string) => Promise<boolean>;
    logout: () => Promise<boolean>;
    updateUserInfo: (firstname: string, lastname: string) => Promise<boolean>;
    refreshUserInfo: () => Promise<boolean>;

    // Incomplete Registration Actions
    saveIncompleteRegistration: (phoneNumber: string, token: string) => void;
    clearIncompleteRegistration: () => void;
    checkIncompleteRegistration: () => boolean;

    // UI Actions
    setLoading: (loading: boolean) => void;
    setPhoneNumber: (phone: string) => void;
    setOtpCode: (otp: string) => void;
    setOtpExpiry: (expiry: number | null) => void;
    setAuthDrawerOpen: (open: boolean) => void;
    setCurrentStep: (step: 'phone' | 'otp' | 'register' | 'edit') => void;
    resetAuthForm: () => void;

    // Utils
    isOtpExpired: () => boolean;
    isUserComplete: () => boolean;

    // OTP Actions
    requestOtp: (phoneNumber: string) => Promise<boolean>;
    verifyOtp: (phoneNumber: string, otpCode: string) => Promise<boolean>;
}

export const useAuthState = create<AuthState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            phoneNumber: '',
            otpCode: '',
            otpExpiry: null,
            isAuthDrawerOpen: false,
            currentStep: 'phone',
            hasIncompleteRegistration: false,

            // Auth Actions
            setUserAndToken: (user, token) => {
                set({
                    user,
                    token,
                    isAuthenticated: !!user && !!token
                });

                // ذخیره توکن و اطلاعات کاربر در localStorage
                if (user && token) {
                    saveAuthToken(token);
                    saveUserData(user);

                    // اگر کاربر لاگین شده و پروفایل کامل است، ثبت‌نام ناقص را پاک می‌کنیم
                    if (user.firstname && user.lastname) {
                        get().clearIncompleteRegistration();
                    } else {
                        // اگر پروفایل ناقص است، وضعیت ثبت‌نام ناقص را ذخیره می‌کنیم
                        get().saveIncompleteRegistration(user.phone_number, token);
                    }
                } else {
                    // اگر کاربر یا توکن null هستند، داده‌های localStorage را پاک می‌کنیم
                    clearAuthData();
                }
            },

            login: async (phoneNumber, otpCode) => {
                set({ isLoading: true });
                try {
                    const response = await authApi.verifyOtp(phoneNumber, otpCode);

                    if (response.error || !response.data) {
                        toast.error(response.message || 'خطا در ورود به حساب کاربری');
                        return false;
                    }

                    const tokenResponse = response.data;
                    const token = tokenResponse.access_token;

                    // دریافت اطلاعات کاربر
                    const userResponse = await authApi.getUserInfo(token);

                    if (userResponse.error || !userResponse.data) {
                        toast.error(userResponse.message || 'خطا در دریافت اطلاعات کاربر');
                        return false;
                    }

                    // ذخیره اطلاعات کاربر و توکن
                    set({
                        user: userResponse.data,
                        token,
                        isAuthenticated: true
                    });

                    // ذخیره توکن و اطلاعات کاربر در localStorage
                    saveAuthToken(token);
                    saveUserData(userResponse.data);

                    // بستن درایور و ریست فرم فقط اگر پروفایل کامل باشد
                    if (userResponse.data.firstname && userResponse.data.lastname) {
                        set({
                            isAuthDrawerOpen: false,
                            currentStep: 'phone',
                            phoneNumber: '',
                            otpCode: '',
                            otpExpiry: null,
                            hasIncompleteRegistration: false
                        });
                        // پاک کردن وضعیت ثبت‌نام ناقص
                        get().clearIncompleteRegistration();
                        toast.success('ورود با موفقیت انجام شد');
                    } else {
                        // ذخیره وضعیت ثبت‌نام ناقص
                        get().saveIncompleteRegistration(phoneNumber, token);
                        // رفتن به مرحله تکمیل پروفایل
                        set({
                            currentStep: 'register',
                            hasIncompleteRegistration: true
                        });
                    }

                    return true;
                } catch (error) {
                    console.error('Error during login:', error);
                    toast.error('خطا در برقراری ارتباط با سرور');
                    return false;
                } finally {
                    set({ isLoading: false });
                }
            },

            logout: async () => {
                const { token } = get();
                set({ isLoading: true });

                try {
                    if (token) {
                        await authApi.logout(token);
                    }

                    // حتی اگر لاگ‌آوت با خطا مواجه شود، اطلاعات کاربر را پاک می‌کنیم
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        // اطمینان از بازگشت به مرحله اول فرم ورود
                        currentStep: 'phone',
                        // بستن درایور در صورت باز بودن
                        isAuthDrawerOpen: false,
                        hasIncompleteRegistration: false
                    });

                    // پاک کردن داده‌های localStorage
                    clearAuthData();
                    get().clearIncompleteRegistration();

                    return true;
                } catch (error) {
                    console.error('Error during logout:', error);
                    // با این حال اطلاعات کاربر را پاک می‌کنیم
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        currentStep: 'phone',
                        isAuthDrawerOpen: false,
                        hasIncompleteRegistration: false
                    });
                    // پاک کردن داده‌های localStorage
                    clearAuthData();
                    get().clearIncompleteRegistration();
                    return true;
                } finally {
                    set({ isLoading: false });
                }
            },

            updateUserInfo: async (firstname, lastname) => {
                const { token } = get();

                if (!token) {
                    toast.error('شما وارد حساب کاربری نشده‌اید');
                    return false;
                }

                set({ isLoading: true });

                try {
                    const response = await authApi.updateUserInfo(token, firstname, lastname);

                    if (response.error || !response.data) {
                        toast.error(response.message || 'خطا در به‌روزرسانی اطلاعات کاربر');
                        return false;
                    }

                    // به‌روزرسانی اطلاعات کاربر در state
                    set({
                        user: response.data,
                        // بستن درایور بعد از به‌روزرسانی موفق پروفایل
                        isAuthDrawerOpen: false,
                        hasIncompleteRegistration: false
                    });

                    // به‌روزرسانی اطلاعات کاربر در localStorage
                    saveUserData(response.data);

                    // پاک کردن وضعیت ثبت‌نام ناقص
                    get().clearIncompleteRegistration();

                    // تغییر پیام موفقیت بر اساس مرحله فعلی
                    const { currentStep } = get();
                    if (currentStep === 'edit') {
                        toast.success('اطلاعات شما با موفقیت به‌روزرسانی شد');
                    } else {
                        toast.success('ثبت نام با موفقیت انجام شد');
                    }

                    return true;
                } catch (error) {
                    console.error('Error updating user info:', error);
                    toast.error('خطا در برقراری ارتباط با سرور');
                    return false;
                } finally {
                    set({ isLoading: false });
                }
            },

            refreshUserInfo: async () => {
                const { token } = get();

                if (!token) {
                    return false;
                }

                try {
                    const response = await authApi.getUserInfo(token);

                    if (response.error || !response.data) {
                        // اگر خطای 401 یا 403 دریافت شد، لاگ‌آوت می‌کنیم
                        if (response.message && (response.message.includes('توکن معتبر نمی‌باشد') ||
                            response.message.includes('مسدود'))) {
                            await get().logout();
                        }
                        return false;
                    }

                    // به‌روزرسانی اطلاعات کاربر در state
                    set({ user: response.data });

                    // به‌روزرسانی اطلاعات کاربر در localStorage
                    saveUserData(response.data);

                    // اگر پروفایل کامل است، وضعیت ثبت‌نام ناقص را پاک می‌کنیم
                    if (response.data.firstname && response.data.lastname) {
                        get().clearIncompleteRegistration();
                        set({ hasIncompleteRegistration: false });
                    } else {
                        // اگر پروفایل ناقص است و توکن معتبر داریم، وضعیت ثبت‌نام ناقص را ذخیره می‌کنیم
                        get().saveIncompleteRegistration(response.data.phone_number, token);
                        set({ hasIncompleteRegistration: true });
                    }

                    return true;
                } catch (error) {
                    console.error('Error refreshing user info:', error);
                    return false;
                }
            },

            // Incomplete Registration Actions
            saveIncompleteRegistration: (phoneNumber, token) => {
                try {
                    // ذخیره اطلاعات ثبت‌نام ناقص در localStorage
                    saveIncompleteRegistrationData(phoneNumber, token);
                    set({ hasIncompleteRegistration: true });
                } catch (error) {
                    console.error('Error saving incomplete registration:', error);
                }
            },

            clearIncompleteRegistration: () => {
                try {
                    // پاک کردن اطلاعات ثبت‌نام ناقص از localStorage
                    clearIncompleteRegistration();
                    set({ hasIncompleteRegistration: false });
                } catch (error) {
                    console.error('Error clearing incomplete registration:', error);
                }
            },

            checkIncompleteRegistration: () => {
                try {
                    // بررسی وضعیت ثبت‌نام ناقص در localStorage
                    const incompleteRegData = getIncompleteRegistrationData();

                    if (!incompleteRegData) {
                        set({ hasIncompleteRegistration: false });
                        return false;
                    }

                    // بررسی انقضا
                    if (isIncompleteRegistrationExpired()) {
                        // اگر منقضی شده، پاک می‌کنیم
                        get().clearIncompleteRegistration();
                        return false;
                    }

                    // اگر توکن وجود دارد و منقضی نشده، ثبت‌نام ناقص داریم
                    set({ hasIncompleteRegistration: true });
                    return true;
                } catch (error) {
                    console.error('Error checking incomplete registration:', error);
                    set({ hasIncompleteRegistration: false });
                    return false;
                }
            },

            // UI Actions
            setLoading: (loading) => set({ isLoading: loading }),
            setPhoneNumber: (phone) => set({ phoneNumber: phone }),
            setOtpCode: (otp) => set({ otpCode: otp }),
            setOtpExpiry: (expiry) => set({ otpExpiry: expiry }),
            setAuthDrawerOpen: (open) => set({ isAuthDrawerOpen: open }),
            setCurrentStep: (step) => set({ currentStep: step }),

            resetAuthForm: () => set({
                phoneNumber: '',
                otpCode: '',
                otpExpiry: null,
                currentStep: 'phone'
            }),

            // Utils
            isOtpExpired: () => {
                const { otpExpiry } = get();
                if (!otpExpiry) return true;
                return Date.now() > otpExpiry;
            },

            isUserComplete: () => {
                const { user } = get();
                return !!user && !!user.firstname && !!user.lastname;
            },

            // OTP Actions
            requestOtp: async (phoneNumber) => {
                set({ isLoading: true });

                try {
                    const response = await authApi.requestOtp(phoneNumber);

                    if (response.error || !response.data) {
                        toast.error(response.message || 'خطا در ارسال کد تأیید');
                        return false;
                    }

                    // محاسبه زمان انقضای کد OTP
                    const expiryTime = Date.now() + (response.data.expires_in * 1000);

                    set({
                        phoneNumber,
                        otpExpiry: expiryTime,
                        currentStep: 'otp'
                    });

                    // در محیط توسعه، نمایش کد OTP
                    if (response.data.development_code && process.env.NODE_ENV === 'development') {
                        console.log('Development OTP Code:', response.data.development_code);
                        toast.info(`کد تأیید (فقط در محیط توسعه): ${response.data.development_code}`);
                    } else {
                        toast.success('کد تأیید با موفقیت ارسال شد');
                    }

                    return true;
                } catch (error) {
                    console.error('Error requesting OTP:', error);
                    toast.error('خطا در برقراری ارتباط با سرور');
                    return false;
                } finally {
                    set({ isLoading: false });
                }
            },

            verifyOtp: async (phoneNumber, otpCode) => {
                set({ isLoading: true });

                try {
                    const response = await authApi.verifyOtp(phoneNumber, otpCode);

                    if (response.error || !response.data) {
                        toast.error(response.message || 'کد وارد شده نامعتبر است');
                        return false;
                    }

                    const tokenResponse = response.data;
                    const token = tokenResponse.access_token;

                    // دریافت اطلاعات کاربر
                    const userResponse = await authApi.getUserInfo(token);

                    if (userResponse.error || !userResponse.data) {
                        toast.error(userResponse.message || 'خطا در دریافت اطلاعات کاربر');
                        return false;
                    }

                    const user = userResponse.data;

                    // ذخیره اطلاعات کاربر و توکن در state
                    set({
                        user,
                        token,
                        isAuthenticated: true
                    });

                    // ذخیره توکن و اطلاعات کاربر در localStorage
                    saveAuthToken(token);
                    saveUserData(user);

                    // بررسی تکمیل بودن پروفایل
                    const isComplete = !!user.firstname && !!user.lastname;

                    if (!isComplete) {
                        // اگر پروفایل کامل نباشد، به مرحله تکمیل پروفایل می‌رویم
                        // و وضعیت ثبت‌نام ناقص را ذخیره می‌کنیم
                        get().saveIncompleteRegistration(phoneNumber, token);
                        set({
                            currentStep: 'register',
                            hasIncompleteRegistration: true
                        });
                        return true;
                    }

                    // اگر پروفایل کامل باشد، درایور بسته می‌شود
                    set({
                        isAuthDrawerOpen: false,
                        currentStep: 'phone',
                        phoneNumber: '',
                        otpCode: '',
                        otpExpiry: null,
                        hasIncompleteRegistration: false
                    });

                    // پاک کردن وضعیت ثبت‌نام ناقص
                    get().clearIncompleteRegistration();

                    toast.success('ورود با موفقیت انجام شد');
                    return true;
                } catch (error) {
                    console.error('Error verifying OTP:', error);
                    toast.error('خطا در برقراری ارتباط با سرور');
                    return false;
                } finally {
                    set({ isLoading: false });
                }
            }
        }),
        {
            name: 'auth-storage',
            // فقط این فیلدها در localStorage ذخیره می‌شوند
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);