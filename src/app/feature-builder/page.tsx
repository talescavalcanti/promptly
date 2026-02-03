'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ChevronDown, X, Check, Copy, Zap, Shield, Bug, TestTube,
    Code2, Server, Database, Link2, Lock
} from 'lucide-react';
import styles from './feature-builder.module.css';
import Plasma from '../components/Plasma/Plasma';
import { TextShimmer } from '@/components/ui/text-shimmer';

// --- Simplified State ---
export type FeatureBuilderState = {
    featureName: string;
    description: string;
    context: 'frontend' | 'backend' | 'database' | 'integration' | 'auth';
    robustness: 'fast' | 'secure' | 'bulletproof';
    includeTests: boolean;
    targetPlatform: string;
};

const TOTAL_STEPS = 3;

const INITIAL_STATE: FeatureBuilderState = {
    featureName: '',
    description: '',
    context: 'backend',
    robustness: 'secure',
    includeTests: true,
    targetPlatform: 'Google AI Studio',
};

const CONTEXTS = [
    { id: 'frontend', label: 'Frontend', icon: Code2, desc: 'Componentes, UI' },
    { id: 'backend', label: 'Backend', icon: Server, desc: 'APIs, Lógica' },
    { id: 'database', label: 'Banco de Dados', icon: Database, desc: 'Schema, Queries' },
    { id: 'integration', label: 'Integração', icon: Link2, desc: 'APIs Externas' },
    { id: 'auth', label: 'Autenticação', icon: Lock, desc: 'Login, Segurança' },
];

const PLATFORMS = ['Lovable', 'Google AI Studio', 'Vercel', 'Replit'];

export default function FeatureBuilderPage() {
    const [step, setStep] = useState(0);
    const [state, setState] = useState<FeatureBuilderState>(INITIAL_STATE);
    const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateState = <K extends keyof FeatureBuilderState>(key: K, value: FeatureBuilderState[K]) => {
        setState(prev => ({ ...prev, [key]: value }));
    };

    const nextStep = () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
    const prevStep = () => setStep(s => Math.max(s - 1, 0));

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    promptMode: 'feature_builder',
                    featureName: state.featureName,
                    description: state.description,
                    context: state.context,
                    robustness: state.robustness,
                    includeTests: state.includeTests,
                    targetPlatform: state.targetPlatform,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao gerar prompt');
            }

            setGeneratedPrompt(data.result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (generatedPrompt) {
            navigator.clipboard.writeText(generatedPrompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleReset = () => {
        setState(INITIAL_STATE);
        setGeneratedPrompt(null);
        setStep(0);
        setError(null);
    };

    const progressPercent = ((step + 1) / TOTAL_STEPS) * 100;

    const renderStep = () => {
        switch (step) {
            case 0: // O que você quer?
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>O que você quer construir?</h2>
                            <p className={styles.stepDescription}>Descreva a funcionalidade de forma simples.</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nome da funcionalidade</label>
                            <input
                                className={styles.input}
                                placeholder="Ex: Sistema de Notificações Push"
                                value={state.featureName}
                                onChange={(e) => updateState('featureName', e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Descreva o que você precisa</label>
                            <textarea
                                className={styles.textarea}
                                placeholder="Ex: Quero um sistema de login com email e senha. Quando o usuário tentar se cadastrar, precisa verificar se o email já existe. Depois do cadastro, deve enviar um email de confirmação..."
                                value={state.description}
                                onChange={(e) => updateState('description', e.target.value)}
                                style={{ minHeight: '180px' }}
                            />
                            <span className={styles.hint}>💡 Quanto mais detalhes, melhor o prompt gerado</span>
                        </div>

                        <div className={styles.actions}>
                            <button className={styles.backButton} style={{ visibility: 'hidden' }}>Voltar</button>
                            <button
                                className={styles.nextButton}
                                onClick={nextStep}
                                disabled={!state.featureName.trim() || !state.description.trim()}
                            >
                                Próximo <ChevronDown style={{ transform: 'rotate(-90deg)' }} size={20} />
                            </button>
                        </div>
                    </>
                );

            case 1: // Configurações
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Configurações rápidas</h2>
                            <p className={styles.stepDescription}>Defina o tipo e nível de qualidade.</p>
                        </div>

                        <div className={styles.sectionTitle}>Tipo de funcionalidade</div>
                        <div className={styles.grid5}>
                            {CONTEXTS.map(ctx => (
                                <div
                                    key={ctx.id}
                                    className={`${styles.card} ${state.context === ctx.id ? styles.selected : ''}`}
                                    onClick={() => updateState('context', ctx.id as FeatureBuilderState['context'])}
                                >
                                    <div className={styles.cardIcon}><ctx.icon size={20} /></div>
                                    <span className={styles.cardTitle}>{ctx.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.sectionTitle} style={{ marginTop: '1.5rem' }}>Nível de robustez</div>
                        <div className={styles.grid3}>
                            <div
                                className={`${styles.card} ${state.robustness === 'fast' ? styles.selected : ''}`}
                                onClick={() => updateState('robustness', 'fast')}
                            >
                                <div className={styles.cardIcon}><Zap size={24} /></div>
                                <span className={styles.cardTitle}>Rápido</span>
                                <span className={styles.cardDesc}>Protótipo</span>
                            </div>
                            <div
                                className={`${styles.card} ${state.robustness === 'secure' ? styles.selected : ''}`}
                                onClick={() => updateState('robustness', 'secure')}
                            >
                                <div className={styles.cardIcon}><Shield size={24} /></div>
                                <span className={styles.cardTitle}>Seguro</span>
                                <span className={styles.cardDesc}>Recomendado</span>
                            </div>
                            <div
                                className={`${styles.card} ${state.robustness === 'bulletproof' ? styles.selected : ''}`}
                                onClick={() => updateState('robustness', 'bulletproof')}
                            >
                                <div className={styles.cardIcon}><Bug size={24} /></div>
                                <span className={styles.cardTitle}>Blindado</span>
                                <span className={styles.cardDesc}>Produção</span>
                            </div>
                        </div>

                        <div className={styles.sectionTitle} style={{ marginTop: '1.5rem' }}>Incluir testes?</div>
                        <div className={styles.grid2}>
                            <div
                                className={`${styles.card} ${state.includeTests ? styles.selected : ''}`}
                                onClick={() => updateState('includeTests', true)}
                            >
                                <div className={styles.cardIcon}><TestTube size={24} /></div>
                                <span className={styles.cardTitle}>Sim</span>
                            </div>
                            <div
                                className={`${styles.card} ${!state.includeTests ? styles.selected : ''}`}
                                onClick={() => updateState('includeTests', false)}
                            >
                                <div className={styles.cardIcon}><Zap size={24} /></div>
                                <span className={styles.cardTitle}>Não</span>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button className={styles.backButton} onClick={prevStep}>Voltar</button>
                            <button className={styles.nextButton} onClick={nextStep}>
                                Próximo <ChevronDown style={{ transform: 'rotate(-90deg)' }} size={20} />
                            </button>
                        </div>
                    </>
                );

            case 2: // Gerar
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Pronto para gerar!</h2>
                            <p className={styles.stepDescription}>Revise e clique para criar seu prompt.</p>
                        </div>

                        <div className={styles.summaryGrid}>
                            <div className={styles.summaryItem}>
                                <div className={styles.summaryLabel}>Funcionalidade</div>
                                <div className={styles.summaryValue}>{state.featureName}</div>
                            </div>
                            <div className={styles.summaryItem}>
                                <div className={styles.summaryLabel}>Tipo</div>
                                <div className={styles.summaryValue}>{CONTEXTS.find(c => c.id === state.context)?.label}</div>
                            </div>
                            <div className={styles.summaryItem}>
                                <div className={styles.summaryLabel}>Robustez</div>
                                <div className={styles.summaryValue}>
                                    {state.robustness === 'fast' ? 'Rápido' : state.robustness === 'secure' ? 'Seguro' : 'Blindado'}
                                </div>
                            </div>
                            <div className={styles.summaryItem}>
                                <div className={styles.summaryLabel}>Testes</div>
                                <div className={styles.summaryValue}>{state.includeTests ? 'Sim' : 'Não'}</div>
                            </div>
                            <div className={styles.summaryItem} style={{ gridColumn: '1 / -1' }}>
                                <div className={styles.summaryLabel}>Descrição</div>
                                <div className={styles.summaryValue} style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                                    {state.description.length > 150 ? state.description.substring(0, 150) + '...' : state.description}
                                </div>
                            </div>
                        </div>

                        <div className={styles.sectionTitle}>Plataforma alvo</div>
                        <div className={styles.chipGrid}>
                            {PLATFORMS.map(p => (
                                <div
                                    key={p}
                                    className={`${styles.chip} ${state.targetPlatform === p ? styles.active : ''}`}
                                    onClick={() => updateState('targetPlatform', p)}
                                >
                                    {p}
                                </div>
                            ))}
                        </div>

                        {error && (
                            <div className={styles.errorMessage}>
                                {error}
                            </div>
                        )}

                        <div className={styles.actions}>
                            <button className={styles.backButton} onClick={prevStep}>Voltar</button>
                            <button className={styles.nextButton} onClick={handleGenerate} disabled={isLoading}>
                                <Zap size={18} /> {isLoading ? 'Gerando...' : 'Gerar Prompt'}
                            </button>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    // Result Screen
    if (generatedPrompt) {
        return (
            <div className={styles.container}>
                <Plasma />
                <Link href="/dashboard" className={styles.closeButton}><X size={20} /></Link>

                <div className={styles.resultCard}>
                    <div className={styles.resultHeader}>
                        <div className={styles.iconCircle}><Check size={28} /></div>
                        <h2 className={styles.resultTitle}>Prompt Gerado!</h2>
                        <p className={styles.resultDesc}>Seu prompt está pronto para uso.</p>
                    </div>

                    <div className={styles.editorWindow}>
                        <div className={styles.editorHeader}>
                            <div className={styles.windowControls}>
                                <div className={styles.controlDot} style={{ background: '#ff5f57' }} />
                                <div className={styles.controlDot} style={{ background: '#febc2e' }} />
                                <div className={styles.controlDot} style={{ background: '#28c840' }} />
                            </div>
                            <span className={styles.fileName}>{state.featureName.toLowerCase().replace(/\s+/g, '-')}.prompt</span>
                        </div>
                        <div className={styles.editorBody}>
                            <pre className={styles.promptContent}>{generatedPrompt}</pre>
                        </div>
                        <div className={styles.editorFooter}>
                            <button className={styles.secondaryAction} onClick={handleReset}>
                                Novo Prompt
                            </button>
                            <button className={styles.copyActionResult} onClick={handleCopy}>
                                {copied ? <><Check size={18} /> Copiado!</> : <><Copy size={18} /> Copiar</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Plasma />
            <Link href="/dashboard" className={styles.closeButton}><X size={20} /></Link>

            <motion.div
                className={styles.wizardCard}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
                </div>

                <span className={styles.stepIndicator}>
                    Passo {step + 1} de {TOTAL_STEPS}
                </span>

                <div className={styles.contentArea}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                        >
                            {renderStep()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {isLoading && (
                    <div className={styles.loadingOverlay}>
                        <div className={styles.spinner} />
                        <TextShimmer>Gerando com IA...</TextShimmer>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
