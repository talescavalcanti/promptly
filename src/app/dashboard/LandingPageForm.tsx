import React, { useState, useEffect } from 'react';
import styles from './page.module.css'; // We'll reuse the dashboard styles for consistency
import { Zap, Palette, Target, Briefcase, Layout } from 'lucide-react';

interface LandingPageFormProps {
    onGenerate: (prompt: string) => void;
}

export const LandingPageForm: React.FC<LandingPageFormProps> = ({ onGenerate }) => {
    const [niche, setNiche] = useState('');
    const [goal, setGoal] = useState('portfolio');
    const [style, setStyle] = useState('modern');
    const [brandName, setBrandName] = useState('');

    // Auto-update parent whenever fields change (optional, or we can just let parent handle the generate button)
    // For this specific request, the parent (Dashboard) handles the "Generate" button click which calls an API.
    // However, the prompt construction logic is specific to THIS form.
    // We should probably expose the *constructed prompt* to the parent state so the parent's "Generar Prompt" button works.
    // OR, we can have a local effect that updates the parent's `objective` field with the constructed prompt.

    useEffect(() => {
        const constructPrompt = () => {
            // Base Persona instructions (Condensed from the Agent File)
            const agentPersona = `
VOCÊ É O “LOVABLE LANDING ARCHITECT” — UM AGENTE DE IA ESPECIALIZADO EM LANDING PAGES NO LOVABLE.
SUA MISSÃO: Criar uma landing page completa, profissional e de alta conversão.

REGRAS DE OURO:
1. ESTRUTURA END-TO-END: Hero, Prova Social, Benefícios, Serviços, Como Funciona, Preços, FAQ, Footer.
2. COPYWRITING: Persuasivo, direto, focado em conversão.
3. DESIGN SYSTEM: Use componentes consistentes (Shadcn/Tailwind), espaçamento rítmico, tipografia hierárquica.
4. DADOS REAIS: Preencha constants.ts com dados plausíveis para o nicho (se não fornecidos).
5. ONE-SHOT: Entregue a implementação completa em uma única resposta sempre que possível.

ESTRUTURA OBRIGATÓRIA DE ARQUIVOS:
- src/pages/Home.tsx (Composição das seções)
- src/lib/constants.ts (TODOS os textos, preços e dados)
- src/components/sections/* (Hero, Features, Pricing, etc.)
- src/components/ui/* (Botões, Cards, Badges)
`;

            // User Specifics
            const userRequest = `
DETALHES DO PROJETO:
- NICHO/NEGÓCIO: ${niche || '[Nicho não especificado, assuma um negócio premium local]'}
- NOME DA MARCA: ${brandName || '[Crie um nome criativo]'}
- OBJETIVO: ${goal === 'sales' ? 'Venda Direta / Alta Conversão' : goal === 'leads' ? 'Captação de Leads' : 'Portfólio / Institucional'}
- ESTILO VISUAL: ${style === 'minimal' ? 'Minimalista e Clean' : style === 'bold' ? 'Bold, Moderno e Impactante' : 'Editorial e Elegante'}

INSTRUÇÃO FINAL:
Crie o código completo para esta landing page no Lovable agora. Comece definindo o constants.ts e depois implemente os componentes.
            `;

            return `${agentPersona}\n\n${userRequest}`;
        };

        const prompt = constructPrompt();
        // We need a way to pass this up. Since the parent uses 'formData.objective' as the main prompt body in logic...
        // We can pass this as the "Objective" to the parent.
        onGenerate(prompt);
    }, [niche, goal, style, brandName, onGenerate]);

    return (
        <div className={styles.wizardContent}>
            {/* Niche Input */}
            <div className={styles.field}>
                <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Briefcase size={16} className="text-promptly-primary" /> Nicho / Tipo de Negócio
                </label>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Ex: Clínica Odontológica, SaaS de Finanças, Consultoria..."
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                />
            </div>

            {/* Brand Name */}
            <div className={styles.field}>
                <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layout size={16} className="text-promptly-primary" /> Nome da Marca (Opcional)
                </label>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Ex: OdontoPremium, FinanceFlow..."
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                />
            </div>

            <div className={styles.row2}>
                {/* Goal Select */}
                <div className={styles.field}>
                    <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Target size={16} className="text-promptly-primary" /> Objetivo Principal
                    </label>
                    <select
                        className={styles.select}
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                    >
                        <option value="portfolio">Institucional / Portfólio</option>
                        <option value="leads">Captura de Leads</option>
                        <option value="sales">Venda Direta</option>
                    </select>
                </div>

                {/* Style Select */}
                <div className={styles.field}>
                    <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Palette size={16} className="text-promptly-primary" /> Estilo Visual
                    </label>
                    <select
                        className={styles.select}
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                    >
                        <option value="modern">Moderno & Tech</option>
                        <option value="minimal">Minimalista & Clean</option>
                        <option value="elegant">Elegante & Editorial</option>
                        <option value="corporate">Corporativo & Sério</option>
                    </select>
                </div>
            </div>

            <div className={styles.wizardGroup} style={{ marginTop: '1rem' }}>
                <div className={styles.groupHeader} style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
                    <div className={styles.groupIcon}>
                        <Zap size={20} />
                    </div>
                    <div>
                        <div className={styles.groupTitle} style={{ fontSize: '0.95rem' }}>Potencializado pelo Landing Architect Agent</div>
                        <div className={styles.stepDesc} style={{ fontSize: '0.8rem' }}>Seu prompt incluirá automaticamente as melhores práticas de CRO e Design.</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
