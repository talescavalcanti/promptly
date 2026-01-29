import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        // --- AUTH CHECK ---
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch { }
                    },
                },
            }
        );

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // --- INPUT HANDLING ---
        const formData = await req.formData();
        const file = formData.get("image") as File;

        if (!file) {
            return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
        }

        // Convert File to Base64
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString("base64");
        const mimeType = file.type;

        // --- READ PROMPT INSTRUCTION ---
        const promptPath = path.join(process.cwd(), 'prompts/design-varibles/variaveis-de-design.md');
        let systemInstruction = "";

        try {
            systemInstruction = fs.readFileSync(promptPath, 'utf-8');
        } catch (e) {
            console.warn("Could not read variable agent file, using fallback.");
            systemInstruction = "Analyze this image and extract design variables (colors, typography, style) in JSON format.";
        }

        // --- CALL GEMINI ---
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
            return NextResponse.json({ error: "Server Error: API Key missing" }, { status: 500 });
        }

        // Models aligned with api/generate/route.ts
        const modelsToTry = [
            "gemini-2.0-flash",
            "gemini-2.0-flash-001",
            "gemini-flash-latest",
            "gemini-pro-latest"
        ];

        const genAI = new GoogleGenerativeAI(apiKey);
        let result = null;
        let lastError = null;

        for (const modelId of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelId });
                result = await model.generateContent([
                    systemInstruction,
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType
                        }
                    }
                ]);
                if (result) break; // Success
            } catch (e: any) {
                console.warn(`Extraction failed with ${modelId}:`, e.message);
                lastError = e;
            }
        }

        if (!result) {
            return NextResponse.json({ error: "All extraction models failed. Last error: " + lastError?.message }, { status: 500 });
        }

        const responseText = result.response.text();

        // --- PARSE MULTI-SECTION OUTPUT ---
        // The UDTE agent returns: Markdown Report + JSON Tokens + Guide
        // We need to extract the JSON section and also preserve the full report.

        let jsonTokens = null;
        let markdownReport = responseText;

        // Try to extract JSON block from the response
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            try {
                jsonTokens = JSON.parse(jsonMatch[1].trim());
            } catch (e) {
                console.warn("Could not parse JSON tokens block:", e);
            }
        }

        // Extract key sections for quick access
        const sections = {
            metadata: extractSection(responseText, "# 1) Metadados", "# 2)"),
            direction: extractSection(responseText, "# 2) Direção Visual", "# 3)"),
            colors: extractSection(responseText, "# 3) Paleta de Cores", "# 4)"),
            typography: extractSection(responseText, "# 4) Tipografia", "# 5)"),
            layout: extractSection(responseText, "# 5) Layout e Grid", "# 6)"),
            spacing: extractSection(responseText, "# 6) Spacing Scale", "# 7)"),
            radius: extractSection(responseText, "# 7) Radius", "# 8)"),
            shadows: extractSection(responseText, "# 8) Shadows", "# 9)"),
            borders: extractSection(responseText, "# 9) Bordas", "# 10)"),
            components: extractSection(responseText, "# 10) Componentes", "# 11)"),
            patterns: extractSection(responseText, "# 11) Padrões de UI", "# 12)"),
            replicationGuide: extractSection(responseText, "# 12) Checklist de Replicação", "========"),
        };

        return NextResponse.json({
            success: true,
            fullReport: markdownReport,
            tokens: jsonTokens,
            sections: sections
        });

    } catch (error: any) {
        console.error("Extraction Error:", error);
        return NextResponse.json({ error: "Extraction Failed: " + error.message }, { status: 500 });
    }
}

// Helper to extract a section from markdown
function extractSection(text: string, startMarker: string, endMarker: string): string {
    const startIndex = text.indexOf(startMarker);
    if (startIndex === -1) return "";

    const endIndex = text.indexOf(endMarker, startIndex + startMarker.length);
    if (endIndex === -1) return text.substring(startIndex);

    return text.substring(startIndex, endIndex).trim();
}
