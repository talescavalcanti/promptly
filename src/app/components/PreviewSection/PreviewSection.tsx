'use client';

import React from 'react';
import styles from './PreviewSection.module.css';
import { FadeIn } from '@/components/FadeIn';

export const PreviewSection = () => {
    return (
        <section id="example" className={styles.section}>
            <div className={styles.container}>
                <FadeIn direction="up" delay={0.2} fullWidth>
                    <div className={styles.card}>
                        <div className={styles.header}>
                            <div className={styles.controls}>
                                <div className={`${styles.dot} ${styles.red}`} />
                                <div className={`${styles.dot} ${styles.yellow}`} />
                                <div className={`${styles.dot} ${styles.green}`} />
                            </div>
                            <div className={styles.headerContent} style={{ textAlign: 'right' }}>
                                <h3>prompt_engenharia.md</h3>
                                <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Gerado via Promptly Engine</p>
                            </div>
                        </div>

                        <div className={styles.codeBlock}>
                            <div className={styles.line}>
                                <span className={styles.lineNumber}>1</span>
                                <div className={styles.content}>
                                    <span className={styles.key}>Contexto:</span> <span className={styles.value}>"Você é um Tech Lead Sênior especializado em arquitetura escalável..."</span>
                                </div>
                            </div>
                            <div className={styles.line}>
                                <span className={styles.lineNumber}>2</span>
                                <div className={styles.content}>
                                    <span className={styles.key}>Stack:</span> <span className={styles.value}>"React 19, Next.js 15 (App Router), Tailwind V4, Supabase..."</span>
                                </div>
                            </div>
                            <div className={styles.line}>
                                <span className={styles.lineNumber}>3</span>
                                <div className={styles.content}>
                                    <span className={styles.key}>Requisitos:</span> <span className={styles.value}>"Implementar sistema de projetos com feedback de IA em tempo real..."</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};
