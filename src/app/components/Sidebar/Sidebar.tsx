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

interface UserProfile {
    plan: string;
    prompts_used: number;
}

export const Sidebar = () => {
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const fetchProfile = async (userId: string) => {
        const { data } = await supabase
            .from('users')
            .select('plano_ativo, prompts_used')
            .eq('id', userId)
            .single();

        console.log("DEBUG Sidebar:", { userId, data });

        if (data) {
            setProfile({
                plan: data.plano_ativo?.toLowerCase() || 'free',
                prompts_used: data.prompts_used || 0
            });
        }
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                fetchProfile(session.user.id);
            }
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
        });

        // Optional: Polling for usage updates
        const interval = setInterval(() => {
            if (user?.id) fetchProfile(user.id);
        }, 5000);

        return () => {
            subscription.unsubscribe();
            clearInterval(interval);
        };
    }, [user?.id]); // Re-subscribe if user changes? No, logic is fine.

    const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
    const avatarUrl = user?.user_metadata?.avatar_url;
    const isDeveloper = user?.email === 'talesscavalacanti006@gmail.com';

    // Limits logic
    const PLAN_LIMITS: Record<string, number> = {
        free: 5,
        starter: 100,
        pro: 400
    };
    const currentPlan = profile?.plan || 'free';
    const limit = isDeveloper ? 9999 : (PLAN_LIMITS[currentPlan] || 5);
    const used = profile?.prompts_used || 0;
    const percent = Math.min(100, (used / limit) * 100);
    const isFree = currentPlan === 'free' && !isDeveloper;

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
                    <span className={styles.userEmail}>
                        {isDeveloper ? 'Developer' : `${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan`}
                    </span>

                    {/* Usage Stats - Strict Pill Badge */}
                    <div className={styles.usage}>
                        <div className={styles.usageHeader}>
                            <span className={styles.planLabel}>{currentPlan} PLAN</span>
                        </div>

                        <div className={styles.usageMain}>
                            <span className={styles.usageValue}>{used}</span>
                            <span className={styles.usageTotal}>/ {isDeveloper ? '∞' : limit}</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};
