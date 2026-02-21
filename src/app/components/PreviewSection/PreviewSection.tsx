'use client';

import React from 'react';
import styles from './PreviewSection.module.css';
import { FadeIn } from '@/components/FadeIn';
import { useRouter } from 'next/navigation';
import { AwwwardsButton } from '@/app/components/AwwwardsButton/AwwwardsButton';

export const PreviewSection = () => {
    const router = useRouter();

    return (
        <section id="example" className={styles.section}>
            <div className={styles.container}>
                <FadeIn direction="up" delay={0.2} fullWidth>
                    <div className={styles.contentWrapper}>
                        {/* Left Column: Code Card */}
                        <div className={styles.cardWrapper}>
                            <div className={styles.card}>
                                <div className={styles.header}>
                                    <div className={styles.controls}>
                                        <div className={`${styles.dot} ${styles.red}`} />
                                        <div className={`${styles.dot} ${styles.yellow}`} />
                                        <div className={`${styles.dot} ${styles.green}`} />
                                    </div>
                                    <div className={styles.headerContent} style={{ textAlign: 'right' }}>
                                        <h3>prompt_engenharia.md</h3>
                                        <p style={{ fontSize: '0.7rem', opacity: 0.7 }}>via Promptly Engine</p>
                                    </div>
                                </div>

                                <div className={styles.codeBlock}>
                                    <div className={styles.line}>
                                        <span className={styles.lineNumber}>1</span>
                                        <div className={styles.content}>
                                            <span className={styles.key}>Contexto:</span> <span className={styles.value}>&quot;Tech Lead Sênior...&quot;</span>
                                        </div>
                                    </div>
                                    <div className={styles.line}>
                                        <span className={styles.lineNumber}>2</span>
                                        <div className={styles.content}>
                                            <span className={styles.key}>Stack:</span> <span className={styles.value}>&quot;React 19, Next.js 15...&quot;</span>
                                        </div>
                                    </div>
                                    <div className={styles.line}>
                                        <span className={styles.lineNumber}>3</span>
                                        <div className={styles.content}>
                                            <span className={styles.key}>Requisitos:</span> <span className={styles.value}>&quot;Sistema real-time...&quot;</span>
                                        </div>
                                    </div>
                                    <div className={styles.line}>
                                        <span className={styles.lineNumber}>4</span>
                                        <div className={styles.content}>
                                            <span style={{ width: '8px', height: '16px', background: '#F5A524', display: 'inline-block' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: CTA */}
                        <div className={styles.ctaWrapper}>
                            <h2 className={styles.title}>
                                Crie sem limites. <br />
                                <span className={styles.highlight}>
                                    Em segundos.
                                </span>
                            </h2>

                            <p className={styles.description}>
                                Transforme ideias simples em software complexo com apenas um comando.
                            </p>

                            <AwwwardsButton onClick={() => router.push('/showcase')}>
                                Ver Exemplos
                            </AwwwardsButton>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};
