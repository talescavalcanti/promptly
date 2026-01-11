
'use client';

import { useEffect, useState } from 'react';
import styles from '../../checkout/checkout.module.css';
import { Copy, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PixPaymentProps {
    pixQrCodeBase64: string;
    pixCopyPaste: string;
    paymentId: string;
    onSuccess: () => void;
}

export function PixPayment({ pixQrCodeBase64, pixCopyPaste, paymentId, onSuccess }: PixPaymentProps) {
    const [copied, setCopied] = useState(false);

    // Polling logic
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const checkStatus = async () => {
            try {
                // Call our Edge Function to check status
                const { data: { session } } = await supabase.auth.getSession();

                const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/check-payment-status`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token}`
                    },
                    body: JSON.stringify({ paymentId })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'RECEIVED' || data.status === 'CONFIRMED') {
                        onSuccess();
                        clearInterval(intervalId);
                    }
                }
            } catch (err) {
                console.error('Error polling payment status', err);
            }
        };

        // Start polling every 3 seconds
        intervalId = setInterval(checkStatus, 3000);

        return () => clearInterval(intervalId);
    }, [paymentId, onSuccess]);

    const handleCopy = () => {
        navigator.clipboard.writeText(pixCopyPaste);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={styles.pixContainer}>
            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                Escaneie o QR Code abaixo com o app do seu banco ou use o "Pix Copia e Cola".
            </p>

            <div className={styles.qrCodeWrapper}>
                {/* Asaas returns base64 image without prefix sometimes, add it if needed */}
                <img
                    src={`data:image/png;base64,${pixQrCodeBase64}`}
                    alt="QR Code Pix"
                    style={{ width: '200px', height: '200px' }}
                />
            </div>

            <div className={styles.copyField}>
                <input
                    className={styles.copyInput}
                    value={pixCopyPaste}
                    readOnly
                />
                <button
                    className={styles.copyButton}
                    onClick={handleCopy}
                    type="button"
                    title="Copiar código Pix"
                >
                    {copied ? <Check size={18} color="#4ade80" /> : <Copy size={18} />}
                </button>
            </div>

            <div className="animate-pulse" style={{ color: '#0070f3', fontSize: '0.9rem', marginTop: '1rem' }}>
                Aguardando pagamento...
            </div>
        </div>
    );
}
