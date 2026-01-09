'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './Hero.module.css';
import { Button } from '../Button/Button';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15, filter: 'blur(8px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            duration: 0.6,
            ease: [0.32, 0.72, 0, 1] as any
        }
    }
};

/**
 * Premium Hero component with micro-animations.
 * Uses staggered reveals for a sophisticated, Apple-inspired entrance.
 */
export const Hero = () => {
    return (
        <motion.section
            className={styles.section}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className={styles.engineBadge} variants={itemVariants}>
                Nova Engine: Gemini 3.0 Pro Integrado
            </motion.div>

            <motion.div className={styles.siteSubtitle} variants={itemVariants}>
                Crie sites completos usando IA com prompts prontos de desenvolvimento.
            </motion.div>

            <motion.h1 className={styles.title} variants={itemVariants}>
                O jeito profissional de <br />
                transformar ideia em <br />
                prompt técnico para IA.
            </motion.h1>

            <motion.h2 className={styles.capsSubtitle} variants={itemVariants}>
                QUANTO MELHOR VOCÊ TRADUZIR SUA IDEIA EM DETALHES, MAIS PODEROSO SERÁ O PROMPT GERADO.
            </motion.h2>

            <motion.p className={styles.description} variants={itemVariants}>
                Estruture requisitos, stack e contexto de forma clara para que modelos de IA geradores de código criem aplicações web modernas com muito menos tentativa e erro.
            </motion.p>

            <motion.div className={styles.ctaGroup} variants={itemVariants}>
                <Link href="/dashboard">
                    <Button variant="primary" style={{ padding: '1rem 2rem', fontSize: '1rem', height: 'auto' }}>
                        Gerar Meu Primeiro Prompt
                    </Button>
                </Link>
                <Link href="#example" className={styles.secondaryCta}>
                    Ver Exemplo
                </Link>
            </motion.div>
        </motion.section>
    );
};
