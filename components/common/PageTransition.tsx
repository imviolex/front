// src/components/common/PageTransition.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import NextTopLoader from 'nextjs-toploader';

interface PageTransitionProps {
    children: React.ReactNode;
}

const pageVariants = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.2, // کاهش زمان
            ease: 'easeOut'
        }
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.1, // کاهش زمان خروج
        }
    }
};

export function PageTransition({ children }: PageTransitionProps) {
    return (
        <>
            <NextTopLoader
                color="#2563eb"
                height={2}
                showSpinner={false}
                speed={150} // سرعت بیشتر
            />
            <AnimatePresence mode="wait">
                <motion.div
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </>
    );
}