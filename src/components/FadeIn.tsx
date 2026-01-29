'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface FadeInProps {
    children: React.ReactNode;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    fullWidth?: boolean;
    className?: string;
}

export function FadeIn({
    children,
    delay = 0,
    direction = 'up',
    fullWidth = false,
    className = ''
}: FadeInProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });

    const getDirectionOffset = () => {
        switch (direction) {
            case 'up': return { y: 20, x: 0 };
            case 'down': return { y: -20, x: 0 };
            case 'left': return { x: 20, y: 0 };
            case 'right': return { x: -20, y: 0 };
            case 'none': return { x: 0, y: 0 };
            default: return { y: 20, x: 0 };
        }
    };

    const initial = { opacity: 0, ...getDirectionOffset() };

    return (
        <motion.div
            ref={ref}
            initial={initial}
            animate={isInView ? { opacity: 1, x: 0, y: 0 } : initial}
            transition={{
                duration: 0.6,
                delay: delay,
                ease: [0.25, 0.1, 0.25, 1.0],
            }}
            className={className}
            style={{
                width: fullWidth ? '100%' : 'auto',
                willChange: 'transform, opacity'
            }}
        >
            {children}
        </motion.div>
    );
}
