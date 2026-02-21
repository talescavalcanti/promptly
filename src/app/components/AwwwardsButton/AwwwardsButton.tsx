'use client';

import React, { useRef, useCallback } from 'react';
import styles from './AwwwardsButton.module.css';

interface AwwwardsButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
}

export const AwwwardsButton = ({ children, onClick }: AwwwardsButtonProps) => {
    const wrapRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const rect = wrap.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        wrap.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px) scale(1.02)`;
        wrap.style.transition = 'transform 0.1s ease-out';
    }, []);

    const handleMouseLeave = useCallback(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        wrap.style.transform = 'translate(0px, 0px) scale(1)';
        wrap.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    }, []);

    return (
        <div className={styles.buttonWrapper}>
            <div
                className={styles.magneticWrap}
                ref={wrapRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <button className={`${styles.awwwardsBtn} cursor-target`} onClick={onClick}>
                    <svg className={styles.borderSvg}>
                        <rect width="100%" height="100%" rx="26" ry="26" pathLength="100"></rect>
                    </svg>

                    <div className={styles.dynamicDot}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </div>

                    <span className={styles.btnText}>{children}</span>
                </button>
            </div>
        </div>
    );
};
