// src/components/ui/custom/three-dots-loader.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils'; // اطمینان حاصل کنید که این تابع را در پروژه دارید

interface ThreeDotsLoaderProps {
    color?: string;
    size?: number; // می‌توانید همان عدد را نگه دارید
    gap?: number;
    rtl?: boolean;
    className?: string; // اضافه کردن className برای انعطاف‌پذیری بیشتر
}

export function ThreeDotsLoader({
                                    color = 'currentColor',
                                    size = 4,
                                    gap = 2,
                                    rtl = false,
                                    className
                                }: ThreeDotsLoaderProps) {
    // ایجاد آرایه برای نقطه‌ها
    const dots = [0, 1, 2];

    // اگر rtl باشد، ترتیب را همان 0,1,2 نگه می‌داریم
    // اگر ltr باشد (rtl=false)، ترتیب را معکوس می‌کنیم تا 2,1,0 شود
    const orderedDots = rtl ? dots : [...dots].reverse();

    // تعیین کلاس‌ها برای هر نقطه بر اساس سایز
    const dotSize = {
        1: 'h-1 w-1',
        2: 'h-2 w-2',
        3: 'h-3 w-3',
        4: 'h-4 w-4',
    }[size] || 'h-4 w-4';

    // تعیین کلاس‌ها برای فاصله‌ها
    const gapSize = {
        1: 'gap-1',
        2: 'gap-2',
        3: 'gap-3',
        4: 'gap-4',
    }[gap] || 'gap-2';

    return (
        <div className={cn(`flex items-center justify-center ${gapSize}`, className)}>
            {orderedDots.map((index) => (
                <motion.div
                    key={index}
                    className={`${dotSize} rounded-full`}
                    style={{ backgroundColor: color }}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0.3 }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        delay: index * 0.2,
                    }}
                />
            ))}
        </div>
    );
}