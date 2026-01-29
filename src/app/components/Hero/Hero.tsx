'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Hero.module.css';
import { Button } from '../Button/Button';
import { GlassButton } from '../GlassButton/GlassButton';
import { FadeIn } from '@/components/FadeIn';
import { Sparkles } from 'lucide-react';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

import DarkVeil from '@/components/ui/dark-veil';

export const Hero = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "200px 0px 0px 0px" });

    return (
        <section className={styles.section} ref={ref}>
            <div className="absolute inset-0 -z-10 h-full w-full">
                {isInView && (
                    <DarkVeil
                        hueShift={210}
                        noiseIntensity={0.002}
                        speed={0.2}
                        scanlineIntensity={0}
                        scanlineFrequency={0}
                        warpAmount={0.5}
                    />
                )}
            </div>
            <div className={styles.vignette} />
            <div className={styles.contentContainer}>
                <FadeIn delay={0.1}>
                    <div className={styles.engineBadge}>
                        <span>NOVA ENGINE: GEMINI 3.0 PRO INTEGRADO</span>
                    </div>
                    <p className="text-[#86868B] text-sm md:text-base mt-4 mb-6 font-medium">
                        Comece agora e gere seu primeiro prompt técnico profissional em minutos.
                    </p>
                </FadeIn>

                <FadeIn delay={0.2}>
                    <h1 className={styles.title}>
                        Transforme qualquer ideia em <br />
                        código de nível sênior com <br />
                        <span className={styles.highlight}>prompts cirúrgicos para IA.</span>
                    </h1>
                </FadeIn>

                <FadeIn delay={0.3}>
                    <p className={styles.description}>
                        Fale com a IA como um arquiteto de software: requisitos claros, stack certa e contexto perfeito — menos tentativa e erro, mais resultado em produção.
                        <br /><br />
                        Quem domina o prompt, domina o projeto.
                    </p>
                </FadeIn>

                <FadeIn delay={0.4}>
                    <div className={styles.ctaGroup}>
                        <Link href="/dashboard" style={{ width: '100%' }}>
                            <GlassButton fullWidth style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                                Quero dominar prompts de IA agora
                            </GlassButton>
                        </Link>
                        <Link href="#example">
                            <Button variant="secondary" style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem', height: 'auto', width: '100%', fontWeight: 600 }}>
                                Ver Exemplo
                            </Button>
                        </Link>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};
