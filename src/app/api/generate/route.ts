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
            appName, appType, segment, stage,
            stackFrontend, stackBackend, database,
            style, objective, context, promptMode
        } = body;

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            return NextResponse.json({ error: "ERRO: GEMINI_API_KEY não encontrada no servidor (.env.local)" }, { status: 500 });
        }

        let prompt = "";

        if (promptMode === 'design') {
            prompt = `
                Atue como um Designer UI/UX Sênior e Especialista em Interfaces Modernas e Premium. 
                Gere um Guia de Design ultra-detalhado para o seguinte objetivo:
                
                OBJETIVO VISUAL: ${objective}
                DIRETRIZES ESTÉTICAS: ${style?.join(', ')}
                DETALHES DE UI: ${context}

                O prompt deve focar EXCLUSIVAMENTE em:
                1. Paleta de Cores, Tipografia e Design System.
                2. Estilos de componentes (botões, inputs, cards) e estados de interação.
                3. Layout, Grids e Componentes React + Tailwind.

                NÃO inclua informações sobre backend, banco de dados ou regras de negócio complexas.
            `;
        } else if (promptMode === 'logic') {
            prompt = `
                Atue como um Engenheiro de Software Sênior Especialista em Backend e Infraestrutura. 
                Gere uma Especificação Técnica focada EXCLUSIVAMENTE em Lógica e Dados para:
                
                OBJETIVO TÉCNICO: ${objective}
                REGRAS E FLUXOS: ${context}
                STACK DE DADOS: ${database}

                Foque em: Schema do Banco de Dados, Documentação de Rotas API, Fluxos de Segurança (JWT, Auth) e Arquitetura de Servidor.
                NÃO inclua nenhuma informação sobre interface visual, cores, fontes ou CSS.
            `;
        } else if (promptMode === 'feature') {
            prompt = `
                Act as a **Senior Frontend Engineer & Component Architect**.
                Create a **Frontend Implementation Roadmap** for the following FEATURE:
                
                REQUESTED FEATURE: ${objective}
                PROJECT CONTEXT: ${context}
                EXISTING APP: ${appName}

                Generate a practical guide strictly following this structure:
                1. **Routes & Application Structure**: Define new client-side routes and the component hierarchy (Smart Controllers vs Dumb Presentational components).
                2. **Component Details**:
                   - List main components needed.
                   - Props interface and State definition (local vs global).
                3. **Integration & Data Flow**:
                   - How to handle data fetching (SWR/TanStack Query recommended).
                   - Mocking the API (instruct to create a mock service layer if backend doesn't exist).
                4. **UI/UX Details**: Interactions, loading states, and error handling.

                **Golden Rules:**
                - **NO BACKEND CODE**: Do not generate SQL, Database Schemas, or Server Side logic.
                - Assume the API exists or tell the user to mock it.
                - **OUTPUT STRICTLY IN ENGLISH.**
            `;
        } else {
            // Default MVP / Software Architect
            prompt = `
                Atue como um Arquiteto de Software Sênior e Tech Lead. 
                Gere uma Especificação Técnica completa para um MVP do projeto:
                
                PROJETO: ${appName}
                TIPO: ${appType} | MERCADO: ${segment} | ESTÁGIO: ${stage}
                STACK: ${stackFrontend?.join(', ')} / ${stackBackend?.join(', ')} / ${database}
                OBJETIVO: ${objective}
                CONTEXTO: ${context}
                Gere um Markdown técnico profissional com arquitetura de pastas, fluxos principais e stack recomendada.
            `;
        }

        // Mandatory Footer
        prompt += `\n\n**IMPORTANTE**: implemente tudo isso de imediato, sem me fazer mais perguntas, só me faça uma sugestão depois de implementar TUDO que eu te falei.`;

        // Modelos identificados na lista do usuário
        const modelsToTry = [
            "gemini-2.0-flash",       // Super moderno, disponível na lista
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
