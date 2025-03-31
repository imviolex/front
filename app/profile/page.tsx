// src/app/profile/page.tsx
'use client';

import { ProfileSection } from '@/components/sections/profile/ProfileSection';

export default function ProfilePage() {
    return (
        <main className="flex items-start justify-center p-2">
            <ProfileSection />
        </main>
    );
}