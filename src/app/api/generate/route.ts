import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            appName, appType, segment, stage,
            stackFrontend, stackBackend, database,
            style, objective, context
        } = body;

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            return NextResponse.json({ error: "ERRO: GEMINI_API_KEY não encontrada no servidor (.env.local)" }, { status: 500 });
        }

        const prompt = `
            Atue como um Arquiteto de Software Sênior e Tech Lead. Gere uma Especificação Técnica para o projeto:
            - Nome: ${appName}
            - Tipo: ${appType}
            - Segmento: ${segment}
            - Estágio: ${stage}
            - Stack: ${stackFrontend?.join(', ')} / ${stackBackend?.join(', ')} / ${database}
            - Estilo: ${style?.join(', ')}
            - Objetivo: ${objective}
            - Contexto: ${context}

            Gere um Markdown técnico profissional e completo.
        `;

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
                console.log(`Tentando modelo identificado: ${modelId}`);
                const model = genAI.getGenerativeModel({ model: modelId });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                if (text) {
                    return NextResponse.json({ result: text });
                }
            } catch (err: any) {
                console.warn(`Falha no modelo ${modelId}:`, err.message);
                lastErrorMsg += `[${modelId}]: ${err.message}. `;
            }
        }

        return NextResponse.json({
            error: `Não foi possível gerar com os modelos da sua lista. Erros: ${lastErrorMsg}`
        }, { status: 500 });

    } catch (error: any) {
        return NextResponse.json({
            error: `Erro fatal no servidor: ${error.message || error.toString()}`
        }, { status: 500 });
    }
}
