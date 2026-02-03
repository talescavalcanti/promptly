'use client';

import React from 'react';
import Link from 'next/link';
import styles from './HowItWorks.module.css';
import { Button } from '../Button/Button';
import { useScrollReveal } from '../../../lib/hooks/useScrollReveal';
import { ArrowRight } from 'lucide-react';

const steps = [
    {
        number: '01',
        title: 'Descreva sua aplicação',
        description: 'Informe nome, tipo, público-alvo, funcionalidades e tecnologias desejadas.',
    },
    {
        number: '02',
        title: 'Revise o prompt técnico',
        description: 'O Promptly estrutura tudo em seções claras para a IA que você usa.',
    },
    {
        number: '03',
        title: 'Cole na sua IA favorita',
        description: 'Use o prompt em modelos que geram código e itere com muito menos atrito.',
    },
];

export const HowItWorks = () => {
    useScrollReveal();

    return (
        <section className={`${styles.section} reveal`}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        Do conceito ao código<br />
                        <span className={styles.highlight}>em 3 passos simples</span>
                    </h2>
                    <p className={styles.subtitle}>
                        Transforme suas ideias em prompts estruturados que IAs de código realmente entendem.
                    </p>
                </div>

                <div className={styles.stepsGrid}>
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={styles.stepCard}
                            style={{ animationDelay: `${index * 0.15}s` }}
                        >
                            <span className={styles.stepNumber}>{step.number}</span>
                            <h3 className={styles.stepTitle}>{step.title}</h3>
                            <p className={styles.stepDescription}>{step.description}</p>

                            {/* Connector line between cards */}
                            {index < steps.length - 1 && (
                                <div className={styles.connector}>
                                    <ArrowRight size={16} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className={styles.ctaSection}>
                    <div className={styles.ctaGlow} />
                    <div className={styles.ctaContent}>
                        <h3 className={styles.ctaTitle}>Pronto para testar?</h3>
                        <p className={styles.ctaText}>
                            Crie sua conta gratuita e gere até 5 prompts completos.
                        </p>
                        <Link href="/signup">
                            <Button variant="primary">
                                Começar gratuitamente
                                <ArrowRight size={18} />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};
