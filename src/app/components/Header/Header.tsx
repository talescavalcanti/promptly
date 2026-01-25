'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (isMenuOpen) return;
            if (currentScrollY < lastScrollY || currentScrollY < 10) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            }
            setLastScrollY(currentScrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY, isMenuOpen]);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMenuOpen]);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsMenuOpen(false);
        router.push('/');
    };

    if (pathname === '/login' || pathname === '/signup' || pathname === '/auth/verify-email' || pathname?.startsWith('/checkout') || pathname === '/builder') {
        return null;
    }

    return (
        <header className={`${styles.header} ${!isVisible ? styles.hidden : ''} ${isMenuOpen ? styles.menuOpen : ''}`}>
            <div className={styles.container}>
                <div className={styles.left}>
                    <button
                        className={styles.hamburger}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <div className={`${styles.bar} ${isMenuOpen ? styles.bar1Open : ''}`} />
                        <div className={`${styles.bar} ${isMenuOpen ? styles.bar2Open : ''}`} />
                        <div className={`${styles.bar} ${isMenuOpen ? styles.bar3Open : ''}`} />
                    </button>

                    <nav className={styles.nav}>
                        {(() => {
                            const items = [
                                // Show Dashboard and Projects only if user is logged in
                                ...(user ? [
                                    { name: 'Dashboard', path: '/dashboard' },
                                    { name: 'Projetos', path: '/projects' }
                                ] : []),
                                { name: 'Planos', path: '/pricing' }
                            ];

                            return items.map((item) => {
                                const isActive = item.path === '/dashboard'
                                    ? pathname === '/dashboard'
                                    : pathname?.startsWith(item.path);

                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className={`${styles.link} ${isActive ? styles.active : ''}`}
                                        style={{ position: 'relative' }}
                                    >
                                        {isActive && (
                                            <motion.span
                                                layoutId="navbar-active"
                                                className={styles.activePill}
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span style={{ position: 'relative', zIndex: 10 }}>
                                            {item.name}
                                        </span>
                                    </Link>
                                );
                            });
                        })()}
                    </nav>
                </div>

                <Link href="/" className={styles.logo} onClick={() => setIsMenuOpen(false)}>
                    <img src="/logo.png" alt="Promptly Logo" width={32} height={32} style={{ objectFit: 'contain' }} />
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

                            </Link>

                            {/* Dashboard moved to main nav */}
                            <Button variant="outline" onClick={handleLogout} className={styles.desktopOnly}>Sair</Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className={styles.desktopOnly}>
                                <Button variant="ghost">Entrar</Button>
                            </Link>
                            <Link href="/signup">
                                <Button variant="primary">Começar</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
                <div className={styles.mobileNav}>
                    <Link href="/pricing" className={styles.mobileLink}>Planos</Link>
                    {user ? (
                        <>
                            <Link href="/dashboard" className={styles.mobileLink}>Dashboard</Link>
                            <Link href="/projects" className={styles.mobileLink}>Meus Projetos</Link>
                            <Link href="/dashboard/settings" className={styles.mobileLink}>Minha Conta</Link>
                            <button onClick={handleLogout} className={styles.mobileLogout}>Sair</button>
                        </>
                    ) : (
                        <Link href="/login" className={styles.mobileLink}>Entrar</Link>
                    )}
                </div>
            </div>
        </header >
    );
};
