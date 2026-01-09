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
    { id: 'saas', label: 'Ferramenta por Assinatura', icon: <MonitorSmartphone size={18} /> },
    { id: 'lp', label: 'Página de Vendas / Captura', icon: <LayoutTemplate size={18} /> },
    { id: 'ecommerce', label: 'Loja Virtual', icon: <ShoppingCart size={18} /> },
    { id: 'admin', label: 'Painel de Administração / Controle', icon: <LayoutDashboard size={18} /> },
    { id: 'cursos', label: 'Plataforma de Alunos / Cursos', icon: <GraduationCap size={18} /> },
    { id: 'blog', label: 'Site de Conteúdo / Blog', icon: <FileText size={18} /> },
    { id: 'marketplace', label: 'Site de Compras e Vendas', icon: <Store size={18} /> },
    { id: 'social', label: 'Comunidade ou Rede Social', icon: <Users size={18} /> },
    { id: 'erp', label: 'Sistema de Gestão (Empresarial)', icon: <BarChart size={18} /> },
    { id: 'webapp', label: 'Aplicativo para Navegador', icon: <Globe size={18} /> },
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

const PROMPT_MODES = [
    { id: 'mvp', label: 'MVP (Criação do App)', icon: <MonitorSmartphone size={16} />, desc: 'Ideal para começar um projeto do zero.' },
    { id: 'design', label: 'Design (UI/UX)', icon: <Palette size={16} />, desc: 'Focado em interface, cores e componentes.' },
    { id: 'feature', label: 'Nova Funcionalidade / Tela', icon: <Code2 size={16} />, desc: 'Adicione novos recursos, telas ou fluxos ao seu app.' },
    { id: 'logic', label: 'Lógica / Backend', icon: <Server size={16} />, desc: 'Focado em API, banco de dados e servidor.' },
] as const;

type PromptMode = typeof PROMPT_MODES[number]['id'];

const STEPS = [
    {
        id: 'context',
        title: 'Vamos começar pelo básico',
        description: 'Defina o que estamos construindo. Escolha as opções que melhor descrevem sua ideia.',
        fields: ['appName', 'appType', 'segment', 'stage'] as const
    },
    {
        id: 'tech',
        title: 'Preferências de Tecnologias',
        description: 'Escolha as tecnologias que você prefere para o seu projeto (ou deixe em branco para sugestões).',
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
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [promptMode, setPromptMode] = useState<PromptMode>('mvp');

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
        const typeLabel = APP_TYPES.find(t => t.id === formData.appType)?.label || '';
        const segLabel = SEGMENTS.find(s => s.id === formData.segment)?.label || '';
        const stageLabel = STAGES.find(s => s.id === formData.stage)?.label || '';

        let summary = "";
        const isMVP = promptMode === 'mvp';

        // Persona by Mode
        if (promptMode === 'design') {
            summary = `Atue como um Designer UI/UX Sênior Especialista em Interfaces Modernas e Premium.`;
        } else if (promptMode === 'logic') {
            summary = `Atue como um Engenheiro de Software Sênior Especialista em Backend e Infraestrutura.`;
        } else if (promptMode === 'feature') {
            summary = `Atue como um Desenvolvedor Fullstack Sênior Especialista em Implementação de Novos Recursos.`;
        } else {
            summary = `Atue como um Arquiteto de Software Sênior. O projeto se chama **${formData.appName || '[Nome]'}**.`;
        }

        if (formData.objective) {
            summary += `\n\n**O que deve ser feito**:\n${formData.objective}`;
        }

        // Only show business context for MVP
        if (isMVP && (typeLabel || segLabel || stageLabel)) {
            summary += `\n\n**Contexto**:\n- Tipo: ${typeLabel || 'Indefinido'}\n- Mercado: ${segLabel || 'Indefinido'}`;
        }

        // Tech Stack - MVP Only
        const hasFrontend = formData.stackFrontend.length > 0;
        const hasBackend = formData.stackBackend.length > 0;
        const hasDb = !!formData.database;

        if (isMVP && (hasFrontend || hasBackend || hasDb)) {
            summary += `\n\n## Stack Sugerida\n`;
            if (hasFrontend) {
                const frontLabels = formData.stackFrontend.map(id => FRONTEND_OPTIONS.find(o => o.id === id)?.label).join(', ');
                summary += `- **Visual**: ${frontLabels}\n`;
            }
            if (hasBackend) {
                const backLabels = formData.stackBackend.map(id => BACKEND_OPTIONS.find(o => o.id === id)?.label).join(', ');
                summary += `- **Lógica**: ${backLabels}\n`;
            }
            if (hasDb) {
                const dbLabel = DB_OPTIONS.find(o => o.id === formData.database)?.label;
                summary += `- **Dados**: ${dbLabel}\n`;
            }
        }

        // Details - Specific per mode
        const hasStyle = formData.style.length > 0;
        const hasContext = !!formData.context;

        if (hasStyle || hasContext) {
            if (isMVP || promptMode === 'design') {
                summary += `\n\n## Diretrizes Visuais\n`;
                if (hasStyle) {
                    const styleLabels = formData.style.map(id => STYLE_OPTIONS.find(o => o.id === id)?.label).join(', ');
                    summary += `- **Estética**: ${styleLabels}\n`;
                }
            } else {
                summary += `\n\n## Detalhes Adicionais\n`;
            }

            if (hasContext) {
                if (promptMode === 'design') {
                    summary += `- **Detalhes de UI**: ${formData.context}\n`;
                } else if (promptMode === 'logic') {
                    summary += `- **Regras / Fluxos**: ${formData.context}\n`;
                } else {
                    summary += `- **Requisitos**: ${formData.context}\n`;
                }
            }
        }

        // Tailored instructions by Mode
        if (promptMode === 'design') {
            summary += `\n\nCom base nessas especificações visuais, gere um guia de design ultra-detalhado. Inclua paleta de cores (HEX), tipografia recomendada, estilos de botões, estados de hover, espaçamentos e a estrutura de componentes React/Tailwind. Não inclua informações sobre backend ou arquitetura de banco de dados.`;
        } else if (promptMode === 'logic') {
            summary += `\n\nCom base nisso, desenhe o schema do banco de dados, documente as rotas da API e explique a arquitetura do servidor e segurança. Não inclua informações sobre interface visual ou escolha de cores.`;
        } else if (promptMode === 'feature') {
            summary += `\n\nCom base nisso, forneça o passo a passo técnico para implementar essa funcionalidade, incluindo alterações de banco, novas rotas e componentes necessários. Seja direto e técnico.`;
        } else {
            summary += `\n\nCom base nisso, gere um prompt detalhado para um dev Fullstack implementar o MVP, com arquitetura de pastas, fluxos de auth e rotas principais.`;
        }

        // Mandatory Footer
        summary += `\n\n**IMPORTANTE**: implemente tudo isso de imediato, sem me fazer mais perguntas, só me faça uma sugestão depois de implementar TUDO que eu te falei.`;

        setResult(summary);
    }, [formData, promptMode]);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, promptMode })
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


    // Render Logic
    if (authLoading) return null;

    const renderMainForm = () => {
        return (
            <div className={styles.wizard}>
                <div className={styles.wizardHeader}>
                    <h3 className={styles.stepTitle}>Qual é a sua grande ideia?</h3>
                    <p className={styles.stepDesc}>Escolha um modelo e descreva o que você quer construir.</p>
                </div>

                <div className={styles.wizardContent}>
                    {/* Mode Selector */}
                    <div className={styles.field}>
                        <label className={styles.label}>O que vamos fazer hoje?</label>
                        <div className={styles.modeGrid}>
                            {PROMPT_MODES.map(mode => (
                                <button
                                    key={mode.id}
                                    className={`${styles.modeCard} ${promptMode === mode.id ? styles.active : ''}`}
                                    onClick={() => setPromptMode(mode.id)}
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
                    {/* Project Name (Only for MVP) */}
                    {promptMode === 'mvp' && (
                        <div className={styles.field}>
                            <label className={styles.label}>Nome do Projeto</label>
                            <input
                                className={styles.input}
                                placeholder="Ex: PetDelivery, FinTrack..."
                                value={formData.appName}
                                onChange={(e) => handleInputChange('appName', e.target.value)}
                            />
                        </div>
                    )}

                    {/* The One Sentence Input */}
                    <div className={styles.field}>
                        <label className={styles.label}>
                            {promptMode === 'mvp' ? 'Descreva o projeto' :
                                promptMode === 'design' ? 'Descreva o visual' :
                                    promptMode === 'feature' ? 'Descreva a nova funcionalidade' : 'Descreva a lógica'}
                        </label>
                        <textarea
                            className={`${styles.textarea} ${styles.mainTextarea}`}
                            placeholder={
                                promptMode === 'mvp' ? "Ex: Uma barbearia que permite agendamento pelo WhatsApp..." :
                                    promptMode === 'design' ? "Ex: Uma dashboard dark mode com gráficos de neon e estética futurista..." :
                                        promptMode === 'feature' ? "Ex: Quero adicionar um sistema de cupons de desconto na finalização da compra..." :
                                            "Ex: Preciso de uma rota de API que calcule o frete baseado na distância do CEP..."
                            }
                            value={formData.objective}
                            onChange={(e) => handleInputChange('objective', e.target.value)}
                        />
                    </div>

                    {/* Style Selection & Advanced (Only for MVP) */}
                    {promptMode === 'mvp' && (
                        <>
                            <div className={styles.field}>
                                <label className={styles.label}>Qual a "vibe" visual?</label>
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

                            <div className={styles.advancedToggle} onClick={() => setShowAdvanced(!showAdvanced)}>
                                <span>Opções Avançadas (Opcional)</span>
                                <Layers size={16} style={{ transition: 'transform 0.3s', transform: showAdvanced ? 'rotate(180deg)' : 'none' }} />
                            </div>

                            {showAdvanced && (
                                <div className={styles.advancedSection}>
                                    <div className={styles.field}>
                                        <label className={styles.label}>Tipo de Projeto</label>
                                        <div className={styles.miniChipGrid}>
                                            {APP_TYPES.map(type => (
                                                <button
                                                    key={type.id}
                                                    className={`${styles.miniChip} ${formData.appType === type.id ? styles.active : ''}`}
                                                    onClick={() => handleInputChange('appType', type.id)}
                                                >
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.field}>
                                        <label className={styles.label}>Mercado / Segmento</label>
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

                                    <div className={styles.field}>
                                        <label className={styles.label}>Tecnologia (Interface)</label>
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

                                    <div className={styles.field}>
                                        <label className={styles.label}>Outros Detalhes / Requisitos</label>
                                        <textarea
                                            className={styles.textarea}
                                            placeholder="Ex: Precisa de suporte a idiomas, integração com Stripe..."
                                            value={formData.context}
                                            onChange={(e) => handleInputChange('context', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className={styles.wizardActions} style={{ borderTop: 'none', paddingTop: 0 }}>
                    <Button
                        variant="primary"
                        onClick={handleGenerate}
                        loading={loading}
                        style={{
                            borderRadius: '50px',
                            padding: '1rem 3rem',
                            fontSize: '1.1rem',
                            width: '100%'
                        }}
                    >
                        {loading ? 'Criando sua Arquitetura...' : 'Gerar Prompt Profissional'}
                    </Button>
                </div>
            </div>
        );
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
                            Assistente Inteligente
                        </div>
                    </div>
                </div>
            </header>

            <div className={styles.grid}>
                {/* Left Column */}
                <div className={styles.inputSection}>
                    {renderMainForm()}
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
