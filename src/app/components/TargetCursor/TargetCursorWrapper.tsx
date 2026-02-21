'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import TargetCursor from './TargetCursor';

const ALLOWED_PATHS = ['/', '/showcase', '/pricing'];

export default function TargetCursorWrapper() {
    const pathname = usePathname();
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const isAllowedPath = ALLOWED_PATHS.includes(pathname);
        if (!isAllowedPath) {
            setEnabled(false);
            return;
        }

        const checkAccess = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user ?? null;

            if (!user) {
                setEnabled(true);
                return;
            }

            const { data: profile } = await supabase
                .from('users')
                .select('plano_ativo')
                .eq('id', user.id)
                .single();

            const isPremium = profile?.plano_ativo && profile.plano_ativo !== 'FREE';
            setEnabled(!isPremium);
        };

        checkAccess();
    }, [pathname]);

    if (!enabled) return null;

    return (
        <TargetCursor
            spinDuration={2.5}
            hideDefaultCursor
            parallaxOn
            hoverDuration={0.35}
        />
    );
}
