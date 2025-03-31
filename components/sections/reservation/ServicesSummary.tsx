// src/components/sections/reservation/ServicesSummary.tsx
'use client';

import { motion } from 'framer-motion';
import { Timer } from "lucide-react";
import { useReservationState } from '@/states/reservationState';
import { toPersianPrice, toPersianNumbers } from "@/lib/utils/persian-numbers";

export function ServicesSummary() {
    const {
        selectedServices,
        services,
        totalPrice,
        totalDuration,
        depositAmount
    } = useReservationState();

    if (selectedServices.length === 0) return null;

    return (
        <motion.div
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="cursor-pointer rounded-xl p-6 bg-muted/40 border"
        >
            <h3 className="font-bold text-foreground mb-4">خلاصه سفارش</h3>

            <div className="space-y-2">
                {selectedServices.map((id) => {
                    const service = services.find(s => s.id === id);
                    if (!service) return null;

                    return (
                        <div key={id} className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                                {service.name}
                            </span>
                            <span className="text-sm text-foreground">
                                {toPersianPrice(service.price)} تومان
                            </span>
                        </div>
                    );
                })}

                <div className="border-t border-border mt-4 pt-4">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">مبلغ کل</span>
                        <span className="font-medium text-foreground">
                            {toPersianPrice(totalPrice)} تومان
                        </span>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-muted-foreground">
                            مبلغ بیعانه
                        </span>
                        <span className="text-sm text-foreground">
                            {toPersianPrice(depositAmount)} تومان
                        </span>
                    </div>

                    <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Timer strokeWidth={2.5} className="h-4 w-4" />
                            <span className="text-sm">
                                زمان تقریبی: {toPersianNumbers(totalDuration)} دقیقه
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}