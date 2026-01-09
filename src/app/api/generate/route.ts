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
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('plan, prompts_used')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            console.error("Profile error:", profileError);
            return NextResponse.json({ error: "Erro ao carregar perfil de usuário." }, { status: 500 });
        }

        const PLAN_LIMITS: Record<string, number> = {
            'free': 5,
            'starter': 100,
            'pro': 400
        };

        const userPlan = profile.plan || 'free';
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
                Atue como um Desenvolvedor Fullstack Sênior. 
                Gere um roteiro técnico para implementar uma NOVA FUNCIONALIDADE:
                
                RECURSO SOLICITADO: ${objective}
                REQUISITOS ADICIONAIS: ${context}

                Foque em: Passo a passo técnico para implementação, alterações no banco, novas rotas e componentes necessários. Seja direto e técnico.
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
