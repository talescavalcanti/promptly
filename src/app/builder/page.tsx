'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Users, ShoppingBag, GraduationCap, Bot, BarChart,
    ArrowRight, ArrowLeft, Check, Copy, Palette, Smartphone, Globe, Layout, Type,
    Target, Zap, Smile, Briefcase, Table, Kanban, UploadCloud, MessageSquare, Loader2,
    ChevronDown, ChevronUp, Trash2, Rocket, Lightbulb, Sparkles, Plus, X
} from 'lucide-react';
import styles from './builder.module.css';
import { TARGET_PLATFORMS } from '../../lib/saas_constants';
import { ScrollReveal } from '../components/ScrollReveal/ScrollReveal';

// --- Types ---
type BuilderState = {
    targetPlatform: string; // New field
    projectName: string;
    personality: string;
    niche: string;
    problem: string;
    target: string;
    layout: string;
    primaryColor: string;
    secondaryColor: string;
    // colorScheme removed
    typography: string;
    fontWeight: string;
    mediaStyle: string;
    tone: string;
    features: string[];
    dashboardWidgets: string[];
};

const INITIAL_STATE: BuilderState = {
    targetPlatform: '',
    projectName: '',
    personality: '',
    niche: '',
    problem: '',
    target: '',
    layout: 'Sidebar Lateral',
    primaryColor: '',
    secondaryColor: '',
    typography: 'Padrão (Inter)',
    fontWeight: 'Normal',
    mediaStyle: '',
    tone: '',
    features: [],
    dashboardWidgets: []
};

// --- Options Constants ---
const PERSONALITIES = ['Séria', 'Moderna', 'Criativa', 'Elegante'];

const NICHES = [
    { id: 'barber', label: 'Barbearia / Estética Masculina', icon: <img src="https://cdn-icons-png.flaticon.com/512/3592/3592881.png" width="24" height="24" alt="Barber" style={{ filter: 'brightness(0) invert(1)' }} /> },
    { id: 'food', label: 'Alimentação / Lanchonete', icon: <ShoppingBag size={24} /> },
    { id: 'health', label: 'Saúde / Clínica', icon: <Users size={24} /> },
    { id: 'delivery', label: 'Delivery / Entregas', icon: <ShoppingBag size={24} /> }, // Using generic icons for now if specialized ones aren't imported
    { id: 'finance', label: 'Finanças / Controle', icon: <BarChart size={24} /> },
    { id: 'fitness', label: 'Fitness / Academia', icon: <Users size={24} /> },
    { id: 'diet', label: 'Emagrecimento / Dieta', icon: <Calendar size={24} /> },
    { id: 'beauty', label: 'Beleza / Estética', icon: <Users size={24} /> },
    { id: 'pet', label: 'Pet Shop / Veterinária', icon: <Smile size={24} /> },
    { id: 'education', label: 'Educação / Cursos', icon: <GraduationCap size={24} /> },
    { id: 'ecommerce', label: 'E-commerce / Loja', icon: <ShoppingBag size={24} /> },
    { id: 'schedule', label: 'Agendamento / Reservas', icon: <Calendar size={24} /> },
    { id: 'law', label: 'Advocacia / Jurídico', icon: <Briefcase size={24} /> },
    { id: 'accounting', label: 'Contabilidade / Fiscal', icon: <BarChart size={24} /> },
    { id: 'mechanic', label: 'Mecânica / Oficina', icon: <Zap size={24} /> },
    { id: 'hotel', label: 'Hotelaria / Hospedagem', icon: <Globe size={24} /> },
    { id: 'travel', label: 'Turismo / Viagens', icon: <Globe size={24} /> },
    { id: 'other', label: 'Outro (personalizado)', icon: <Target size={24} /> },
];

const TARGETS = [
    { id: 'b2b', label: 'Empresas (B2B)', desc: 'Visual denso e informativo' },
    { id: 'b2c', label: 'Consumidor (B2C)', desc: 'Visual amigável e simples' },
    { id: 'youth', label: 'Jovem/Criativo', desc: 'Visual trendy e ousado' },
];

const LAYOUTS = [
    { id: 'sidebar', label: 'Menu Lateral', icon: <Layout size={32} /> },
    { id: 'navbar', label: 'Menu no Topo', icon: <Globe size={32} /> },
    { id: 'minimal', label: 'Minimalista', icon: <Smartphone size={32} /> },
];

const COLORS = [
    { id: 'blue', label: 'Confiança', desc: 'Segurança e Força', color: '#3b82f6' },
    { id: 'purple', label: 'Criativo', desc: 'Imaginação e Sabedoria', color: '#8b5cf6' },
    { id: 'green', label: 'Pacífico', desc: 'Saúde e Crescimento', color: '#22c55e' },
    { id: 'red', label: 'Excitação', desc: 'Ação e Juventude', color: '#ef4444' },
    { id: 'orange', label: 'Amigável', desc: 'Alegria e Confiança', color: '#f97316' },
    { id: 'yellow', label: 'Otimismo', desc: 'Clareza e Calor', color: '#eab308' },
    { id: 'pink', label: 'Inovação', desc: 'Diversão e Ousadia', color: '#ec4899' },
    { id: 'black', label: 'Luxo', desc: 'Poder e Elegância', color: '#000000' },
    { id: 'teal', label: 'Clareza', desc: 'Tecnologia e Frescor', color: '#14b8a6' },
    { id: 'neutral', label: 'Equilíbrio', desc: 'Neutro e Minimalista', color: '#737373' },
];

const FONTS = [
    { id: 'sans', label: 'Moderna', sub: 'Inter', family: 'var(--font-inter), sans-serif', preview: 'Aa' },
    { id: 'poppins', label: 'Geométrica', sub: 'Poppins', family: '"Poppins", sans-serif', preview: 'Aa' },
    { id: 'serif', label: 'Elegante', sub: 'Playfair Display', family: 'serif', preview: 'Aa' },
    { id: 'mono', label: 'Tech', sub: 'Space Mono', family: 'monospace', preview: 'Aa' },
    { id: 'quicksand', label: 'Amigável', sub: 'Quicksand', family: '"Quicksand", sans-serif', preview: 'Aa' },
    { id: 'nunito', label: 'Suave', sub: 'Nunito', family: '"Nunito", sans-serif', preview: 'Aa' },
];

const MEDIA_STYLES = [
    'Minimalista/Geométrico', 'Fotos Realistas', 'Ilustrações 3D', 'Desenhos Lineares'
];

const TONES = [
    { id: 'direct', label: 'Direto', desc: 'Objetivo e sem rodeios', icon: <Target size={32} /> },
    { id: 'persuasive', label: 'Persuasivo', desc: 'Focado em convenção', icon: <Zap size={32} /> },
    { id: 'friendly', label: 'Amigável', desc: 'Próximo e acolhedor', icon: <Smile size={32} /> },
    { id: 'formal', label: 'Formal', desc: 'Sério e corporativo', icon: <Briefcase size={32} /> },
];

const FEATURES = [
    'Login Social (Google)', 'Pagamentos/Assinatura', 'Sistema de Notificações',
    'Perfil de Usuário', 'Tutorial Inicial (Onboarding)'
];

const WIDGETS = [
    { id: 'charts', label: 'Gráficos', desc: 'Visualizar métricas e KPIs', icon: <BarChart size={32} /> },
    { id: 'tables', label: 'Tabelas', desc: 'Listar e filtrar dados', icon: <Table size={32} /> },
    { id: 'kanban', label: 'Kanban', desc: 'Gestão de tarefas em fases', icon: <Kanban size={32} /> },
    { id: 'upload', label: 'Arquivos', desc: 'Upload e gestão de documentos', icon: <UploadCloud size={32} /> },
    { id: 'chat', label: 'Chat/Suporte', desc: 'Comunicação em tempo real', icon: <MessageSquare size={32} /> },
];

const PROBLEM_SUGGESTIONS: Record<string, string[]> = {
    barber: [
        "Agendamentos perdidos por falta de confirmação e horários ociosos.",
        "Dificuldade em gerenciar comissões dos barbeiros e estoque de produtos.",
        "Falta de fidelização de clientes e controle de histórico de cortes."
    ],
    food: [
        "Demora no atendimento de pedidos via WhatsApp e erros na cozinha.",
        "Cardápio desatualizado e dificuldade em calcular custos dos pratos.",
        "Falta de controle de entregas e taxas de motoboys."
    ],
    health: [
        "Paciente falta à consulta e agenda fica vázia (No-show).",
        "Prontuários em papel difíceis de organizar e acessar.",
        "Falta de acompanhamento pós-consulta e lembretes de retorno."
    ],
    delivery: [
        "Roteirização ineficiente causando atrasos nas entregas.",
        "Dificuldade em rastrear encomendas em tempo real.",
        "Gestão complexa de frota e custos de combustível."
    ],
    finance: [
        "Descontrole de fluxo de caixa e mistura de contas pessoais com da empresa.",
        "Dificuldade em cobrar inadimplentes e gerar boletos.",
        "Falta de relatórios claros para tomada de decisão."
    ],
    fitness: [
        "Alunos desmotivados abandonando a academia (Churn alto).",
        "Dificuldade em montar e acompanhar treinos personalizados.",
        "Gestão financeira de planos recorrentes e catracas."
    ],
    education: [
        "Baixo engajamento dos alunos em cursos online.",
        "Dificuldade em corrigir provas e emitir certificados.",
        "Comunicação falha entre escola, alunos e pais."
    ],
    ecommerce: [
        "Abandono de carrinho no checkout por frete alto ou complexidade.",
        "Controle de estoque manual gerando furos e perdas.",
        "Dificuldade em gerenciar múltiplos canais de venda (Marketplaces)."
    ],
    // Default fallback
    other: [
        "Processos manuais em planilhas que geram erros e perda de tempo.",
        "Falta de visibilidade dos dados para crescer o negócio.",
        "Comunicação descentralizada causando falhas na equipe."
    ]
    // ... (keeping existing PROBLEM_SUGGESTIONS)
};

const TARGET_SUGGESTIONS: Record<string, string[]> = {
    barber: ["Homens vaidosos de 18-35 anos", "Profissionais liberais da região", "Noivos e padrinhos"],
    food: ["Jovens universitários", "Famílias com crianças", "Trabalhadores de escritório no almoço"],
    health: ["Pacientes com doenças crônicas", "Idosos que precisam de acompanhamento", "Pais de primeira viagem"],
    delivery: ["Pessoas que trabalham em home office", "Estudantes sem tempo de cozinhar", "Casais jovens"],
    finance: ["Pequenos empreendedores", "Autônomos e freelancers", "Investidores iniciantes"],
    fitness: ["Pessoas buscando emagrecimento", "Atletas amadores", "Iniciantes na musculação"],
    education: ["Estudantes de vestibular", "Profissionais buscando recolocação", "Crianças em fase de alfabetização"],
    ecommerce: ["Compradores de eletrônicos", "Fãs de moda sustentável", "Colecionadores"],
    other: ["Donos de pequenos negócios", "Gestores de RH", "Freelancers de tecnologia"]
};

// New Feature Suggestions
const FEATURE_SUGGESTIONS: Record<string, string[]> = {
    barber: ["Agendamento online", "Lembrete via WhatsApp", "Clube de assinaturas de corte"],
    food: ["Cardápio digital via QR Code", "Rastreamento do motoboy", "Cupons de desconto"],
    health: ["Prontuário eletrônico", "Prescrição digital", "Telemedicina"],
    delivery: ["Otimização de rotas", "Chat com entregador", "Calculadora de frete"],
    finance: ["Conciliação bancária", "Emissão de boletos", "Relatórios de fluxo de caixa"],
    fitness: ["Vídeos de exercícios", " Diário de alimentação", "Gráfico de evolução"],
    education: ["Sala de aula virtual", "Quiz gamificado", "Emissão de certificados"],
    ecommerce: ["Recuperação de carrinho abandonado", "Vitrine inteligente", "Checkout transparente"],
    other: ["Dashboard personalizável", "Exportação de dados", "Gestão de usuários"]
};

export default function BuilderPage() {
    const [step, setStep] = useState(1);
    const [state, setState] = useState<BuilderState>({
        ...INITIAL_STATE,
        primaryColor: '',
        secondaryColor: ''
    });
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isNicheOpen, setIsNicheOpen] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [customSuggestions, setCustomSuggestions] = useState<string[]>([]);
    const [customTargetSuggestions, setCustomTargetSuggestions] = useState<string[]>([]);
    const [featureInput, setFeatureInput] = useState('');
    const [customFeatureSuggestions, setCustomFeatureSuggestions] = useState<string[]>([]);

    const getSuggestions = () => {
        const nicheObj = NICHES.find(n => n.label === state.niche);
        const nicheId = nicheObj ? nicheObj.id : 'other';
        const defaults = PROBLEM_SUGGESTIONS[nicheId] || PROBLEM_SUGGESTIONS['other'];
        return [...defaults, ...customSuggestions];
    };

    const getTargetSuggestions = () => {
        const nicheObj = NICHES.find(n => n.label === state.niche);
        const nicheId = nicheObj ? nicheObj.id : 'other';
        const defaults = TARGET_SUGGESTIONS[nicheId] || TARGET_SUGGESTIONS['other'];
        return [...defaults, ...customTargetSuggestions];
    };

    const getFeatureSuggestions = () => {
        const nicheObj = NICHES.find(n => n.label === state.niche);
        const nicheId = nicheObj ? nicheObj.id : 'other';
        const defaults = FEATURE_SUGGESTIONS[nicheId] || FEATURE_SUGGESTIONS['other'];
        return [...defaults, ...customFeatureSuggestions];
    };

    const handleGenerateMore = () => {
        const newIdeas = [
            "Falta de automação em processos repetitivos e manuais.",
            "Dificuldade em escalar o negócio sem aumentar custos operacionais.",
            "Baixa retenção de clientes por falta de programas de fidelidade.",
            "Gestão de estoque ineficiente causando rupturas.",
            "Comunicação interna falha gerando retrabalho.",
            "Falta de padronização nos processos de venda."
        ];

        const currentSuggestions = getSuggestions();
        const availableIdeas = newIdeas.filter(idea => !currentSuggestions.includes(idea));

        if (availableIdeas.length > 0) {
            const randomIdea = availableIdeas[Math.floor(Math.random() * availableIdeas.length)];
            setCustomSuggestions(prev => [...prev, randomIdea]);
        }
    };

    const handleGenerateTargetMore = () => {
        const newTargets = [
            "Microempreendedores individuais em expansão",
            "Gestores de equipes remotas",
            "Estudantes de pós-graduação e pesquisadores",
            "Famílias que buscam organização financeira",
            "Profissionais de saúde autônomos",
            "Pequenas agências de marketing",
            "Desenvolvedores indie"
        ];

        const currentTargets = getTargetSuggestions();
        const availableTargets = newTargets.filter(t => !currentTargets.includes(t));

        if (availableTargets.length > 0) {
            const randomTarget = availableTargets[Math.floor(Math.random() * availableTargets.length)];
            setCustomTargetSuggestions(prev => [...prev, randomTarget]);
        }
    };

    const handleGenerateFeatureMore = () => {
        const newFeatures = [
            "Gamificação com pontos e níveis",
            "Integração com calendários externos (Google/Outlook)",
            "Modo offline para acesso sem internet",
            "Geração de relatórios em PDF/Excel",
            "Login com biometria",
            "Notificações push personalizáveis",
            "Suporte a múltiplos idiomas"
        ];

        const currentFeatures = getFeatureSuggestions();
        const availableFeatures = newFeatures.filter(f => !currentFeatures.includes(f));

        if (availableFeatures.length > 0) {
            const randomFeature = availableFeatures[Math.floor(Math.random() * availableFeatures.length)];
            setCustomFeatureSuggestions(prev => [...prev, randomFeature]);
        }
    };

    const updateState = (key: keyof BuilderState, value: any) => {
        setState(prev => ({ ...prev, [key]: value }));
    };

    const handleColorSelect = (colorId: string) => {
        setState(prev => {
            // If clicking the current primary, deselect it
            if (prev.primaryColor === colorId) return { ...prev, primaryColor: '' };
            // If clicking the current secondary, deselect it
            if (prev.secondaryColor === colorId) return { ...prev, secondaryColor: '' };

            // If primary is empty, set it
            if (!prev.primaryColor) return { ...prev, primaryColor: colorId };
            // If secondary is empty and color is different, set it
            if (!prev.secondaryColor) return { ...prev, secondaryColor: colorId };

            // If both full, replace primary (cycle) or do nothing? Let's replace primary for smoother flow
            return { ...prev, primaryColor: colorId };
        });
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

    const toggleWidget = (widget: string) => {
        setState(prev => ({
            ...prev,
            dashboardWidgets: prev.dashboardWidgets.includes(widget)
                ? prev.dashboardWidgets.filter(w => w !== widget)
                : [...prev.dashboardWidgets, widget]
        }));
    };



    const nextStep = () => {
        if (step < 12) setStep(step + 1); // Increased total steps to 12
        else handleGenerateWithAI();
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleGenerateWithAI = async () => {
        setStep(13); // Move to result screen (12+1)
        setIsGenerating(true);
        setGeneratedPrompt(''); // Clear previous

        try {
            const pColor = COLORS.find(c => c.id === state.primaryColor)?.label || 'Indefinido';
            const sColor = COLORS.find(c => c.id === state.secondaryColor)?.label || 'Indefinido';

            const payload = {
                promptMode: 'optimize_prompt',
                targetPlatform: state.targetPlatform, // Pass to API
                saasName: state.projectName || 'Projeto Sem Nome',
                saasNiche: state.niche,
                targetAudience: state.target,
                saasColor: `Primária: ${pColor}, Secundária: ${sColor}`,
                saasFont: `${state.typography} (Peso: ${state.fontWeight})`,
                logoStyle: state.mediaStyle,
                voiceTone: state.tone,
                features: state.features,
                dashboardWidgets: state.dashboardWidgets
            };

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.error) {
                setGeneratedPrompt(`Erro: ${data.error}`);
            } else {
                setGeneratedPrompt(data.result);
            }

        } catch (error) {
            console.error(error);
            setGeneratedPrompt('Erro ao conectar com a IA. Tente novamente.');
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
            case 1:
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Plataforma Alvo</h2>
                            <p className={styles.stepDescription}>Para qual ferramenta devemos otimizar o prompt?</p>
                        </div>
                        <div className={styles.grid3}>
                            {TARGET_PLATFORMS.map(p => (
                                <div
                                    key={p.id}
                                    className={`${styles.card} ${styles.platformCard} ${state.targetPlatform === p.id ? styles.selected : ''}`}
                                    onClick={() => updateState('targetPlatform', p.id)}
                                >
                                    <div className={styles.cardIcon}>
                                        <img
                                            src={p.logo}
                                            alt={p.label}
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                objectFit: 'contain',
                                                filter: state.targetPlatform === p.id ? 'none' : 'grayscale(100%) opacity(0.7)',
                                                transition: 'all 0.3s'
                                            }}
                                        />
                                    </div>
                                    <span className={styles.cardTitle}>{p.label}</span>
                                    <span className={styles.cardDesc} style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                        {p.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                );
            case 2:
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Vamos começar pelo nome</h2>
                            <p className={styles.stepDescription}>Como você gostaria de chamar o seu projeto?</p>
                        </div>
                        <input
                            className={styles.input}
                            placeholder="Digite o nome..."
                            value={state.projectName}
                            onChange={(e) => updateState('projectName', e.target.value)}
                            autoFocus
                        />
                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <p className={styles.stepDescription} style={{ marginBottom: '1rem' }}>Qual a vibe do projeto?</p>
                            <div className={styles.chipGrid}>
                                {PERSONALITIES.map(p => (
                                    <button
                                        key={p}
                                        className={`${styles.chip} ${state.personality === p ? styles.selected : ''}`}
                                        onClick={() => updateState('personality', p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                );
            case 3:
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <Target size={32} color="var(--primary)" />
                            </div>
                            <h2 className={styles.stepTitle}>Nicho do Projeto</h2>
                            <p className={styles.stepDescription}>
                                Selecione o nicho que melhor representa seu aplicativo
                            </p>
                        </div>

                        <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                            {/* Trigger */}
                            <div
                                className={styles.selectTrigger}
                                onClick={() => setIsNicheOpen(!isNicheOpen)}
                                style={{
                                    border: isNicheOpen ? '1px solid var(--primary, #F5A524)' : '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                <span style={{ color: state.niche ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                                    {state.niche || 'Selecione o nicho...'}
                                </span>
                                {isNicheOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>

                            {/* Dropdown Menu */}
                            {isNicheOpen && (
                                <div className={styles.selectDropdown}>
                                    {NICHES.map(n => (
                                        <div
                                            key={n.id}
                                            className={styles.selectItem}
                                            onClick={() => {
                                                updateState('niche', n.label);
                                                setIsNicheOpen(false);
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
                                                {n.icon}
                                            </div>
                                            <span>{n.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                );
            case 4:
                return (
                    <>
                        <div className={styles.stepHeaderRow}>
                            <div className={styles.iconCircle}>
                                <Rocket size={28} color="var(--primary)" />
                            </div>
                            <div className={styles.headerText}>
                                <h2 className={styles.stepTitle}>Qual problema resolve?</h2>
                                <div className={styles.tipText}>
                                    <Lightbulb size={16} color="#F5A524" />
                                    <span>"Organizar pedidos da lanchonete", "Gerenciar agenda de consultas"</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ width: '100%' }}>
                            {/* Suggestions Button */}
                            <button
                                className={`${styles.suggestionsBtn} ${showSuggestions ? styles.active : ''}`}
                                onClick={() => setShowSuggestions(!showSuggestions)}
                            >
                                <Sparkles size={16} /> Sugestões
                            </button>

                            <AnimatePresence>
                                {showSuggestions && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                        animate={{ opacity: 1, height: 'auto', transitionEnd: { overflow: 'visible' } }}
                                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                        style={{ marginBottom: '1.5rem' }}
                                    >
                                        <div className={styles.suggestionsGrid} style={{ marginBottom: 0 }}>
                                            {getSuggestions().map((sug, idx) => {
                                                const isSelected = state.problem.includes(sug);
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`${styles.suggestionCard} ${isSelected ? styles.selected : ''}`}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                // Optional: Remove it? Ideally yes for true toggle
                                                                const newText = state.problem.replace(sug, '').replace(/\n\n\n/g, '\n\n').trim();
                                                                updateState('problem', newText);
                                                            } else {
                                                                const newText = state.problem
                                                                    ? state.problem + '\n\n' + sug
                                                                    : sug;
                                                                updateState('problem', newText);
                                                            }
                                                        }}
                                                    >
                                                        "{sug}"
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <button
                                            className={styles.generateBtn}
                                            onClick={handleGenerateMore}
                                        >
                                            <Bot size={16} /> Gerar novas ideias com IA
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Textarea */}
                            <textarea
                                className={styles.problemTextarea}
                                placeholder="Descreva o problema que sua ferramenta resolve..."
                                value={state.problem}
                                onChange={(e) => updateState('problem', e.target.value)}
                            />
                        </div>

                    </>
                );
            case 5:
                return (
                    <>
                        <div className={styles.stepHeaderRow}>
                            <div className={styles.iconCircle}>
                                <Users size={28} color="var(--primary)" />
                            </div>
                            <div className={styles.headerText}>
                                <h2 className={styles.stepTitle}>Público-alvo</h2>
                                <div className={styles.tipText}>
                                    <Lightbulb size={16} color="#F5A524" />
                                    <span>"Donos de lanchonetes", "Pacientes de clínicas"</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ width: '100%' }}>
                            <button
                                className={`${styles.suggestionsBtn} ${showSuggestions ? styles.active : ''}`}
                                onClick={() => setShowSuggestions(!showSuggestions)}
                            >
                                <Sparkles size={16} /> Sugestões
                            </button>

                            <AnimatePresence>
                                {showSuggestions && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                        animate={{ opacity: 1, height: 'auto', transitionEnd: { overflow: 'visible' } }}
                                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                        style={{ marginBottom: '1.5rem' }}
                                    >
                                        <div className={styles.suggestionsGrid} style={{ marginBottom: 0 }}>
                                            {getTargetSuggestions().map((sug, idx) => {
                                                const isSelected = state.target.includes(sug);
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`${styles.suggestionCard} ${isSelected ? styles.selected : ''}`}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                const newText = state.target.replace(sug, '').replace(/\n\n\n/g, '\n\n').trim();
                                                                updateState('target', newText);
                                                            } else {
                                                                const newText = state.target
                                                                    ? state.target + '\n\n' + sug
                                                                    : sug;
                                                                updateState('target', newText);
                                                            }
                                                        }}
                                                    >
                                                        "{sug}"
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <button
                                            className={styles.generateBtn}
                                            onClick={handleGenerateTargetMore}
                                        >
                                            <Bot size={16} /> Gerar novas ideias com IA
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <textarea
                                className={styles.problemTextarea} // Reusing problem textarea style
                                placeholder="Descreva seu público-alvo..."
                                value={state.target}
                                onChange={(e) => updateState('target', e.target.value)}
                            />
                        </div>
                    </>
                );
            case 6:
                return (
                    <>
                        <div className={styles.stepHeaderRow}>
                            <div className={styles.iconCircle}>
                                <Zap size={28} color="var(--primary)" />
                            </div>
                            <div className={styles.headerText}>
                                <h2 className={styles.stepTitle}>Funcionalidades</h2>
                                <div className={styles.tipText}>
                                    <Lightbulb size={16} color="#F5A524" />
                                    <span>"Sistema de pedidos, Cardápio digital, Chat"</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ width: '100%' }}>
                            <button
                                className={`${styles.suggestionsBtn} ${showSuggestions ? styles.active : ''}`}
                                onClick={() => setShowSuggestions(!showSuggestions)}
                            >
                                <Sparkles size={16} /> Sugestões
                            </button>

                            <AnimatePresence>
                                {showSuggestions && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                        animate={{ opacity: 1, height: 'auto', transitionEnd: { overflow: 'visible' } }}
                                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                        style={{ marginBottom: '1.5rem' }}
                                    >
                                        <div className={styles.suggestionsGrid} style={{ marginBottom: 0 }}>
                                            {getFeatureSuggestions().map((sug, idx) => {
                                                const isSelected = state.features.includes(sug);
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`${styles.suggestionCard} ${isSelected ? styles.selected : ''}`}
                                                        onClick={() => toggleFeature(sug)}
                                                    >
                                                        "{sug}"
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <button
                                            className={styles.generateBtn}
                                            onClick={handleGenerateFeatureMore}
                                        >
                                            <Bot size={16} /> Gerar novas ideias com IA
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className={styles.inputWithButton}>
                                <input
                                    className={styles.featureInput}
                                    placeholder="Digite uma funcionalidade e pressione Enter..."
                                    value={featureInput}
                                    onChange={(e) => setFeatureInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') addFeature();
                                    }}
                                />
                                <button className={styles.addButton} onClick={addFeature}>
                                    <Plus size={24} />
                                </button>
                            </div>

                            {/* Applied Features Chips */}
                            {state.features.length > 0 && (
                                <div className={styles.chipGrid} style={{ marginTop: '1.5rem', justifyContent: 'flex-start' }}>
                                    {state.features.map((feat, idx) => (
                                        <div key={idx} className={`${styles.chip} ${styles.selected}`} onClick={() => toggleFeature(feat)}>
                                            {feat} <span style={{ opacity: 0.5, marginLeft: '0.5rem' }}>×</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                );
            case 7: // Navigation
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Estrutura de Navegação</h2>
                            <p className={styles.stepDescription}>Como os usuários vão se mover pelo app?</p>
                        </div>
                        <div className={styles.grid3}>
                            {LAYOUTS.map(l => (
                                <div
                                    key={l.id}
                                    className={`${styles.card} ${state.layout === l.label ? styles.selected : ''}`}
                                    onClick={() => updateState('layout', l.label)}
                                >
                                    <div className={styles.cardIcon}>{l.icon}</div>
                                    <span className={styles.cardTitle}>{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </>
                );
            case 8: // Colors
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Paleta de Cores</h2>
                            <p className={styles.stepDescription}>
                                Escolha 2 cores: <strong style={{ color: 'var(--primary)' }}>Primária</strong> e <strong style={{ color: '#fff' }}>Secundária</strong>.
                            </p>
                        </div>

                        <div className={styles.grid3}>
                            {COLORS.map(c => {
                                const isPrimary = state.primaryColor === c.id;
                                const isSecondary = state.secondaryColor === c.id;
                                const isSelected = isPrimary || isSecondary;

                                return (
                                    <div
                                        key={c.id}
                                        className={`${styles.colorCard} ${isSelected ? styles.selected : ''}`}
                                        onClick={() => handleColorSelect(c.id)}
                                        style={{
                                            '--card-color': c.color,
                                            borderColor: isPrimary ? c.color : (isSecondary ? '#fff' : undefined)
                                        } as React.CSSProperties}
                                    >
                                        <div className={styles.colorPreview} style={{ backgroundColor: c.color }}>
                                            {isPrimary && <span className={styles.colorBadge}>1</span>}
                                            {isSecondary && <span className={styles.colorBadge}>2</span>}
                                        </div>
                                        <div className={styles.colorInfo}>
                                            <span className={styles.cardTitle}>{c.label}</span>
                                            <span className={styles.cardDesc}>{c.desc}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                );
            case 9: // Typography
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Tipografia</h2>
                            <p className={styles.stepDescription}>Qual estilo de fonte combina mais?</p>
                        </div>

                        <div className={styles.grid}>
                            {FONTS.map(f => (
                                <div
                                    key={f.id}
                                    className={`${styles.fontCard} ${state.typography === f.label ? styles.selected : ''}`}
                                    onClick={() => updateState('typography', f.label)}
                                >
                                    <div
                                        className={styles.fontPreview}
                                        style={{
                                            fontFamily: f.family,
                                            fontWeight: state.fontWeight === 'Bold' ? 700 : (state.fontWeight === 'Medium' ? 500 : 400)
                                        }}
                                    >
                                        {f.preview}
                                    </div>
                                    <div className={styles.fontInfo}>
                                        <span className={styles.cardTitle}>{f.label}</span>
                                        <span className={styles.cardDesc}>{f.sub}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.subsection}>
                            <p className={styles.subsectionTitle}>Espessura do Texto</p>
                            <div className={styles.chipGrid}>
                                {['Normal', 'Medium', 'Bold'].map(w => (
                                    <button
                                        key={w}
                                        className={`${styles.chip} ${state.fontWeight === w ? styles.selected : ''}`}
                                        onClick={() => updateState('fontWeight', w)}
                                    >
                                        {w === 'Normal' ? 'Normal' : (w === 'Medium' ? 'Médio' : 'Negrito')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                );
            case 10: // Media
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Estilo de Imagens</h2>
                            <p className={styles.stepDescription}>
                                Como você imagina as ilustrações ou fotos do seu app?
                                <br />
                                <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                                    Isso ajuda a IA a sugerir bancos de imagens ou estilos de ilustração.
                                </span>
                            </p>
                        </div>
                        <div className={styles.grid3}>
                            {MEDIA_STYLES.map(m => (
                                <button
                                    key={m}
                                    className={`${styles.card} ${state.mediaStyle === m ? styles.selected : ''}`}
                                    onClick={() => updateState('mediaStyle', m)}
                                >
                                    <span className={styles.cardTitle}>{m}</span>
                                </button>
                            ))}
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                            <button
                                className={`${styles.skipButton} ${!state.mediaStyle ? styles.active : ''}`}
                                onClick={() => updateState('mediaStyle', '')}
                            >
                                Decidir depois (Pular etapa)
                            </button>
                        </div>
                    </>
                );
            case 11: // Tone
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>Tom de Voz</h2>
                            <p className={styles.stepDescription}>Como o seu SaaS fala com o usuário?</p>
                        </div>
                        <div className={styles.grid2x2}>
                            {TONES.map(t => (
                                <div
                                    key={t.id}
                                    className={`${styles.card} ${state.tone === t.label ? styles.selected : ''}`}
                                    onClick={() => updateState('tone', t.label)}
                                >
                                    <div className={styles.cardIcon}>{t.icon}</div>
                                    <span className={styles.cardTitle}>{t.label}</span>
                                    <span className={styles.cardDesc}>{t.desc}</span>
                                </div>
                            ))}
                        </div>
                    </>
                );
            case 12: // Dashboard
                return (
                    <>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>O Painel (Dashboard)</h2>
                            <p className={styles.stepDescription}>O que o usuário vê assim que entra?</p>
                        </div>
                        <div className={styles.gridCentered}>
                            {WIDGETS.map(w => (
                                <div
                                    key={w.id}
                                    className={`${styles.card} ${state.dashboardWidgets.includes(w.label) ? styles.selected : ''}`}
                                    onClick={() => toggleWidget(w.label)}
                                >
                                    <div className={styles.cardIcon}>{w.icon}</div>
                                    <span className={styles.cardTitle}>{w.label}</span>
                                    <span className={styles.cardDesc}>{w.desc}</span>
                                </div>
                            ))}
                        </div>
                    </>
                );
            case 13:
                return (
                    <div style={{ textAlign: 'center' }}>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle} style={{ fontSize: '2.5rem' }}>Seu Prompt Otimizado</h2>
                            <p className={styles.stepDescription}>
                                {isGenerating
                                    ? 'A IA está analisando suas escolhas e criando o melhor prompt...'
                                    : 'Pronto! Copie o código abaixo e use no seu gerador favorito.'}
                            </p>
                        </div>

                        {isGenerating ? (
                            <div className={styles.resultBox} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                >
                                    <Loader2 size={48} color="var(--primary)" />
                                </motion.div>
                            </div>
                        ) : (
                            <div className={styles.resultBox}>
                                {generatedPrompt}
                            </div>
                        )}

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <button
                                className={styles.nextBtn}
                                onClick={handleCopy}
                                disabled={isGenerating}
                                style={{ background: copied ? '#4ade80' : 'var(--primary)', opacity: isGenerating ? 0.5 : 1 }}
                            >
                                {copied ? <><Check size={20} /> Copiado!</> : <><Copy size={20} /> Copiar Prompt</>}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <ScrollReveal width="100%">
            <div className={styles.container}>
                {/* Top Navigation */}
                <div className={styles.topNav}>
                    <a href="/dashboard" className={styles.navLink}>
                        <ArrowLeft size={16} /> Sair
                    </a>
                    <button
                        className={styles.navLink}
                        onClick={() => setState(INITIAL_STATE)}
                        style={{ color: '#ef4444' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Trash2 size={16} /> Limpar Opções
                        </div>
                    </button>
                </div>

                {/* Progress Section */}
                {
                    step < 12 && (
                        <div className={styles.progressSection}>
                            <div className={styles.progressHeader}>
                                <div className={styles.stepBadge}>
                                    Etapa {step} de 12
                                </div>
                                <span className={styles.progressText}>
                                    {Math.round(((step - 1) / 12) * 100)}% completo
                                </span>
                            </div>
                            <div className={styles.progressBarContainer}>
                                <div
                                    className={styles.progressBarFill}
                                    style={{ width: `${((step - 1) / 12) * 100}%` }}
                                />
                            </div>
                        </div>
                    )
                }

                {/* Main Content Card */}
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className={styles.mainCard}
                    >
                        {renderStepContent()}
                    </motion.div>
                </AnimatePresence>

                {/* Bottom Actions */}
                {
                    step < 12 && (
                        <div className={styles.bottomBar}>
                            <div className={styles.actionButtons}>
                                <button className={styles.backBtn} onClick={prevStep} disabled={step === 1}>
                                    <ArrowLeft size={18} /> Voltar
                                </button>
                                <button className={styles.nextBtn} onClick={nextStep} disabled={step === 1 && !state.targetPlatform}>
                                    {step === 12 ? 'Finalizar e Gerar' : <>Próximo <ArrowRight size={18} /></>}
                                </button>
                            </div>

                            <div className={styles.paginationDots}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
                                    <div
                                        key={s}
                                        className={`${styles.dot} ${s === step ? styles.active : ''}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                }
            </div>
        </ScrollReveal>
    );
}
