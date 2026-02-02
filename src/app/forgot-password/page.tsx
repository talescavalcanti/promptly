'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../login/auth.module.css';
import { Button } from '../components/Button/Button';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Erro ao enviar email');

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar email de recuperação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <Link href="/" className={styles.brand}>
                        <span className={styles.brandName}>Promptly</span>
                    </Link>
                    <h1 className={styles.title}>Recuperar Senha</h1>
                    <p className={styles.subtitle}>
                        Digite seu email para receber um link de recuperação.
                    </p>
                </div>

                {success ? (
                    <div className={styles.success}>
                        Email enviado com sucesso! Verifique sua caixa de entrada.
                    </div>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        {error && <div className={styles.error}>{error}</div>}
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="email">Email</label>
                            <input
                                className={styles.input}
                                id="email"
                                type="email"
                                placeholder="nome@exemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button
                            variant="primary"
                            type="submit"
                            className={styles.submitButton}
                            loading={loading}
                        >
                            {loading ? 'Enviando...' : 'Enviar Link'}
                        </Button>
                    </form>
                )}

                <div className={styles.footer}>
                    Lembrou a senha?
                    <Link href="/login" className={styles.link}>Fazer login</Link>
                </div>
            </div>
        </div>
    );
}
