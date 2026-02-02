'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../../components/Button/Button';
import styles from './success.module.css';

function CheckoutSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan') || 'PRO';
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Trigger confetti
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    const handleAccess = async () => {
        setLoading(true);
        // Force session refresh
        await supabase.auth.refreshSession();
        // Small delay to ensure DB propagation
        setTimeout(() => {
            router.push('/dashboard');
        }, 1000);
    };

    return (
        <div className={styles.container}>
            {/* Background Effects */}
            <div className={styles.blob1} />
            <div className={styles.blob2} />

            <div className={styles.card}>
                <div className={styles.successIndicator}>
                    <div style={{ width: 6, height: 6, background: '#10B981', borderRadius: '50%', boxShadow: '0 0 10px #10B981' }} />
                    Sucesso
                </div>

                <h1 className={styles.title}>
                    Pagamento<br />Confirmado.
                </h1>

                <p className={styles.message}>
                    Sua assinatura do plano <strong style={{ color: '#fff', fontWeight: 600 }}>{plan}</strong> já está ativa. Você agora tem acesso total a todas as ferramentas de criação.
                </p>

                <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                        <div className={styles.label}>Status</div>
                        <div className={styles.valueSuccess}>Ativo</div>
                    </div>
                    <div className={styles.detailItem}>
                        <div className={styles.label}>Capacidade</div>
                        <div className={styles.value}>
                            {plan === 'STARTER' ? '100' : '400'} gerações/mês
                        </div>
                    </div>
                </div>

                <Button
                    variant="primary"
                    onClick={handleAccess}
                    loading={loading}
                    className={styles.buttonStyle}
                >
                    Acessar Dashboard <ArrowRight size={16} />
                </Button>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div style={{ background: '#000', minHeight: '100vh' }}></div>}>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
