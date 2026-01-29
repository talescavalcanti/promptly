
import React from 'react';
import GlassSurface from '../GlassSurface/GlassSurface';
import styles from './GlassButton.module.css';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    fullWidth?: boolean;
    loading?: boolean;
    children: React.ReactNode;
    // Glass Surface Props passthrough
    glassOpacity?: number;
    glassBlur?: number;
    glassBorderRadius?: number;
    className?: string; // Additional classes for the button
}

export const GlassButton = ({
    fullWidth,
    loading,
    children,
    disabled,
    className = '',
    glassOpacity = 0.93,
    glassBlur = 11,
    glassBorderRadius = 30, // Default to a more pill-like shape for buttons
    ...props
}: GlassButtonProps) => {

    return (
        <button
            className={`${styles.buttonReset} ${fullWidth ? styles.fullWidth : ''} ${className}`}
            disabled={disabled || loading}
            {...props}
            style={{ borderRadius: glassBorderRadius, ...props.style }}
        >
            <GlassSurface
                borderRadius={glassBorderRadius}
                opacity={glassOpacity}
                blur={glassBlur}
                className={styles.glassContainer}
                width={fullWidth ? '100%' : undefined}
                height={'100%'}
            >
                <span className={styles.content}>
                    {loading && (
                        <span className={styles.spinner} aria-hidden="true">
                            <span className={styles.spinnerInner}></span>
                        </span>
                    )}
                    <span className={loading ? styles.hiddenText : ''} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {children}
                    </span>
                </span>
            </GlassSurface>
        </button>
    );
};
