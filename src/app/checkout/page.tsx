
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './checkout.module.css';
import { PlanSelector } from '../components/Checkout/PlanSelector';
import { PaymentMethodSelector } from '../components/Checkout/PaymentMethodSelector';
import { CreditCardForm } from '../components/Checkout/CreditCardForm';
import { PixPayment } from '../components/Checkout/PixPayment';
import { Button } from '../components/Button/Button';
import { ArrowLeft, Lock } from 'lucide-react';
import { formatCPF, formatPhone, formatCEP } from '@/lib/formatters';

function CheckoutContent() {
    const router = useRouter();

    const searchParams = useSearchParams();
    const initialPlan = searchParams.get('plan') as 'STARTER' | 'PRO' | null;

    const [plan, setPlan] = useState<'STARTER' | 'PRO'>('STARTER');

    useEffect(() => {
        if (initialPlan === 'STARTER' || initialPlan === 'PRO') {
            setPlan(initialPlan);
        }
    }, [initialPlan]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [details, setDetails] = useState({
        name: '',
        email: '',
        whatsapp: '',
        cpf: '',
        cep: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: ''
    });
    const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'PIX'>('CREDIT_CARD');
    const [cardDetails, setCardDetails] = useState({
        holderName: '',
        number: '',
        expiryMonth: '',
        expiryYear: '',
        ccv: ''
    });

    // Pix State
    const [pixData, setPixData] = useState<{
        pixQrCodeBase64: string;
        pixCopyPaste: string;
        paymentId: string;
    } | null>(null);

    // Fetch user email on mount
    useEffect(() => {
        const loadUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                setDetails(prev => ({ ...prev, email: user.email! }));
            }
        };
        loadUser();
    }, []);

    // CEP Lookup
    const handleCepBlur = async () => {
        // Check for 9 characters (XXXXX-XXX)
        if (details.cep.length === 9) {
            try {
                // Remove formatting for API call just in case, though ViaCEP handles it usually
                const cleanCep = details.cep.replace(/\D/g, '');
                const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                const data = await res.json();

                if (!data.erro) {
                    setDetails(prev => ({
                        ...prev,
                        endereco: data.logradouro,
                        bairro: data.bairro, // Keep saving it in state if needed, or remove if strictly not wanted. User said "tire a opção", implying UI.
                        cidade: data.localidade,
                        estado: data.uf
                    }));
                }
            } catch (error) {
                console.error('Erro ao buscar CEP', error);
            }
        }
    };

    const handleDetailsChange = (field: string, value: string) => {
        let formattedValue = value;

        if (field === 'cpf') {
            formattedValue = formatCPF(value);
        } else if (field === 'whatsapp') {
            formattedValue = formatPhone(value);
        } else if (field === 'cep') {
            formattedValue = formatCEP(value);
        }

        setDetails(prev => ({ ...prev, [field]: formattedValue }));
    };

    const handleCardChange = (field: string, value: string) => {
        setCardDetails(prev => ({ ...prev, [field]: value }));
    };

    const processPayment = async () => {
        setLoading(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login?redirect=/checkout');
                return;
            }

            // Sanitize
            const cleanCpf = details.cpf.replace(/\D/g, '');
            const cleanWhatsapp = details.whatsapp.replace(/\D/g, '');
            const cleanCep = details.cep.replace(/\D/g, '');

            const payload = {
                plan,
                method: paymentMethod,
                billingDetails: {
                    ...details,
                    cpf: cleanCpf,
                    whatsapp: cleanWhatsapp,
                    cep: cleanCep
                },
                cardDetails: paymentMethod === 'CREDIT_CARD' ? cardDetails : undefined
            };

            const response = await fetch('/api/checkout/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            let data = null;

            // Parse response safely
            try {
                data = await response.json();
            } catch (e) {
                console.error("Failed to parse response JSON", e);
                console.error(e);
                throw new Error(`Erro de comunicação com o servidor (Status ${response.status})`);
            }

            if (!response.ok) {
                console.error('Payment Error Data:', data);
                // Simple error throw, valid session is handled by Middleware/Server
                throw new Error(data.error || `Erro desconhecido: ${JSON.stringify(data)}` || 'Erro ao processar pagamento');
            }

            if (paymentMethod === 'PIX') {
                setPixData({
                    pixQrCodeBase64: data.pixQrCodeBase64,
                    pixCopyPaste: data.pixCopyPaste,
                    paymentId: data.paymentId
                });
                setLoading(false);
                // Don't redirect yet, wait for user to pay
            } else {
                // Credit Card Success
                router.push(`/checkout/success?plan=${plan}`);
            }

        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error(String(err));
            console.error(error);
            setError(error.message || "Ocorreu um erro ao processar o pagamento.");
            setLoading(false);
        }
    };

    const onPixSuccess = () => {
        alert('Pagamento aprovado!');
        router.push('/dashboard');
    };

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <div className={styles.mainContent}>
                    <div style={{ marginBottom: '1rem' }}>
                        <Button variant="outline" onClick={() => router.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ArrowLeft size={16} /> Voltar
                        </Button>
                    </div>

                    {/* Step 1: PLAN */}
                    <section>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.stepNumber}>1</span>
                            Escolha seu plano
                        </h2>
                        <PlanSelector selectedPlan={plan} onSelect={setPlan} />
                    </section>

                    {/* Step 2: DETAILS */}
                    <section>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.stepNumber}>2</span>
                            Seus Dados
                        </h2>
                        <div className={styles.formGrid}>
                            <div className={styles.fullWidth}>
                                <div className={styles.field}>
                                    <label className={styles.label}>Nome Completo</label>
                                    <input className={styles.input} value={details.name} onChange={e => handleDetailsChange('name', e.target.value)} required />
                                </div>
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>CPF</label>
                                <input className={styles.input} placeholder="000.000.000-00" value={details.cpf} onChange={e => handleDetailsChange('cpf', e.target.value)} required />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>WhatsApp</label>
                                <input className={styles.input} placeholder="(00) 00000-0000" value={details.whatsapp} onChange={e => handleDetailsChange('whatsapp', e.target.value)} required />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>CEP</label>
                                <input className={styles.input} value={details.cep} onChange={e => handleDetailsChange('cep', e.target.value)} onBlur={handleCepBlur} maxLength={9} required />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Cidade/UF</label>
                                <input className={styles.input} value={`${details.cidade}${details.estado ? '/' + details.estado : ''}`} readOnly />
                            </div>
                            <div className={styles.fullWidth}>
                                <div className={styles.field}>
                                    <label className={styles.label}>Endereço</label>
                                    <input className={styles.input} value={details.endereco} onChange={e => handleDetailsChange('endereco', e.target.value)} required />
                                </div>
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Número</label>
                                <input className={styles.input} value={details.numero} onChange={e => handleDetailsChange('numero', e.target.value)} required />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Complemento</label>
                                <input className={styles.input} value={details.complemento} onChange={e => handleDetailsChange('complemento', e.target.value)} />
                            </div>
                            {/* Bairro field removed as requested */}
                        </div>
                    </section>

                    {/* Step 3: PAYMENT */}
                    <section>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.stepNumber}>3</span>
                            Pagamento
                        </h2>
                        <PaymentMethodSelector method={paymentMethod} onSelect={setPaymentMethod} />

                        {paymentMethod === 'CREDIT_CARD' && (
                            <CreditCardForm cardDetails={cardDetails} onChange={handleCardChange} />
                        )}

                        {paymentMethod === 'PIX' && pixData && (
                            <PixPayment
                                pixQrCodeBase64={pixData.pixQrCodeBase64}
                                pixCopyPaste={pixData.pixCopyPaste}
                                paymentId={pixData.paymentId}
                                onSuccess={onPixSuccess}
                            />
                        )}
                    </section>
                </div>

                {/* Sidebar Summary */}
                <div className={styles.sidebar}>
                    <div className={styles.summaryCard}>
                        <h3>Resumo do Pedido</h3>
                        <div className={styles.summaryRow}>
                            <span>Plano {plan}</span>
                            <span>{plan === 'STARTER' ? 'R$ 9,90' : 'R$ 27,90'}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Taxas</span>
                            <span>R$ 0,00</span>
                        </div>
                        <div className={styles.totalRow}>
                            <span>Total</span>
                            <span>{plan === 'STARTER' ? 'R$ 9,90' : 'R$ 27,90'}</span>
                        </div>

                        {error && (
                            <div style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '1rem', background: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                                {error}
                            </div>
                        )}

                        {!(paymentMethod === 'PIX' && pixData) && (
                            <Button
                                variant="primary"
                                onClick={processPayment}
                                loading={loading}
                                style={{ marginTop: '1.5rem', width: '100%', padding: '1rem' }}
                            >
                                {paymentMethod === 'PIX' ? 'Gerar PIX' : 'Assinar Agora'}
                            </Button>
                        )}

                        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <Lock size={12} /> Pagamento seguro via Asaas
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className={styles.container}>Carregando...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
