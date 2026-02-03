import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateSaasV4Prompt, SaasBuilderInput } from '../../builder/saas-prompts-v4';
import { LANDING_PAGE_AGENT_V2_PROMPT, LANDING_PAGE_GOOGLE_STUDIO_PROMPT } from '../../landing-builder/agentPrompts';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        // --- AUTH & LIMITS CHECK ---
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        );

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized: Faça login para continuar." }, { status: 401 });
        }

        const user = session.user;
        const isDeveloper = user.email === 'talesscavalacanti006@gmail.com';

        // Fetch profile
        // Fetch profile from 'users' table (which matches the rest of the system)
        let { data: profile, error: profileError } = await supabase
            .from('users')
            .select('plano_ativo, prompts_used')
            .eq('id', user.id)
            .maybeSingle();

        // Self-healing: If profile doesn't exist, create it
        if (!profile && !profileError) {
            console.log("Profile missing for user, creating default entry...");
            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                    prompts_used: 0,
                    plano_ativo: 'free'
                });

            if (insertError) {
                console.error("Failed to create missing profile:", insertError);
                return NextResponse.json({ error: "Erro crítico ao criar perfil de usuário." }, { status: 500 });
            }

            // Retry fetch
            const retry = await supabase
                .from('users')
                .select('plano_ativo, prompts_used')
                .eq('id', user.id)
                .single();

            profile = retry.data;
            profileError = retry.error;
        }

        if (profileError || !profile) {
            console.error("Profile error:", profileError);
            return NextResponse.json({
                error: "Erro ao carregar perfil de usuário.",
                details: profileError?.message || "Perfil não encontrado",
                code: profileError?.code
            }, { status: 500 });
        }

        const PLAN_LIMITS: Record<string, number> = {
            'free': 5,
            'starter': 100,
            'pro': 400
        };

        // Map database value (STARTER/PRO) to limit keys
        const userPlan = profile.plano_ativo ? profile.plano_ativo.toLowerCase() : 'free';

        const limit = PLAN_LIMITS[userPlan] || 5;
        const currentUsage = profile.prompts_used || 0;

        if (!isDeveloper && currentUsage >= limit) {
            return NextResponse.json({
                error: `Limite de ${limit} prompts atingido no plano ${userPlan}. Faça o upgrade para continuar.`
            }, { status: 403 });
        }

        // --- GENERATION LOGIC ---
        const body = await req.json();
        const {
            // Common
            promptMode, objective, context, targetPlatform,
            // SaaS Wizard Specifics
            saasName, saasColor, saasFont, logoStyle, voiceTone,
            saasNiche, businessModel, chargingModel, planNames,
            coreEntity, coreView, dataInputType,
            userRoles, loginMethod, registrationPolicy,
            notificationChannels, integrations, supportChannels,
            problemSolved, marketingHeadline, cta,
            // Landing Builder Specifics
            targetAudience, colorPalette, typography,
            primaryColor, secondaryColor, fontWeight, useSingleFont,
            geometry, layout, brandName, sections, wizardMode
        } = body;

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            return NextResponse.json({ error: "ERRO: GEMINI_API_KEY não encontrada no servidor (.env.local)" }, { status: 500 });
        }

        let prompt = "";

        if (promptMode === 'feature_builder') {
            // Feature Builder - Uses Gemini to expand user description into full technical spec
            const { featureName, description, context, robustness, includeTests } = body;

            const robustnessConfig = {
                fast: {
                    label: 'Rápido (Protótipo)',
                    validations: 'Validações básicas apenas',
                    security: 'Nenhuma medida extra',
                    tests: 'Sem testes'
                },
                secure: {
                    label: 'Seguro (Recomendado)',
                    validations: 'Validação completa de inputs, tratamento de nulls e tipos incorretos',
                    security: 'Proteção XSS, SQL Injection, validação de permissões',
                    tests: 'Testes unitários para happy path, validações e cenários de erro'
                },
                bulletproof: {
                    label: 'Blindado (Produção)',
                    validations: 'Validação exaustiva incluindo limites de tamanho, concorrência e timeouts',
                    security: 'XSS, SQL Injection, CSRF, Rate Limiting, Audit Trail, validação de permissões',
                    tests: 'Cobertura 100%: unit, integration, edge cases, performance, security testing'
                }
            };

            const config = robustnessConfig[robustness as keyof typeof robustnessConfig] || robustnessConfig.secure;

            const contextLabels: Record<string, string> = {
                frontend: 'Frontend (React/Next.js components, hooks, state management)',
                backend: 'Backend (API routes, services, business logic)',
                database: 'Database (Schema, migrations, queries, indexes)',
                integration: 'Integration (External APIs, webhooks, third-party services)',
                auth: 'Authentication (Login, sessions, permissions, security)'
            };

            prompt = `
Você é um Arquiteto de Software Sênior e Engenheiro de Prompts especializado em desenvolvimento com IA.

Sua tarefa é EXPANDIR a descrição simples do usuário em um PROMPT TÉCNICO COMPLETO e DETALHADO que será usado em plataformas como Lovable, GPT-Engineer, ou Google AI Studio.

---
### ENTRADA DO USUÁRIO

**Nome da Funcionalidade:** ${featureName}
**Contexto:** ${contextLabels[context] || context}
**Nível de Robustez:** ${config.label}
**Incluir Testes:** ${includeTests ? 'Sim' : 'Não'}

**Descrição do Usuário:**
${description}

---
### SUA MISSÃO

Transforme a descrição acima em um prompt PROFISSIONAL seguindo esta estrutura:

1. **OBJETIVO CLARO**
   - Reescreva o objetivo de forma técnica e precisa
   - Identifique o problema que está sendo resolvido

2. **ESPECIFICAÇÃO TÉCNICA**
   - Inputs necessários (nome, tipo, validação)
   - Outputs esperados (estrutura de resposta)
   - Fluxo de dados

3. **REGRAS DE NEGÓCIO**
   - Liste TODAS as regras implícitas e explícitas
   - Numere cada regra (RN01, RN02, etc.)

4. **EDGE CASES E VALIDAÇÕES**
   - ${config.validations}
   - Liste cenários de erro que devem ser tratados

5. **SEGURANÇA**
   - ${config.security}

${includeTests ? `6. **TESTES**
   - ${config.tests}
   - Descreva os cenários de teste necessários` : ''}

7. **IMPLEMENTAÇÃO**
   - Stack técnica recomendada
   - Estrutura de arquivos sugerida
   - Código inicial ou pseudo-código

---
### REGRAS DE SAÍDA

1. Gere APENAS o prompt final. Não adicione explicações ou meta-comentários.
2. O prompt deve ser LONGO e DETALHADO (mínimo 500 palavras)
3. Use formatação Markdown para organizar seções
4. Adicione detalhes que o usuário pode ter esquecido mas são importantes
5. O prompt deve poder ser COPIADO E COLADO diretamente em uma IA

GERE O PROMPT TÉCNICO AGORA:
`;
        } else if (promptMode === 'suggest_saas_details') {
            prompt = `
                Atue como um Especialista de Produto e Designer de SaaS Sênior.
                Analise o contexto abaixo e sugira detalhes criativos e técnicos para o projeto.
                
                NOME DO APP: ${saasName || 'Indefinido'}
                CONTEXTO ATUAL: ${saasNiche ? `Nicho: ${saasNiche}` : 'Nicho Desconhecido'}

                RETORNE APENAS UM JSON VÁLIDO (sem markdown, sem \`\`\`) com o seguinte formato:
                {
                    "niche": "Sugestão de nicho específico e lucrativo",
                    "targetAudience": "Sugestão de público-alvo detalhado",
                    "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
                    "visualStyle": "Sugestão de estilo (ex: Minimalista, Cyberpunk, Corporativo)",
                    "primaryColor": "Código HEX",
                    "secondaryColor": "Código HEX",
                    "typography": "Nome da fonte (ex: Inter, Poppins, Roboto)"
                }
            `;
        } else if (promptMode === 'saas_builder') {
            // V4: Clean PRD format - no verbose headers
            const saasInput: SaasBuilderInput = {
                appName: saasName || 'New SaaS',
                niche: saasNiche || '',
                targetAudience: body.targetAudience || '',
                features: body.features || [],
                visualStyle: logoStyle || 'Modern & Clean',
                primaryColor: saasColor || '#3b82f6',
                secondaryColor: body.secondaryColor || '#ffffff',
                typography: body.typography?.split(' (')[0] || 'Inter',
                typographyWeight: body.typographyWeight || 600,
                targetPlatform: targetPlatform || 'Lovable',
                monetization: body.monetization || {
                    enabled: false,
                    model: 'subscription',
                    provider: 'stripe',
                    plans: ['Free', 'Pro', 'Enterprise'],
                    trialDays: 7
                }
            };

            const { systemPrompt, userPrompt } = generateSaasV4Prompt(saasInput);

            prompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;

        } else if (promptMode === 'optimize_prompt') {
            prompt = `
                Atue como um ** Engenheiro de Prompts Sênior ** especializado em desenvolvimento de software com IA para ${targetPlatform || 'Lovable, GPT-Engineer, v0'}.
                
                SEU OBJETIVO: Escrever um prompt FINAL, técnico e extremamente detalhado que o usuário irá enviar para uma IA construtora de software.
                
                ### CONTEXTO DO PROJETO(Dados fornecidos pelo usuário):
                - ** Nome do SaaS **: ${saasName || 'Novo Projeto'}
                - ** Nicho de Mercado **: ${saasNiche}
                - ** Público Alvo **: ${body.targetAudience}
                - ** Identidade Visual **: Cores ${saasColor}, Fonte ${saasFont} (Peso: ${body.fontWeight || 'Padrão'
                }), Estilo ${logoStyle}
                - ** Tom de Voz **: ${voiceTone}
                - ** Widgets do Dashboard **: ${body.dashboardWidgets ? body.dashboardWidgets.join(', ') : 'Padrão de mercado'}
                - ** Funcionalidades Chave **: ${body.features ? body.features.join(', ') : 'Essenciais para o nicho'}

                ### SUA TAREFA:
                Escreva o prompt abaixo completando TODAS as lacunas com sua expertise técnica.Não deixe nada como "A definir".Invente os detalhes faltantes(Planos de preço, Schema do banco, Estrutura de arquivos) para que o projeto seja viável e profissional.

                ### ESTRUTURA DO PROMPT QUE VOCÊ DEVE GERAR(Copie e preencha):

    ---
        "Atue como um CTO e Product Manager Experiente.
                Estou criando um novo SaaS chamado ** ${saasName || 'Novo Projeto'}** focado em ** ${saasNiche}**.

                ### 1. Identidade & Visual
        - Cores: ${saasColor}
    - Tipografia: ${saasFont} (Peso: ${body.fontWeight || 'Padrão'
                })
- Estilo: ${logoStyle}
- Tom de Voz: ${voiceTone}
                - ** Diretriz de Design **: Crie uma interface limpa, moderna e responsiva(Mobile - First) usando Shadcn UI e Tailwind CSS.Use animações sutis(Framer Motion) para uma sensação premium.

                ### 2. Modelo de Negócio & Estratégia
    - Nicho: ${saasNiche} para ${body.targetAudience}
                - ** Planos Sugeridos **: [Crie 3 nomes de planos e preços compatíveis com o mercado de ${saasNiche}]
    - ** Diferencial Competitivo **: [Descreva um diferencial técnico ou de UX para este projeto]

                ### 3. Core do Produto(MVP)
    - ** Fluxo Principal **: O usuário entra, [Descreva o fluxo principal de uso do ${saasNiche}].
                - ** Dashboard **: Deve conter widgets de ${body.dashboardWidgets ? body.dashboardWidgets.join(', ') : 'Métricas principais'}.
                - ** Input de Dados **: Otimize para[Desktop / Mobile] com formulários intuitivos.

                ### 4. Arquitetura Técnica(Mandatório)
    - ** Frontend **: React(Vite), TypeScript, Tailwind CSS, Shadcn UI, Lucide React.
                - ** Backend / BaaS **: Supabase(Auth, Postgres, Storage, Edge Functions).
                - ** State Management **: TanStack Query(React Query) + Context API.
                - ** Segurança **: Implemente RLS(Row Level Security) em TODAS as tabelas.Política padrão: usuários só veem seus próprios dados.

                ### 5. Funcionalidades(Implementação Imediata)
                ${body.features ? body.features.map((f: string) => `- ${f}`).join('\n') : '- CRUD completo da entidade principal'}
-[Adicione 2 funcionalidades técnicas essenciais para este nicho que o usuário esqueceu]

                ### 6. Schema do Banco de Dados(Sugestão Inicial)
[Crie um esquema SQL simplificado para as tabelas principais: users, subscriptions, e a entidade principal de ${saasNiche}]

                ** INSTRUÇÃO FINAL **: Implemente o código inicial focado no Dashboard e na funcionalidade principal.Crie os arquivos necessários e a estrutura de pastas."
---

                ** IMPORTANTE **:
1. Sua resposta deve ser APENAS o prompt gerado acima. 
                2. Mantenha os dados do usuário FIXOS. 
                3. Seja criativo nos detalhes que faltam."
    `;

        } else if (promptMode === 'design') {
            prompt = `
                Atue como um Designer UI / UX Sênior e Especialista em Interfaces Modernas para ${targetPlatform || 'Web'}. 
                Gere um Guia de Design ultra - detalhado para o seguinte objetivo:
                
                OBJETIVO VISUAL: ${objective}
                DETALHES DE UI: ${context}

                O prompt deve focar EXCLUSIVAMENTE em:
1. Paleta de Cores, Tipografia e Design System.
                2. Estilos de componentes(botões, inputs, cards) e estados de interação.
                3. Layout, Grids e Componentes React + Tailwind.

                NÃO inclua informações sobre backend ou banco de dados.
            `;
        } else if (promptMode === 'logic') {
            prompt = `
                Atue como um Engenheiro de Software Sênior Especialista em Backend e Infraestrutura. 
                Gere uma Especificação Técnica focada EXCLUSIVAMENTE em Lógica e Dados para ${targetPlatform || 'Web'}:
                
                OBJETIVO TÉCNICO: ${objective}
                REGRAS E FLUXOS: ${context}
                
                Foque em: Schema do Banco de Dados, Documentação de Rotas API, Fluxos de Segurança(JWT, Auth) e Arquitetura de Servidor.
                NÃO inclua nenhuma informação sobre interface visual, cores, fontes ou CSS.
            `;
        } else if (promptMode === 'feature') {
            prompt = `
Act as a ** Senior Frontend Engineer & Component Architect ** specialized in ${targetPlatform || 'Web Frameworks'}.
                Create a ** Frontend Implementation Roadmap ** for the following FEATURE:
                
                REQUESTED FEATURE: ${objective}
                PROJECT CONTEXT: ${context}
                
                Generate a practical guide strictly following this structure:
1. ** Routes & Application Structure **: Define new client - side routes and the component hierarchy.
                2. ** Component Details **: Props, State, and Interactions.
                3. ** Integration **: Data fetching and API mocking.
                
                ** Golden Rules:**
                - ** NO BACKEND CODE **: Do not generate SQL or Server logic.
                - Assume the API exists or tell the user to mock it.
            `;
        } else if (promptMode === 'landing_page') {
            if (targetPlatform === 'Google AI Studio') {
                prompt = `
                ${LANDING_PAGE_GOOGLE_STUDIO_PROMPT}

                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                *** COMANDO DE EXECUÇÃO: GERAR PROMPT FINAL ***
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                CONTEXTO DO PROJETO (INPUT DO USUÁRIO):
                
                1. IDENTIDADE DO PROJETO:
                   - Nome da Marca: ${brandName || 'Projeto SaaS (Nome a definir)'}
                   - Nicho de Mercado: ${saasNiche || 'Não especificado (Inferir o mais rentável compatível)'}
                   - Objetivo Principal: ${objective || 'Conversão e Credibilidade'}
                   - Público-Alvo: ${targetAudience || 'Geral/B2B'}

                2. DIRETRIZES DE DESIGN APONTADAS:
                   - Estilo Arquitetural: ${logoStyle || 'Premium Modern (Clean & Bold)'}
                   - Geometria (Bordas): ${geometry || 'Mixed (Estratégico)'}
                   - Layout (Grid): ${layout || 'Standard (Com ritmo visual)'}
                   - Paleta de Cores: 
                     * Primária (Brand): ${primaryColor}
                     * Secundária (Fundo): ${secondaryColor}
                   - Tipografia: ${typography} (Peso: ${fontWeight})
                   - Modo Fonte Única: ${useSingleFont ? 'ATIVADO (Use a mesma fonte para tudo)' : 'DESATIVADO (Use paring recomendado)'}

                3. TOM E CONTEÚDO:
                   - Tom de Voz: ${voiceTone || 'Profissional, Confidente e Técnico'}
                   - Oferta / Problema: ${problemSolved || 'Inferir headline de alto impacto'}
                   - Call-to-Action (CTA): ${cta || 'Começar Agora'}

                4. ARQUITETURA DE SEÇÕES SOLICITADA:
                   ${sections ? sections.map((s: string) => `- ${s}`).join('\n                   ') : '- (Defina a estrutura ideal para alta conversão)'}

                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                SUA MISSÃO AGORA:
                
                Atue como o Senior Prompt Engineer definido acima e gere o "PROMPT FINAL ÚNICO" para este projeto específico.
                
                REGRAS RÍGIDAS DE SAÍDA (OVERRIDE TOTAL):
                1. O usuário quer COPIAR E COLAR. Não entregue "Especificações", "Dicas" ou "Análises".
                2. Entregue APENAS o TEXTO DO PROMPT.
                3. O prompt gerado deve ser LONGO, TÉCNICO e EXAUSTIVO, seguindo seu template de "Qualidade Premium".
                4. Garanta que o prompt gerado proíba explicitamente o "Vibe Coding" (design genérico).

                [INÍCIO DO PROMPT GERADO]
                `;
            } else {
                // Nova lógica simplificada e inteligente usando o "Master Architect" Prompt (Lovable/Default)
                prompt = `
                ${LANDING_PAGE_AGENT_V2_PROMPT}

            AGORA, GERE A LANDING PAGE PARA O SEGUINTE PROJETO:

            1. NICHO: ${saasNiche || 'Geral'}
            2. NOME DA MARCA: ${brandName || '(Invente um nome tech/moderno)'}
            3. OBJETIVO: ${objective || 'Conversão'}
            4. PÚBLICO ALVO: ${targetAudience || 'Geral'}
            
            DIRETRIZES VISUAIS (RIGOROSAS):
            - ESTILO ARQUITETURAL: ${logoStyle || 'Premium Modern'}
            - GEOMETRIA (BORDAS): ${geometry || 'Mixed'}
            - LAYOUT (GRID): ${layout || 'Standard'}
            - COR PRIMÁRIA: ${primaryColor || '#000000'}
            - COR SECUNDÁRIA (FUNDO): ${secondaryColor || '#ffffff'}
            - TIPOGRAFIA: ${typography || 'Sans'} (Peso: ${fontWeight || 'Regular'}) ${useSingleFont ? '(USAR APENAS UMA FONTE PARA TUDO)' : ''}

            CONTEÚDO E TOM:
            - TOM DE VOZ: ${voiceTone || 'Profissional e Direto'}
            - OFERTA PRINCIPAL: ${problemSolved || 'Resolver o problema do cliente'}
            - CTA: ${cta || 'Agendar Agora'}

            SEÇÕES OBRIGATÓRIAS (NA ORDEM):
            ${sections ? sections.join(', ') : 'Hero, Proof, Features, Testimonials, FAQ, Footer'}
            
            (Se o usuário não pediu alguma seção essencial como Hero ou Footer, inclua mesmo assim para integridade).
            `;
            }

        } else {
            // Fallback
            prompt = `Atue como Especialista em Software para ${targetPlatform || 'Web'}.Objetivo: ${objective}.Contexto: ${context}.`;
        }

        // Mandatory Footer
        prompt += `\n\n ** IMPORTANTE **: implemente tudo isso de imediato, sem me fazer mais perguntas, só me faça uma sugestão depois de implementar TUDO que eu te falei.`;

        // Modelos identificados na lista do usuário
        const modelsToTry = [
            "gemini-2.0-flash",       // Fallback Rápido (Top Tier)
            "gemini-2.0-flash-001",   // Variação disponível
            "gemini-flash-latest",    // Alias disponível
            "gemini-pro-latest"       // Fallback estável
        ];

        const genAI = new GoogleGenerativeAI(apiKey);
        let lastErrorMsg = "";

        for (const modelId of modelsToTry) {
            try {
                console.log(`Tentando modelo identificado: ${modelId} `);
                const model = genAI.getGenerativeModel({ model: modelId });
                console.log(`[DEBUG] Prompt Length for ${modelId}:`, prompt.length);

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                if (text) {
                    // --- SUCCESS: INCREMENT USAGE & SAVE PROJECT ---
                    await supabase.rpc('increment_prompts');

                    // Save to projects - use app name from SaaS or brand name from Landing
                    const title = body.appName || body.brandName || body.objective?.substring(0, 30) || "Projeto Sem Título";
                    const { error: saveError } = await supabase
                        .from('projects')
                        .insert({
                            user_id: user.id,
                            title: title,
                            inputs: body,
                            generated_content: text
                        });

                    if (saveError) {
                        console.error("Erro ao salvar projeto:", saveError);
                        // Non-blocking error, but worth logging
                    }

                    return NextResponse.json({ result: text });
                }
            } catch (err: unknown) {
                const error = err as Error;
                console.warn(`Falha no modelo ${modelId}: `, error.message);
                lastErrorMsg += `[${modelId}]: ${error.message}.`;
            }
        }

        return NextResponse.json({
            error: `Não foi possível gerar com os modelos da sua lista.Erros: ${lastErrorMsg} `
        }, { status: 500 });

    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({
            error: `Erro fatal no servidor: ${err.message || err.toString()} `
        }, { status: 500 });
    }
}
