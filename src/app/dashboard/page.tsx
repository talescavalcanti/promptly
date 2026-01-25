'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import styles from './page.module.css';
import { Button } from '../components/Button/Button';
import {
    LayoutTemplate, MonitorSmartphone, ShoppingCart, LayoutDashboard, GraduationCap, FileText, Store, Users, BarChart, Globe,
    Code2, Server, Database, Layers, Palette, Target, FileQuestion, Copy, Check, Briefcase, Zap, Shield, Megaphone, HelpCircle, Rocket, Monitor
} from 'lucide-react';

import { TARGET_PLATFORMS } from '../../lib/saas_constants';
import { ScrollReveal } from '../components/ScrollReveal/ScrollReveal';
// --- Types & Config ---

type FormData = {
    promptMode: 'design' | 'feature' | 'logic';
    targetPlatform: string;
    objective: string;
    context: string;
};

const PROMPT_MODES = [
    { id: 'guided_builder', label: 'Criador Visual', icon: <Rocket size={16} />, desc: 'Interface gráfica passo-a-passo' },
    { id: 'design', label: 'Design (UI/UX)', icon: <Palette size={16} />, desc: 'Focado em interface, cores e componentes.' },
    { id: 'feature', label: 'Nova Funcionalidade', icon: <Code2 size={16} />, desc: 'Adicione novos recursos ao app existente.' },
    { id: 'logic', label: 'Lógica / Backend', icon: <Server size={16} />, desc: 'Schema de banco, rotas e arquitetura.' },
] as const;

// Helper to keep code clean


export default function DashboardPage() {
    const router = useRouter();
    const [authLoading, setAuthLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);

    // Initial State
    const [formData, setFormData] = useState<FormData>({
        promptMode: 'design',
        targetPlatform: 'lovable', // Default
        objective: '',
        context: '',
    });

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

    // Handle Input Changes
    const updateField = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };



    // --- Preview Generation Logic ---
    useEffect(() => {
        let summary = "";
        const mode = formData.promptMode as string;
        const platform = TARGET_PLATFORMS.find(p => p.id === formData.targetPlatform)?.value || 'Qualquer Plataforma';

        if (mode === 'design') {
            summary = `Atue como Designer UI/UX para ${platform}.\nObjetivo: ${formData.objective}\nContexto: ${formData.context}`;
        } else if (mode === 'feature') {
            summary = `Atue como Dev Fullstack para ${platform}.\nFuncionalidade: ${formData.objective}\nContexto: ${formData.context}`;
        } else if (mode === 'logic') {
            summary = `Atue como Tech Lead.\nObjetivo: ${formData.objective}\nContexto: ${formData.context}`;
        } else {
            summary = `Atue como Especialista de Software para ${platform}.\nObjetivo: ${formData.objective}\nContexto: ${formData.context}`;
        }

        summary += `\n\n**IMPORTANTE**: implemente tudo isso de imediato, sem me fazer mais perguntas, só me faça uma sugestão depois de implementar TUDO que eu te falei.`;
        setResult(summary);
    }, [formData]);


    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro ao gerar');
            setResult(data.result);
        } catch (error: any) {
            setResult(`Erro: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!result) return;
        await navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (authLoading) return null;

    // --- Render Logic ---



    // --- Mode Selection Logic ---
    const handleModeSelect = (mode: string) => {
        if (mode === 'guided_builder') {
            router.push('/builder');
            return;
        }
        updateField('promptMode', mode);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.title}>Crie seu Saas do 0</h1>
                        <p className={styles.subtitle}>Defina cada detalhe e gere a especificação técnica completa.</p>
                    </div>
                </div>
            </header>

            <div className={styles.grid}>
                <ScrollReveal className={styles.inputSection} width="100%">
                    <div className={styles.wizard}>

                        {/* Mode Selector */}
                        <div className={styles.field} style={{ marginBottom: '2rem' }}>
                            <div className={styles.modeGrid}>
                                {PROMPT_MODES.map(mode => (
                                    <button
                                        key={mode.id}
                                        className={`${styles.modeCard} ${formData.promptMode === mode.id ? styles.active : ''}`}
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
                        {/* PLATFORM SELECTOR */}
                        <div className={styles.field} style={{ marginBottom: '2rem' }}>
                            <label className={styles.label} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Monitor size={16} className="text-promptly-primary" /> Plataforma Alvo
                            </label>
                            <div className={styles.miniChipGrid}>
                                {TARGET_PLATFORMS.map(platform => (
                                    <button
                                        key={platform.id}
                                        className={`${styles.miniChip} ${formData.targetPlatform === platform.id ? styles.active : ''}`}
                                        onClick={() => updateField('targetPlatform', platform.id)}
                                    >
                                        {platform.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* WIZARD FORM (Empty Check needed to avoid error if I deleted the block) */}
                        {/* INPUT FORM */}
                        <div className={styles.wizardContent}>
                            <div className={styles.field}>
                                <label className={styles.label}>
                                    {formData.promptMode === 'design' ? 'Descreva o visual' :
                                        formData.promptMode === 'feature' ? 'Descreva a funcionalidade' : 'Descreva a lógica'}
                                </label>
                                <textarea
                                    className={`${styles.textarea} ${styles.mainTextarea}`}
                                    placeholder="Descreva o que você precisa..."
                                    value={formData.objective}
                                    onChange={(e) => updateField('objective', e.target.value)}
                                />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Contexto Adicional</label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Detalhes técnicos ou de contexto..."
                                    value={formData.context}
                                    onChange={(e) => updateField('context', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={styles.wizardActions}>
                            <Button
                                variant="primary"
                                onClick={handleGenerate}
                                loading={loading}
                                style={{
                                    borderRadius: '50px',
                                    padding: '1rem 3rem',
                                    fontSize: '1.1rem',
                                    width: '100%',
                                    marginTop: '2rem'
                                }}
                            >
                                {loading ? 'Gerando Especificação...' : 'Gerar Prompt'}
                            </Button>
                        </div>
                    </div>
                </ScrollReveal>
            </div>

            <div className={styles.previewSection}>
                <div className={styles.previewCard}>
                    <div className={styles.previewHeader}>
                        <h3 className={styles.previewTitle}>Preview do Prompt</h3>
                        {result && (
                            <button className={`${styles.copyButton} ${copied ? styles.copied : ''}`} onClick={handleCopy} title="Copiar">
                                {copied ? <><Check size={16} /> Copiado</> : <><Copy size={16} /> Copiar</>}
                            </button>
                        )}
                    </div>
                    <div className={styles.previewContent}>
                        <pre>{result || "Preencha os dados à esquerda para ver o prompt gerado aqui..."}</pre>
                    </div>
                </div>
            </div>
        </div>

    );
}
