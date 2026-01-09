'use client';

import React from 'react';
import styles from './PreviewSection.module.css';

import { useScrollReveal } from '../../../lib/hooks/useScrollReveal';

export const PreviewSection = () => {
    useScrollReveal();

    return (
        <section className={`${styles.section} reveal`}>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <div className={styles.headerContent}>
                            <h3>Preview do seu prompt</h3>
                            <p>Veja como o Promptly organiza os requisitos da sua aplicação em um prompt técnico e acionável.</p>
                        </div>
                        <div className={styles.badge}>Focado em devs</div>
                    </div>

                    <div className={styles.codeBlock}>
                        <div className={styles.line}>
                            <span className={styles.key}>Contexto Geral:</span> <span className={styles.value}>Crie uma plataforma web de comunidade para devs que compartilham projetos, recebem feedback de IA e organizam estudos em grupo.</span>
                        </div>
                        <div className={styles.line}>
                            <span className={styles.key}>Requisitos Funcionais:</span> <span className={styles.value}>Áreas públicas e privadas, sistema de projetos com feedback automático, histórico de sugestões da IA e trilhas de estudo personalizáveis.</span>
                        </div>
                        <div className={styles.line}>
                            <span className={styles.key}>Stack Tecnológica:</span> <span className={styles.value}>Frontend em React + TypeScript + Tailwind; backend em Node.js + NestJS; banco de dados PostgreSQL.</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
