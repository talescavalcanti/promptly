'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import styles from './FloatingUsage.module.css';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';

interface UserProfile {
    plan: string;
    prompts_used: number;
}

export const FloatingUsage = () => {
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const fetchProfile = async (userId: string) => {
        const { data } = await supabase
            .from('users')
            .select('plano_ativo, prompts_used')
            .eq('id', userId)
            .single();
        if (data) {
            setProfile({
                plan: data.plano_ativo?.toLowerCase() || 'free',
                prompts_used: data.prompts_used || 0
            });
        }
    };

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setIsVisible(!!session?.user);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
        };
        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            setUser(session?.user ?? null);
            setIsVisible(!!session?.user);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
        });

        const interval = setInterval(() => {
            if (user?.id) fetchProfile(user.id);
        }, 5000);

        return () => {
            subscription.unsubscribe();
            clearInterval(interval);
        };
    }, [user?.id]); // Depend on user.id to update interval check if needed, mostly consistent

    // Hide for auth pages or if not visible
    if (pathname === '/login' || pathname === '/signup' || !isVisible || !user) return null;

    // Logic
    const isDeveloper = user?.email === 'talesscavalacanti006@gmail.com';
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

    // Usage "text"
    const planLabel = isDeveloper ? 'Developer' : `${currentPlan} Plan`;
    const countLabel = `${used} / ${isDeveloper ? '∞' : limit}`;

    return (
        <div className={styles.container}>
            <div className={styles.pill}>
                <div className={styles.info}>
                    <span className={styles.label}>{planLabel}</span>
                    <span className={styles.count}>{countLabel}</span>
                </div>
                {(isFree || percent >= 80) && !isDeveloper && (
                    <Link href="/pricing" className={styles.upgradeBtn} title="Fazer Upgrade">
                        ⚡
                    </Link>
                )}
            </div>
        </div>
    );
};
