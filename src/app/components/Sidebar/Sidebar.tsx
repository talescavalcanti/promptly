
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const navItems = [
    { label: 'Gerador', href: '/dashboard', icon: '✨' },
    { label: 'Meus Prompts', href: '/dashboard/library', icon: '📚' },
    { label: 'Modelos', href: '/dashboard/templates', icon: '🎨' },
    { label: 'Configurações', href: '/dashboard/settings', icon: '⚙️' },
];

export const Sidebar = () => {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <Link href="/" className={styles.brand}>
                Promptly
            </Link>
            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.item} ${pathname === item.href ? styles.active : ''}`}
                    >
                        <span>{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>
            <div className={styles.user}>
                <div className={styles.avatar}>T</div>
                <div className={styles.userInfo}>
                    <span className={styles.userName}>Taless</span>
                    <span className={styles.userEmail}>Pro Plan</span>
                </div>
            </div>
        </aside>
    );
};
