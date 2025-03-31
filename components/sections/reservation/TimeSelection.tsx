// components/sections/reservation/TimeSelection.tsx
'use client';

import { CustomTimeSelectDrawer } from '@/components/ui/custom/time-picker';
import { SectionTitle } from '@/components/ui/custom/section-title';
import { useReservationState } from '@/states/reservationState';

export function TimeSelection() {
    const { setTime, needsDoubleSlot } = useReservationState();

    const handleTimeChange = (time: string) => {
        setTime(time);
    };

    return (
        <div>
            <SectionTitle>انتخاب ساعت</SectionTitle>
            <div className="mt-0">
                <CustomTimeSelectDrawer
                    onChange={handleTimeChange}
                    requiresDoubleSlot={needsDoubleSlot}
                />
            </div>
        </div>
    );
}