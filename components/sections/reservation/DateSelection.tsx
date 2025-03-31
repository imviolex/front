// src/components/sections/reservation/DateSelection.tsx
'use client';

import { DateWheelPickerDrawer } from '@/components/ui/custom/date-picker';
import { SectionTitle } from '@/components/ui/custom/section-title';
import { useReservationState } from '@/states/reservationState';
import { format } from 'date-fns';

interface DateValue {
    date: Date;
    formatted: string;
    weekDay: {
        index: number;
    };
    toUnix: () => number;
}

export function DateSelection() {
    const { setDate } = useReservationState();

    const handleDateChange = (selectedDate: Date) => {
        const dateValue: DateValue = {
            date: selectedDate,
            formatted: format(selectedDate, 'yyyy-MM-dd'),
            weekDay: {
                index: selectedDate.getDay()
            },
            toUnix: () => Math.floor(selectedDate.getTime() / 1000)
        };

        setDate(dateValue);
    };

    return (
        <div>
            <SectionTitle>انتخاب روز</SectionTitle>
            <div className="mt-5">
                <DateWheelPickerDrawer onChange={handleDateChange} />
            </div>
        </div>
    );
}