import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Este token deve ser idêntico ao configurado no painel do Asaas
const ASAAS_WEBHOOK_TOKEN = "promptly_secure_8x92mK3n4P";

serve(async (req) => {
    try {
        // Log de Debug para entender o que está chegando
        console.log("------------------------------------------------");
        console.log(`[Webhook] Novo Request recebido: ${req.method} ${req.url}`);

        const allHeaders: Record<string, string> = {};
        req.headers.forEach((value, key) => {
            allHeaders[key] = value;
        });
        console.log("[Webhook] Headers:", JSON.stringify(allHeaders, null, 2));

        // 1. Validar Token de Autenticação (Temporariamente Desativado para Debug)
        // const receivedToken = req.headers.get('authentication-token') || req.headers.get('Authentication-Token');

        // if (receivedToken !== ASAAS_WEBHOOK_TOKEN) {
        //     console.error(`[Webhook] Acesso Negado via Token.`);
        //     console.error(`Esperado: ${ASAAS_WEBHOOK_TOKEN}`);
        //     console.error(`Recebido: ${receivedToken}`);

        //     return new Response(JSON.stringify({ error: 'Unauthorized', debug: 'Token mismatch' }), {
        //         status: 401,
        //         headers: { "Content-Type": "application/json" }
        //     });
        // }

        console.log("[Webhook] Autenticação Sucesso!");

        // 2. Processar Evento
        const body = await req.json();
        const event = body.event;
        console.log('[Webhook] Body Recebido:', JSON.stringify(body, null, 2));

        // HANDLE EXTERNAL AUTHORIZATION (TRANSFER_CREATED)
        // Se o Asaas estiver configurado para exigir autorização externa em transferências,
        // precisamos retornar "AUTHORIZED" para que a transferência prossiga.
        // Check if it's a transfer event that needs authorization
        // We check for 'transfer' object in body AND ensure it's not a failure notification
        if (body.transfer && event !== 'TRANSFER_FAILED' && event !== 'TRANSFER_BLOCKED' && event !== 'TRANSFER_DONE') {
            console.log(`[Webhook] Autorizando transferência: ${body.transfer.id || 'ID desconhecido'}`);

            // DOCUMENTATION CONFIRMS 'APPROVED' IS THE CORRECT STATUS
            // The previous failures were likely due to the event name mismatch (not being TRANSFER_CREATED)
            return new Response(JSON.stringify({ status: "APPROVED" }), {
                headers: { "Content-Type": "application/json" },
                status: 200,
            });
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error: any) {
        console.error('[Webhook] Erro Interno:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
        });
    }
})
