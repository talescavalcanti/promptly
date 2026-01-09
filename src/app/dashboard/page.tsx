'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import styles from './page.module.css';
import { Button } from '../components/Button/Button';
import {
    LayoutTemplate, MonitorSmartphone, ShoppingCart, LayoutDashboard, GraduationCap, FileText, Store, Users, BarChart, Globe,
    Code2, Server, Database, Layers, Palette, Target, FileQuestion, Copy, Check
} from 'lucide-react';

// --- Types & Config ---

type FormData = {
    // Step 1: Contexto Geral
    appName: string;
    appType: string;
    segment: string;
    stage: string;

    // Step 2: Tech
    stackFrontend: string[];
    stackBackend: string[];
    database: string;

    // Step 3: Details
    style: string[]; // Changed to array for multi-select
    objective: string;
    context: string;

    audience?: string; // Optional/legacy
    features?: string; // Optional/legacy
};

// ... (Previous constants APP_TYPES, SEGMENTS, STAGES, FRONTEND_OPTIONS, BACKEND_OPTIONS, DB_OPTIONS)
const APP_TYPES = [
    { id: 'saas', label: 'Micro-SaaS', icon: <MonitorSmartphone size={18} /> },
    { id: 'lp', label: 'Landing Page', icon: <LayoutTemplate size={18} /> },
    { id: 'ecommerce', label: 'E-commerce', icon: <ShoppingCart size={18} /> },
    { id: 'admin', label: 'Dashboard Admin', icon: <LayoutDashboard size={18} /> },
    { id: 'cursos', label: 'Plataforma Cursos', icon: <GraduationCap size={18} /> },
    { id: 'blog', label: 'Blog / CMS', icon: <FileText size={18} /> },
    { id: 'marketplace', label: 'Marketplace', icon: <Store size={18} /> },
    { id: 'social', label: 'Rede Social', icon: <Users size={18} /> },
    { id: 'erp', label: 'Sistema ERP/CRM', icon: <BarChart size={18} /> },
    { id: 'webapp', label: 'Web App (SPA)', icon: <Globe size={18} /> },
];

const SEGMENTS = [
    { id: 'tech', label: 'Tecnologia / Startup' },
    { id: 'saude', label: 'Saúde e Bem-estar' },
    { id: 'educacao', label: 'Educação' },
    { id: 'financeiro', label: 'Financeiro' },
    { id: 'varejo', label: 'Varejo' },
    { id: 'criativo', label: 'Criativo' },
    { id: 'produtividade', label: 'Produtividade' },
    { id: 'outro', label: 'Outro' },
];

const STAGES = [
    { id: 'ideia', label: 'Apenas uma ideia', desc: 'Explorar possibilidades' },
    { id: 'mvp', label: 'MVP / Protótipo', desc: 'Foco no essencial' },
    { id: 'escala', label: 'Produto Completo', desc: 'Foco em escala' },
];

const FRONTEND_OPTIONS = [
    { id: 'react', label: 'React' },
    { id: 'next', label: 'Next.js' },
    { id: 'vue', label: 'Vue.js' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
    { id: 'html', label: 'HTML/CSS/JS' },
    { id: 'tailwind', label: 'Tailwind CSS' },
    { id: 'flutter', label: 'Flutter' },
    { id: 'react_native', label: 'React Native' },
];

const BACKEND_OPTIONS = [
    { id: 'node', label: 'Node.js' },
    { id: 'python', label: 'Python' },
    { id: 'java', label: 'Java' },
    { id: 'csharp', label: 'C# (.NET)' },
    { id: 'go', label: 'Go' },
    { id: 'php', label: 'PHP' },
    { id: 'ruby', label: 'Ruby' },
    { id: 'firebase', label: 'Firebase' },
    { id: 'supabase', label: 'Supabase' },
];

const DB_OPTIONS = [
    { id: 'postgres', label: 'PostgreSQL' },
    { id: 'mysql', label: 'MySQL' },
    { id: 'mongo', label: 'MongoDB' },
    { id: 'sqlite', label: 'SQLite' },
    { id: 'redis', label: 'Redis' },
    { id: 'dynamo', label: 'DynamoDB' },
    { id: 'firestore', label: 'Firestore' },
];

const STYLE_OPTIONS = [
    { id: 'minimalista', label: 'Minimalista & Clean' },
    { id: 'moderno', label: 'Moderno & Bold' },
    { id: 'corporativo', label: 'Corporativo & Trust' },
    { id: 'playful', label: 'Divertido & Colorido' },
    { id: 'dark', label: 'Dark Mode / Noturno' },
    { id: 'tech', label: 'Tech / Futurista' },
];

const STEPS = [
    {
        id: 'context',
        title: 'Vamos começar pelo básico',
        description: 'Defina o que estamos construindo. Escolha as opções que melhor descrevem sua ideia.',
        fields: ['appName', 'appType', 'segment', 'stage'] as const
    },
    {
        id: 'tech',
        title: 'Tecnologias e Dados',
        description: 'Defina a stack tecnológica e banco de dados para a aplicação.',
        fields: ['stackFrontend', 'stackBackend', 'database'] as const
    },
    {
        id: 'details',
        title: 'Detalhes Finais',
        description: 'Estilo visual, objetivos principais e contexto adicional.',
        fields: ['style', 'objective', 'context'] as const
    }
];

export default function DashboardPage() {
    const router = useRouter();
    const [authLoading, setAuthLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        appName: '',
        appType: '',
        segment: '',
        stage: '',
        audience: '',
        features: '',
        stackFrontend: [],
        stackBackend: [],
        database: '',
        style: [], // Array
        objective: '',
        context: ''
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

    const handleInputChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleSelection = (field: 'stackFrontend' | 'stackBackend' | 'style', value: string) => {
        setFormData(prev => {
            const current = prev[field] as string[];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(item => item !== value) };
            } else {
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    // Auto-generate preview
    useEffect(() => {
        const typeLabel = APP_TYPES.find(t => t.id === formData.appType)?.label || '[Tipo]';
        const segLabel = SEGMENTS.find(s => s.id === formData.segment)?.label || '[Segmento]';
        const stageLabel = STAGES.find(s => s.id === formData.stage)?.label || '[Estágio]';

        let summary = `Atue como um Arquiteto de Software Sênior para estruturar um projeto de **${typeLabel}**. O projeto se chama **${formData.appName || '[Nome]'}**, atuando no mercado de **${segLabel}**. O foco atual é desenvolver um **${stageLabel}**, priorizando funcionalidades essenciais e boas práticas para este contexto.`;

        // Step 2: Stack
        const hasFrontend = formData.stackFrontend.length > 0;
        const hasBackend = formData.stackBackend.length > 0;
        const hasDb = !!formData.database;

        if (hasFrontend || hasBackend || hasDb) {
            summary += `\n\n## Stack Tecnológica\n`;
            if (hasFrontend) {
                const frontLabels = formData.stackFrontend.map(id => FRONTEND_OPTIONS.find(o => o.id === id)?.label).join(', ');
                summary += `- **Frontend**: ${frontLabels}\n`;
            }
            if (hasBackend) {
                const backLabels = formData.stackBackend.map(id => BACKEND_OPTIONS.find(o => o.id === id)?.label).join(', ');
                summary += `- **Backend**: ${backLabels}\n`;
            }
            if (hasDb) {
                const dbLabel = DB_OPTIONS.find(o => o.id === formData.database)?.label;
                summary += `- **Banco de Dados**: ${dbLabel}\n`;
            }
        }

        // Step 3: Details
        const hasStyle = formData.style.length > 0;
        const hasObjective = !!formData.objective;
        const hasContext = !!formData.context;

        if (hasStyle || hasObjective || hasContext) {
            summary += `\n\n## Detalhes de Design & Negócio\n`;
            if (hasStyle) {
                const styleLabels = formData.style.map(id => STYLE_OPTIONS.find(o => o.id === id)?.label).join(', ');
                summary += `- **Estilo Visual**: ${styleLabels}\n`;
            }
            if (hasObjective) {
                summary += `- **Objetivo Principal**: ${formData.objective}\n`;
            }
            if (hasContext) {
                summary += `- **Contexto Adicional**: ${formData.context}\n`;
            }
        }

        setResult(summary);
    }, [formData, currentStep]);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (!res.ok) {
                setResult(`Erro: ${data.error || 'Falha ao gerar o prompt.'}`);
            } else {
                setResult(data.result);
            }
        } catch (error) {
            setResult("Erro de conexão ao tentar gerar o prompt.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!result || loading) return;
        try {
            await navigator.clipboard.writeText(result);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const nextStep = () => {
        if (currentStep < STEPS.length - 1) setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    // Render Logic
    if (authLoading) return null;

    const renderWizardField = (field: string) => {
        switch (field) {
            // STEP 1 FIELDS
            case 'appName':
                return (
                    <div className={styles.field} key="appName">
                        <label className={styles.label}>Qual será o nome do seu projeto?</label>
                        <input
                            className={styles.input}
                            placeholder="Ex: Promptly"
                            value={formData.appName}
                            onChange={(e) => handleInputChange('appName', e.target.value)}
                        />
                    </div>
                );
            case 'appType':
                return (
                    <div className={styles.field} key="appType">
                        <label className={styles.label}>O que vamos construir hoje?</label>
                        <div className={styles.chipGrid}>
                            {APP_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    className={`${styles.chip} ${formData.appType === type.id ? styles.active : ''}`}
                                    onClick={() => handleInputChange('appType', type.id)}
                                >
                                    {type.icon}
                                    <span>{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'segment':
                return (
                    <div className={styles.field} key="segment">
                        <label className={styles.label}>Em qual mercado esse projeto atua?</label>
                        <div className={styles.miniChipGrid}>
                            {SEGMENTS.map(seg => (
                                <button
                                    key={seg.id}
                                    className={`${styles.miniChip} ${formData.segment === seg.id ? styles.active : ''}`}
                                    onClick={() => handleInputChange('segment', seg.id)}
                                >
                                    {seg.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'stage':
                return (
                    <div className={styles.field} key="stage">
                        <label className={styles.label}>Qual o momento atual da ideia?</label>
                        <div className={styles.radioGrid}>
                            {STAGES.map(stage => (
                                <button
                                    key={stage.id}
                                    className={`${styles.radioCard} ${formData.stage === stage.id ? styles.active : ''}`}
                                    onClick={() => handleInputChange('stage', stage.id)}
                                >
                                    <div className={styles.radioIndicator}></div>
                                    <div>
                                        <div className={styles.radioTitle}>{stage.label}</div>
                                        <div className={styles.radioDesc}>{stage.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            // STEP 2 FIELDS
            case 'stackFrontend':
                return (
                    <div className={styles.field} key="stackFrontend">
                        <label className={styles.label}>Qual tecnologia para o Frontend?</label>
                        <div className={styles.miniChipGrid}>
                            {FRONTEND_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    className={`${styles.miniChip} ${formData.stackFrontend.includes(opt.id) ? styles.active : ''}`}
                                    onClick={() => toggleSelection('stackFrontend', opt.id)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'stackBackend':
                return (
                    <div className={styles.field} key="stackBackend">
                        <label className={styles.label}>Qual tecnologia para o Backend?</label>
                        <div className={styles.miniChipGrid}>
                            {BACKEND_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    className={`${styles.miniChip} ${formData.stackBackend.includes(opt.id) ? styles.active : ''}`}
                                    onClick={() => toggleSelection('stackBackend', opt.id)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'database':
                return (
                    <div className={styles.field} key="database">
                        <label className={styles.label}>Qual Banco de Dados?</label>
                        <div className={styles.miniChipGrid}>
                            {DB_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    className={`${styles.miniChip} ${formData.database === opt.id ? styles.active : ''}`}
                                    onClick={() => handleInputChange('database', opt.id)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            // STEP 3 FIELDS
            case 'style':
                return (
                    <div className={styles.field} key="style">
                        <label className={styles.label}>Qual a estética visual desejada?</label>
                        <div className={styles.miniChipGrid}>
                            {STYLE_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    className={`${styles.miniChip} ${formData.style.includes(opt.id) ? styles.active : ''}`}
                                    onClick={() => toggleSelection('style', opt.id)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'objective':
                return (
                    <div className={styles.field} key="objective">
                        <label className={styles.label}>Qual o principal problema que essa aplicação resolve?</label>
                        <textarea
                            className={styles.textarea}
                            placeholder="Ex: Ajudar freelancers a organizar faturas de forma simples e automatizada."
                            value={formData.objective}
                            onChange={(e) => handleInputChange('objective', e.target.value)}
                        />
                    </div>
                );
            case 'context':
                return (
                    <div className={styles.field} key="context">
                        <label className={styles.label}>Alguma restrição ou requisito extra? (Opcional)</label>
                        <textarea
                            className={styles.textarea}
                            placeholder="Ex: Integração com Stripe obrigatória; Deve rodar em Vercel..."
                            value={formData.context}
                            onChange={(e) => handleInputChange('context', e.target.value)}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.title}>Crie prompts técnicos sob medida</h1>
                        <p className={styles.subtitle}>Responda ao assistente para gerar sua infraestrutura em segundos.</p>
                    </div>

                    <div className={styles.modeToggle}>
                        <div className={styles.stepBadge}>
                            Assistente ({currentStep + 1}/{STEPS.length})
                        </div>
                    </div>
                </div>
            </header>

            <div className={styles.grid}>
                {/* Left Column */}
                <div className={styles.inputSection}>
                    <div className={styles.wizard} key={currentStep}>
                        <div className={styles.wizardHeader}>
                            <h3 className={styles.stepTitle}>{STEPS[currentStep].title}</h3>
                            <p className={styles.stepDesc}>{STEPS[currentStep].description}</p>
                        </div>

                        <div className={styles.wizardContent}>
                            {STEPS[currentStep].fields.map(field => renderWizardField(field))}
                        </div>

                        <div className={styles.wizardActions}>
                            <Button
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                style={{
                                    visibility: currentStep === 0 ? 'hidden' : 'visible',
                                    borderRadius: '50px',
                                    padding: '0.8rem 1.5rem'
                                }}
                            >
                                Voltar
                            </Button>
                            {currentStep < STEPS.length - 1 ? (
                                <Button
                                    variant="primary"
                                    onClick={nextStep}
                                    style={{
                                        borderRadius: '50px',
                                        padding: '0.8rem 2rem'
                                    }}
                                >
                                    Próximo passo
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={handleGenerate}
                                    loading={loading}
                                    style={{
                                        borderRadius: '50px',
                                        padding: '0.8rem 2.5rem'
                                    }}
                                >
                                    {loading ? 'Gerando...' : 'Concluir'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Preview */}
                <div className={styles.previewSection}>
                    <div className={styles.previewCard}>
                        <div className={styles.previewHeader}>
                            <h3 className={styles.previewTitle}>Preview do prompt</h3>
                            {result && (
                                <button
                                    className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
                                    onClick={handleCopy}
                                    title="Copiar prompt"
                                >
                                    {copied ? (
                                        <>
                                            <Check size={16} />
                                            <span>Copiado!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={16} />
                                            <span>Copiar</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        <div className={styles.previewContent}>
                            <pre>{result || "Preencha o formulário para ver o resultado..."}</pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
