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
                Comece agora e gere seu primeiro prompt técnico profissional em minutos.
            </motion.div>

            <motion.h1 className={styles.title} variants={itemVariants}>
                Transforme qualquer ideia em código de nível sênior com prompts cirúrgicos para IA.
            </motion.h1>

            <motion.p className={styles.description} variants={itemVariants}>
                Fale com a IA como um arquiteto de software: requisitos claros, stack certa e contexto perfeito — menos tentativa e erro, mais resultado em produção.
                <br /><br />
                Quem domina o prompt, domina o projeto.
            </motion.p>

            <motion.div className={styles.ctaGroup}>
                <Link href="/dashboard">
                    <Button variant="primary" style={{ padding: '1rem 2rem', fontSize: '1rem', height: 'auto' }}>
                        Quero dominar prompts de IA agora
                    </Button>
                </Link>
                <Link href="#example" className={styles.secondaryCta}>
                    Ver Exemplo
                </Link>
            </motion.div>
        </motion.section>
    );
};
