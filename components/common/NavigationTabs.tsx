// src/components/common/NavigationTabs.tsx
'use client';

import {
    HomeIcon,
    CalendarDays,
    FileText,
    SunIcon,
    MoonIcon,
    SunMoon,
    User,
    LucideIcon
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";

export type NavigationPath = "/" | "/reservation" | "/rules" | "/profile";

type TabItem = {
    title?: string;
    icon: LucideIcon;
    onClick?: () => void;
    path?: NavigationPath;
    hideTitle?: boolean;
    type?: never;
} | {
    type: "separator";
    title?: never;
    icon?: never;
    onClick?: never;
    path?: never;
};

export const useNavigationTabs = () => {
    const { theme, setTheme, systemTheme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const currentTheme = theme === 'system' ? systemTheme : theme;

    const getThemeIcon = (): LucideIcon => {
        if (theme === 'system') {
            return SunMoon;
        }
        return currentTheme === 'dark' ? SunIcon : MoonIcon;
    };

    const toggleTheme = () => {
        if (theme === 'system') {
            setTheme('light');
        } else if (theme === 'light') {
            setTheme('dark');
        } else {
            setTheme('system');
        }
    };

    const createNavigationHandler = (path: NavigationPath) => () => {
        if (pathname !== path) {
            router.push(path);
        }
    };

    const tabs: TabItem[] = [
        {
            icon: getThemeIcon(),
            onClick: toggleTheme,
            hideTitle: true
        },
        {
            type: "separator"
        },
        {
            title: "صفحه اصلی",
            icon: HomeIcon,
            path: "/",
            onClick: createNavigationHandler("/")
        },
        {
            title: "رزرو نوبت",
            icon: CalendarDays,
            path: "/reservation",
            onClick: createNavigationHandler("/reservation")
        },
        {
            title: "قوانین رزرو",
            icon: FileText,
            path: "/rules",
            onClick: createNavigationHandler("/rules")
        },
        {
            title: "حساب کاربری",
            icon: User,
            path: "/profile",
            onClick: createNavigationHandler("/profile")
        },
    ];

    return tabs;
};

export type { TabItem };