'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import styles from './Header.module.css';
import { Button } from '../Button/Button';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

export const Header = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show if scrolling up or at the very top
            if (currentScrollY < lastScrollY || currentScrollY < 10) {
                setIsVisible(true);
            }
            // Hide if scrolling down and not at the top
            else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        // Initial session check
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        getSession();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    // Hide header on auth pages
    if (pathname === '/login' || pathname === '/signup') {
        return null;
    }

    return (
        <header className={`${styles.header} ${!isVisible ? styles.hidden : ''}`}>
            <div className={styles.container}>
                <nav className={styles.nav}>
                    <Link
                        href="/pricing"
                        className={`${styles.link} ${pathname === '/pricing' ? styles.active : ''}`}
                    >
                        Planos
                    </Link>
                </nav>

                <Link href="/" className={styles.logo}>
                    <img src="/logo.png" alt="Promptly Logo" width={32} height={32} style={{ objectFit: 'contain' }} /> Promptly
                </Link>

                <div className={styles.actions}>
                    {user ? (
                        <>
                            <Link href="/dashboard/settings" className={styles.userProfile}>
                                <div className={styles.avatar}>
                                    {user.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="Avatar" />
                                    ) : (
                                        (user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()
                                    )}
                                </div>
                                <span className={styles.userName}>
                                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                </span>
                            </Link>
                            <Link href="/dashboard">
                                <Button variant="ghost">Dashboard</Button>
                            </Link>
                            <Button variant="outline" onClick={handleLogout}>Sair</Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost">Entrar</Button>
                            </Link>
                            <Link href="/signup">
                                <Button variant="primary">Criar conta</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};
