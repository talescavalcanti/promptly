'use client';

import React from 'react';
import Link from 'next/link';
import styles from './HowItWorks.module.css';
import { Button } from '../Button/Button';
import { useScrollReveal } from '../../../lib/hooks/useScrollReveal';

export const HowItWorks = () => {
    useScrollReveal();

    return (
        <section className={`${styles.section} reveal`}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Como o Promptly encaixa no seu fluxo de trabalho</h2>
                    <p className={styles.subtitle}>Veja o passo a passo: da descrição da ideia até a geração do prompt técnico para a sua IA favorita.</p>
                </div>

                <div className={styles.content}>
                    <div className={styles.steps}>
                        <div className={styles.step}>
                            <h3 className={styles.stepTitle}>1. Descreva sua aplicação</h3>
                            <p className={styles.stepDescription}>Informe nome, tipo, público-alvo, funcionalidades e tecnologias desejadas.</p>
                        </div>
                        <div className={styles.step}>
                            <h3 className={styles.stepTitle}>2. Revise o prompt técnico</h3>
                            <p className={styles.stepDescription}>O Promptly estrutura tudo em seções claras para a IA que você usa.</p>
                        </div>
                        <div className={styles.step}>
                            <h3 className={styles.stepTitle}>3. Cole na sua IA favorita</h3>
                            <p className={styles.stepDescription}>Use o prompt em modelos que geram código e itere com muito menos atrito.</p>
                        </div>
                    </div>

                    <div className={styles.ctaCard}>
                        <h3 className={styles.ctaTitle}>Pronto para testar?</h3>
                        <p className={styles.ctaText}>
                            Crie sua conta gratuita e gere até 5 prompts completos para testar o fluxo do Promptly no seu dia a dia.
                        </p>
                        <Link href="/signup">
                            <Button variant="primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
                                Criar conta gratuita
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};
