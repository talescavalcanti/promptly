'use client';

import { motion } from 'framer-motion';

/**
 * Dashboard Template.
 * Ensures that transitions between /dashboard and /dashboard/settings (and others)
 * are always animated, even though they share the same DashboardLayout.
 */
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                scale: 0.98,
                filter: 'blur(12px)',
                y: 15
            }}
            animate={{
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
                y: 0
            }}
            transition={{
                duration: 0.5,
                ease: [0.32, 0.72, 0, 1], // Apple Standard Easing (Quintic)
            }}
        >
            {children}
        </motion.div>
    );
}
