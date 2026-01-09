'use client';

import React from 'react';
import styles from './Features.module.css';
import { LayoutDashboard, History, ShieldCheck } from 'lucide-react';
import { useScrollReveal } from '../../../lib/hooks/useScrollReveal';

const features = [
    {
        icon: <LayoutDashboard size={20} strokeWidth={2.5} />,
        title: 'Dashboard claro e objetivo',
        description: 'Acompanhe seu plano, histórico de prompts e uso do período gratuito em um único lugar.'
    },
    {
        icon: <History size={20} strokeWidth={2.5} />,
        title: 'Até 5 prompts gratuitos',
        description: 'Experimente o fluxo completo: da ideia ao prompt final, com limite de 5 gerações no plano gratuito.'
    },
    {
        icon: <ShieldCheck size={20} strokeWidth={2.5} />,
        title: 'Pensado para produção',
        description: 'Arquitetura de micro-SaaS, validação robusta e foco em qualidade de código desde o primeiro dia.'
    }
];

export const Features = () => {
    useScrollReveal();

    return (
        <section id="features" className={`${styles.section} reveal`}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Por que usar o Promptly?</h2>
                    <p className={styles.subtitle}>Benefícios claros para seu fluxo de desenvolvimento.</p>
                </div>
                <div className={styles.grid}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                <span className={styles.icon}>{feature.icon}</span>
                                {feature.title}
                            </h3>
                            <p className={styles.cardDescription}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
