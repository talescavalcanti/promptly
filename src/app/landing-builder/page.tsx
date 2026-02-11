'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
    Briefcase, Target, Palette, Layout, Check, Copy, ChevronDown, Type, Layers, X, Zap, Sliders, Frame, Feather, ArrowUpRight
} from 'lucide-react';
import styles from './landing-builder.module.css';
import { TextShimmer } from '@/components/ui/text-shimmer';

// --- Types ---
type LandingBuilderState = {
    mode: 'portfolio' | 'custom';
    niche: string;
    brandName: string;
    targetAudience: string;
    goal: 'portfolio' | 'leads' | 'sales';
    style: 'brutalist' | 'swiss' | 'glass' | 'editorial';
    geometry: 'sharp' | 'soft' | 'mixed'; // New
    layout: 'standard' | 'radical'; // New
    primaryColor: string;
    secondaryColor: string;
    typography: string;
    fontWeight: 'light' | 'regular' | 'medium' | 'bold';
    useSingleFont: boolean;
    sections: string[];
    mainOffer: string;
    contactInfo: string;
    tone: string;
    targetPlatform: 'Lovable' | 'Google AI Studio' | 'Vercel' | 'Replit'; // New Step 8
};


const INITIAL_STATE: LandingBuilderState = {
    mode: 'custom',
    niche: '',
    brandName: '',
    targetAudience: '',
    goal: 'portfolio',
    style: 'swiss',
    geometry: 'sharp',
    layout: 'radical',
    primaryColor: '#000000', // Default Black (Architect preference)
    secondaryColor: '#ffffff', // Default White
    typography: 'sans',
    fontWeight: 'regular',
    useSingleFont: false,
    sections: ['Hero', 'ProofStrip', 'Services', 'HowItWorks', 'ResultsGallery', 'Differentials', 'Depoimentos', 'FAQ', 'Locations', 'Footer'],
    mainOffer: '',
    contactInfo: '',
    tone: 'Profissional e Confiável',
    targetPlatform: 'Google AI Studio' // Default per user preference
};

const GOALS = [
    { id: 'portfolio', label: 'Portfólio / Institucional', desc: 'Apresentar serviços e histórico', icon: <Briefcase size={24} /> },
    { id: 'leads', label: 'Captura de Leads', desc: 'Foco em formulários e contato', icon: <Target size={24} /> },
    { id: 'sales', label: 'Venda Direta', desc: 'Página de Vendas (High Ticket)', icon: <Layout size={24} /> },
];

const STYLES = [
    { id: 'swiss', label: 'Minimalismo Suíço', desc: 'Grid rígido, arrojado, tipografia forte.', color: '#ffffff' },
    { id: 'brutalist', label: 'Neo-Brutalismo', desc: 'Contraste alto, bordas duras, impacto.', color: '#ef4444' },
    { id: 'glass', label: 'Efeito Glass (Glassmorphism)', desc: 'Profundidade, blur real, camadas 3D.', color: '#3b82f6' },
    { id: 'editorial', label: 'Luxo Editorial', desc: 'Elegância, serifa, layout de revista.', color: '#a8a29e' },
];

const GEOMETRIES = [
    { id: 'sharp', label: 'Sharp (0px)', desc: 'Brutalista, Tech, Luxo. Transmite precisão e confiança.', visualClass: 'sharp' },
    { id: 'soft', label: 'Soft (16px+)', desc: 'Amigável, Social, App. Reduz a carga cognitiva.', visualClass: 'soft' },
    { id: 'mixed', label: 'Híbrido', desc: 'Estratégico. Mistura profissionalismo com acessibilidade.', visualClass: 'mixed' },
];

const LAYOUTS = [
    { id: 'radical', label: 'Radical (Assimétrico)', desc: 'Quebra o grid. "Anti-Safe Harbor". Retém atenção pelo inesperado.', visualClass: 'radical' },
    { id: 'standard', label: 'Estruturado (Grade)', desc: 'Clássico colunar. Seguro, mas previsível. Bom para corporativo.', visualClass: 'standard' },
];

const COLORS = [
    { id: 'black', label: 'Preto Luxo', color: '#000000' },
    { id: 'white', label: 'Branco Clean', color: '#ffffff' },
    { id: 'blue', label: 'Royal Blue', color: '#2563eb' }, // Darker/Premium
    { id: 'orange', label: 'Signal Orange', color: '#f97316' },
    { id: 'red', label: 'Deep Red', color: '#dc2626' },
    { id: 'emerald', label: 'Deep Emerald', color: '#059669' },
    { id: 'slate', label: 'Cinza Tech', color: '#475569' },
    { id: 'gold', label: 'Gold Metallic', color: '#ca8a04' },
];

const FONT_WEIGHTS = [
    { id: 'light', label: 'Leve (300)' },
    { id: 'regular', label: 'Regular (400)' },
    { id: 'medium', label: 'Médio (500)' },
    { id: 'bold', label: 'Negrito (700)' },
];

const FONTS = [
    { id: 'sans', label: 'Moderna (Inter/Plus Jakarta)', desc: 'Limpa e legível', value: 'Inter, sans-serif' },
    { id: 'serif', label: 'Elegante (Playfair/Lora)', desc: 'Sofisticada e clássica', value: 'Playfair Display, serif' },
    { id: 'tech', label: 'Tech (Space Grotesk/Mono)', desc: 'Futurista e digital', value: 'Space Grotesk, monospace' },
    { id: 'display', label: 'Display (Oswald/Syne)', desc: 'Personalidade forte', value: 'Oswald, sans-serif' },
    { id: 'minimal', label: 'Minimal (Urbanist)', desc: 'Geométrica e limpa', value: 'Urbanist, sans-serif' }, // New
    { id: 'luxury', label: 'High Luxury (Cormorant)', desc: 'Serifa fina e alta', value: 'Cormorant Garamond, serif' }, // New
];

const SINGLE_FONTS = [
    { id: 'Inter', label: 'Inter', desc: 'A padrão da web moderna', style: 'sans-serif', value: 'Inter, sans-serif' },
    { id: 'Plus Jakarta Sans', label: 'Jakarta', desc: 'Geométrica moderna', style: 'sans-serif', value: '"Plus Jakarta Sans", sans-serif' },
    { id: 'Space Grotesk', label: 'Space', desc: 'Tech brutalist', style: 'sans-serif', value: 'Space Grotesk, monospace' },
    { id: 'Playfair Display', label: 'Playfair', desc: 'Serifada de alto luxo', style: 'serif', value: 'Playfair Display, serif' },
    { id: 'Outfit', label: 'Outfit', desc: 'Clean e sofisticada', style: 'sans-serif', value: 'Outfit, sans-serif' },
    { id: 'Syne', label: 'Syne', desc: 'Arística e única', style: 'sans-serif', value: 'Syne, sans-serif' },
    { id: 'Urbanist', label: 'Urbanist', desc: 'Geométrica premium', style: 'sans-serif', value: 'Urbanist, sans-serif' }, // New
    { id: 'IBM Plex Mono', label: 'IBM Mono', desc: 'Engenharia de dados', style: 'monospace', value: '"IBM Plex Mono", monospace' }, // New
    { id: 'Unbounded', label: 'Unbounded', desc: 'Futurismo radical', style: 'sans-serif', value: 'Unbounded, sans-serif' }, // New
    { id: 'Cormorant Garamond', label: 'Cormorant', desc: 'Elegância sublime', style: 'serif', value: 'Cormorant Garamond, serif' }, // New
];

const SECTIONS_LIST = [
    { id: 'Hero', label: 'Hero (Topo)' },
    { id: 'ProofStrip', label: 'Faixa de Prova Social' },
    { id: 'PainAndPromise', label: 'Dor + Promessa' },
    { id: 'Services', label: 'Lista de Serviços' },
    { id: 'HowItWorks', label: 'Como Funciona (Passos)' },
    { id: 'ResultsGallery', label: 'Galeria de Resultados' },
    { id: 'Differentials', label: 'Diferenciais' },
    { id: 'Pricing', label: 'Tabela de Preços' },
    { id: 'Testimonials', label: 'Depoimentos' },
    { id: 'FAQ', label: 'Perguntas Frequentes' },
    { id: 'Locations', label: 'Localização/Contato' },
];

const PLATFORMS = [
    {
        id: 'Lovable',
        label: 'Lovable',
        desc: 'Construtor AI Full-stack (Supabase + React).',
        logo: '/platforms/lovable.png',
        activeColor: '#ec4899', // Pink/Magenta for Lovable brand match
        activeBg: 'linear-gradient(145deg, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0.02) 100%)',
        borderColor: '#ec4899',
        recommended: true
    },
    {
        id: 'Google AI Studio',
        label: 'Google AI Studio',
        desc: 'Gera prompts otimizados (Modelo 1.5 Pro).',
        logo: '/platforms/google-ai.png',
        activeColor: '#4285F4',
        activeBg: 'rgba(66, 133, 244, 0.05)',
        borderColor: '#4285F4'
    },
    {
        id: 'Vercel',
        label: 'Vercel v0',
        desc: 'Prototipagem rápida de interfaces (UI).',
        logo: '/platforms/vercel.svg',
        activeColor: '#ffffff',
        activeBg: 'rgba(255, 255, 255, 0.05)',
        borderColor: '#ffffff'
    },
    {
        id: 'Replit',
        label: 'Replit Agent',
        desc: 'Agente de codificação autônomo.',
        logo: '/platforms/replit.png',
        activeColor: '#F26207',
        activeBg: 'rgba(242, 98, 7, 0.1)',
        borderColor: '#F26207'
    },
];

export default function LandingBuilderPage() {
    const [step, setStep] = useState(0);
    const [state, setState] = useState<LandingBuilderState>(INITIAL_STATE);
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const NICHE_SUGGESTIONS = [
        "Clínica Odontológica", "Consultoria Financeira", "SaaS B2B", "Barbearia Premium", "Nutricionista Esportiva", "Advocacia Trabalhista"
    ];

    const updateState = (key: keyof LandingBuilderState, value: LandingBuilderState[keyof LandingBuilderState]) => {
        setState(prev => ({ ...prev, [key]: value }));
    };

    const toggleSection = (sectionId: string) => {
        setState(prev => ({
            ...prev,
            sections: prev.sections.includes(sectionId)
                ? prev.sections.filter(s => s !== sectionId)
                : [...prev.sections, sectionId]
        }));
    };

    const nextStep = () => {
        if (state.mode === 'portfolio') {
            // Portfolio Flow: Step 0 (Mode) -> Step 1 (Niche) -> Generate
            if (step === 0) setStep(1);
            else if (step === 1) handleGeneratePrompt();
        } else {
            // Custom Flow Updated: 
            // 0: Mode
            // 1: Identity (Niche/Name)
            // 2: Audience (NEW)
            // 3: Goal
            // 4: Style
            // 5: Design Details (NEW)
            // 6: Sections
            // 7: Content
            // 8: Platform (NEW)
            // 9: Sections
            // 10: Content
            // 11: Generate
            if (step < 10) setStep(step + 1);
            else handleGeneratePrompt();
        }
    };

    const prevStep = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleGeneratePrompt = async () => {
        setStep(11); // Result screen (Custom mode index + 3 new steps)
        setIsGenerating(true);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    promptMode: 'landing_page',
                    wizardMode: state.mode,
                    saasNiche: state.niche || 'Geral',

                    // Custom Mode Fields
                    objective: state.mode === 'custom' ? GOALS.find(g => g.id === state.goal)?.label : undefined,
                    logoStyle: state.mode === 'custom' ? STYLES.find(s => s.id === state.style)?.label : undefined,
                    targetAudience: state.mode === 'custom' ? state.targetAudience : undefined,

                    // Design Details Updated
                    primaryColor: state.mode === 'custom' ? state.primaryColor : undefined,
                    secondaryColor: state.mode === 'custom' ? state.secondaryColor : undefined,
                    typography: state.mode === 'custom' ? FONTS.find(f => f.id === state.typography)?.label : undefined,
                    fontWeight: state.mode === 'custom' ? state.fontWeight : undefined,
                    useSingleFont: state.mode === 'custom' ? state.useSingleFont : undefined,

                    // New Architect Fields
                    geometry: state.mode === 'custom' ? state.geometry : undefined,
                    layout: state.mode === 'custom' ? state.layout : undefined,

                    voiceTone: state.mode === 'custom' ? state.tone : undefined,
                    problemSolved: state.mode === 'custom' ? state.mainOffer : undefined,
                    cta: state.mode === 'custom' ? state.contactInfo : undefined,
                    sections: state.mode === 'custom' ? state.sections : undefined,

                    brandName: state.brandName,

                    // Critical: Target Platform for Backend Logic
                    targetPlatform: state.targetPlatform
                })
            });

            const data = await response.json();

            if (data.error) {
                setGeneratedPrompt(`Erro ao gerar prompt: ${data.error}`);
            } else {
                setGeneratedPrompt(data.result);
            }
        } catch {
            setGeneratedPrompt('Erro de conexão ao gerar prompt. Tente novamente.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isNextDisabled = () => {
        if (step === 1 && !state.niche) return true;
        return false;
    }

    const renderStepContent = () => {
        switch (step) {
            case 0: // Mode Selection
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Como deseja criar?</h2>
                            <p className={styles.stepDescription}>Escolha a velocidade da criação.</p>
                        </div>
                        <div className={styles.grid2}>
                            <div
                                className={`${styles.card} ${state.mode === 'portfolio' ? styles.selected : ''}`}
                                onClick={() => updateState('mode', 'portfolio')}
                            >
                                <div className={styles.cardIcon}><Zap size={28} /></div>
                                <h3 className={styles.cardTitle} style={{ marginTop: '1rem' }}>Modo Flash (Portfólio)</h3>
                                <p className={styles.cardDesc}>
                                    Apenas diga o nicho, e a IA inventa <b>tudo</b> (copy, design, dados).
                                    Ideal para mostrar poder ou criar templates rápidos.
                                </p>
                            </div>

                            <div
                                className={`${styles.card} ${state.mode === 'custom' ? styles.selected : ''}`}
                                onClick={() => updateState('mode', 'custom')}
                            >
                                <div className={styles.cardIcon}><Sliders size={28} /></div>
                                <h3 className={styles.cardTitle} style={{ marginTop: '1rem' }}>Modo Personalizado</h3>
                                <p className={styles.cardDesc}>
                                    Defina tom de voz, oferta, seções e detalhes.
                                    Ideal para projetos reais ou clientes específicos.
                                </p>
                            </div>
                        </div>
                    </>
                );

            case 1: // Niche & Name
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Identidade do Projeto</h2>
                            <p className={styles.stepDescription}>
                                {state.mode === 'portfolio' ? 'Apenas o básico para a IA começar.' : 'Comece definindo o nicho e o nome da sua marca.'}
                            </p>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Qual é o seu nicho? {state.mode === 'portfolio' && <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>(Obrigatório)</span>}</label>
                            <input
                                className={styles.input}
                                placeholder="Ex: Clínica de Estética, SaaS de RH..."
                                value={state.niche}
                                onChange={e => updateState('niche', e.target.value)}
                                autoFocus
                            />
                            <div className={styles.chipGrid} style={{ marginTop: '1rem' }}>
                                {NICHE_SUGGESTIONS.map(s => (
                                    <button key={s} className={styles.chip} onClick={() => updateState('niche', s)}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.inputGroup} style={{ marginTop: '2rem' }}>
                            <label className={styles.label}>Nome da Marca (Opcional)</label>
                            <input
                                className={styles.input}
                                placeholder="Deixe vazio para a IA inventar"
                                value={state.brandName}
                                onChange={e => updateState('brandName', e.target.value)}
                            />
                            {state.mode === 'portfolio' && (
                                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
                                    No &quot;Modo Flash&quot;, se você não der nome, criaremos um criativo para você.
                                </p>
                            )}
                        </div>
                    </>
                );

            case 2: // Target Audience (NEW)
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Público Alvo</h2>
                            <p className={styles.stepDescription}>Quem você quer atingir? Detalhe seu cliente ideal.</p>
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Descreva seu cliente ideal</label>
                            <textarea
                                className={styles.textarea}
                                placeholder="Ex: Homens de 25-40 anos que buscam estilo; Empresas B2B que precisam escalar vendas..."
                                value={state.targetAudience}
                                onChange={e => updateState('targetAudience', e.target.value)}
                                style={{ minHeight: '150px' }}
                            />
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
                                Isso ajuda a IA a escrever uma copy mais persuasiva e focada nas dores reais.
                            </p>
                        </div>
                    </>
                );

            case 3: // Goal
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Objetivo da Página</h2>
                            <p className={styles.stepDescription}>Qual o foco principal de conversão?</p>
                        </div>
                        <div className={styles.grid3}>
                            {GOALS.map(g => (
                                <div
                                    key={g.id}
                                    className={`${styles.card} ${state.goal === g.id ? styles.selected : ''}`}
                                    onClick={() => updateState('goal', g.id)}
                                >
                                    <div className={styles.cardIcon}>{g.icon}</div>
                                    <span className={styles.cardTitle}>{g.label}</span>
                                    <span className={styles.cardDesc} style={{ fontSize: '0.85rem', opacity: 0.7 }}>{g.desc}</span>
                                </div>
                            ))}
                        </div>
                    </>
                );

            case 4: // Visual Style - ARCHITECT UPDATE
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Direção de Arte</h2>
                            <p className={styles.stepDescription}>
                                &quot;O estilo não é enfeite, é posicionamento.&quot;
                                <br />
                                <span style={{ opacity: 0.5, fontSize: '0.9em' }}>Escolha a estética que ressoa com o inconsciente do seu público.</span>
                            </p>
                        </div>
                        <div className={styles.grid2} style={{ marginBottom: '2.5rem' }}>
                            {STYLES.map(s => (
                                <div
                                    key={s.id}
                                    className={`${styles.card} ${state.style === s.id ? styles.selected : ''}`}
                                    onClick={() => updateState('style', s.id)}
                                    style={{
                                        '--primary': s.color,
                                        background: state.style === s.id ? `linear-gradient(145deg, rgba(255,255,255,0.05) 0%, ${s.color}22 100%)` : 'rgba(255,255,255,0.02)',
                                        border: state.style === s.id ? `1px solid ${s.color}` : '1px solid rgba(255,255,255,0.08)',
                                        transform: state.style === s.id ? 'translateY(-2px)' : 'none',
                                        boxShadow: state.style === s.id ? `0 10px 30px -10px ${s.color}44` : 'none',
                                        padding: '2rem 1.5rem',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center'
                                    } as React.CSSProperties}
                                >
                                    <div
                                        className={styles.cardIcon}
                                        style={{
                                            marginBottom: '1rem',
                                            borderRadius: '50%',
                                            padding: '16px',
                                            background: state.style === s.id ? s.color : 'rgba(255,255,255,0.05)',
                                            color: state.style === s.id ? (s.id === 'swiss' ? 'black' : 'white') : 'rgba(255,255,255,0.7)',
                                            transition: 'all 0.3s',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            width: '64px',
                                            height: '64px'
                                        }}
                                    >
                                        {s.id === 'swiss' && <Palette size={28} />}
                                        {s.id === 'brutalist' && <Frame size={28} strokeWidth={2.5} />}
                                        {s.id === 'glass' && <Layers size={28} />}
                                        {s.id === 'editorial' && <Feather size={28} />}
                                    </div>
                                    <span className={styles.cardTitle} style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>{s.label}</span>
                                    <span className={styles.cardDesc} style={{ fontSize: '0.9rem', opacity: 0.7, lineHeight: 1.5, maxWidth: '240px', margin: '0 auto' }}>{s.desc}</span>
                                </div>
                            ))}
                        </div>

                        {/* Pro Tip - Minimal */}
                        <p style={{
                            marginTop: '1.5rem',
                            fontSize: '0.8rem',
                            color: 'rgba(255,255,255,0.45)',
                            fontStyle: 'italic',
                            lineHeight: 1.6,
                            borderLeft: '2px solid rgba(255,255,255,0.1)',
                            paddingLeft: '1rem'
                        }}>
                            <strong style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'normal' }}>Nota:</strong> Minimalismo Suíço para B2B. Neo-Brutalismo para disrupção (B2C/Gen-Z).
                        </p>
                    </>
                );

            case 5: // ARCHITECTURE: Geometry & Layout
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Física & Estrutura</h2>
                            <p className={styles.stepDescription}>
                                A &quot;psicologia invisível&quot; do seu design.
                                <br />
                                <span style={{ opacity: 0.5, fontSize: '0.9em' }}>Decisões de geometria afetam a confiança subconsciente do usuário em 50ms.</span>
                            </p>
                        </div>

                        {/* Geometry Section */}
                        <div style={{ marginBottom: '3rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                                <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', color: 'white' }}>
                                    <Frame size={18} style={{ color: 'var(--primary)' }} />
                                    Geometria
                                </label>
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>ACABAMENTO</span>
                            </div>

                            <div className={styles.grid3} style={{ gap: '1rem' }}>
                                {GEOMETRIES.map(g => (
                                    <div
                                        key={g.id}
                                        onClick={() => updateState('geometry', g.id)}
                                        className={`${styles.card} ${state.geometry === g.id ? styles.selected : ''}`}
                                        style={{
                                            padding: '1.5rem',
                                            textAlign: 'center',
                                            gap: '1rem',
                                            background: state.geometry === g.id ? 'rgba(245, 165, 36, 0.05)' : 'rgba(0,0,0,0.4)',
                                            border: state.geometry === g.id ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                background: state.geometry === g.id ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                                                borderRadius: g.visualClass === 'soft' ? '50%' : g.visualClass === 'mixed' ? '0px 16px 0px 16px' : '0px',
                                                margin: '0 auto',
                                                transition: 'all 0.3s',
                                                boxShadow: state.geometry === g.id ? '0 0 20px rgba(245, 165, 36, 0.4)' : 'none'
                                            }}
                                        />
                                        <div>
                                            <span className={styles.cardTitle} style={{ fontSize: '1rem', display: 'block', marginBottom: '0.4rem' }}>{g.label}</span>
                                            <p className={styles.cardDesc} style={{ fontSize: '0.8rem', lineHeight: '1.4', opacity: 0.6 }}>{g.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Layout Section */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                                <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', color: 'white' }}>
                                    <Layout size={18} style={{ color: 'var(--primary)' }} />
                                    Topologia
                                </label>
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>GRID SYSTEM</span>
                            </div>

                            <div className={styles.grid2} style={{ gap: '1rem' }}>
                                {LAYOUTS.map(l => (
                                    <div
                                        key={l.id}
                                        onClick={() => updateState('layout', l.id)}
                                        className={`${styles.card} ${state.layout === l.id ? styles.selected : ''}`}
                                        style={{
                                            flexDirection: 'row',
                                            textAlign: 'left',
                                            alignItems: 'center',
                                            padding: '1.5rem',
                                            background: state.layout === l.id ? 'rgba(245, 165, 36, 0.05)' : 'rgba(0,0,0,0.4)',
                                            border: state.layout === l.id ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)'
                                        }}
                                    >
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            display: 'grid',
                                            gridTemplateColumns: l.visualClass === 'radical' ? '1.5fr 1fr' : '1fr 1fr',
                                            gridTemplateRows: l.visualClass === 'radical' ? '1fr 1.5fr' : '1fr 1fr',
                                            gap: '4px',
                                            flexShrink: 0,
                                            padding: '4px',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ background: state.layout === l.id ? 'var(--primary)' : 'rgba(255,255,255,0.4)', opacity: 0.9, borderRadius: 2 }}></div>
                                            <div style={{ background: state.layout === l.id ? 'var(--primary)' : 'rgba(255,255,255,0.4)', opacity: 0.4, borderRadius: 2 }}></div>
                                            <div style={{ background: state.layout === l.id ? 'var(--primary)' : 'rgba(255,255,255,0.4)', opacity: 0.2, borderRadius: 2 }}></div>
                                            {l.visualClass === 'standard' && <div style={{ background: state.layout === l.id ? 'var(--primary)' : 'rgba(255,255,255,0.4)', opacity: 0.6, borderRadius: 2 }}></div>}
                                        </div>

                                        <div style={{ marginLeft: '1rem' }}>
                                            <span className={styles.cardTitle} style={{ fontSize: '1rem', display: 'block', marginBottom: '0.2rem' }}>{l.label}</span>
                                            <p className={styles.cardDesc} style={{ fontSize: '0.8rem', lineHeight: '1.4', opacity: 0.6 }}>{l.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pro Tip - Minimal */}
                        <p style={{
                            marginTop: '1.5rem',
                            fontSize: '0.8rem',
                            color: 'rgba(255,255,255,0.45)',
                            fontStyle: 'italic',
                            lineHeight: 1.6,
                            borderLeft: '2px solid rgba(255,255,255,0.1)',
                            paddingLeft: '1rem'
                        }}>
                            <strong style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'normal' }}>Nota:</strong> Layouts Radicais quebram a previsibilidade. Sharp Geometry para marcas Premium.
                        </p>
                    </>
                );

            case 6: // ARCHITECTURE: Colors
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Paleta Cromática</h2>
                            <p className={styles.stepDescription}>
                                &quot;Cores são emoção codificada.&quot;
                                <br />
                                <span style={{ opacity: 0.5, fontSize: '0.9em' }}>Escolha contraste alto para retenção. Evite tons pastéis lavados (&quot;SaaS Safe&quot;).</span>
                            </p>
                        </div>

                        <div className={styles.grid2} style={{ marginBottom: '2.5rem' }}>
                            {/* Primary Color */}
                            <div>
                                <label className={styles.label} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', color: 'white' }}>
                                    <Palette size={18} style={{ color: 'var(--primary)' }} />
                                    Cor Primária (Brand & CTA)
                                </label>
                                <div className={styles.featuresGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                    {COLORS.filter(c => c.id !== 'white').map(c => (
                                        <div
                                            key={`p-${c.id}`}
                                            onClick={() => updateState('primaryColor', c.color)}
                                            style={{
                                                height: '70px',
                                                borderRadius: '12px',
                                                background: c.color,
                                                cursor: 'pointer',
                                                border: state.primaryColor === c.color ? '3px solid white' : '1px solid rgba(255,255,255,0.1)',
                                                boxShadow: state.primaryColor === c.color ? `0 0 20px ${c.color}66` : 'none',
                                                transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                                                position: 'relative',
                                                transform: state.primaryColor === c.color ? 'scale(1.05)' : 'scale(1)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'flex-end',
                                                padding: '8px',
                                                overflow: 'hidden'
                                            }}
                                            title={c.label}
                                        >
                                            {state.primaryColor === c.color && <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.3)', borderRadius: '50%', padding: 2 }}><Check size={14} color="white" /></div>}
                                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: c.id === 'white' ? 'black' : 'rgba(255,255,255,0.9)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{c.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Secondary Color */}
                            <div>
                                <label className={styles.label} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', color: 'white' }}>
                                    <Layers size={18} style={{ color: 'var(--primary)' }} />
                                    Cor Base (Background)
                                </label>
                                <div className={styles.featuresGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                    {COLORS.map(c => (
                                        <div
                                            key={`s-${c.id}`}
                                            onClick={() => updateState('secondaryColor', c.color)}
                                            style={{
                                                height: '70px',
                                                borderRadius: '12px',
                                                background: c.color,
                                                cursor: 'pointer',
                                                border: state.secondaryColor === c.color ? '3px solid white' : '1px solid rgba(255,255,255,0.1)',
                                                transform: state.secondaryColor === c.color ? 'scale(1.05)' : 'scale(1)',
                                                transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                                                position: 'relative',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'flex-end',
                                                padding: '8px',
                                                overflow: 'hidden'
                                            }}
                                            title={c.label}
                                        >
                                            {state.secondaryColor === c.color && <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.3)', borderRadius: '50%', padding: 2 }}><Check size={14} color={c.id === 'black' || c.id === 'blue' || c.id === 'red' || c.id === 'emerald' ? 'white' : 'black'} /></div>}
                                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: c.id === 'white' ? 'black' : 'rgba(255,255,255,0.9)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{c.color}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Pro Tip - Minimal */}
                        <p style={{
                            marginTop: '1.5rem',
                            fontSize: '0.8rem',
                            color: 'rgba(255,255,255,0.45)',
                            fontStyle: 'italic',
                            lineHeight: 1.6,
                            borderLeft: '2px solid rgba(255,255,255,0.1)',
                            paddingLeft: '1rem'
                        }}>
                            <strong style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'normal' }}>Nota:</strong> Evite Violeta de IA (saturado em 2025). Monocromático ou Alta Energia diferenciam melhor.
                        </p>
                    </>
                );

            case 7: // ARCHITECTURE: Typography
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Tipografia</h2>
                            <p className={styles.stepDescription}>
                                &quot;A voz textual do seu projeto.&quot;
                                <br />
                                <span style={{ opacity: 0.5, fontSize: '0.9em' }}>Legibilidade constrói confiança. Escolha com base na densidade de informação.</span>
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Type size={20} style={{ color: 'var(--primary)' }} />
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: 'white' }}>Single Font Mode</span>
                                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Use a mesma fonte para títulos e corpo (Estilo Suíço/Minimalista)</span>
                                </div>
                            </div>
                            <button
                                onClick={() => updateState('useSingleFont', !state.useSingleFont)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                                <div style={{ width: 44, height: 24, background: state.useSingleFont ? 'var(--primary)' : 'rgba(255,255,255,0.1)', borderRadius: 20, position: 'relative', transition: 'all 0.3s', boxShadow: state.useSingleFont ? '0 0 10px rgba(245, 165, 36, 0.4)' : 'none' }}>
                                    <div style={{ width: 18, height: 18, background: 'white', borderRadius: '50%', position: 'absolute', top: 3, left: state.useSingleFont ? 23 : 3, transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)' }} />
                                </div>
                            </button>
                        </div>

                        <div className={styles.grid2} style={{ marginBottom: '2.5rem' }}>
                            {(state.useSingleFont ? SINGLE_FONTS : FONTS).map(f => (
                                <div
                                    key={f.id}
                                    className={`${styles.card} ${state.typography === f.id ? styles.selected : ''}`}
                                    onClick={() => updateState('typography', f.id)}
                                    style={{
                                        padding: '1.5rem',
                                        flexDirection: 'row',
                                        textAlign: 'left',
                                        gap: '1.5rem',
                                        alignItems: 'center',
                                        background: state.typography === f.id ? 'rgba(245, 165, 36, 0.05)' : 'rgba(0,0,0,0.4)',
                                        border: state.typography === f.id ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)'
                                    }}
                                >
                                    <div style={{
                                        fontSize: '2.5rem',
                                        lineHeight: 1,
                                        fontWeight: state.fontWeight === 'bold' ? 700 : state.fontWeight === 'medium' ? 500 : state.fontWeight === 'light' ? 300 : 400, // Dynamic Weight
                                        color: state.typography === f.id ? 'var(--primary)' : 'rgba(255,255,255,0.8)',
                                        fontFamily: f.value, // Using the actual font-family value for preview
                                        background: state.typography === f.id ? 'rgba(245, 165, 36, 0.1)' : 'rgba(255,255,255,0.05)',
                                        width: '64px',
                                        height: '64px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        transition: 'all 0.3s'
                                    }}>
                                        Aa
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span className={styles.cardTitle} style={{ fontSize: '1.1rem', marginBottom: '0.3rem', fontFamily: f.value, fontWeight: state.fontWeight === 'bold' ? 700 : state.fontWeight === 'medium' ? 500 : state.fontWeight === 'light' ? 300 : 400 }}>{f.label}</span>
                                        <span className={styles.cardDesc} style={{ fontSize: '0.8rem', opacity: 0.6 }}>{f.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label className={styles.label} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', color: 'white' }}>
                                <ArrowUpRight size={18} style={{ color: 'var(--primary)' }} />
                                Peso dos Títulos (Heading Weight)
                            </label>
                            <div className={`${styles.featuresGrid} ${styles.weightGrid}`} style={{ gap: '0.75rem' }}>
                                {FONT_WEIGHTS.map(w => (
                                    <button
                                        key={w.id}
                                        onClick={() => updateState('fontWeight', w.id)}
                                        className={styles.chip}
                                        style={{
                                            width: '100%',
                                            justifyContent: 'center',
                                            padding: '0.8rem',
                                            borderRadius: '10px',
                                            background: state.fontWeight === w.id ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                            color: state.fontWeight === w.id ? '#000' : 'rgba(255,255,255,0.6)',
                                            borderColor: state.fontWeight === w.id ? 'var(--primary)' : 'transparent',
                                            fontWeight: w.id === 'bold' ? 700 : w.id === 'medium' ? 500 : w.id === 'light' ? 300 : 400,
                                            fontSize: '0.9rem',
                                            boxShadow: state.fontWeight === w.id ? '0 4px 12px rgba(245, 165, 36, 0.3)' : 'none'
                                        }}
                                    >
                                        {w.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pro Tip - Minimal */}
                        <p style={{
                            marginTop: '1.5rem',
                            fontSize: '0.8rem',
                            color: 'rgba(255,255,255,0.45)',
                            fontStyle: 'italic',
                            lineHeight: 1.6,
                            borderLeft: '2px solid rgba(255,255,255,0.1)',
                            paddingLeft: '1rem'
                        }}>
                            <strong style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'normal' }}>Nota:</strong> Sans-Serif para tech/moderno. Serifadas para luxo/autoridade. Nunca sacrifique legibilidade.
                        </p>
                    </>
                );

            case 9: // Sections (shifted)
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Estrutura da Página</h2>
                            <p className={styles.stepDescription}>Marque as seções que você deseja incluir.</p>
                        </div>
                        <div className={styles.featuresGrid}>
                            {SECTIONS_LIST.map(sec => (
                                <div
                                    key={sec.id}
                                    className={`${styles.featureCard} ${state.sections.includes(sec.id) ? styles.active : ''}`}
                                    onClick={() => toggleSection(sec.id)}
                                >
                                    <div className={styles.checkbox}>
                                        {state.sections.includes(sec.id) && <Check size={14} color="#000" />}
                                    </div>
                                    <span>{sec.label}</span>
                                </div>
                            ))}
                        </div>
                    </>
                );

            case 10: // Content Details (shifted)
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Detalhes Finais</h2>
                            <p className={styles.stepDescription}>Adicione informações específicas para a IA.</p>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Oferta Principal / Diferencial</label>
                            <textarea
                                className={styles.textarea}
                                placeholder="Ex: 50% de desconto na primeira consulta, Frete Grátis..."
                                value={state.mainOffer}
                                onChange={e => updateState('mainOffer', e.target.value)}
                                style={{ minHeight: '100px' }}
                            />
                        </div>

                        <div className={styles.inputGroup} style={{ marginTop: '1.5rem' }}>
                            <label className={styles.label}>Informações de Contato / Links</label>
                            <input
                                className={styles.input}
                                placeholder="Ex: WhatsApp: (11) 99999-9999, Instagram: @marca"
                                value={state.contactInfo}
                                onChange={e => updateState('contactInfo', e.target.value)}
                            />
                        </div>

                        <div className={styles.inputGroup} style={{ marginTop: '1.5rem' }}>
                            <label className={styles.label}>Tom de Voz</label>
                            <input
                                className={styles.input}
                                placeholder="Ex: Descontraído, Sério, Luxuoso..."
                                value={state.tone}
                                onChange={e => updateState('tone', e.target.value)}
                            />
                        </div>
                    </>
                );
            case 8: // Platform Selection (NEW)
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Plataforma de Construção</h2>
                            <p className={styles.stepDescription}>
                                Onde você vai buildar esse projeto?
                                <br />
                                <span style={{ opacity: 0.6, fontSize: '0.9em' }}>Otimizaremos o prompt especificamente para a &quot;mente&quot; da IA escolhida.</span>
                            </p>
                        </div>
                        <div className={styles.grid2}>
                            {PLATFORMS.map(p => (
                                <div
                                    key={p.id}
                                    className={`${styles.card} ${state.targetPlatform === p.id ? styles.selected : ''}`}
                                    onClick={() => updateState('targetPlatform', p.id)}
                                    style={{
                                        padding: '1.5rem',
                                        alignItems: 'center', // Center align for stronger visual
                                        textAlign: 'center', // Center text 
                                        gap: '1.2rem',
                                        background: state.targetPlatform === p.id ? p.activeBg : 'rgba(255,255,255,0.02)',
                                        borderColor: state.targetPlatform === p.id ? p.borderColor : 'rgba(255,255,255,0.08)',
                                        boxShadow: state.targetPlatform === p.id ? `0 0 40px ${p.activeColor}33` : 'none', // Stronger glow
                                        position: 'relative',
                                        overflow: 'visible', // Allow glow/badge to pop
                                        transform: state.targetPlatform === p.id ? 'scale(1.02)' : 'scale(1)',
                                        transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
                                    }}
                                >
                                    {/* Recommended Badge */}
                                    {p.recommended && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-10px',
                                            right: '12px',
                                            background: 'linear-gradient(90deg, #ec4899, #8b5cf6)', // Pink to Purple gradient
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            color: 'white',
                                            letterSpacing: '0.8px',
                                            textTransform: 'uppercase',
                                            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)',
                                            zIndex: 10
                                        }}>
                                            Recomendado
                                        </div>
                                    )}

                                    <div className={styles.cardIcon} style={{
                                        background: state.targetPlatform === p.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        width: '80px',
                                        height: '80px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.3s',
                                        border: state.targetPlatform === p.id ? `1px solid ${p.activeColor}44` : '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                            <Image
                                                src={p.logo}
                                                alt={p.label}
                                                fill
                                                style={{
                                                    objectFit: 'contain',
                                                    // High visibility mode: Minimal grayscale, high opacity
                                                    filter: state.targetPlatform === p.id ? 'none' : 'grayscale(20%) opacity(0.9)',
                                                    transition: 'all 0.4s ease'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                                        <span className={styles.cardTitle} style={{ fontSize: '1.2rem', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>{p.label}</span>
                                        <span className={styles.cardDesc} style={{ fontSize: '0.85rem', opacity: 0.6, lineHeight: 1.5, maxWidth: '220px', margin: '0 auto' }}>{p.desc}</span>
                                    </div>

                                    {/* Refined Selection Indicator - Integrated Ring */}
                                    <div style={{
                                        marginTop: 'auto',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        border: state.targetPlatform === p.id ? 'none' : '2px solid rgba(255,255,255,0.2)',
                                        background: state.targetPlatform === p.id ? p.activeColor : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.3s ease',
                                        boxShadow: state.targetPlatform === p.id ? `0 2px 8px ${p.activeColor}66` : 'none'
                                    }}>
                                        {state.targetPlatform === p.id && (
                                            <Check size={14} color={p.activeColor === '#ffffff' ? 'black' : 'white'} strokeWidth={3} />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>

            <Link href="/dashboard" className={styles.closeButton} aria-label="Voltar para o Dashboard">
                <X size={24} />
            </Link>
            {step <= 10 ? (
                <div className={styles.wizardCard}>
                    {/* Progress Bar (Dynamic based on mode) */}
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{
                                width: state.mode === 'portfolio'
                                    ? step === 0 ? '5%' : '50%'
                                    : `${(step / 10) * 100}%`
                            }}
                        />
                    </div>

                    <div className={styles.stepIndicator}>
                        {state.mode === 'portfolio' && step > 0 ? 'Passo Rápido' : `Passo ${step === 0 ? 'Inicial' : step} de ${state.mode === 'portfolio' ? 1 : 10}`}
                    </div>

                    <div className={styles.contentArea}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                style={{ width: '100%' }}
                            >
                                {renderStepContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={styles.backButton}
                            onClick={prevStep}
                            disabled={step === 0}
                            style={{ opacity: step === 0 ? 0.3 : 1, cursor: step === 0 ? 'default' : 'pointer' }}
                        >
                            <ChevronDown style={{ transform: 'rotate(90deg)' }} size={20} /> Voltar
                        </button>

                        <button
                            className={styles.nextButton}
                            onClick={nextStep}
                            disabled={isNextDisabled()}
                            style={{ opacity: isNextDisabled() ? 0.5 : 1 }}
                        >
                            {(state.mode === 'portfolio' && step === 1) || step === 10
                                ? 'Gerar Mágica'
                                : <>Próximo <ChevronDown style={{ transform: 'rotate(-90deg)' }} size={20} /></>
                            }
                        </button>
                    </div>
                </div>
            ) : (
                <div className={styles.resultCard} style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
                    <div className={styles.resultHeader}>
                        <h2 className={styles.resultTitle}>Seu Prompt está Pronto</h2>
                        <p className={styles.resultDesc}>Agora é só copiar e colar no <b>{state.targetPlatform}</b>.</p>
                    </div>

                    {isGenerating ? (
                        <div className={styles.loadingOverlay} style={{ position: 'relative', height: '300px', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <TextShimmer
                                className="text-lg font-medium text-center [--base-color:theme(colors.zinc.500)] [--base-gradient-color:theme(colors.white)]"
                                duration={1.5}
                            >
                                {state.mode === 'portfolio' ? 'A IA está imaginando seu portfólio completo...' : `Otimizando especificações para ${state.targetPlatform}...`}
                            </TextShimmer>
                        </div>
                    ) : (
                        <div className={styles.editorWindow}>
                            <div className={styles.editorHeader}>
                                <div className={styles.windowControls}>
                                    <div className={styles.controlDot} style={{ background: '#FF5F56' }} />
                                    <div className={styles.controlDot} style={{ background: '#FFBD2E' }} />
                                    <div className={styles.controlDot} style={{ background: '#27C93F' }} />
                                </div>
                                <span className={styles.fileName}>prompt_landing_page.md</span>
                                <div style={{ flex: 1 }} />
                                <div className={styles.badge}>{state.targetPlatform} Mode</div>
                            </div>

                            <div className={styles.editorBody}>
                                <pre className={styles.promptContent}>{generatedPrompt}</pre>
                            </div>

                            <div className={styles.editorFooter}>
                                <button className={styles.copyActionResult} onClick={handleCopy}>
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    {copied ? 'Copiado!' : 'Copiar Prompt'}
                                </button>
                                <button className={styles.secondaryAction} onClick={() => setStep(0)}>
                                    Criar Novo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
