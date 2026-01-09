
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import styles from './Sidebar.module.css';
import { User } from '@supabase/supabase-js';

const navItems = [
    { label: 'Gerador', href: '/dashboard', icon: '✨' },
    { label: 'Meus Prompts', href: '/dashboard/library', icon: '📚' },
    { label: 'Modelos', href: '/dashboard/templates', icon: '🎨' },
    { label: 'Configurações', href: '/dashboard/settings', icon: '⚙️' },
];

export const Sidebar = () => {
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        getUser();

        // Listen for user metadata updates (like avatar_url or full_name)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
    const avatarUrl = user?.user_metadata?.avatar_url;

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
                <div className={styles.avatar}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        fullName.charAt(0).toUpperCase()
                    )}
                </div>
                <div className={styles.userInfo}>
                    <span className={styles.userName}>{fullName}</span>
                    <span className={styles.userEmail}>Free Plan</span>
                </div>
            </div>
        </aside>
    );
};
