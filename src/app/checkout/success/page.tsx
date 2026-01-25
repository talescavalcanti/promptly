'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Zap, ArrowRight, Rocket } from 'lucide-react';
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
                <div className={styles.iconWrapper}>
                    <CheckCircle size={36} strokeWidth={2.5} />
                </div>

                <h1 className={styles.title}>
                    Pagamento Aprovado!
                </h1>

                <p className={styles.message}>
                    Sua assinatura do plano <strong style={{ color: '#fff', fontWeight: 600 }}>{plan}</strong> foi confirmada com sucesso. <br />
                    Prepare-se para criar prompts de outro nível.
                </p>

                <div className={styles.detailsBox}>
                    <div className={styles.detailRow}>
                        <div className={styles.iconBox}>
                            <Zap size={20} />
                        </div>
                        <div>
                            <div className={styles.label}>Status do Plano</div>
                            <div className={styles.valueSuccess}>Ativo & Confirmado</div>
                        </div>
                    </div>

                    <div className={styles.detailRow}>
                        <div className={styles.iconBox}>
                            <Rocket size={20} />
                        </div>
                        <div>
                            <div className={styles.label}>Prompts Disponíveis</div>
                            <div className={styles.value}>
                                {plan === 'STARTER' ? '100 gerações/mês' : '400 gerações/mês'}
                            </div>
                        </div>
                    </div>
                </div>

                <Button
                    variant="primary"
                    onClick={handleAccess}
                    loading={loading}
                    className={styles.buttonStyle}
                >
                    Acessar Dashboard <ArrowRight size={18} />
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
