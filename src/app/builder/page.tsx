"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Wand2, Calculator, Check, X, Plus, Trash2, Settings, Palette, Target, Fingerprint, LayoutGrid } from 'lucide-react';
import styles from './saas-builder.module.css';
import { TextShimmer } from '@/components/ui/text-shimmer';

import { CheckBox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { SAAS_BUILDER_V3_TEMPLATE, SaasBuilderState, generateSaasV3Prompt } from './saas-prompts-v3';

// --- Constants ---
const TONES = [
    { value: 'pragmatic', label: 'Direto', desc: 'Objetivo e sem rodeios' },
    { value: 'executive', label: 'Sofisticado', desc: 'Premium e exclusivo' },
    { value: 'empathetic', label: 'Amigável', desc: 'Próximo e acolhedor' },
    { value: 'technical', label: 'Técnico', desc: 'Especialista e detalhado' },
];

const MOODS = [
    { value: 'clean', label: 'Minimalista', desc: 'Clean e focado no essencial' },
    { value: 'luxury', label: 'Dark Mode', desc: 'Visual noturno e elegante' },
    { value: 'futurist', label: 'Futurista', desc: 'Moderno e tecnológico' },
    { value: 'classic', label: 'Editorial', desc: 'Tipografia elegante e clássica' },
];

const PAYMENT_PROVIDERS = [
    { value: 'demo', label: 'Modo Demo (Simulação)' },
    { value: 'stripe', label: 'Stripe' },
    { value: 'mercadopago', label: 'Mercado Pago' },
    { value: 'other', label: 'Outro' },
];



const STEPS = [
    { id: 1, title: 'Identidade', icon: Fingerprint, desc: 'Nome, Nicho e Alma do Produto' },
    { id: 2, title: 'Estratégia', icon: Target, desc: 'Persona, Dor e Sucesso' },
    { id: 3, title: 'Escopo', icon: LayoutGrid, desc: 'Features e Integrações' },
    { id: 4, title: 'Visual', icon: Palette, desc: 'Branding e Estilo' },
    { id: 5, title: 'Revisão', icon: Check, desc: 'Confirme antes de gerar' }
];

const FONT_OPTIONS = [
    { name: 'Poppins', weights: 'Regular, Medium, SemiBold' },
    { name: 'Inter', weights: 'Light, Regular, Medium, Bold' },
    { name: 'Plus Jakarta Sans', weights: 'Medium, SemiBold, Bold' },
    { name: 'Outfit', weights: 'Regular, Medium, Bold' },
    { name: 'DM Sans', weights: 'Regular, Medium, Bold' },
    { name: 'Manrope', weights: 'Medium, SemiBold, Bold' },
    { name: 'Raleway', weights: 'Regular, SemiBold, Bold' },
    { name: 'Playfair Display', weights: 'Regular, SemiBold, Bold' },
    { name: 'Space Grotesk', weights: 'Light, Regular, Medium, Bold' },
    { name: 'Public Sans', weights: 'Regular, Medium, SemiBold' }
];

const WEIGHT_OPTIONS = [
    { value: 'Light', label: 'Light', weight: 300 },
    { value: 'Regular', label: 'Regular', weight: 400 },
    { value: 'Medium', label: 'Medium', weight: 500 },
    { value: 'SemiBold', label: 'SemiBold', weight: 600 },
    { value: 'Bold', label: 'Bold', weight: 700 },
];

// Optimized Font Loader Component
// Optimized Font Loader Component
const FontLoader = ({ font, fontWeight }: { font: string, fontWeight: string }) => {
    // Load selected font with specific weight for the preview
    useEffect(() => {
        const weightValue = WEIGHT_OPTIONS.find(w => w.value === fontWeight)?.weight || 400;
        const fontName = font.replace(/ /g, '+');

        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@${weightValue}&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link);
        };
    }, [font, fontWeight]);

    // Preload all options (Batched Request)
    useEffect(() => {
        // Check if already loaded to avoid duplicate requests
        if (document.querySelector(`link[data-font-batch="true"]`)) return;

        const families = FONT_OPTIONS.map(f => `family=${f.name.replace(/ /g, '+')}:wght@400;700`).join('&');
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
        link.rel = 'stylesheet';
        link.dataset.fontBatch = "true";
        document.head.appendChild(link);
    }, []);

    return null;
};


export default function SaasBuilderPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [state, setState] = useState<SaasBuilderState>({
        identity: { name: '', niche: '', oneLiner: '', tone: 'premium', visualMood: 'premium, dark mode, gold accents, luxury' },
        audience: { persona: '', pain: '', keyAction: '', successMetric: '' },
        scope: {
            featuresRequired: [],
            featuresOut: [],
            routes: ['/dashboard', '/profile'],
            adminEnabled: true,
            payments: { enabled: false, provider: 'demo' },
            storage: false
        },
        branding: {
            font: 'Poppins',
            fontWeight: 'Regular',
            colors: { primary: '#F5A524', bg: '#09090b', text: '#ffffff', border: '#27272a' }
        }
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    // AI Suggestion Simulation
    const [isSuggesting, setIsSuggesting] = useState(false);

    // --- Actions ---
    const handleNext = () => {
        if (currentStep < 6) setCurrentStep(curr => curr + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(curr => curr - 1);
        else router.push('/dashboard');
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        // Simulate "Processing" time for effect
        setTimeout(() => {
            const prompt = generateSaasV3Prompt(state);
            setGeneratedPrompt(prompt);
            setIsGenerating(false);
            setCurrentStep(6); // Show Result
        }, 2000);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedPrompt);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    // Generic Update Helper
    const updateState = (section: keyof SaasBuilderState, field: string, value: any) => {
        setState(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const updateDeepState = (section: keyof SaasBuilderState, subSection: string, field: string, value: any) => {
        setState(prev => ({
            ...prev,
            [section]: {
                ...prev[section] as any,
                [subSection]: {
                    ...(prev[section] as any)[subSection],
                    [field]: value
                }
            }
        }));
    };

    // --- AI Suggestion Logic (Mocked for speed/demo) ---
    const suggestIdentity = () => {
        setIsSuggesting(true);
        setTimeout(() => {
            setState(prev => ({
                ...prev,
                identity: {
                    ...prev.identity,
                    niche: 'Micro-SaaS para Freelancers',
                    oneLiner: 'Gestão simplificada de projetos e faturas para quem trabalha sozinho.',
                    tone: 'direto',
                    visualMood: 'minimalista, clean, whitespace, crisp'
                },
                audience: {
                    persona: 'Designers e Devs Freelancers',
                    pain: 'Perder tempo cobrando clientes e organizando tarefas.',
                    keyAction: 'Criar Fatura',
                    successMetric: 'Faturas pagas'
                }
            }));
            setIsSuggesting(false);
        }, 1500);
    };

    // --- Render Steps ---
    const renderStep1_Identity = () => (
        <div className={styles.contentArea}>
            <div className={styles.stepHeader}>
                <h2 className={styles.stepTitle}>Identidade do Produto</h2>
                <p className={styles.stepDescription}>Comece pelo básico. Quem é o seu SaaS?</p>
                <div className="flex justify-start mt-4">
                    <button onClick={suggestIdentity} className={styles.suggestionpill} disabled={isSuggesting}>
                        {isSuggesting ? 'Pensando...' : 'Preencher com IA'}
                    </button>
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>Nome do App</label>
                <input
                    className={styles.input}
                    value={state.identity.name}
                    onChange={e => updateState('identity', 'name', e.target.value)}
                    placeholder="Ex: InvoiceHero"
                    autoFocus
                />
            </div>

            <div className={styles.grid2}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Nicho de Mercado</label>
                    <input
                        className={styles.input}
                        value={state.identity.niche}
                        onChange={e => updateState('identity', 'niche', e.target.value)}
                        placeholder="Ex: Gestão para Freelancers"
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>One-Liner (Slogan)</label>
                    <input
                        className={styles.input}
                        value={state.identity.oneLiner}
                        onChange={e => updateState('identity', 'oneLiner', e.target.value)}
                        placeholder="O que ele faz em uma frase curta"
                    />
                </div>
            </div>

            <div className={styles.grid2}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Tom de Voz</label>
                    <div className={styles.selectionGrid}>
                        {TONES.map(t => (
                            <div
                                key={t.value}
                                className={`${styles.selectionCard} ${state.identity.tone === t.value ? styles.active : ''}`}
                                onClick={() => updateState('identity', 'tone', t.value)}
                            >
                                <div className={styles.selectionTitle}>{t.label}</div>
                                <div className={styles.selectionDesc}>{t.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Personalidade Visual</label>
                    <div className={styles.selectionGrid}>
                        {MOODS.map(m => (
                            <div
                                key={m.value}
                                className={`${styles.selectionCard} ${state.identity.visualMood === m.value ? styles.active : ''}`}
                                onClick={() => updateState('identity', 'visualMood', m.value)}
                            >
                                <div className={styles.selectionTitle}>{m.label}</div>
                                <div className={styles.selectionDesc}>{m.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2_Strategy = () => (
        <div className={styles.contentArea}>
            <div className={styles.stepHeader}>
                <h2 className={styles.stepTitle}>Estratégia e Público</h2>
                <p className={styles.stepDescription}>Para quem você está construindo e qual o objetivo?</p>
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>Persona Principal</label>
                <input
                    className={styles.input}
                    value={state.audience.persona}
                    onChange={e => updateState('audience', 'persona', e.target.value)}
                    placeholder="Ex: Gerentes de Marketing sobrecarregados"
                />
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>Dor Principal (Pain)</label>
                <textarea
                    className={styles.textarea}
                    rows={2}
                    value={state.audience.pain}
                    onChange={e => updateState('audience', 'pain', e.target.value)}
                    placeholder="Ex: Dificuldade em provar ROI das campanhas."
                />
            </div>

            <div className={styles.grid2}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Ação Principal</label>
                    <input
                        className={styles.input}
                        value={state.audience.keyAction}
                        onChange={e => updateState('audience', 'keyAction', e.target.value)}
                        placeholder="Ex: Gerar Relatório PDF"
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Resultado Esperado</label>
                    <input
                        className={styles.input}
                        value={state.audience.successMetric}
                        onChange={e => updateState('audience', 'successMetric', e.target.value)}
                        placeholder="Ex: Relatórios gerados por semana"
                    />
                </div>
            </div>
        </div>
    );





    const renderStep4_Scope = () => {
        const toggleFeature = (feat: string, type: 'required' | 'out') => {
            const listKey = type === 'required' ? 'featuresRequired' : 'featuresOut';
            const current = state.scope[listKey];
            const exists = current.includes(feat);
            if (exists) {
                updateState('scope', listKey, current.filter(f => f !== feat));
            } else {
                updateState('scope', listKey, [...current, feat]);
            }
        };

        const TagInput = ({ list, onChange, placeholder }: any) => {
            const [val, setVal] = useState('');
            const add = () => {
                if (val.trim()) {
                    onChange([...list, val.trim()]);
                    setVal('');
                }
            };
            return (
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <input
                            className={styles.input}
                            value={val}
                            onChange={e => setVal(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && add()}
                            placeholder={placeholder}
                        />
                        <button onClick={add} className={styles.addButton}><Plus /></button>
                    </div>
                    <div className={styles.chipGrid}>
                        {list.map((item: string, i: number) => (
                            <div key={i} className={`${styles.chip} active`} onClick={() => onChange(list.filter((_: any, idx: number) => idx !== i))}>
                                {item} <span className="ml-2 opacity-50">×</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        };

        return (
            <div className={styles.contentArea}>
                <div className={styles.stepHeader}>
                    <h2 className={styles.stepTitle}>Escopo e Tecnologia</h2>
                    <p className={styles.stepDescription}>O que entra no MVP e configurações técnicas.</p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Features Obrigatórias (MVP)</label>
                        <TagInput
                            list={state.scope.featuresRequired}
                            onChange={(l: string[]) => updateState('scope', 'featuresRequired', l)}
                            placeholder="Ex: Dashboard de métricas, Exportação PDF..."
                        />
                    </div>

                    <div className={styles.toggleWrapper} onClick={() => updateState('scope', 'adminEnabled', !state.scope.adminEnabled)}>
                        <div className={styles.toggleLabel}>
                            <span className={styles.toggleTitle}>Painel Admin</span>
                            <span className={styles.toggleDesc}>Criar área /admin para gestão global?</span>
                        </div>
                        <CheckBox
                            checked={state.scope.adminEnabled}
                            onClick={() => { }} // Handled by wrapper
                            color="#F5A524"
                        />
                    </div>

                    <div className={styles.toggleWrapper} onClick={() => updateDeepState('scope', 'payments', 'enabled', !state.scope.payments.enabled)}>
                        <div className={styles.toggleLabel}>
                            <span className={styles.toggleTitle}>Pagamentos</span>
                            <span className={styles.toggleDesc}>Habilitar checkout e planos?</span>
                        </div>
                        <CheckBox
                            checked={state.scope.payments.enabled}
                            onClick={() => { }} // Handled by wrapper
                            color="#F5A524"
                        />
                    </div>

                    {state.scope.payments.enabled && (
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Provedor de Pagamento</label>
                            <div className={styles.selectionGrid}>
                                {PAYMENT_PROVIDERS.map(p => (
                                    <div
                                        key={p.value}
                                        className={`${styles.selectionCard} ${state.scope.payments.provider === p.value ? styles.active : ''}`}
                                        onClick={() => updateDeepState('scope', 'payments', 'provider', p.value)}
                                    >
                                        <div className={styles.selectionTitle}>{p.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.toggleWrapper} onClick={() => updateState('scope', 'storage', !state.scope.storage)}>
                        <div className={styles.toggleLabel}>
                            <span className={styles.toggleTitle}>Storage (Uploads)</span>
                            <span className={styles.toggleDesc}>Usuários podem fazer upload de arquivos?</span>
                        </div>
                        <CheckBox
                            checked={state.scope.storage}
                            onClick={() => { }} // Handled by wrapper
                            color="#F5A524"
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderStep5_Visuals = () => (
        <div className={styles.contentArea}>
            <div className={styles.stepHeader}>
                <h2 className={styles.stepTitle}>Visual & Branding</h2>
                <p className={styles.stepDescription}>Defina as cores e a tipografia do seu SaaS.</p>
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>Fonte Principal</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {FONT_OPTIONS.map((font) => (
                        <div
                            key={font.name}
                            onClick={() => updateState('branding', 'font', font.name)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${state.branding.font === font.name
                                ? 'bg-[rgba(245,165,36,0.15)] border-[#F5A524] text-[#F5A524]'
                                : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)] text-white/60 hover:bg-[rgba(255,255,255,0.06)]'
                                }`}
                        >
                            <div className="font-medium text-sm mb-1" style={{ fontFamily: font.name }}>{font.name}</div>
                            <div className="text-[10px] opacity-60 text-current">{font.weights}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dynamic Font Loader (Preview) */}
            <FontLoader font={state.branding.font} fontWeight={state.branding.fontWeight} />

            <div className={styles.inputGroup}>
                <label className={styles.label}>Espessura da Fonte</label>
                <div className="flex gap-3 flex-wrap">
                    {WEIGHT_OPTIONS.map((w) => (
                        <div
                            key={w.value}
                            onClick={() => updateState('branding', 'fontWeight', w.value)}
                            className={`px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${state.branding.fontWeight === w.value
                                ? 'bg-[rgba(245,165,36,0.15)] border-[#F5A524] text-[#F5A524]'
                                : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)] text-white/60 hover:bg-[rgba(255,255,255,0.06)]'
                                }`}
                        >
                            {w.label}
                        </div>
                    ))}
                </div>
            </div>

            <h3 className="text-white font-medium mb-4 mt-8">Paleta de Cores</h3>
            <div className="space-y-4">
                <div className={styles.colorRow}>
                    <div className={styles.colorLabel}>Primary Color</div>
                    <div className={styles.colorInputWrapper} style={{ backgroundColor: state.branding.colors.primary }}>
                        <input type="color" className={styles.colorInput} value={state.branding.colors.primary} onChange={e => updateDeepState('branding', 'colors', 'primary', e.target.value)} />
                    </div>
                </div>
                <div className={styles.colorRow}>
                    <div className={styles.colorLabel}>Background Color</div>
                    <div className={styles.colorInputWrapper} style={{ backgroundColor: state.branding.colors.bg }}>
                        <input type="color" className={styles.colorInput} value={state.branding.colors.bg} onChange={e => updateDeepState('branding', 'colors', 'bg', e.target.value)} />
                    </div>
                </div>
                <div className={styles.colorRow}>
                    <div className={styles.colorLabel}>Text Color</div>
                    <div className={styles.colorInputWrapper} style={{ backgroundColor: state.branding.colors.text }}>
                        <input type="color" className={styles.colorInput} value={state.branding.colors.text} onChange={e => updateDeepState('branding', 'colors', 'text', e.target.value)} />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep6_Review = () => (
        <div className={styles.contentArea}>
            <div className={styles.stepHeader} style={{ textAlign: 'center' }}>
                <h2 className={styles.stepTitle}>Tudo pronto!</h2>
                <p className={styles.stepDescription}>Revise os dados antes de gerar o prompt.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className={styles.reviewCard}>
                    <div className={styles.reviewItem}>
                        <span className={styles.reviewLabel}>Nome</span>
                        <span className={styles.reviewValue}>{state.identity.name}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <span className={styles.reviewLabel}>Nicho</span>
                        <span className={styles.reviewValue}>{state.identity.niche}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <span className={styles.reviewLabel}>Persona</span>
                        <span className={styles.reviewValue}>{state.audience.persona}</span>
                    </div>
                </div>
                <div className={styles.reviewCard}>
                    <div className={styles.reviewItem}>
                        <span className={styles.reviewLabel}>Pagamentos</span>
                        <span className={styles.reviewValue}>{state.scope.payments.enabled ? 'Sim' : 'Não'}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <span className={styles.reviewLabel}>Admin</span>
                        <span className={styles.reviewValue}>{state.scope.adminEnabled ? 'Sim' : 'Não'}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <span className={styles.reviewLabel}>Features</span>
                        <span className={styles.reviewValue}>{state.scope.featuresRequired.length} items</span>
                    </div>
                </div>
            </div>
        </div>
    );

    // --- Main Render ---
    if (currentStep === 6) {
        // Result View
        return (

            <div className={styles.container}>
                {isGenerating ? (
                    <div className="flex flex-col items-center gap-6 py-20">
                        <TextShimmer className="text-2xl font-bold font-heading text-center" duration={1.5}>
                            Arquitetando seu SaaS Premium...
                        </TextShimmer>
                        <p className="text-white/50 text-center max-w-md">Criando tabelas, definindo RLS, desenhando UI e escrevendo a documentação.</p>
                    </div>
                ) : (
                    <div className="w-full max-w-4xl animate-in fade-in zoom-in duration-500">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Seu Prompt está Pronto</h2>
                            <p className="text-white/40">Copie o código abaixo e cole na Lovable.</p>
                        </div>

                        {/* Integration Logos Slider (CSS Marquee) */}
                        <div className="w-full mb-8 relative fade-in-up delay-200">
                            <div className={styles.marqueeContainer}>
                                <div className={styles.marqueeContent}>
                                    <img src="/logos/lovable.png" alt="Lovable" />
                                    <img src="/logos/vercel.png" alt="Vercel" />
                                    <img src="/logos/bolt.png" alt="Bolt" />
                                    <img src="/logos/replit.png" alt="Replit" />
                                    <img src="/logos/google_ai.png" alt="Google AI Studio" />
                                    {/* Duplicate for infinite loop */}
                                    <img src="/logos/lovable.png" alt="Lovable" />
                                    <img src="/logos/vercel.png" alt="Vercel" />
                                    <img src="/logos/bolt.png" alt="Bolt" />
                                    <img src="/logos/replit.png" alt="Replit" />
                                    <img src="/logos/google_ai.png" alt="Google AI Studio" />
                                </div>
                            </div>
                        </div>

                        {/* MacBook Editor Window */}
                        <div className={styles.editorWindow}>
                            {/* Window Header */}
                            <div className={styles.editorHeader}>
                                <div className={styles.windowControls}>
                                    <Link href="/dashboard" className={`${styles.controlDot} bg-[#FF5F56] hover:brightness-75 transition-all cursor-pointer`} title="Sair do Builder" />
                                    <div className={`${styles.controlDot} bg-[#FFBD2E]`} />
                                    <div className={`${styles.controlDot} bg-[#27C93F]`} />
                                </div>
                                <div className="flex-1 text-center mr-16"> {/* mr-16 balances the dots */}
                                    <span className={styles.fileName}>prompt-v3.md</span>
                                </div>
                            </div>

                            {/* Editor Body */}
                            <div className={styles.editorBody}>
                                <pre className={styles.promptContent}>{generatedPrompt}</pre>
                            </div>

                            {/* Editor Footer (Actions) */}
                            <div className={styles.editorFooter}>
                                <button
                                    className={styles.backButton}
                                    onClick={() => setCurrentStep(1)}
                                    style={{ border: 'none', paddingLeft: 0, paddingRight: 0 }}
                                >
                                    Criar Outro
                                </button>

                                <div className="flex gap-4">
                                    <Link
                                        href="/dashboard"
                                        className={styles.backButton}
                                        style={{ border: 'none', textDecoration: 'none' }}
                                    >
                                        Sair
                                    </Link>
                                    <button
                                        className={styles.copyActionResult}
                                        onClick={copyToClipboard}
                                    >
                                        {isCopied ? <Check size={18} /> : null}
                                        {isCopied ? 'Copiado!' : 'Copiar Código'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Global Close Button (Top Right) */}
                <Link href="/dashboard" className={styles.closeButton}>
                    <X size={24} />
                </Link>
            </div>
        );
    }

    // Wizard View
    return (
        <div className={styles.container}>
            <button className={styles.closeButton} onClick={() => router.push('/dashboard')}>
                <X size={20} />
            </button>

            <motion.div
                className={styles.wizardCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Progress */}
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${(currentStep / 5) * 100}%` }}
                    />
                </div>

                {/* Header Info */}
                <div className={styles.stepIndicator}>
                    Passo {currentStep} de 5 • {STEPS[currentStep - 1].title}
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 flex flex-col"
                    >
                        {currentStep === 1 && renderStep1_Identity()}
                        {currentStep === 2 && renderStep2_Strategy()}
                        {currentStep === 3 && renderStep4_Scope()}
                        {currentStep === 4 && renderStep5_Visuals()}
                        {currentStep === 5 && renderStep6_Review()}
                    </motion.div>
                </AnimatePresence>

                {/* Footer Nav */}
                <div className={styles.actions}>
                    <button
                        className={styles.backButton}
                        onClick={handleBack}
                    >
                        {currentStep === 1 ? 'Cancelar' : 'Voltar'}
                    </button>

                    {currentStep < 5 ? (
                        <button className={styles.nextButton} onClick={handleNext}>
                            Próximo <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button className={styles.nextButton} onClick={handleGenerate}>
                            Gerar Mágica
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
