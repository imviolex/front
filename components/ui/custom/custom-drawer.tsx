// src/components/ui/custom/custom-drawer.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
    Drawer as ShadcnDrawer,
    DrawerContent as ShadcnDrawerContent,
    DrawerClose as ShadcnDrawerClose,
    DrawerTrigger as ShadcnDrawerTrigger,
    DrawerTitle as ShadcnDrawerTitle,
    DrawerDescription as ShadcnDrawerDescription,
    DrawerFooter as ShadcnDrawerFooter,
    DrawerHeader as ShadcnDrawerHeader
} from '@/components/ui/shadcn/drawer';
import { Button } from '@/components/ui/shadcn/button';
import { cn } from '@/lib/utils';

type CustomDrawerProps = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    direction?: 'bottom' | 'left' | 'right' | 'top';
    showCloseButton?: boolean;
    closeButtonText?: string;
    title?: string;
    description?: string;
    children: React.ReactNode;
    trigger?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    contentClassName?: string;
    headerClassName?: string;
    bodyClassName?: string;
    placement?: 'center' | 'right' | 'left';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    minHeight?: 'auto' | 'min' | 'medium' | 'large' | 'full';
    disableScroll?: boolean;
};

export function CustomDrawer({
                                 open,
                                 onOpenChange,
                                 direction = 'bottom',
                                 showCloseButton = true,
                                 closeButtonText = 'بستن',
                                 title,
                                 description,
                                 children,
                                 trigger,
                                 footer,
                                 className,
                                 contentClassName,
                                 headerClassName,
                                 bodyClassName,
                                 placement = 'center',
                                 size = 'md',
                                 minHeight = 'auto',
                                 disableScroll = false
                             }: CustomDrawerProps) {

    const [isMobile, setIsMobile] = useState(false);

    // تشخیص موبایل
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);

    // تعیین کلاس‌های مربوط به سایز
    const getSizeClass = () => {
        switch (size) {
            case 'xs': return 'md:max-w-xs';
            case 'sm': return 'md:max-w-sm';
            case 'md': return 'md:max-w-md';
            case 'lg': return 'md:max-w-lg';
            case 'xl': return 'md:max-w-xl';
            default: return 'md:max-w-md';
        }
    };

    // تعیین کلاس‌های مربوط به موقعیت قرارگیری
    const getPlacementClass = () => {
        switch (placement) {
            case 'center': return 'md:mx-auto';
            case 'right': return 'md:mr-3 md:ml-auto';
            case 'left': return 'md:ml-4 md:mr-auto';
            default: return 'md:mx-auto';
        }
    };

    // تعیین کلاس‌های مربوط به حداقل ارتفاع
    const getMinHeightClass = () => {
        if (!isMobile) return '';

        switch (minHeight) {
            case 'min': return 'min-h-[50vh]';
            case 'medium': return 'min-h-[57vh]';
            case 'large': return 'min-h-[57vh]';
            case 'full': return 'min-h-[90vh]';
            case 'auto':
            default: return '';
        }
    };

    // تعیین کلاس مربوط به ارتفاع محتوا
    const getContentHeightClass = () => {
        // اگر اسکرول غیرفعال شده باشد، کلاسی برای اسکرول اضافه نمی‌کنیم
        if (disableScroll) return '';

        if (!isMobile) return 'max-h-[50vh] overflow-y-auto';

        switch (minHeight) {
            case 'min': return 'max-h-[45vh] overflow-y-auto';
            case 'medium': return 'max-h-[55vh] overflow-y-auto';
            case 'large': return 'max-h-[58vh] overflow-y-auto';
            case 'full': return 'max-h-[85vh] overflow-y-auto';
            case 'auto':
            default: return '';
        }
    };

    return (
        <ShadcnDrawer open={open} onOpenChange={onOpenChange} direction={direction}>
            {trigger && <ShadcnDrawerTrigger asChild>{trigger}</ShadcnDrawerTrigger>}

            <ShadcnDrawerContent className={cn(
                "p-0",
                getSizeClass(),
                getPlacementClass(),
                getMinHeightClass(),
                "md:w-full md:rounded-t-xl",
                className,
                contentClassName
            )}>
                <div className="flex flex-col rounded-t-xl overflow-hidden h-full">
                    {(title || showCloseButton) && (
                        <div className={cn("flex justify-between items-center px-6 pt-6 pb-4", headerClassName)}>
                            {title && <ShadcnDrawerTitle className="text-lg font-semibold">{title}</ShadcnDrawerTitle>}
                            {description && <ShadcnDrawerDescription>{description}</ShadcnDrawerDescription>}

                            {showCloseButton && (
                                <ShadcnDrawerClose asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-lg hover:bg-transparent hover:text-inherit focus:ring-primary/20"
                                    >
                                        {closeButtonText}
                                    </Button>
                                </ShadcnDrawerClose>
                            )}
                        </div>
                    )}

                    <div className={cn("px-6 pb-3 flex-1", getContentHeightClass(), bodyClassName)}>
                        {children}
                    </div>

                    {footer && <ShadcnDrawerFooter>{footer}</ShadcnDrawerFooter>}
                </div>
            </ShadcnDrawerContent>
        </ShadcnDrawer>
    );
}

// صادر کردن اجزای اصلی drawer برای استفاده در صورت نیاز
export const DrawerTrigger = ShadcnDrawerTrigger;
export const DrawerClose = ShadcnDrawerClose;
export const DrawerTitle = ShadcnDrawerTitle;
export const DrawerDescription = ShadcnDrawerDescription;
export const DrawerFooter = ShadcnDrawerFooter;
export const DrawerHeader = ShadcnDrawerHeader;