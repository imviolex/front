// src/app/layout.tsx

import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/providers/theme-provider";
import "../styles/globals.css";
import localFont from 'next/font/local';
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/shadcn/sonner";
import { PageTransition } from "@/components/common/PageTransition";

const dana = localFont({
    src: [
        {
            path: '../../public/font/Dana-Medium.woff2',
            weight: '400',
            style: 'normal',
        },
        {
            path: '../../public/font/Dana-Bold.woff2',
            weight: '700',
            style: 'normal',
        },
    ],
    variable: '--font-dana'
});

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1.0,
    maximumScale: 1.0,
    minimumScale: 1.0,
    userScalable: false,
    viewportFit: "cover",
    interactiveWidget: "resizes-visual",
};

export const metadata: Metadata = {
    title: "پیرایش مهدی",
    description: "سیستم رزرو نوبت آرایشگاه",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fa" dir="rtl" suppressHydrationWarning>
        <body className={`${dana.variable} font-dana`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="barber-theme"
        >
            <Toaster />
            <Header />
            <PageTransition>
                {children}
            </PageTransition>
        </ThemeProvider>
        </body>
        </html>
    );
}