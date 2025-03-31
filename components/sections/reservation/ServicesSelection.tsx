// src/components/sections/reservation/ServicesSelection.tsx
'use client';

import { useEffect, useState } from 'react';
import { SectionTitle } from '@/components/ui/custom/section-title';
import { ServiceCard } from '@/components/ui/custom/service-card';
import { useReservationState } from '@/states/reservationState';
import { ServiceCardSkeleton } from './ServiceCard.skeleton';
import { ApiErrorMessage } from '@/components/ui/custom/api-error-message';

export function ServicesSelection() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {
        services,
        selectedServices,
        toggleService,
        fetchServices
    } = useReservationState();

    useEffect(() => {
        const loadServices = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await fetchServices();
                if (result.error) {
                    setError(result.message);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadServices();
    }, [fetchServices]);

    const handleSelect = (id: string | number) => {
        toggleService(Number(id));
    };

    if (isLoading) {
        return (
            <div className="space-y-5">
                <SectionTitle>انتخاب خدمات</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array(8).fill(null).map((_, index) => (
                        <ServiceCardSkeleton key={index} index={index} />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-5">
                <SectionTitle>انتخاب خدمات</SectionTitle>
                <ApiErrorMessage message={error} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array(8).fill(null).map((_, index) => (
                        <ServiceCardSkeleton key={index} index={index} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <SectionTitle>انتخاب خدمات</SectionTitle>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service) => (
                    <ServiceCard
                        key={service.id}
                        id={service.id}
                        selected={selectedServices.includes(service.id)}
                        onSelect={handleSelect}
                        title={service.name}
                        description={service.description}
                        price={service.price}
                        duration={service.duration}
                    />
                ))}
            </div>
        </div>
    );
}