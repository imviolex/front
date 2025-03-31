// src/components/sections/reservation/BarberSelection.tsx
'use client';

import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { SelectorCard } from '@/components/ui/custom/selector-card';
import { SectionTitle } from '@/components/ui/custom/section-title';
import { useReservationState } from '@/states/reservationState';
import { cn } from "@/lib/utils";
import type { Barber } from '@/types/reservation';
import { BarberSelectionSkeleton } from './BarberSelection.skeleton';
import { ApiErrorMessage } from '@/components/ui/custom/api-error-message';

export function BarberSelection() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { barbers, selectedBarber, setBarber, fetchBarbers } = useReservationState();

    useEffect(() => {
        const loadBarbers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await fetchBarbers();
                if (result.error) {
                    setError(result.message);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadBarbers();
    }, [fetchBarbers]);

    const handleSelect = (barberId: string) => {
        // چک کردن دسترسی آرایشگر
        const barber = barbers.find(b => String(b.id) === barberId);
        if (barber?.available) {
            setBarber(barberId);
        }
    };

    if (isLoading) {
        return <BarberSelectionSkeleton />;
    }

    if (error) {
        return (
            <div className="space-y-5">
                <SectionTitle>انتخاب آرایشگر</SectionTitle>
                <ApiErrorMessage message={error} />
                <BarberSelectionSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <SectionTitle>انتخاب آرایشگر</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {barbers.map((barber: Barber) => (
                    <SelectorCard
                        key={barber.id}
                        id={String(barber.id)}
                        selected={selectedBarber === String(barber.id)}
                        onSelect={handleSelect}
                        icon={
                            <User
                                className={cn(
                                    "h-5 w-5",
                                    !barber.available
                                        ? 'text-muted-foreground'
                                        : selectedBarber === String(barber.id)
                                            ? 'text-primary-foreground'
                                            : 'text-muted-foreground'
                                )}
                            />
                        }
                        title={`${barber.first_name} ${barber.last_name}`}
                        subtitle={barber.specialty}
                        className={cn(
                            'transition-all duration-200',
                            !barber.available && 'opacity-50 pointer-events-none select-none'
                        )}
                    />
                ))}
            </div>
        </div>
    );
}