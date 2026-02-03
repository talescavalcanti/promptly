'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

interface HomeRedirectGuardProps {
    children: React.ReactNode;
}

export function HomeRedirectGuard({ children }: HomeRedirectGuardProps) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        const checkUserPlan = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    // Not logged in - show home page
                    setShouldRender(true);
                    setIsChecking(false);
                    return;
                }

                // Check if user has active paid plan
                const { data: userProfile } = await supabase
                    .from('users')
                    .select('plano_ativo, status')
                    .eq('id', user.id)
                    .single();

                const hasPaidPlan = userProfile?.plano_ativo &&
                    userProfile.plano_ativo !== 'FREE' &&
                    userProfile.plano_ativo !== 'free' &&
                    userProfile.status === 'ativo';

                if (hasPaidPlan) {
                    // User has active paid plan - redirect to dashboard
                    router.replace('/dashboard');
                } else {
                    // No paid plan - show home page
                    setShouldRender(true);
                    setIsChecking(false);
                }
            } catch (error) {
                console.error('Error checking user plan:', error);
                setShouldRender(true);
                setIsChecking(false);
            }
        };

        checkUserPlan();
    }, [router]);

    if (isChecking) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* Silent loading - no visual indicator */}
            </div>
        );
    }

    if (!shouldRender) {
        return null;
    }

    return <>{children}</>;
}
