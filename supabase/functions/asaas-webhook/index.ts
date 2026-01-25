import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Este token deve ser idêntico ao configurado no painel do Asaas
const ASAAS_WEBHOOK_TOKEN = "promptly_secure_8x92mK3n4P";

serve(async (req) => {
    try {
        // 1. Validar Token de Autenticação
        const authHeader = req.headers.get('authentication-token');

        if (authHeader !== ASAAS_WEBHOOK_TOKEN) {
            console.error('Token inválido:', authHeader);
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 2. Processar Evento
        const body = await req.json();
        console.log('Evento Asaas Recebido:', JSON.stringify(body, null, 2));

        // Lógica de Validação de Saque
        // O Asaas espera um retorno 200 OK.
        // Se for validação de saque síncrona, confirme a documentação se precisa de um JSON específico.
        // Por padrão, responder 200 OK valida o recebimento.

        // CASO SEJA APENAS NOTIFICAÇÃO:
        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        console.error('Erro no webhook:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
        });
    }
})
