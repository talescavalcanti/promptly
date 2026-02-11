'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { supabase } from '../../lib/supabase';
import {
    LayoutTemplate, Rocket, ImagePlus, Zap
} from 'lucide-react';

import { ScrollReveal } from '../components/ScrollReveal/ScrollReveal';

// --- Types & Config ---

const PROMPT_MODES = [
    { id: 'guided_builder', label: 'Crie o seu saas do 0', icon: <Rocket size={16} />, desc: 'Crie o seu saas com apenas 1 prompt' },
    { id: 'landing_page', label: 'Landing Page', icon: <LayoutTemplate size={16} />, desc: 'Gere uma landing page inteira com apenas 1 prompt.' },
    { id: 'feature_builder', label: 'Feature Pro', icon: <Zap size={16} />, desc: 'Funcionalidade production-ready com testes.' },
    { id: 'extract_design', label: 'Extrair Design', icon: <ImagePlus size={16} />, desc: 'Extraia cores e estilos de uma imagem de referência.' },
] as const;

export default function DashboardPage() {
    const router = useRouter();
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            } else {
                setAuthLoading(false);
            }
        };
        checkUser();
    }, [router]);


    if (authLoading) return null;

    // --- Mode Selection Logic ---
    const handleModeSelect = (mode: string) => {
        if (mode === 'guided_builder') {
            router.push('/builder');
            return;
        }
        if (mode === 'landing_page') {
            router.push('/landing-builder');
            return;
        }
        if (mode === 'extract_design') {
            router.push('/design-extractor');
            return;
        }
        if (mode === 'feature_builder') {
            router.push('/feature-builder');
            return;
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.title}>Gere o seu prompt</h1>
                        <p className={styles.subtitle}>Escolha uma das opções abaixo para começar.</p>
                    </div>
                </div>
            </header>

            <div className={styles.grid}>
                <ScrollReveal className={styles.inputSection} width="100%">
                    <div className={styles.wizard}>

                        {/* Mode Selector */}
                        <div className={styles.field} style={{ marginBottom: '0' }}>
                            <div className={styles.modeGrid}>
                                {PROMPT_MODES.map(mode => (
                                    <button
                                        key={mode.id}
                                        className={`${styles.modeCard}`}
                                        onClick={() => handleModeSelect(mode.id)}
                                    >
                                        <div className={styles.modeIcon}>{mode.icon}</div>
                                        <div className={styles.modeText}>
                                            <div className={styles.modeTitle}>{mode.label}</div>
                                            <div className={styles.modeDesc}>{mode.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </div >
        </div >
    );
}
