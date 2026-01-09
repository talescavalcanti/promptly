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

    return (
        <header className={styles.header}>
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
