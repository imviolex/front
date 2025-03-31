// src/components/layout/Header.tsx
'use client';

import dynamic from 'next/dynamic';
import { useNavigationTabs } from '@/components/common/NavigationTabs';

const Navigation = dynamic(
    () => import('@/components/common/Navigation').then(mod => mod.Navigation),
    { ssr: false }
);

export function Header() {
    const tabs = useNavigationTabs();

    return (
        <nav className="w-full fixed top-4 z-50">
            <Navigation
                tabs={tabs}
                activeColor="text-primary"
                className="border-border"
                defaultSelected={2}
            />
        </nav>
    );
}