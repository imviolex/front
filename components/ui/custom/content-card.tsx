// src/components/ui/custom/content-card.tsx
'use client';

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/shadcn/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/shadcn/button";

const MotionCard = motion(Card);

const fadeInVariants = {
    initial: {
        opacity: 0,
        y: 10
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.32, 0.72, 0, 1]
        }
    }
};

interface ContentCardProps {
    children: React.ReactNode;
    className?: string;
    footerIcon?: React.ReactNode;
    headerContent?: React.ReactNode;
    footerContent?: React.ReactNode;
    onFooterClick?: () => void;
    footerText?: React.ReactNode; // تغییر از string به React.ReactNode
    isFooterDisabled?: boolean; // اضافه کردن این پراپ جدید
}

export function ContentCard({
                                children,
                                className,
                                headerContent,
                                footerContent,
                                onFooterClick,
                                footerIcon,
                                footerText,
                                isFooterDisabled = false // مقدار پیش‌فرض false
                            }: ContentCardProps) {
    return (
        <div className="flex flex-col items-center max-w-3xl mx-auto px-1">
            <MotionCard
                className={cn("w-full relative overflow-hidden", className)}
                variants={fadeInVariants}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                {headerContent && (
                    <div className="flex items-center bg-primary/10 dark:bg-primary/10 px-4 py-2.5 border-b">
                        {headerContent}
                    </div>
                )}

                <div className="p-4 md:p-6">
                    <div className="text-muted-foreground space-y-4 relative">
                        {children}
                    </div>
                </div>

                {(footerContent || footerText) && (
                    <div className="flex items-center bg-primary/10 dark:bg-primary/5 px-4 py-1.5 border-t">
                        {footerContent || (
                            <Button
                                variant="ghost"
                                className="w-full text-sm font-bold text-primary/70 hover:text-primary/70 hover:bg-transparent flex items-center justify-center gap-2"
                                onClick={onFooterClick}
                                disabled={isFooterDisabled}
                            >
                                {footerIcon}
                                {footerText}
                            </Button>
                        )}
                    </div>
                )}
            </MotionCard>
        </div>
    );
}