'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Zap, ArrowRight, Rocket } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../../components/Button/Button';

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
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fafafa',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                background: 'white',
                padding: '3rem',
                borderRadius: '24px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                textAlign: 'center',
                maxWidth: '500px',
                width: '90%'
            }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#d1fae5',
                    color: '#059669',
                    marginBottom: '1.5rem'
                }}>
                    <CheckCircle size={40} strokeWidth={3} />
                </div>

                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111' }}>
                    Pagamento Aprovado!
                </h1>

                <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                    Sua assinatura do plano <strong style={{ color: '#000' }}>{plan}</strong> foi confirmada. <br />
                    Agora você tem acesso a recursos exclusivos.
                </p>

                <div style={{
                    background: '#f3f4f6',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    marginBottom: '2rem',
                    textAlign: 'left'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ background: 'black', padding: '0.4rem', borderRadius: '8px', color: 'white' }}>
                            <Zap size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>Status do Plano</div>
                            <div style={{ fontWeight: 'bold', color: '#059669' }}>Ativo & Confirmado</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'black', padding: '0.4rem', borderRadius: '8px', color: 'white' }}>
                            <Rocket size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>Prompts Disponíveis</div>
                            <div style={{ fontWeight: 'bold', color: '#111' }}>
                                {plan === 'STARTER' ? '100 gerações/mês' : '400 gerações/mês'}
                            </div>
                        </div>
                    </div>
                </div>

                <Button
                    variant="primary"
                    onClick={handleAccess}
                    loading={loading}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        fontSize: '1.1rem',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                >
                    Acessar Promptly <ArrowRight size={20} />
                </Button>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
