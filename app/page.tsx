// src/app/page.tsx
'use client';


export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center p-2 gap-2">
            <IntroSection />
            <BrideGroomSection />
        </main>
    );
}