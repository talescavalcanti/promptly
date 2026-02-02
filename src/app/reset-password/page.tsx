'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import styles from '../login/auth.module.css';
import { Button } from '../components/Button/Button';
import { Eye, EyeOff, Check, X } from 'lucide-react';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    // Password Requirements
    const requirements = [
        { label: 'Pelo menos 8 caracteres', test: (p: string) => p.length >= 8 },
        { label: 'Uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
        { label: 'Uma letra minúscula', test: (p: string) => /[a-z]/.test(p) },
        { label: 'Um número', test: (p: string) => /[0-9]/.test(p) },
        { label: 'Um caractere especial', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
    ];

    const allRequirementsMet = requirements.every(req => req.test(password));

    useEffect(() => {
        const handleRecovery = async () => {
            // Check URL hash for recovery tokens (Supabase sends tokens in hash fragment)
            const hash = window.location.hash;

            if (hash) {
                // Parse hash fragment
                const params = new URLSearchParams(hash.substring(1));
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');
                const type = params.get('type');

                if (type === 'recovery' && accessToken && refreshToken) {
                    // Set the session with the recovery tokens
                    const { error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    });

                    if (!error) {
                        setIsValidSession(true);
                        setCheckingSession(false);
                        // Clear hash from URL
                        window.history.replaceState(null, '', window.location.pathname);
                        return;
                    }
                }
            }

            // Fallback: check for existing session
            const { data: { session } } = await supabase.auth.getSession();
            setIsValidSession(!!session);
            setCheckingSession(false);
        };

        handleRecovery();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsValidSession(true);
                setCheckingSession(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!allRequirementsMet) {
            setError('A senha não atende a todos os requisitos.');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) throw updateError;

            // Sign out after password reset
            await supabase.auth.signOut();

            setSuccess(true);
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar senha.');
        } finally {
            setLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <Link href="/" className={styles.brand}>
                            <span className={styles.brandName}>Promptly</span>
                        </Link>
                        <p className={styles.subtitle}>Verificando sessão...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isValidSession) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <Link href="/" className={styles.brand}>
                            <span className={styles.brandName}>Promptly</span>
                        </Link>
                        <h1 className={styles.title}>Link Inválido</h1>
                        <p className={styles.subtitle}>
                            Este link de recuperação expirou ou é inválido.
                        </p>
                    </div>
                    <div className={styles.footer}>
                        <Link href="/forgot-password" className={styles.link}>
                            Solicitar novo link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <Link href="/" className={styles.brand}>
                        <span className={styles.brandName}>Promptly</span>
                    </Link>
                    <h1 className={styles.title}>Nova Senha</h1>
                    <p className={styles.subtitle}>
                        Digite sua nova senha abaixo.
                    </p>
                </div>

                {success ? (
                    <div className={styles.success}>
                        Senha atualizada com sucesso! Redirecionando...
                    </div>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        {error && <div className={styles.error}>{error}</div>}

                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="password">Nova Senha</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    className={styles.input}
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.eyeButton}
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0' }}>
                            {requirements.map((req, i) => {
                                const isMet = req.test(password);
                                return (
                                    <li key={i} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '0.875rem',
                                        color: isMet ? '#30D158' : '#86868B',
                                        marginBottom: '4px'
                                    }}>
                                        {isMet ? <Check size={14} /> : <X size={14} />}
                                        {req.label}
                                    </li>
                                );
                            })}
                        </ul>

                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="confirmPassword">Confirmar Senha</label>
                            <input
                                className={styles.input}
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button
                            variant="primary"
                            type="submit"
                            className={styles.submitButton}
                            loading={loading}
                            disabled={!allRequirementsMet || !confirmPassword}
                        >
                            {loading ? 'Atualizando...' : 'Atualizar Senha'}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
