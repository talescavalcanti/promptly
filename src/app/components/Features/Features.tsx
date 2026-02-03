'use client';

import React from 'react';
import styles from './Features.module.css';
import { FadeIn } from '@/components/FadeIn';

const features = [
    {
        title: <>Gerencie tudo em <span className={styles.highlight}>um só lugar</span></>,
        description: 'Um dashboard unificado para acompanhar seu histórico, editar prompts e monitorar seu uso. Tudo limpo e direto ao ponto.'
    },
    {
        title: <>Histórico <span className={styles.highlight}>Inteligente</span></>,
        description: 'Seus prompts salvos automaticamente para você nunca perder uma boa ideia.'
    },
    {
        title: <>Pronto para <span className={styles.highlight}>Produção</span></>,
        description: 'Validação técnica em tempo real para garantir que sua especificação seja viável.'
    }
];

export const Features = () => {
    return (
        <section id="features" className={styles.section}>
            <div className={styles.container}>
                <FadeIn>
                    <div className={styles.header}>
                        <h2 className={styles.title}>Fluxo <span className={styles.highlight}>profissional</span>.</h2>
                        <p className={styles.subtitle}>Ferramentas que não ficam no caminho da sua criatividade.</p>
                    </div>
                </FadeIn>

                <div className={styles.grid}>
                    {features.map((feature, index) => (
                        <FadeIn key={index} delay={0.2 * index} fullWidth>
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <h3 className={styles.cardTitle}>{feature.title}</h3>
                                </div>
                                <p className={styles.cardDescription}>{feature.description}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
};
