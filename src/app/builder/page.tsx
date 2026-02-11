'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Layout, Check, Copy, ChevronDown, Bot, X, Briefcase, Monitor
} from 'lucide-react';
import Link from 'next/link';
import styles from './saas-builder.module.css';
import { TARGET_PLATFORMS } from '../../lib/saas_constants';
import { TextShimmer } from '@/components/ui/text-shimmer';

// --- Types ---
type SaasBuilderState = {
    appName: string;
    niche: string;
    targetAudience: string;
    features: string[];
    visualStyle: string;
    primaryColor: string;
    secondaryColor: string;
    typography: string;
    typographyWeight: number;
    targetPlatform: string;
    monetization: {
        enabled: boolean;
        model: 'subscription' | 'one-time' | 'freemium' | 'usage-based';
        provider: 'stripe' | 'asaas' | 'mercadopago' | 'demo';
        plans: string[];
        trialDays: number;
    };
};

const INITIAL_STATE: SaasBuilderState = {
    appName: '',
    niche: '',
    targetAudience: '',
    features: [],
    visualStyle: 'Moderno & Clean',
    primaryColor: '#3b82f6',
    secondaryColor: '#ffffff',
    typography: 'Inter',
    typographyWeight: 400,
    targetPlatform: 'Lovable',
    monetization: {
        enabled: false,
        model: 'subscription',
        provider: 'stripe',
        plans: ['Free', 'Pro', 'Enterprise'],
        trialDays: 7,
    },
};

// --- Preset Suggestions ---
const NICHE_SUGGESTIONS = [
    { id: 'productivity', label: 'Produtividade', desc: 'Gestão de tarefas, notas, projetos' },
    { id: 'crm', label: 'CRM & Vendas', desc: 'Gestão de clientes e pipeline' },
    { id: 'finance', label: 'Finanças', desc: 'Controle financeiro, faturas, cobranças' },
    { id: 'health', label: 'Saúde & Fitness', desc: 'Agendamentos, prontuários, treinos' },
    { id: 'education', label: 'Educação & Cursos', desc: 'LMS, aulas online, certificados' },
    { id: 'ecommerce', label: 'E-commerce', desc: 'Catálogo, carrinho, checkout' },
    { id: 'booking', label: 'Agendamentos', desc: 'Reservas, calendário, confirmações' },
    { id: 'analytics', label: 'Analytics & BI', desc: 'Dashboards, relatórios, métricas' },
];

const AUDIENCE_SUGGESTIONS = [
    { id: 'freelancers', label: 'Freelancers', desc: 'Profissionais autônomos' },
    { id: 'startups', label: 'Startups', desc: 'Empresas em estágio inicial' },
    { id: 'smb', label: 'PMEs', desc: 'Pequenas e médias empresas' },
    { id: 'enterprise', label: 'Enterprise', desc: 'Grandes corporações' },
    { id: 'creators', label: 'Criadores de Conteúdo', desc: 'YouTubers, influencers' },
    { id: 'developers', label: 'Desenvolvedores', desc: 'Devs e times técnicos' },
    { id: 'students', label: 'Estudantes', desc: 'Universitários e vestibulandos' },
    { id: 'agencies', label: 'Agências', desc: 'Marketing, design, desenvolvimento' },
];

const PAYMENT_PROVIDERS = [
    { id: 'stripe', label: 'Stripe', desc: 'Global - Cartão, PIX (via Stripe)', icon: '💳', region: 'Global' },
    { id: 'asaas', label: 'Asaas', desc: 'Brasil - PIX, Boleto, Cartão', icon: '🇧🇷', region: 'Brasil' },
    { id: 'mercadopago', label: 'Mercado Pago', desc: 'LATAM - PIX, Boleto, Cartão', icon: '🌎', region: 'LATAM' },
    { id: 'demo', label: 'Demo Mode', desc: 'Sem pagamentos reais (teste)', icon: '🧪', region: 'Teste' },
];

const MONETIZATION_MODELS = [
    { id: 'subscription', label: 'Assinatura', desc: 'Cobrança mensal/anual recorrente' },
    { id: 'freemium', label: 'Freemium', desc: 'Grátis + planos premium' },
    { id: 'one-time', label: 'Pagamento Único', desc: 'Licença vitalícia' },
    { id: 'usage-based', label: 'Por Uso', desc: 'Cobra conforme consumo' },
];

const STYLES = [
    { id: 'modern', label: 'Moderno & Clean', desc: 'Minimalista, muito espaço em branco, foco no conteúdo.', icon: Layout, color: '#3b82f6' }, // Blue
    { id: 'corporate', label: 'Corporativo & Sério', desc: 'Cores sóbrias, tipografia densa, dados confiáveis.', icon: Briefcase, color: '#64748b' }, // Slate
    { id: 'creative', label: 'Criativo & Vibrante', desc: 'Gradientes, cores fortes e formas orgânicas.', icon: Zap, color: '#ec4899' }, // Pink
    { id: 'tech', label: 'Tech & Dark Mode', desc: 'Fundo escuro, neon, futurista e high-tech.', icon: Monitor, color: '#10b981' }, // Emerald
];

const COLORS = [
    { id: 'blue', label: 'Azul Tech', color: '#3b82f6' },
    { id: 'indigo', label: 'Indigo Profundo', color: '#6366f1' },
    { id: 'violet', label: 'Violeta Místico', color: '#8b5cf6' },
    { id: 'purple', label: 'Roxo Criativo', color: '#a855f7' },
    { id: 'fuchsia', label: 'Fuchsia Vibrante', color: '#d946ef' },
    { id: 'pink', label: 'Rosa Shock', color: '#ec4899' },
    { id: 'rose', label: 'Rose Elegante', color: '#f43f5e' },
    { id: 'red', label: 'Vermelho Bold', color: '#ef4444' },
    { id: 'orange', label: 'Laranja Energia', color: '#f97316' },
    { id: 'amber', label: 'Amber Ouro', color: '#f59e0b' },
    { id: 'yellow', label: 'Amarelo Sol', color: '#eab308' },
    { id: 'lime', label: 'Lime Ácido', color: '#84cc16' },
    { id: 'emerald', label: 'Verde Saúde', color: '#10b981' },
    { id: 'teal', label: 'Teal Moderno', color: '#14b8a6' },
    { id: 'cyan', label: 'Ciano Futuro', color: '#06b6d4' },
    { id: 'sky', label: 'Sky Claro', color: '#0ea5e9' },
    { id: 'slate', label: 'Cinza Neutro', color: '#64748b' },
    { id: 'zinc', label: 'Zinc Industrial', color: '#71717a' },
    { id: 'neutral', label: 'Neutral', color: '#737373' },
    { id: 'stone', label: 'Stone Earth', color: '#78716c' },
    { id: 'black', label: 'Preto Luxo', color: '#000000' },
    { id: 'white', label: 'Branco Clean', color: '#ffffff' },
];

const FONTS = [
    { id: 'Inter', label: 'Inter', category: 'Sans-Serif' },
    { id: 'Poppins', label: 'Poppins', category: 'Sans-Serif' },
    { id: 'Roboto', label: 'Roboto', category: 'Sans-Serif' },
    { id: 'Open Sans', label: 'Open Sans', category: 'Sans-Serif' },
    { id: 'Montserrat', label: 'Montserrat', category: 'Sans-Serif' },
    { id: 'Playfair Display', label: 'Playfair', category: 'Serif' },
    { id: 'Lora', label: 'Lora', category: 'Serif' },
    { id: 'Merriweather', label: 'Merriweather', category: 'Serif' },
    { id: 'JetBrains Mono', label: 'JetBrains', category: 'Monospace' },
    { id: 'Oswald', label: 'Oswald', category: 'Condensed' },
];

export default function SaasBuilderPage() {
    const [step, setStep] = useState(0);
    const [state, setState] = useState<SaasBuilderState>(INITIAL_STATE);
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [featureInput, setFeatureInput] = useState('');

    const updateState = (key: keyof SaasBuilderState, value: string | string[] | number) => {
        setState(prev => ({ ...prev, [key]: value }));
    };

    const toggleFeature = (feat: string) => {
        setState(prev => ({
            ...prev,
            features: prev.features.includes(feat)
                ? prev.features.filter(f => f !== feat)
                : [...prev.features, feat]
        }));
    };

    const addFeature = () => {
        if (featureInput.trim()) {
            if (!state.features.includes(featureInput.trim())) {
                toggleFeature(featureInput.trim());
            }
            setFeatureInput('');
        }
    };

    const nextStep = () => {
        if (step < 8) setStep(step + 1); // Steps: 0-7 wizard, 8 result
        else handleGeneratePrompt();
    };

    const prevStep = () => {
        if (step > 0) setStep(step - 1);
    };

    // --- AI Suggestion Logic ---
    const handleMagicSuggest = async () => {
        if (!state.appName) return;
        setIsSuggesting(true);
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    promptMode: 'suggest_saas_details',
                    saasName: state.appName,
                    saasNiche: state.niche
                }),
            });

            if (!response.ok) throw new Error('Erro na sugestão IA');
            const data = await response.json();

            // Clean markdown if present - more robust regex
            const jsonMatch = data.result.match(/```json\n?([\s\S]*?)\n?```/) || data.result.match(/(\{[\s\S]*\})/);
            const cleanJson = jsonMatch ? jsonMatch[1] : data.result.trim();
            const suggestions = JSON.parse(cleanJson);

            setState(prev => ({
                ...prev,
                niche: suggestions.niche || prev.niche,
                targetAudience: suggestions.targetAudience || prev.targetAudience,
                features: [...prev.features, ...(suggestions.features || [])],
                primaryColor: suggestions.primaryColor || prev.primaryColor,
                secondaryColor: suggestions.secondaryColor || prev.secondaryColor,
                typography: suggestions.typography || prev.typography,
                visualStyle: suggestions.visualStyle || prev.visualStyle
            }));

        } catch (error) {
            console.error("Magic Suggest Error:", error);
            // Optional: Show toast
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleGeneratePrompt = async () => {
        setStep(8); // Result screen
        setIsGenerating(true);
        setGeneratedPrompt('');

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    promptMode: 'saas_builder',
                    saasName: state.appName,
                    saasNiche: state.niche,
                    targetAudience: state.targetAudience,
                    features: state.features,
                    saasColor: state.primaryColor,
                    secondaryColor: state.secondaryColor,
                    typography: `${state.typography} (Weight: ${state.typographyWeight})`,
                    typographyWeight: state.typographyWeight,
                    targetPlatform: state.targetPlatform,
                    logoStyle: state.visualStyle,
                    voiceTone: 'Profissional e Persuasivo',
                    monetization: state.monetization
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Erro ao gerar prompt');
            }

            const data = await response.json();
            setGeneratedPrompt(data.result);

        } catch (error: unknown) {
            const err = error as Error;
            console.error(err);
            setGeneratedPrompt(`Erro: ${err.message || 'Falha na conexão'}. Tente novamente.`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // --- Render Steps ---
    const renderStepContent = () => {
        switch (step) {
            case 0: // App Name & Platform
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Identidade do Projeto</h2>
                            <p className={styles.stepDescription}>Comece definindo o nome e onde você vai construir.</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                                Plataforma de IA (Onde você vai colar o prompt?)
                            </label>
                            <div className={styles.platformGrid}>
                                {TARGET_PLATFORMS.map(platform => {
                                    return (
                                        <div
                                            key={platform.id}
                                            className={`${styles.platformCard} ${state.targetPlatform === platform.id ? styles.active : ''}`}
                                            onClick={() => updateState('targetPlatform', platform.id)}
                                        >
                                            <div className={styles.platformIcon}>
                                                <img
                                                    src={platform.logo}
                                                    alt={platform.label}
                                                    className={styles.platformLogoImg}
                                                />
                                            </div>
                                            <div className={styles.platformInfo}>
                                                <span className={styles.platformName}>{platform.label}</span>
                                                <span className={styles.platformDomain}>{platform.value}</span>
                                            </div>
                                            {state.targetPlatform === platform.id && (
                                                <motion.div
                                                    layoutId="active-platform"
                                                    className={styles.platformActiveIndicator}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
                            <label className={styles.label}>Nome do SaaS</label>
                            <input
                                className={styles.input}
                                placeholder="Ex: TaskFlow, FinanceAI..."
                                value={state.appName}
                                onChange={(e) => updateState('appName', e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className={styles.navButtons}>
                            <button className={styles.backButton} style={{ visibility: 'hidden' }}>Voltar</button>
                            <button className={styles.nextButton} onClick={nextStep} disabled={!state.appName.trim()}>
                                Próximo <ChevronDown style={{ transform: 'rotate(-90deg)' }} size={20} />
                            </button>
                        </div>
                    </>
                );
            case 1: // Niche & AI Magic
                return (
                    <>
                        <div className={styles.stepHeader} style={{ marginBottom: '1rem' }}>
                            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                                <div>
                                    <h2 className={styles.stepTitle}>Nicho e Público</h2>
                                    <p className={`${styles.stepDescription} whitespace-nowrap`}>Defina o mercado. Ou deixe a IA sugerir.</p>
                                </div>
                                <button
                                    className={styles.copyActionResult}
                                    onClick={handleMagicSuggest}
                                    disabled={isSuggesting || !state.appName}
                                >
                                    {isSuggesting && (
                                        <div className={styles.spinner} style={{ width: 16, height: 16, borderWidth: 2 }} />
                                    )}
                                    {isSuggesting ? 'Pensando...' : 'Preencher com IA'}
                                </button>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nicho de Mercado</label>
                            <input
                                className={styles.input}
                                placeholder="Ex: Gestão e Projetos..."
                                value={state.niche}
                                onChange={(e) => updateState('niche', e.target.value)}
                            />
                            <div className={styles.suggestionsGrid} style={{ marginTop: '0.75rem' }}>
                                {NICHE_SUGGESTIONS.map(n => (
                                    <div
                                        key={n.id}
                                        className={styles.suggestionpill}
                                        onClick={() => updateState('niche', n.label)}
                                        title={n.desc}
                                        style={{ opacity: state.niche === n.label ? 1 : 0.7 }}
                                    >
                                        {state.niche === n.label ? '✓ ' : '+ '}{n.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                            <label className={styles.label}>Público Alvo</label>
                            <input
                                className={styles.input}
                                placeholder="Ex: Freelancers, Startups..."
                                value={state.targetAudience}
                                onChange={(e) => updateState('targetAudience', e.target.value)}
                            />
                            <div className={styles.suggestionsGrid} style={{ marginTop: '0.75rem' }}>
                                {AUDIENCE_SUGGESTIONS.map(a => (
                                    <div
                                        key={a.id}
                                        className={styles.suggestionpill}
                                        onClick={() => updateState('targetAudience', a.label)}
                                        title={a.desc}
                                        style={{ opacity: state.targetAudience === a.label ? 1 : 0.7 }}
                                    >
                                        {state.targetAudience === a.label ? '✓ ' : '+ '}{a.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.navButtons}>
                            <button className={styles.backButton} onClick={prevStep}>Voltar</button>
                            <button className={styles.nextButton} onClick={nextStep}>
                                Próximo <ChevronDown style={{ transform: 'rotate(-90deg)' }} size={20} />
                            </button>
                        </div>
                    </>
                );
            case 2: // Features
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className={styles.stepTitle}>Funcionalidades</h2>
                                    <p className={styles.stepDescription}>O que seu app vai fazer?</p>
                                </div>
                                {!state.features.length && state.appName && (
                                    <button
                                        className={styles.backButton}
                                        style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                                        onClick={handleMagicSuggest}
                                        disabled={isSuggesting}
                                    >
                                        <Bot size={16} className="mr-2" /> Sugerir Features
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className={styles.inputWithButton}>
                            <input
                                className={styles.input}
                                placeholder="Digite uma feature..."
                                value={featureInput}
                                onChange={(e) => setFeatureInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') addFeature(); }}
                            />
                            <button className={styles.addButton} onClick={addFeature}>+</button>
                        </div>
                        <div className={styles.chipGrid}>
                            {state.features.map((feat, idx) => (
                                <div key={idx} className={styles.chip} onClick={() => toggleFeature(feat)}>
                                    {feat} <X size={14} style={{ marginLeft: 6 }} />
                                </div>
                            ))}
                        </div>
                        <div className={styles.suggestionsGrid}>
                            {['Auth', 'Dashboard', 'Pagamentos', 'Admin', 'Relatórios'].map(sug => (
                                <div key={sug} className={styles.suggestionpill} onClick={() => {
                                    if (!state.features.includes(sug)) toggleFeature(sug);
                                }}>+ {sug}</div>
                            ))}
                        </div>
                        <div className={styles.navButtons}>
                            <button className={styles.backButton} onClick={prevStep}>Voltar</button>
                            <button className={styles.nextButton} onClick={nextStep}>
                                Próximo <ChevronDown style={{ transform: 'rotate(-90deg)' }} size={20} />
                            </button>
                        </div>
                    </>
                );
            case 3: // Visual Style Only
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Estilo Visual</h2>
                            <p className={styles.stepDescription}>Qual a &quot;vibe&quot; do seu SaaS?</p>
                        </div>
                        <div className={styles.grid2} style={{ marginTop: '1rem' }}>
                            {STYLES.map(s => (
                                <div
                                    key={s.id}
                                    className={`${styles.card} ${state.visualStyle === s.label ? styles.selected : ''}`}
                                    onClick={() => updateState('visualStyle', s.label)}
                                    style={{ '--primary': s.color } as React.CSSProperties}
                                >
                                    <div className={styles.cardIcon}><s.icon size={24} /></div>
                                    <span className={styles.cardTitle}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className={styles.navButtons}>
                            <button className={styles.backButton} onClick={prevStep}>Voltar</button>
                            <button className={styles.nextButton} onClick={nextStep}>
                                Próximo <ChevronDown style={{ transform: 'rotate(-90deg)' }} size={20} />
                            </button>
                        </div>
                    </>
                );
            case 4: // Colors Only (Synced with Landing Builder)
                return (
                    <>
                        <div className={styles.stepHeader} style={{ marginBottom: '1.5rem' }}>
                            <h2 className={styles.stepTitle}>Paleta de Cores</h2>
                            <p className={styles.stepDescription}>Defina as cores da sua marca.</p>
                        </div>

                        {/* Colors */}
                        <div className={styles.grid2} style={{ marginBottom: '2rem' }}>
                            {/* Primary Color */}
                            <div>
                                <label className={styles.label} style={{ marginBottom: '0.8rem', display: 'block' }}>Cor Primária (Destaques)</label>
                                <div className={styles.featuresGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(36px, 1fr))', gap: '8px' }}>
                                    {COLORS.filter(c => c.id !== 'white').map(c => (
                                        <div
                                            key={`p-${c.id}`}
                                            onClick={() => updateState('primaryColor', c.color)}
                                            style={{
                                                width: '36px', height: '36px', borderRadius: '50%',
                                                background: c.color,
                                                cursor: 'pointer',
                                                border: state.primaryColor === c.color ? '3px solid white' : '1px solid rgba(255,255,255,0.1)',
                                                boxShadow: state.primaryColor === c.color ? `0 0 15px ${c.color}aa` : 'none',
                                                transform: state.primaryColor === c.color ? 'scale(1.1)' : 'scale(1)',
                                                transition: 'all 0.2s',
                                                position: 'relative'
                                            }}
                                            title={c.label}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Secondary Color */}
                            <div>
                                <label className={styles.label} style={{ marginBottom: '0.8rem', display: 'block' }}>Cor Secundária (Fundo/Base)</label>
                                <div className={styles.featuresGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(36px, 1fr))', gap: '8px' }}>
                                    {COLORS.map(c => (
                                        <div
                                            key={`s-${c.id}`}
                                            onClick={() => updateState('secondaryColor', c.color)}
                                            style={{
                                                width: '36px', height: '36px', borderRadius: '50%',
                                                background: c.color,
                                                cursor: 'pointer',
                                                border: state.secondaryColor === c.color ? '3px solid white' : '1px solid rgba(255,255,255,0.1)',
                                                boxShadow: state.secondaryColor === c.color ? `0 0 15px ${c.color}aa` : 'none',
                                                transform: state.secondaryColor === c.color ? 'scale(1.1)' : 'scale(1)',
                                                transition: 'all 0.2s'
                                            }}
                                            title={c.label}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Live Preview (Kept as it adds value and fits the structure) */}
                        <div className={styles.mockPreview} style={{ background: state.secondaryColor, borderColor: 'rgba(255,255,255,0.1)' }}>
                            <div style={{
                                width: '100%',
                                padding: '1rem',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: state.secondaryColor === '#ffffff' || state.secondaryColor.startsWith('#f') ? '#000' : '#fff', opacity: 0.8
                                }}>{state.appName || 'Meu SaaS'}</div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', flex: 1, gap: '1rem' }}>
                                <h3 className={styles.mockHeading} style={{ color: state.primaryColor, marginBottom: 0 }}>
                                    {state.visualStyle.split(' ')[0]} Vibe
                                </h3>
                                <p style={{
                                    color: state.secondaryColor === '#ffffff' || state.secondaryColor.startsWith('#f') ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
                                    fontSize: '0.9rem',
                                    textAlign: 'center',
                                    maxWidth: '80%'
                                }}>
                                    Transforme suas ideias em realidade com a paleta de cores perfeita.
                                </p>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button className={styles.mockButton} style={{
                                        background: state.primaryColor,
                                        color: state.secondaryColor === '#ffffff' || state.secondaryColor.startsWith('#f') ? '#fff' : '#000',
                                        boxShadow: `0 4px 15px ${state.primaryColor}66`
                                    }}>
                                        Começar Agora
                                    </button>
                                    <button style={{
                                        padding: '0.6rem 1.2rem',
                                        borderRadius: '8px',
                                        background: 'transparent',
                                        border: `1px solid ${state.primaryColor}`,
                                        color: state.primaryColor,
                                        fontSize: '0.9rem',
                                        fontWeight: 500
                                    }}>
                                        Saber Mais
                                    </button>
                                </div>
                            </div>
                        </div>


                        <div className={styles.navButtons}>
                            <button className={styles.backButton} onClick={prevStep}>Voltar</button>
                            <button className={styles.nextButton} onClick={nextStep}>
                                Próximo <ChevronDown style={{ transform: 'rotate(-90deg)' }} size={20} />
                            </button>
                        </div>
                    </>
                );
            case 5: // Typography & Weight
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Tipografia</h2>
                            <p className={styles.stepDescription}>A voz visual da sua marca.</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Família da Fonte</label>
                            <div className="grid grid-cols-2 gap-3 mt-2" style={{ maxHeight: '360px', overflowY: 'auto', paddingRight: '5px' }}>
                                {FONTS.map(font => (
                                    <div
                                        key={font.id}
                                        className={`${styles.fontCard} ${state.typography === font.id ? styles.active : ''}`}
                                        onClick={() => updateState('typography', font.id)}
                                        style={{ fontFamily: font.id }}
                                    >
                                        <div className={styles.fontPreviewAa}>Aa</div>
                                        <div className={styles.fontInfo}>
                                            <span className={styles.fontName}>{font.label}</span>
                                            <span className={styles.fontCat} style={{ fontFamily: 'var(--font-heading)' }}>{font.category}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
                            <div className="flex justify-between items-center mb-2">
                                <label className={styles.label}>Espessura (Peso): <span style={{ color: 'var(--primary)' }}>{state.typographyWeight}</span></label>
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="900"
                                step="100"
                                value={state.typographyWeight}
                                onChange={(e) => updateState('typographyWeight', parseInt(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                style={{ accentColor: 'var(--primary)' }}
                            />

                            {/* Live Preview Box */}
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '2rem',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: 16,
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '120px'
                            }}>
                                <p style={{
                                    fontFamily: state.typography,
                                    fontWeight: state.typographyWeight,
                                    fontSize: '1.8rem',
                                    color: 'white',
                                    textAlign: 'center',
                                    lineHeight: 1.2
                                }}>
                                    Promptly SaaS
                                </p>
                                <p style={{
                                    fontFamily: state.typography,
                                    fontWeight: 400, // Contrast with body text
                                    fontSize: '1rem',
                                    color: 'rgba(255,255,255,0.6)',
                                    textAlign: 'center'
                                }}>
                                    The quick brown fox jumps over the lazy dog.
                                </p>
                            </div>
                        </div>

                        <div className={styles.navButtons}>
                            <button className={styles.backButton} onClick={prevStep}>Voltar</button>
                            <button className={styles.nextButton} onClick={nextStep}>
                                Próximo <ChevronDown style={{ transform: 'rotate(-90deg)' }} size={20} />
                            </button>
                        </div>
                    </>
                );
            case 6: // Monetization
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Monetização</h2>
                            <p className={styles.stepDescription}>Como seu SaaS vai gerar receita?</p>
                        </div>

                        {/* Enable/Disable Toggle */}
                        <div className={styles.formGroup}>
                            <div
                                className={`${styles.card} ${state.monetization.enabled ? styles.selected : ''}`}
                                onClick={() => setState(prev => ({
                                    ...prev,
                                    monetization: { ...prev.monetization, enabled: !prev.monetization.enabled }
                                }))}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem' }}
                            >
                                <div style={{
                                    width: 24, height: 24, borderRadius: 6,
                                    background: state.monetization.enabled ? 'var(--primary)' : 'transparent',
                                    border: state.monetization.enabled ? 'none' : '2px solid rgba(255,255,255,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {state.monetization.enabled && <Check size={16} color="#fff" />}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600, color: 'white', margin: 0 }}>Ativar Pagamentos</p>
                                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                                        Integrar sistema de cobrança recorrente
                                    </p>
                                </div>
                            </div>
                        </div>

                        {state.monetization.enabled && (
                            <>
                                {/* Payment Provider */}
                                <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                                    <label className={styles.label}>Provedor de Pagamento</label>
                                    <div className={styles.grid2} style={{ marginTop: '0.75rem' }}>
                                        {PAYMENT_PROVIDERS.map(p => (
                                            <div
                                                key={p.id}
                                                className={`${styles.card} ${state.monetization.provider === p.id ? styles.selected : ''}`}
                                                onClick={() => setState(prev => ({
                                                    ...prev,
                                                    monetization: { ...prev.monetization, provider: p.id as 'stripe' | 'asaas' | 'mercadopago' | 'demo' }
                                                }))}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{p.icon}</div>
                                                <p style={{ fontWeight: 600, color: 'white', margin: 0 }}>{p.label}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{p.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Billing Model */}
                                <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                                    <label className={styles.label}>Modelo de Cobrança</label>
                                    <div className={styles.suggestionsGrid} style={{ marginTop: '0.75rem' }}>
                                        {MONETIZATION_MODELS.map(m => (
                                            <div
                                                key={m.id}
                                                className={styles.suggestionpill}
                                                onClick={() => setState(prev => ({
                                                    ...prev,
                                                    monetization: { ...prev.monetization, model: m.id as 'subscription' | 'one-time' | 'freemium' | 'usage-based' }
                                                }))}
                                                style={{ opacity: state.monetization.model === m.id ? 1 : 0.7 }}
                                                title={m.desc}
                                            >
                                                {state.monetization.model === m.id ? '✓ ' : ''}{m.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Trial Days */}
                                <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className={styles.label}>Período de Teste: <span style={{ color: 'var(--primary)' }}>{state.monetization.trialDays} dias</span></label>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="30"
                                        step="1"
                                        value={state.monetization.trialDays}
                                        onChange={(e) => setState(prev => ({
                                            ...prev,
                                            monetization: { ...prev.monetization, trialDays: parseInt(e.target.value) }
                                        }))}
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                        style={{ accentColor: 'var(--primary)' }}
                                    />
                                </div>
                            </>
                        )}

                        <div className={styles.navButtons}>
                            <button className={styles.backButton} onClick={prevStep}>Voltar</button>
                            <button className={styles.nextButton} onClick={nextStep}>
                                Próximo <ChevronDown style={{ transform: 'rotate(-90deg)' }} size={20} />
                            </button>
                        </div>
                    </>
                );
            case 7: // Review
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Revisão Final</h2>
                            <p className={styles.stepDescription}>Plataforma Alvo: <span style={{ color: 'var(--primary)' }}>{state.targetPlatform}</span></p>
                        </div>
                        <div className={styles.reviewCard}>
                            <div className={styles.reviewItem}> <span className={styles.reviewLabel}>App:</span> <span className={styles.reviewValue}>{state.appName}</span> </div>
                            <div className={styles.reviewItem}> <span className={styles.reviewLabel}>Nicho:</span> <span className={styles.reviewValue}>{state.niche}</span> </div>
                            <div className={styles.reviewItem}> <span className={styles.reviewLabel}>Estilo:</span> <span className={styles.reviewValue}>{state.visualStyle}</span> </div>
                            <div className={styles.reviewItem}> <span className={styles.reviewLabel}>Stack:</span> <span className={styles.reviewValue}>{state.targetPlatform} + {state.typography} ({state.typographyWeight})</span> </div>
                            <div className={styles.reviewItem}> <span className={styles.reviewLabel}>Features:</span> <span className={styles.reviewValue}>{state.features.length} funcionais</span> </div>
                            <div className={styles.reviewItem}>
                                <span className={styles.reviewLabel}>Monetização:</span>
                                <span className={styles.reviewValue}>
                                    {state.monetization.enabled
                                        ? `${state.monetization.provider.charAt(0).toUpperCase() + state.monetization.provider.slice(1)} - ${state.monetization.model} (${state.monetization.trialDays}d trial)`
                                        : 'Não configurado'
                                    }
                                </span>
                            </div>
                        </div>

                        <div className={styles.navButtons}>
                            <button className={styles.backButton} onClick={prevStep}>Voltar</button>
                            <button className={styles.nextButton} onClick={handleGeneratePrompt}>Gerar Mágica</button>
                        </div>
                    </>
                );
            default: return null;
        }
    };

    // --- Result Screen ---
    if (step === 8) {
        return (
            <div className={styles.container}>
                <Link href="/dashboard" className={styles.closeButton}><X size={24} /></Link>
                <div className={styles.resultContainer}>
                    <div className={styles.stepHeader}>
                        <h2 className={styles.stepTitle}>Seu Prompt está Pronto</h2>
                        <p className={styles.stepDescription}>Agora é só copiar e colar no <b>{state.targetPlatform}</b>.</p>
                    </div>
                    {isGenerating ? (
                        <div className={styles.loadingState} style={{ position: 'relative', height: '300px', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <TextShimmer
                                className="text-lg font-medium text-center [--base-color:theme(colors.zinc.500)] [--base-gradient-color:theme(colors.white)]"
                                duration={1.5}
                            >
                                {`Otimizando especificações para ${state.targetPlatform}...`}
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
                                <span className={styles.fileName}>prompt_gerado.md</span>
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
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Link href="/dashboard" className={styles.closeButton}><X size={24} /></Link>
            <div className={styles.wizardCard}>
                <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${((step + 1) / 8) * 100}%` }} />
                    </div>
                </div>
                <div className={styles.contentArea}>
                    <AnimatePresence mode='wait'>
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
            </div>
        </div>
    );
}
