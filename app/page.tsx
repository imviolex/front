
'use client';

import { IntroSection } from '@/components/sections/home/IntroSection';
import { BrideGroomSection } from '@/components/sections/home/BrideGroomSection';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center p-2 gap-2">
            <IntroSection />
            <BrideGroomSection />
        </main>
    );
}