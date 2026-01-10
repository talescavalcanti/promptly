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

    if (pathname === '/login' || pathname === '/signup' || pathname === '/auth/verify-email') {
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
                        {user && (
                            <Link
                                href="/projects"
                                className={`${styles.link} ${pathname?.startsWith('/projects') ? styles.active : ''}`}
                            >
                                Projetos
                            </Link>
                        )}
                        <Link
                            href="/pricing"
                            className={`${styles.link} ${pathname === '/pricing' ? styles.active : ''}`}
                        >
                            Planos
                        </Link>
                    </nav>
                </div>

                <Link href="/" className={styles.logo} onClick={() => setIsMenuOpen(false)}>
                    <img src="/logo.png" alt="Promptly Logo" width={32} height={32} style={{ objectFit: 'contain' }} /> <span>Promptly</span>
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

                            <Link href="/dashboard" className={styles.desktopOnly}>
                                <Button variant="ghost">Dashboard</Button>
                            </Link>
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
        </header>
    );
};
