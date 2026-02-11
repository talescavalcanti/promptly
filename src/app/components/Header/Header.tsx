'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hoveredPath, setHoveredPath] = useState<string | null>(null);
    const [isPremium, setIsPremium] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (isMenuOpen) return;

        const previous = scrollY.getPrevious() ?? 0;

        if (latest < previous || latest < 10) {
            setIsVisible(true);
        } else if (latest > previous && latest > 100) {
            setIsVisible(false);
        }
    });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                // Check subscription status
                const { data: profile } = await supabase
                    .from('users')
                    .select('plano_ativo')
                    .eq('id', currentUser.id)
                    .single();

                if (profile && profile.plano_ativo && profile.plano_ativo !== 'FREE') {
                    setIsPremium(true);
                } else {
                    setIsPremium(false);
                }
            } else {
                setIsPremium(false);
            }
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            setUser(session?.user ?? null);
            if (!session?.user) {
                setIsPremium(false);
            } else {
                // Re-check premium status on auth change
                supabase
                    .from('users')
                    .select('plano_ativo')
                    .eq('id', session.user.id)
                    .single()
                    .then(({ data: profile }) => {
                        if (profile && profile.plano_ativo && profile.plano_ativo !== 'FREE') {
                            setIsPremium(true);
                        } else {
                            setIsPremium(false);
                        }
                    });
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsMenuOpen(false);
        setIsPremium(false);
        router.push('/');
    };

    if (pathname === '/login' || pathname === '/signup' || pathname === '/auth/verify-email' || pathname?.startsWith('/checkout') || pathname === '/builder' || pathname === '/landing-builder' || pathname === '/feature-builder' || pathname === '/showcase' || pathname === '/forgot-password' || pathname === '/reset-password') {
        return null;
    }

    return (
        <>
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
                                        { name: 'Criar', path: '/dashboard' },
                                        { name: 'Projetos', path: '/projects' }
                                    ] : []),
                                    // Hide Showcase for premium users
                                    ...(!isPremium ? [{ name: 'Exemplos', path: '/showcase' }] : []),
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
                                            onMouseEnter={() => setHoveredPath(item.path)}
                                            onMouseLeave={() => setHoveredPath(null)}
                                        >
                                            {isActive && (
                                                <motion.span
                                                    layoutId="navbar-active"
                                                    className={styles.activePill}
                                                    initial={{ opacity: 0, scale: 0.85 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            {hoveredPath === item.path && !isActive && (
                                                <motion.span
                                                    layoutId="navbar-hover"
                                                    className={styles.hoverPill}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
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
            </header>

            {/* Mobile Menu Overlay - Right Sheet */}
            <AnimatePresence>
                {
                    isMenuOpen && (
                        <>
                            <motion.div
                                className={styles.backdrop}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMenuOpen(false)}
                            />
                            <motion.div
                                className={styles.mobileMenu}
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            >
                                <div className={styles.mobileNavHeader}>
                                    <span className={styles.mobileMenuTitle}>Menu</span>
                                    <button onClick={() => setIsMenuOpen(false)} className={styles.closeButton}>
                                        ✕
                                    </button>
                                </div>

                                <div className={styles.mobileNav}>
                                    {user ? (
                                        <>
                                            <div className={styles.mobileSection}>
                                                <span className={styles.sectionTitle}>Navegação</span>
                                                <Link href="/dashboard" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Criar</Link>
                                                <Link href="/projects" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Meus Projetos</Link>
                                                {!isPremium && (
                                                    <Link href="/showcase" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Exemplos</Link>
                                                )}
                                                <Link href="/pricing" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Planos</Link>
                                            </div>

                                            <div className={styles.mobileSection}>
                                                <span className={styles.sectionTitle}>Conta</span>
                                                <Link href="/dashboard/settings" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
                                                    Minha Conta
                                                </Link>
                                                <button onClick={handleLogout} className={styles.mobileLogout}>
                                                    Sair da Conta
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Link href="/login" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Entrar</Link>
                                            <Link href="/signup" className={styles.mobileButton} onClick={() => setIsMenuOpen(false)}>
                                                Começar Agora
                                            </Link>
                                            <Link href="/showcase" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Exemplos</Link>
                                            <Link href="/pricing" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Planos</Link>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )
                }
            </AnimatePresence >
        </>
    );
};
