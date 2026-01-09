'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import styles from '../login/auth.module.css'; // Reuse styles
import { Button } from '../components/Button/Button';
import { Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const passwordRequirements = [
        { label: 'Pelo menos 8 caracteres', test: (p: string) => p.length >= 8 },
        { label: 'Pelo menos um número', test: (p: string) => /[0-9]/.test(p) },
        { label: 'Pelo menos um caractere especial', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
    ];

    const isPasswordStrong = passwordRequirements.every(req => req.test(password));

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isPasswordStrong) {
            setError('Por favor, atenda a todos os requisitos de segurança da senha.');
            return;
        }
        try {
            const { data, error: signupError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (signupError) throw signupError;

            if (data.user) {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao criar sua conta.');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className={styles.container}>
            <div className={`${styles.card} animate-fade-blur`}>
                <div className={styles.header}>
                    <Link href="/" className={styles.brand}>
                        <span className={styles.brandName}>Promptly</span>
                    </Link>
                    <h1 className={styles.title}>Criar Conta</h1>
                    <p className={styles.subtitle}>Comece a criar prompts profissionais hoje</p>
                </div>

                <form className={styles.form} onSubmit={handleSignup}>
                    {error && <div className={styles.error}>{error}</div>}
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="name">Nome Completo</label>
                        <input
                            className={styles.input}
                            id="name"
                            type="text"
                            placeholder="João Silva"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
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
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="password">Senha</label>
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
                        <ul className={styles.checklist}>
                            {passwordRequirements.map((req, i) => {
                                const met = req.test(password);
                                return (
                                    <li key={i} className={`${styles.checkItem} ${met ? styles.met : ''}`}>
                                        {met ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                        {req.label}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <Button
                        variant="primary"
                        type="submit"
                        style={{
                            width: '100%',
                            borderRadius: '50px',
                            padding: '1.1rem',
                            fontSize: '1rem',
                            fontWeight: '600'
                        }}
                        loading={loading}
                    >
                        {loading ? 'Criando conta...' : 'Criar Conta'}
                    </Button>
                </form>
                <div className={styles.footer}>
                    Já tem uma conta?
                    <Link href="/login" className={styles.link}>Entrar</Link>
                </div>
            </div>
        </div>
    );
}
