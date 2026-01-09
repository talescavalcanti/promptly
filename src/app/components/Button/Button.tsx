
import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    fullWidth?: boolean;
    loading?: boolean;
    children: React.ReactNode;
}

export const Button = ({
    variant = 'primary',
    fullWidth,
    loading,
    className,
    children,
    disabled,
    ...props
}: ButtonProps) => {
    const variantClass = styles[variant];
    const fullWidthClass = fullWidth ? styles.fullWidth : '';
    const loadingClass = loading ? styles.loading : '';

    return (
        <button
            className={`${styles.button} ${variantClass} ${fullWidthClass} ${loadingClass} ${className || ''}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <div className={styles.spinner} aria-hidden="true">
                    <div className={styles.spinnerInner}></div>
                </div>
            )}
            <span className={loading ? styles.hiddenText : ''}>{children}</span>
        </button>
    );
};
