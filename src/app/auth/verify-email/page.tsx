'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail } from 'lucide-react';
import styles from '../../login/auth.module.css';
import { Button } from '../../components/Button/Button';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    return (
        <div className={styles.container}>
            <div className={`${styles.card} animate-fade-blur`}>
                <div className={styles.header}>
                    <Link href="/" className={styles.brand}>
                        <span className={styles.brandName}>Promptly</span>
                    </Link>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '1.5rem',
                        color: 'var(--primary)'
                    }}>
                        <Mail size={48} />
                    </div>
                    <h1 className={styles.title}>Verifique seu email</h1>
                    <p className={styles.subtitle} style={{ maxWidth: '300px', margin: '0 auto' }}>
                        Enviamos um link de confirmação para {email ? <strong>{email}</strong> : 'seu email'}.
                        <br /><br />
                        Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
                    </p>
                </div>

                <div className={styles.form}>
                    <Link href="/login" style={{ width: '100%' }}>
                        <Button
                            variant="primary"
                            style={{
                                width: '100%',
                                borderRadius: '50px',
                                padding: '1.1rem',
                                fontSize: '1rem',
                                fontWeight: '600'
                            }}
                        >
                            Voltar para o Login
                        </Button>
                    </Link>
                </div>

                <div className={styles.footer}>
                    Não recebeu o email?
                    <button
                        className={styles.link}
                        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                        onClick={() => alert('Funcionalidade de reenvio em breve')}
                    >
                        Reenviar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className={styles.container}>
                <div className={`${styles.card} animate-fade-blur`}>
                    <div className={styles.header}>
                        <p className={styles.subtitle}>Carregando...</p>
                    </div>
                </div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
