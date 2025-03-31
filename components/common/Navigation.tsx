// src/components/common/Navigation.tsx
"use client";
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import type { TabItem } from "@/components/common/NavigationTabs";

interface NavigationProps {
    tabs: TabItem[];
    className?: string;
    activeColor?: string;
    defaultSelected?: number;
}

const buttonVariants = {
    initial: {
        gap: 0,
        paddingLeft: ".5rem",
        paddingRight: ".5rem",
    },
    animate: (isSelected: boolean) => ({
        gap: isSelected ? ".75rem" : 0,
    }),
};

const spanVariants = {
    initial: {
        width: 0,
        opacity: 0,
        x: -6,
        scale: 0.95,
    },
    animate: {
        width: "auto",
        opacity: 1,
        x: 0,
        scale: 1,
    },
    exit: {
        width: 0,
        opacity: 0,
        x: 6,
        scale: 0.95,
        transition: {
            duration: 0.2,
            ease: "easeIn",
        },
    },
};

export function Navigation({
                               tabs,
                               className,
                               activeColor = "text-primary",
                               defaultSelected = 0,
                           }: NavigationProps) {
    const pathname = usePathname();
    const outsideClickRef = React.useRef(null);
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

    // تابع اصلاح شده برای تشخیص تب فعال با پشتیبانی از مسیرهای زیرمجموعه
    const getCurrentTabIndex = React.useCallback(() => {
        if (!pathname) return defaultSelected;

        // ابتدا بررسی می‌کنیم آیا مسیر دقیقا مطابقت دارد
        const exactMatchIndex = tabs.findIndex(
            (tab) => "path" in tab && tab.path === pathname
        );

        if (exactMatchIndex !== -1) return exactMatchIndex;

        // اگر مطابقت دقیق پیدا نشد، به دنبال مسیر پایه می‌گردیم
        // مثلا مسیر '/reservation/success' باید تب '/reservation' را فعال کند
        return tabs.findIndex(
            (tab) => "path" in tab && tab.path !== "/" && pathname.startsWith(tab.path as string)
        );
    }, [tabs, pathname, defaultSelected]);

    const [selected, setSelected] = React.useState<number>(defaultSelected || getCurrentTabIndex());

    // به‌روزرسانی تب فعال با تغییر pathname
    React.useEffect(() => {
        const currentIndex = getCurrentTabIndex();
        if (currentIndex !== -1) {
            setSelected(currentIndex);
        }
    }, [pathname, getCurrentTabIndex]);

    // گوش دادن به رویداد path-changed برای به‌روزرسانی تب فعال از صفحات دیگر
    React.useEffect(() => {
        const handlePathChange = () => {
            const currentIndex = getCurrentTabIndex();
            if (currentIndex !== -1) {
                setSelected(currentIndex);
            }
        };

        window.addEventListener('path-changed', handlePathChange);

        return () => {
            window.removeEventListener('path-changed', handlePathChange);
        };
    }, [getCurrentTabIndex]);

    const handleSelect = React.useCallback((index: number, onClick?: () => void) => {
        if (onClick) {
            onClick();
            if ("path" in tabs[index] && tabs[index].path) {
                setSelected(index);
            }
        }
    }, [tabs, setSelected]);

    return (
        <div className="w-full flex justify-center">
            <div
                ref={outsideClickRef}
                className={cn(
                    "flex flex-wrap items-center justify-center gap-2 rounded-2xl border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/50 p-1 shadow-sm max-w-fit touch-none select-none",
                    className
                )}
            >
                {tabs.map((tab, index) => {
                    if (tab.type === "separator") {
                        return (
                            <div
                                key={`separator-${index}`}
                                className="mx-1 h-[24px] w-[1.2px] bg-border"
                                aria-hidden="true"
                            />
                        );
                    }

                    const Icon: LucideIcon = tab.icon;
                    const isSelected = selected === index && "path" in tab;
                    const isHovered = hoveredIndex === index;
                    const showTitle = !tab.hideTitle && isSelected && tab.title;

                    return (
                        <motion.button
                            key={index}
                            variants={buttonVariants}
                            initial="initial"
                            animate="animate"
                            custom={isSelected}
                            onClick={() => handleSelect(index, tab.onClick)}
                            onHoverStart={() => setHoveredIndex(index)}
                            onHoverEnd={() => setHoveredIndex(null)}
                            className={cn(
                                "relative flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-300 whitespace-nowrap",
                                isSelected && cn("bg-muted/50", activeColor),
                                isHovered && !isSelected && "bg-muted/50 text-foreground",
                                !isSelected && !isHovered && "text-muted-foreground"
                            )}
                        >
                            <motion.div
                                initial={{ scale: 1 }}
                                whileTap={{
                                    scale: 0.95,
                                    transition: { duration: 0.15, ease: "easeInOut" },
                                }}
                                className="flex items-center"
                            >
                                <Icon
                                    size={20}
                                    className={cn(
                                        "transition-transform duration-300",
                                        isSelected ? "scale-110" : "scale-100"
                                    )}
                                />
                                <AnimatePresence mode="wait">
                                    {showTitle && (
                                        <motion.span
                                            variants={spanVariants}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                            className="overflow-hidden mr-2"
                                        >
                                            {tab.title}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}