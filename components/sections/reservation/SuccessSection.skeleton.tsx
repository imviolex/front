// src/components/sections/reservation/SuccessSection.skeleton.tsx
import React from 'react';
import {Skeleton} from "@/components/ui/shadcn/skeleton";

// اسکلتون برای شماره پیگیری
export const RefIdSkeleton = () => (
    <Skeleton className="h-4 w-20" />
);

// اسکلتون برای نام آرایشگر
export const BarberNameSkeleton = () => (
    <Skeleton className="h-4 w-24" />
);

// اسکلتون برای تاریخ نوبت
export const DateSkeleton = () => (
    <Skeleton className="h-4 w-44" />
);

// اسکلتون برای زمان نوبت
export const TimeSkeleton = () => (
    <Skeleton className="h-4 w-36" />
);

// اسکلتون برای لیست خدمات
export const ServicesSkeleton = () => (
    <>
        {[1, 2, 3].map((index) => (
            <div key={index} className="flex justify-between items-center mb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
            </div>
        ))}
    </>
);

// اسکلتون برای مبلغ کل
export const TotalPriceSkeleton = () => (
    <Skeleton className="h-5 w-28" />
);

// اسکلتون برای مبلغ پرداخت شده
export const PaidAmountSkeleton = () => (
    <Skeleton className="h-4 w-24" />
);