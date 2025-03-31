// src/app/rules/page.tsx
'use client';

import RulesSection from '@/components/sections/rules/RulesSection';

export default function RulesPage() {
    return (
        <main className="flex min-h-screen flex-col items-center p-2 gap-3">
            <RulesSection />
        </main>
    );
}