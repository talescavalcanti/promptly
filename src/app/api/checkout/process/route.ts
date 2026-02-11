import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        // 1. Auth Check with Supabase (Server-Side)
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
                            // Ignored
                        }
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
        }

        // 2. Load Environment Variables (API Keys)
        const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
        const ASAAS_BASE_URL = process.env.ASAAS_BASE_URL;


        if (!ASAAS_API_KEY || !ASAAS_BASE_URL) {
            console.error("Missing Asaas Keys in .env.local");
            return NextResponse.json({
                error: "Configuração de pagamento incompleta no servidor. (ASAAS_API_KEY missing)"
            }, { status: 500 });
        }

        // 3. Parse Body
        const body = await req.json();
        const { plan, method, cardDetails, billingDetails } = body;

        // Helper for safe fetching
        const safeFetch = async (url: string, options: RequestInit) => {
            const response = await fetch(url, options);
            const text = await response.text();
            try {
                return {
                    ok: response.ok,
                    status: response.status,
                    data: JSON.parse(text)
                };
            } catch {
                console.error(`Starting fetch to ${url}`);
                console.error(`Failed to parse JSON from ${url}. Status: ${response.status}`);
                console.error("Raw response:", text.substring(0, 500)); // Log first 500 chars
                throw new Error(`Resposta inválida do Asaas (HTML/Non-JSON). Status: ${response.status}`);
            }
        };

        // 4. Get/Create Asaas Customer
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError) {
            return NextResponse.json({ error: "Erro ao buscar perfil do usuário." }, { status: 500 });
        }

        let asaasCustomerId = userProfile?.asaas_customer_id;

        if (!asaasCustomerId) {
            // Create customer in Asaas
            const customerRes = await safeFetch(`${ASAAS_BASE_URL}/customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'access_token': ASAAS_API_KEY
                },
                body: JSON.stringify({
                    name: billingDetails.name,
                    cpfCnpj: billingDetails.cpf,
                    email: billingDetails.email,
                    mobilePhone: billingDetails.whatsapp,
                    address: billingDetails.endereco,
                    addressNumber: billingDetails.numero,
                    complement: billingDetails.complemento,
                    province: billingDetails.bairro,
                    postalCode: billingDetails.cep,
                    externalReference: user.id
                })
            });

            if (!customerRes.ok || customerRes.data.errors) {
                return NextResponse.json({ error: `Erro no Asaas (Cliente): ${JSON.stringify(customerRes.data.errors || customerRes.data)}` }, { status: 400 });
            }

            asaasCustomerId = customerRes.data.id;

            // Update user profile
            await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    email: user.email,
                    asaas_customer_id: asaasCustomerId,
                    billing_name: billingDetails.name,
                    cpf: billingDetails.cpf,
                    whatsapp: billingDetails.whatsapp,
                    endereco: billingDetails.endereco,
                    numero: billingDetails.numero,
                    complemento: billingDetails.complemento,
                    bairro: billingDetails.bairro,
                    cep: billingDetails.cep,
                    cidade: billingDetails.cidade,
                    estado: billingDetails.estado
                });
        }

        // 5. Create Subscription
        const value = plan === 'PRO' ? 27.90 : 9.90;
        const description = `Assinatura Plano ${plan}`;

        const subscriptionBody: Record<string, unknown> = {
            customer: asaasCustomerId,
            billingType: method,
            value,
            cycle: 'MONTHLY',
            description,
            externalReference: plan
        };

        if (method === 'CREDIT_CARD') {
            subscriptionBody.creditCard = {
                holderName: cardDetails.holderName,
                number: cardDetails.number.replace(/\D/g, ''),
                expiryMonth: cardDetails.expiryMonth,
                expiryYear: cardDetails.expiryYear,
                ccv: cardDetails.ccv.replace(/\D/g, '')
            };
            subscriptionBody.creditCardHolderInfo = {
                name: billingDetails.name,
                email: billingDetails.email,
                cpfCnpj: billingDetails.cpf,
                postalCode: billingDetails.cep,
                addressNumber: billingDetails.numero,
                mobilePhone: billingDetails.whatsapp
            };
        }

        const subRes = await safeFetch(`${ASAAS_BASE_URL}/subscriptions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access_token': ASAAS_API_KEY
            },
            body: JSON.stringify(subscriptionBody)
        });

        if (!subRes.ok || subRes.data.errors) {
            return NextResponse.json({ error: `Erro no Asaas (Assinatura): ${JSON.stringify(subRes.data.errors || subRes.data)}` }, { status: 400 });
        }

        const subData = subRes.data; // Correctly typed as any/json
        const subscriptionId = subData.id;
        let pixQrCode = null;
        let pixQRCodeText = null;
        let paymentId = '';

        // 6. Handle Payments (PIX needs fetching the generated payment)
        if (method === 'PIX') {
            // Fetch payments for this subscription
            const paymentsResponse = await fetch(`${ASAAS_BASE_URL}/subscriptions/${subscriptionId}/payments`, {
                headers: { 'access_token': ASAAS_API_KEY }
            });
            const paymentsData = await paymentsResponse.json();
            const firstPayment = paymentsData.data && paymentsData.data[0];

            if (!firstPayment) {
                return NextResponse.json({ error: "Pagamento não gerado pelo Asaas." }, { status: 500 });
            }

            paymentId = firstPayment.id;

            // Get QR Code
            const qrResponse = await fetch(`${ASAAS_BASE_URL}/payments/${paymentId}/pixQrCode`, {
                headers: { 'access_token': ASAAS_API_KEY }
            });
            const qrData = await qrResponse.json();
            pixQrCode = qrData.encodedImage;
            pixQRCodeText = qrData.payload;
        } else {
            // For Credit Card, try to find the payment ID as well
            const paymentsResponse = await fetch(`${ASAAS_BASE_URL}/subscriptions/${subscriptionId}/payments`, {
                headers: { 'access_token': ASAAS_API_KEY }
            });
            const paymentsData = await paymentsResponse.json();
            if (paymentsData.data && paymentsData.data.length > 0) {
                paymentId = paymentsData.data[0].id;
            }
        }

        // 7. Save to Database
        const { error: dbError } = await supabase
            .from('payments')
            .insert({
                user_id: user.id,
                plan,
                amount: value,
                method,
                status: subData.status,
                asaas_payment_id: paymentId,
                asaas_subscription_id: subscriptionId,
                pix_qr_code: pixQRCodeText
            });

        if (dbError) {
            console.error("DB Save Error:", dbError);
            // Don't fail request, payment is made
        }

        // 8. Grant Access (If Credit Card Approved Immediately)
        const validStatuses = ['ACTIVE', 'CONFIRMED', 'RECEIVED'];
        if (method === 'CREDIT_CARD' && validStatuses.includes(subData.status)) {
            const expirationDate = new Date()
            expirationDate.setMonth(expirationDate.getMonth() + 1)

            await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    email: user.email,
                    status: 'ativo',
                    plano_ativo: plan,
                    prompts_used: 0,
                    data_expiracao: expirationDate.toISOString()
                }, { onConflict: 'id' });
        }

        return NextResponse.json({
            success: true,
            subscriptionId,
            paymentId,
            pixQrCodeBase64: pixQrCode,
            pixCopyPaste: pixQRCodeText,
            debugStatus: subData.status,
            environment: ASAAS_BASE_URL.includes('sandbox') ? 'sandbox' : 'production'
        });

    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error("Internal Error:", err);
        return NextResponse.json({
            error: err.message || "Erro interno no servidor."
        }, { status: 500 });
    }
}
