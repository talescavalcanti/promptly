'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, Target, Palette, Layout, FileText, Check, Copy, ChevronDown, ChevronUp, Bot, Sparkles, Lightbulb, Type, Layers, X, Zap, Sliders, Frame, Feather, Megaphone
} from 'lucide-react';
import Link from 'next/link';
import styles from './landing-builder.module.css'; // Reusing the copied/renamed styles
import { ScrollReveal } from '../components/ScrollReveal/ScrollReveal';
import { LANDING_PAGE_AGENT_V2_PROMPT } from './agentPrompts';

// --- Types ---
type LandingBuilderState = {
    mode: 'portfolio' | 'custom';
    niche: string;
    brandName: string;
    targetAudience: string; // New
    goal: 'portfolio' | 'leads' | 'sales';
    style: 'modern' | 'minimal' | 'editorial' | 'bold';
    primaryColor: string; // New
    secondaryColor: string; // New
    typography: string;
    fontWeight: 'light' | 'regular' | 'medium' | 'bold'; // New
    useSingleFont: boolean; // New
    sections: string[];
    mainOffer: string;
    contactInfo: string;
    tone: string;
};

const INITIAL_STATE: LandingBuilderState = {
    mode: 'custom',
    niche: '',
    brandName: '',
    targetAudience: '',
    goal: 'portfolio',
    style: 'modern',
    primaryColor: '#3b82f6', // Default Blue
    secondaryColor: '#ffffff', // Default White
    typography: 'sans',
    fontWeight: 'regular',
    useSingleFont: false,
    sections: ['Hero', 'ProofStrip', 'Services', 'HowItWorks', 'ResultsGallery', 'Differentials', 'Depoimentos', 'FAQ', 'Locations', 'Footer'],
    mainOffer: '',
    contactInfo: '',
    tone: 'Profissional e Confiável'
};

const GOALS = [
    { id: 'portfolio', label: 'Portfólio / Institucional', desc: 'Apresentar serviços e histórico', icon: <Briefcase size={24} /> },
    { id: 'leads', label: 'Captura de Leads', desc: 'Foco em formulários e contato', icon: <Target size={24} /> },
    { id: 'sales', label: 'Venda Direta', desc: 'Página de Vendas (High Ticket)', icon: <Layout size={24} /> },
];

const STYLES = [
    { id: 'modern', label: 'Moderno & Tech', desc: 'Gradientes, Glassmorphism, Rounded', color: '#3b82f6' },
    { id: 'minimal', label: 'Minimalista & Clean', desc: 'Muito espaço em branco, tipografia suíça', color: '#14b8a6' },
    { id: 'editorial', label: 'Editorial & Elegante', desc: 'Fontes serifadas, fotos grandes, luxo', color: '#FFFFFF' },
    { id: 'bold', label: 'Bold & Impactante', desc: 'Cores fortes, fontes grossas, contraste alto', color: '#ef4444' },
];

const COLORS = [
    { id: 'blue', label: 'Azul Tech', color: '#3b82f6' },
    { id: 'emerald', label: 'Verde Saúde', color: '#10b981' },
    { id: 'purple', label: 'Roxo Criativo', color: '#8b5cf6' },
    { id: 'orange', label: 'Laranja Vibrante', color: '#f97316' },
    { id: 'red', label: 'Vermelho Bold', color: '#ef4444' },
    { id: 'slate', label: 'Cinza Neutro', color: '#64748b' },
    { id: 'black', label: 'Preto Luxo', color: '#000000' },
    { id: 'white', label: 'Branco Clean', color: '#ffffff' },
    { id: 'gold', label: 'Dourado Premium', color: '#d4af37' },
    { id: 'teal', label: 'Teal Moderno', color: '#14b8a6' },
];

const FONT_WEIGHTS = [
    { id: 'light', label: 'Leve (300)' },
    { id: 'regular', label: 'Regular (400)' },
    { id: 'medium', label: 'Médio (500)' },
    { id: 'bold', label: 'Negrito (700)' },
];

const FONTS = [
    { id: 'sans', label: 'Moderna (Inter/Plus Jakarta)', desc: 'Limpa e legível' },
    { id: 'serif', label: 'Elegante (Playfair/Lora)', desc: 'Sofisticada e clássica' },
    { id: 'tech', label: 'Tech (Space Grotesk/Inter)', desc: 'Futurista e digital' },
    { id: 'condensed', label: 'Bold (Oswald/Roboto)', desc: 'Impactante e forte' },
];

const SINGLE_FONTS = [
    { id: 'Inter', label: 'Inter', desc: 'A padrão da web moderna', style: 'sans-serif' },
    { id: 'Roboto', label: 'Roboto', desc: 'Geométrica e amigável', style: 'sans-serif' },
    { id: 'Poppins', label: 'Poppins', desc: 'Geométrica e carismática', style: 'sans-serif' },
    { id: 'Playfair Display', label: 'Playfair', desc: 'Serifada de alto luxo', style: 'serif' },
    { id: 'Montserrat', label: 'Montserrat', desc: 'Urbana e moderna', style: 'sans-serif' },
    { id: 'Open Sans', label: 'Open Sans', desc: 'Legibilidade neutra', style: 'sans-serif' },
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

export default function LandingBuilderPage() {
    const [step, setStep] = useState(0);
    const [state, setState] = useState<LandingBuilderState>(INITIAL_STATE);
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const NICHE_SUGGESTIONS = [
        "Clínica Odontológica", "Consultoria Financeira", "SaaS B2B", "Barbearia Premium", "Nutricionista Esportiva", "Advocacia Trabalhista"
    ];

    const updateState = (key: keyof LandingBuilderState, value: any) => {
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
            // 8: Generate
            if (step < 7) setStep(step + 1);
            else handleGeneratePrompt();
        }
    };

    const prevStep = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleGeneratePrompt = async () => {
        setStep(8); // Result screen (Custom mode index)
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

                    voiceTone: state.mode === 'custom' ? state.tone : undefined,
                    problemSolved: state.mode === 'custom' ? state.mainOffer : undefined,
                    cta: state.mode === 'custom' ? state.contactInfo : undefined,
                    sections: state.mode === 'custom' ? state.sections : undefined,

                    brandName: state.brandName
                })
            });

            const data = await response.json();

            if (data.error) {
                setGeneratedPrompt(`Erro ao gerar prompt: ${data.error}`);
            } else {
                setGeneratedPrompt(data.result);
            }
        } catch (error) {
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
                                    No "Modo Flash", se você não der nome, criaremos um criativo para você.
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

            case 4: // Visual Style
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Estilo Visual</h2>
                            <p className={styles.stepDescription}>Qual a estética desejada?</p>
                        </div>
                        <div className={styles.grid2}>
                            {STYLES.map(s => (
                                <div
                                    key={s.id}
                                    className={`${styles.card} ${state.style === s.id ? styles.selected : ''}`}
                                    onClick={() => updateState('style', s.id)}
                                    style={{ '--primary': s.color } as React.CSSProperties}
                                >
                                    <div
                                        className={styles.cardIcon}
                                        style={{
                                            marginBottom: '0.5rem',
                                            borderRadius: s.id === 'bold' ? '4px' : s.id === 'editorial' ? '50%' : '16px',
                                            borderWidth: s.id === 'minimal' ? '1px' : s.id === 'bold' ? '2px' : '1px',
                                            background: s.id === 'minimal' ? 'transparent' : undefined
                                        }}
                                    >
                                        {s.id === 'modern' && <Layers size={24} />}
                                        {s.id === 'minimal' && <Frame size={24} strokeWidth={1.5} />}
                                        {s.id === 'editorial' && <Feather size={24} />}
                                        {s.id === 'bold' && <Megaphone size={24} strokeWidth={2.5} />}
                                    </div>
                                    <span className={styles.cardTitle}>{s.label}</span>
                                    <span className={styles.cardDesc} style={{ fontSize: '0.85rem', opacity: 0.7 }}>{s.desc}</span>
                                </div>
                            ))}
                        </div>
                    </>
                );

            case 5: // Design Details (Advanced)
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Refinamento Visual</h2>
                            <p className={styles.stepDescription}>Personalize as cores e a tipografia em detalhes.</p>
                        </div>

                        {/* Colors */}
                        <div className={styles.grid2} style={{ marginBottom: '2rem' }}>
                            {/* Primary Color */}
                            <div>
                                <label className={styles.label} style={{ marginBottom: '0.5rem', display: 'block' }}>Cor Primária (Destaques)</label>
                                <div className={styles.featuresGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '8px' }}>
                                    {COLORS.filter(c => c.id !== 'white').map(c => (
                                        <div
                                            key={`p-${c.id}`}
                                            onClick={() => updateState('primaryColor', c.color)}
                                            style={{
                                                width: '40px', height: '40px', borderRadius: '10px', background: c.color, cursor: 'pointer',
                                                border: state.primaryColor === c.color ? '2px solid white' : '1px solid rgba(255,255,255,0.1)',
                                                boxShadow: state.primaryColor === c.color ? `0 0 10px ${c.color}` : 'none',
                                                transition: 'all 0.2s'
                                            }}
                                            title={c.label}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Secondary Color */}
                            <div>
                                <label className={styles.label} style={{ marginBottom: '0.5rem', display: 'block' }}>Cor Secundária (Fundo/Base)</label>
                                <div className={styles.featuresGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '8px' }}>
                                    {COLORS.map(c => (
                                        <div
                                            key={`s-${c.id}`}
                                            onClick={() => updateState('secondaryColor', c.color)}
                                            style={{
                                                width: '40px', height: '40px', borderRadius: '10px', background: c.color, cursor: 'pointer',
                                                border: state.secondaryColor === c.color ? '2px solid white' : '1px solid rgba(255,255,255,0.1)',
                                                transform: state.secondaryColor === c.color ? 'scale(1.1)' : 'scale(1)',
                                                transition: 'all 0.2s'
                                            }}
                                            title={c.label}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '2rem 0' }} />

                        {/* Typography */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <label className={styles.label}>Tipografia</label>
                            <button
                                onClick={() => updateState('useSingleFont', !state.useSingleFont)}
                                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <div style={{ width: 36, height: 20, background: state.useSingleFont ? 'var(--primary)' : 'rgba(255,255,255,0.1)', borderRadius: 20, position: 'relative', transition: 'all 0.3s' }}>
                                    <div style={{ width: 16, height: 16, background: 'white', borderRadius: '50%', position: 'absolute', top: 2, left: state.useSingleFont ? 18 : 2, transition: 'all 0.3s' }} />
                                </div>
                                Usar apenas uma fonte
                            </button>
                        </div>

                        <div className={styles.grid2} style={{ marginBottom: '1.5rem' }}>
                            {(state.useSingleFont ? SINGLE_FONTS : FONTS).map(f => (
                                <div
                                    key={f.id}
                                    className={`${styles.card} ${state.typography === f.id ? styles.selected : ''}`}
                                    onClick={() => updateState('typography', f.id)}
                                    style={{ padding: '0.75rem 1rem', minHeight: 'auto', flexDirection: 'row', textAlign: 'left', gap: '1rem', borderLeft: 'none' } as any}
                                >
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', fontFamily: state.useSingleFont ? f.id : undefined }}>Aa</div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span className={styles.cardTitle} style={{ fontSize: '0.9rem' }}>{f.label}</span>
                                        <span className={styles.cardDesc} style={{ fontSize: '0.75rem' }}>{f.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Font Weight */}
                        <label className={styles.label} style={{ marginBottom: '1rem', display: 'block' }}>Espessura da Fonte (Heading)</label>
                        <div className={`${styles.featuresGrid} ${styles.weightGrid}`} style={{ gap: '0.5rem' }}>
                            {FONT_WEIGHTS.map(w => (
                                <button
                                    key={w.id}
                                    onClick={() => updateState('fontWeight', w.id)}
                                    className={styles.chip}
                                    style={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        background: state.fontWeight === w.id ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                        color: state.fontWeight === w.id ? '#000' : 'rgba(255,255,255,0.6)',
                                        borderColor: state.fontWeight === w.id ? 'var(--primary)' : 'transparent',
                                        fontWeight: w.id === 'bold' ? 700 : w.id === 'medium' ? 500 : w.id === 'light' ? 300 : 400
                                    }}
                                >
                                    {w.label}
                                </button>
                            ))}
                        </div>
                    </>
                );

            case 6: // Sections
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

            case 7: // Content Details
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
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            <Link href="/dashboard" className={styles.closeButton} aria-label="Voltar para o Dashboard">
                <X size={24} />
            </Link>
            {step < 8 ? (
                <div className={styles.wizardCard}>
                    {/* Progress Bar (Dynamic based on mode) */}
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{
                                width: state.mode === 'portfolio'
                                    ? step === 0 ? '5%' : '50%'
                                    : `${(step / 7) * 100}%`
                            }}
                        />
                    </div>

                    <div className={styles.stepIndicator}>
                        {state.mode === 'portfolio' && step > 0 ? 'Passo Rápido' : `Passo ${step === 0 ? 'Inicial' : step} de ${state.mode === 'portfolio' ? 1 : 7}`}
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
                            {(state.mode === 'portfolio' && step === 1) || step === 7
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
                        <p className={styles.resultDesc}>Agora é só copiar e colar no <b>{state.mode === 'portfolio' ? 'Lovable' : 'Lovable'}</b>.</p>
                    </div>

                    {isGenerating ? (
                        <div className={styles.loadingOverlay} style={{ position: 'relative', height: '300px', background: 'transparent' }}>
                            <div className={styles.spinner} />
                            <span>
                                {state.mode === 'portfolio' ? 'A IA está imaginando seu portfólio completo...' : 'Otimizando especificações técnicas...'}
                            </span>
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
                                <div className={styles.badge}>Lovable Mode</div>
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
