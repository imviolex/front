// src/hooks/useAuth.ts
import { useEffect, useCallback } from 'react';
import { useAuthState } from '@/states/authState';
import { toast } from 'sonner';
import {
    getAuthToken,
    getUserData,
    isTokenExpired,
    clearAuthData,
    saveAuthToken,
    saveUserData,
    saveIncompleteRegistrationData,
    clearIncompleteRegistration as clearIncompleteRegistrationUtil
} from '@/lib/utils/auth';
import { UserResponse } from '@/lib/api/auth';

/**
 * هوک مدیریت احراز هویت
 * این هوک برای استفاده در کامپوننت‌ها و دسترسی به توابع حساب کاربری است
 */
export const useAuth = () => {
    const {
        user,
        token,
        isAuthenticated,
        hasIncompleteRegistration,
        phoneNumber,
        otpCode,
        otpExpiry,
        isAuthDrawerOpen,
        currentStep,
        isLoading,

        // اکشن‌ها
        setUserAndToken,
        setCurrentStep,
        logout,
        refreshUserInfo,
        setAuthDrawerOpen,
        saveIncompleteRegistration,
        checkIncompleteRegistration: checkIncompleteRegistrationState,
        clearIncompleteRegistration,
        setPhoneNumber,
        setOtpCode,
        requestOtp,
        verifyOtp,
        updateUserInfo,
        resetAuthForm,
        isOtpExpired
    } = useAuthState();

    // بررسی اعتبار توکن موجود هنگام بارگذاری اولیه
    useEffect(() => {
        const checkAuthStatus = async () => {
            // اگر کاربر در استیت موجود است، نیازی به بررسی دوباره نیست
            if (isAuthenticated && user && token) {
                // بررسی تکمیل بودن پروفایل
                if (!user.firstname || !user.lastname) {
                    // اگر پروفایل ناقص است، وضعیت ثبت‌نام ناقص را ذخیره می‌کنیم
                    saveIncompleteRegistration(user.phone_number, token);
                    saveIncompleteRegistrationData(user.phone_number, token);
                }
                return;
            }

            // بررسی localStorage برای توکن و کاربر
            const savedToken = getAuthToken();
            const savedUser = getUserData();

            // اگر توکن موجود است و منقضی نشده
            if (savedToken && !isTokenExpired() && savedUser) {
                // تبدیل تایپ User به UserResponse
                const userResponse: UserResponse = {
                    ...savedUser,
                    last_login: savedUser.last_login || '',
                };

                // ذخیره در استیت
                setUserAndToken(userResponse, savedToken);

                // بررسی تکمیل پروفایل
                if (!savedUser.firstname || !savedUser.lastname) {
                    saveIncompleteRegistration(savedUser.phone_number, savedToken);
                    saveIncompleteRegistrationData(savedUser.phone_number, savedToken);
                }

                // به‌روزرسانی اطلاعات کاربر از سرور (در پس‌زمینه)
                refreshUserInfo().catch((error) => {
                    console.error('Error refreshing user info:', error);
                });
            } else if (savedToken && isTokenExpired()) {
                // اگر توکن منقضی شده، لاگ‌آوت می‌کنیم
                clearAuthData();
                setUserAndToken(null, null);
            }

            // بررسی وضعیت ثبت‌نام ناقص
            checkIncompleteRegistrationState();
        };

        checkAuthStatus();
    }, [
        isAuthenticated,
        user,
        token,
        setUserAndToken,
        refreshUserInfo,
        saveIncompleteRegistration,
        checkIncompleteRegistrationState
    ]);

    // تابع باز کردن فرم ورود
    const openAuthDrawer = useCallback(() => {
        if (isAuthenticated && user?.firstname && user?.lastname) {
            toast.info('شما قبلاً وارد حساب کاربری خود شده‌اید');
            return;
        }

        // اگر ثبت‌نام ناقص داریم، مستقیم به مرحله ثبت‌نام می‌رویم
        if (hasIncompleteRegistration) {
            setCurrentStep('register');
        } else {
            setCurrentStep('phone');
        }

        setAuthDrawerOpen(true);
    }, [isAuthenticated, user, hasIncompleteRegistration, setCurrentStep, setAuthDrawerOpen]);

    // تابع باز کردن فرم ویرایش پروفایل
    const openEditProfileDrawer = useCallback(() => {
        if (!isAuthenticated || !user) {
            toast.error('برای ویرایش اطلاعات باید ابتدا وارد حساب کاربری خود شوید');
            return;
        }

        setCurrentStep('edit');
        setAuthDrawerOpen(true);
    }, [isAuthenticated, user, setCurrentStep, setAuthDrawerOpen]);

    // تابع خروج از حساب کاربری با تأیید
    const handleLogout = useCallback(async () => {
        const toastId = toast.loading('در حال خروج...', {
            duration: Infinity, // toast تا زمانی که دستی بسته نشود، باقی می‌ماند
        });

        const success = await logout();

        toast.dismiss(toastId); // toast در حال خروج را ببندید

        if (success) {
            toast.success('با موفقیت از حساب کاربری خود خارج شدید');
        } else {
            toast.error('خطا در خروج از حساب کاربری');
        }
    }, [logout]);

    // بررسی آیا پروفایل کاربر کامل است یا خیر
    const isProfileComplete = useCallback(() => {
        return !!user?.firstname && !!user?.lastname;
    }, [user]);

    // محاسبه نام کامل کاربر
    const getFullName = useCallback(() => {
        if (!user) return '';
        return `${user.firstname || ''} ${user.lastname || ''}`.trim();
    }, [user]);

    // تابعی برای بستن درایور احراز هویت
    const closeAuthDrawer = useCallback(() => {
        setAuthDrawerOpen(false);

        // فقط اگر ثبت‌نام ناقص نداریم، فرم را ریست می‌کنیم
        if (!hasIncompleteRegistration) {
            setTimeout(() => {
                resetAuthForm();
            }, 300);
        }
    }, [setAuthDrawerOpen, resetAuthForm, hasIncompleteRegistration]);

    // تابع به‌روزرسانی نام و نام خانوادگی کاربر
    const updateProfile = useCallback(async (firstname: string, lastname: string) => {
        const success = await updateUserInfo(firstname.trim(), lastname.trim());

        if (success) {
            // پاک کردن وضعیت ثبت‌نام ناقص در صورت موفقیت
            clearIncompleteRegistration();
            clearIncompleteRegistrationUtil();

            // ذخیره اطلاعات به‌روز شده در localStorage اگر کاربر موجود است
            if (user) {
                const updatedUser = {
                    ...user,
                    firstname: firstname.trim(),
                    lastname: lastname.trim()
                };
                saveUserData(updatedUser);

                // اگر توکن موجود است، آن را نیز به‌روزرسانی می‌کنیم
                if (token) {
                    saveAuthToken(token);
                }
            }

            // بستن درایور در صورت موفقیت
            setAuthDrawerOpen(false);
        }

        return success;
    }, [updateUserInfo, clearIncompleteRegistration, setAuthDrawerOpen, user, token]);

    // تابع ارسال و تأیید OTP
    const sendAndVerifyOtp = useCallback(async (phone: string, otp: string) => {
        if (!phone || !otp) return false;

        const success = await verifyOtp(phone, otp);
        return success;
    }, [verifyOtp]);

    // تابع بررسی وضعیت ثبت‌نام ناقص - بازنویسی با منطق بهتر
    const checkIncompleteRegistration = useCallback(() => {
        const hasIncomplete = checkIncompleteRegistrationState();

        // اگر ثبت‌نام ناقص داریم و کاربر احراز هویت شده، باید به مرحله تکمیل پروفایل برویم
        if (hasIncomplete && isAuthenticated) {
            setCurrentStep('register');
        }

        return hasIncomplete;
    }, [checkIncompleteRegistrationState, isAuthenticated, setCurrentStep]);

    // اضافه کردن تابع برای دسترسی به توکن
    const getToken = useCallback(() => {
        return token;
    }, [token]);

    // برگرداندن مقادیر و توابع مورد نیاز
    return {
        // state ها
        user,
        token,
        isAuthenticated,
        hasIncompleteRegistration,
        phoneNumber,
        otpCode,
        otpExpiry,
        isAuthDrawerOpen,
        currentStep,
        isLoading,

        // توابع خارجی شده برای کامپوننت‌ها
        openAuthDrawer,
        openEditProfileDrawer,
        closeAuthDrawer,
        logout: handleLogout,
        isProfileComplete,
        getFullName,
        updateProfile,
        sendAndVerifyOtp,
        getToken, // اضافه شده: تابع دسترسی به توکن

        // توابع اصلی از زوستند
        setPhoneNumber,
        setOtpCode,
        setCurrentStep,
        requestOtp,
        verifyOtp,
        isOtpExpired,
        checkIncompleteRegistration,
        saveIncompleteRegistration,
        clearIncompleteRegistration
    };
};