import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

        // Map database value (STARTER/PRO) to limit keys (Fixed: removed duplicate declaration)
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
            // SaaS Wizard Specifics
            saasName, saasColor, saasFont, logoStyle, voiceTone,
            saasNiche, businessModel, chargingModel, planNames,
            coreEntity, coreView, dataInputType,
            userRoles, loginMethod, registrationPolicy,
            notificationChannels, integrations, supportChannels,
            problemSolved, marketingHeadline, cta
        } = body;

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            return NextResponse.json({ error: "ERRO: GEMINI_API_KEY não encontrada no servidor (.env.local)" }, { status: 500 });
        }

        let prompt = "";

        if (promptMode === 'saas_wizard') {
            // SAAS WIZARD PROMPT
            prompt = `
                Atue como um **CTO, Arquiteto de Software e Product Manager Sênior**.
                Estou construindo um SaaS do zero e preciso de uma Especificação Técnica e de Produto COMPLETA.

                ## 1. Identidade do Projeto
                - **Nome**: ${saasName || 'A definir'}
                - **Nicho**: ${saasNiche || 'Geral'}
                - **Identidade Visual**: Cores ${saasColor}, Fonte ${saasFont}, Logo ${logoStyle}
                - **Tom de Voz**: ${voiceTone}

                ## 2. Modelo de Negócio
                - **Tipo**: ${businessModel}
                - **Cobrança**: ${chargingModel} (Planos: ${planNames})
                - **Resolver o Problema**: ${problemSolved}
                - **Marketing Headline**: "${marketingHeadline}"
                - **CTA**: "${cta}"

                ## 3. Core do Produto (MVP)
                - **Entidade Principal**: ${coreEntity}
                - **Visualização de Dados**: ${coreView}
                - **Entrada de Dados**: ${dataInputType}

                ## 4. Acesso e Segurança
                - **Perfis de Usuário**: ${userRoles}
                - **Método de Login**: ${loginMethod}
                - **Política de Registro**: ${registrationPolicy}

                ## 5. Funcionalidades Extras
                - **Notificações**: ${notificationChannels?.join(', ')}
                - **Integrações**: ${integrations}
                - **Suporte**: ${supportChannels?.join(', ')}

                ### O QUE VOCÊ DEVE GERAR (OUTPUT):
                Gere um documento Markdown estruturado contendo:

                1.  **Guia de Identidade Visual (Design System)**:
                    - Paleta de cores sugerida (HEX codes) baseada em "${saasColor}".
                    - Tipografia recomendada baseada em "${saasFont}".
                    - Estilo de componentes UI.
                3.  **Arquitetura Técnica (Stack Recomendada)**:
                    - Frontend (Framework, Libs de UI).
                    - Backend (Linguagem, Framework).
                    - Banco de Dados (Schema Relacional simplificado para ${coreEntity}).
                    - Infraestrutura (Auth, Hosting, Storage).
                4.  **Roadmap de Funcionalidades (MVP)**:
                    - Lista de features essenciais para lançar.
                    - Estrutura de Pastas do Projeto.
                5.  **Estratégia de Marketing Inicial**:
                    - Sugestão de Copy para a Hero Section usando a headline "${marketingHeadline}".
            `;

        } else if (promptMode === 'optimize_prompt') {
            prompt = `
                Atue como um **Engenheiro de Prompts Sênior** especializado em desenvolvimento de software com IA para ${targetPlatform || 'Lovable, GPT-Engineer, v0'}.
                
                SEU OBJETIVO: Escrever um prompt FINAL, técnico e extremamente detalhado que o usuário irá enviar para uma IA construtora de software.
                
                ### CONTEXTO DO PROJETO (Dados fornecidos pelo usuário):
                - **Nome do SaaS**: ${saasName || 'Novo Projeto'}
                - **Nicho de Mercado**: ${saasNiche}
                - **Público Alvo**: ${body.targetAudience}
                - **Identidade Visual**: Cores ${saasColor}, Fonte ${saasFont} (Peso: ${body.fontWeight || 'Padrão'}), Estilo ${logoStyle}
                - **Tom de Voz**: ${voiceTone}
                - **Widgets do Dashboard**: ${body.dashboardWidgets ? body.dashboardWidgets.join(', ') : 'Padrão de mercado'}
                - **Funcionalidades Chave**: ${body.features ? body.features.join(', ') : 'Essenciais para o nicho'}

                ### SUA TAREFA:
                Escreva o prompt abaixo completando TODAS as lacunas com sua expertise técnica. Não deixe nada como "A definir". Invente os detalhes faltantes (Planos de preço, Schema do banco, Estrutura de arquivos) para que o projeto seja viável e profissional.

                ### ESTRUTURA DO PROMPT QUE VOCÊ DEVE GERAR (Copie e preencha):

                ---
                "Atue como um CTO e Product Manager Experiente.
                Estou criando um novo SaaS chamado **${saasName || 'Novo Projeto'}** focado em **${saasNiche}**.

                ### 1. Identidade & Visual
                - Cores: ${saasColor}
                - Tipografia: ${saasFont} (Peso: ${body.fontWeight || 'Padrão'})
                - Estilo: ${logoStyle}
                - Tom de Voz: ${voiceTone}
                - **Diretriz de Design**: Crie uma interface limpa, moderna e responsiva (Mobile-First) usando Shadcn UI e Tailwind CSS. Use animações sutis (Framer Motion) para uma sensação premium.

                ### 2. Modelo de Negócio & Estratégia
                - Nicho: ${saasNiche} para ${body.targetAudience}
                - **Planos Sugeridos**: [Crie 3 nomes de planos e preços compatíveis com o mercado de ${saasNiche}]
                - **Diferencial Competitivo**: [Descreva um diferencial técnico ou de UX para este projeto]

                ### 3. Core do Produto (MVP)
                - **Fluxo Principal**: O usuário entra, [Descreva o fluxo principal de uso do ${saasNiche}].
                - **Dashboard**: Deve conter widgets de ${body.dashboardWidgets ? body.dashboardWidgets.join(', ') : 'Métricas principais'}.
                - **Input de Dados**: Otimize para [Desktop/Mobile] com formulários intuitivos.

                ### 4. Arquitetura Técnica (Mandatório)
                - **Frontend**: React (Vite), TypeScript, Tailwind CSS, Shadcn UI, Lucide React.
                - **Backend/BaaS**: Supabase (Auth, Postgres, Storage, Edge Functions).
                - **State Management**: TanStack Query (React Query) + Context API.
                - **Segurança**: Implemente RLS (Row Level Security) em TODAS as tabelas. Política padrão: usuários só veem seus próprios dados.

                ### 5. Funcionalidades (Implementação Imediata)
                ${body.features ? body.features.map((f: string) => `- ${f}`).join('\n') : '- CRUD completo da entidade principal'}
                - [Adicione 2 funcionalidades técnicas essenciais para este nicho que o usuário esqueceu]

                ### 6. Schema do Banco de Dados (Sugestão Inicial)
                [Crie um esquema SQL simplificado para as tabelas principais: users, subscriptions, e a entidade principal de ${saasNiche}]

                **INSTRUÇÃO FINAL**: Implemente o código inicial focado no Dashboard e na funcionalidade principal. Crie os arquivos necessários e a estrutura de pastas."
                ---

                **IMPORTANTE**: 
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
        } else {
            // Fallback
            prompt = `Atue como Especialista em Software para ${targetPlatform || 'Web'}.Objetivo: ${objective}.Contexto: ${context}.`;
        }

        // Mandatory Footer
        prompt += `\n\n ** IMPORTANTE **: implemente tudo isso de imediato, sem me fazer mais perguntas, só me faça uma sugestão depois de implementar TUDO que eu te falei.`;

        // Modelos identificados na lista do usuário
        const modelsToTry = [
            "gemini-3-pro-preview",   // ID CORRETO (Gemini 3 Pro)
            "gemini-3-flash-preview", // ID CORRETO (Gemini 3 Flash)
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
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                if (text) {
                    // --- SUCCESS: INCREMENT USAGE & SAVE PROJECT ---
                    await supabase.rpc('increment_prompts');

                    // Save to projects
                    const title = body.appName || body.objective?.substring(0, 30) || "Projeto Sem Título";
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
            } catch (err: any) {
                console.warn(`Falha no modelo ${modelId}: `, err.message);
                lastErrorMsg += `[${modelId}]: ${err.message}.`;
            }
        }

        return NextResponse.json({
            error: `Não foi possível gerar com os modelos da sua lista.Erros: ${lastErrorMsg} `
        }, { status: 500 });

    } catch (error: any) {
        return NextResponse.json({
            error: `Erro fatal no servidor: ${error.message || error.toString()} `
        }, { status: 500 });
    }
}
