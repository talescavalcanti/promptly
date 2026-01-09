
import React from 'react';
import Link from 'next/link';
import styles from './Hero.module.css';
import { Button } from '../Button/Button';

export const Hero = () => {
    return (
        <section className={styles.section}>
            <div
                className={`${styles.engineBadge} animate-entrance`}
                style={{ animationDelay: '200ms' }}
            >
                Nova Engine: Gemini 3.0 Pro Integrado
            </div>
            <div
                className={`${styles.siteSubtitle} animate-entrance`}
                style={{ animationDelay: '350ms' }}
            >
                Crie sites completos usando IA com prompts prontos de desenvolvimento.
            </div>
            <h1
                className={`${styles.title} animate-entrance`}
                style={{ animationDelay: '500ms' }}
            >
                O jeito profissional de <br />
                transformar ideia em <br />
                prompt técnico para IA.
            </h1>
            <h2
                className={`${styles.capsSubtitle} animate-entrance`}
                style={{ animationDelay: '650ms' }}
            >
                QUANTO MELHOR VOCÊ TRADUZIR SUA IDEIA EM DETALHES, MAIS PODEROSO SERÁ O PROMPT GERADO.
            </h2>
            <p
                className={`${styles.description} animate-entrance`}
                style={{ animationDelay: '800ms' }}
            >
                Estruture requisitos, stack e contexto de forma clara para que modelos de IA geradores de código criem aplicações web modernas com muito menos tentativa e erro.
            </p>
            <div
                className={`${styles.ctaGroup} animate-entrance`}
                style={{ animationDelay: '950ms' }}
            >
                <Link href="/dashboard">
                    <Button variant="primary" style={{ padding: '1rem 2rem', fontSize: '1rem', height: 'auto' }}>
                        Gerar Meu Primeiro Prompt
                    </Button>
                </Link>
                <Link href="#example" className={styles.secondaryCta}>
                    Ver Exemplo
                </Link>
            </div>
        </section>
    );
};
