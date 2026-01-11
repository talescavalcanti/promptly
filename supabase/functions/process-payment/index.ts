
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            throw new Error('User not authenticated')
        }

        const { plan, method, cardDetails, billingDetails } = await req.json()
        const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY')
        const ASAAS_BASE_URL = Deno.env.get('ASAAS_BASE_URL')

        if (!ASAAS_API_KEY || !ASAAS_BASE_URL) {
            throw new Error('Asaas configuration missing')
        }

        // 1. Get or Create Asaas Customer
        // First, fetch user profile to see if asaas_customer_id exists
        const { data: userProfile, error: profileError } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', user.id)
            .maybeSingle() // Fix: Use maybeSingle to handle missing user row

        if (profileError) throw profileError

        let asaasCustomerId = userProfile?.asaas_customer_id

        if (!asaasCustomerId) {
            // Create customer in Asaas
            const customerResponse = await fetch(`${ASAAS_BASE_URL}/customers`, {
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
            })

            const customerData = await customerResponse.json()
            if (customerData.errors) {
                throw new Error(`Asaas Customer Error: ${JSON.stringify(customerData.errors)}`)
            }

            asaasCustomerId = customerData.id

            // Update user profile (Upsert ensures existence)
            await supabaseClient
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
                })
        }

        // 2. Create Subscription
        const value = plan === 'PRO' ? 27.90 : 9.90
        const description = `Assinatura Plano ${plan}`

        const subscriptionBody: any = {
            customer: asaasCustomerId,
            billingType: method,
            value,
            cycle: 'MONTHLY',
            description,
            externalReference: plan
        }

        if (method === 'CREDIT_CARD') {
            subscriptionBody.creditCard = {
                holderName: cardDetails.holderName,
                number: cardDetails.number.replace(/\D/g, ''),
                expiryMonth: cardDetails.expiryMonth,
                expiryYear: cardDetails.expiryYear,
                ccv: cardDetails.ccv.replace(/\D/g, '')
            }
            subscriptionBody.creditCardHolderInfo = {
                name: billingDetails.name,
                email: billingDetails.email,
                cpfCnpj: billingDetails.cpf,
                postalCode: billingDetails.cep,
                addressNumber: billingDetails.numero,
                mobilePhone: billingDetails.whatsapp
            }
        }

        const subResponse = await fetch(`${ASAAS_BASE_URL}/subscriptions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access_token': ASAAS_API_KEY
            },
            body: JSON.stringify(subscriptionBody)
        })

        const subData = await subResponse.json()
        if (subData.errors) {
            throw new Error(`Asaas Subscription Error: ${JSON.stringify(subData.errors)}`)
        }

        const subscriptionId = subData.id
        let pixQrCode = null
        let pixQRCodeText = null
        let paymentId = ''

        // 3. Handle PIX specific logic (Get first charge)
        if (method === 'PIX') {
            // Fetch payments for this subscription to get the current one
            const paymentsResponse = await fetch(`${ASAAS_BASE_URL}/subscriptions/${subscriptionId}/payments`, {
                headers: { 'access_token': ASAAS_API_KEY }
            })
            const paymentsData = await paymentsResponse.json()
            const firstPayment = paymentsData.data[0] // Assuming the first one is the current one
            paymentId = firstPayment.id

            // Get QR Code
            const qrResponse = await fetch(`${ASAAS_BASE_URL}/payments/${paymentId}/pixQrCode`, {
                headers: { 'access_token': ASAAS_API_KEY }
            })
            const qrData = await qrResponse.json()
            pixQrCode = qrData.encodedImage
            pixQRCodeText = qrData.payload
        } else {
            // For Credit Card, we might assume the payment is processed or pending. 
            // We can get the payment ID from the subscription response if available, or fetch strictly like PIX.
            // Usually subscription creation returns immediate status.
            // Let's fetch the generated payment ID anyway for consistency in our DB
            const paymentsResponse = await fetch(`${ASAAS_BASE_URL}/subscriptions/${subscriptionId}/payments`, {
                headers: { 'access_token': ASAAS_API_KEY }
            })
            const paymentsData = await paymentsResponse.json()
            if (paymentsData.data && paymentsData.data.length > 0) {
                paymentId = paymentsData.data[0].id
            }
        }

        // 4. Save to database
        const { data: insertedPayment, error: dbError } = await supabaseClient
            .from('payments')
            .insert({
                user_id: user.id,
                plan,
                amount: value,
                method,
                status: subData.status, // Usually 'ACTIVE' for CC or 'PENDING'
                asaas_payment_id: paymentId,
                asaas_subscription_id: subscriptionId,
                pix_qr_code: pixQRCodeText,
                // pix_expiration: ... // Could extract from payment details
            })
            .select()
            .single()

        if (dbError) throw dbError

        // 5. Grant access immediately if active or confirmed
        const validStatuses = ['ACTIVE', 'CONFIRMED', 'RECEIVED'];
        if (validStatuses.includes(subData.status)) {
            const expirationDate = new Date()
            expirationDate.setMonth(expirationDate.getMonth() + 1)

            const { error: updateUserError } = await supabaseClient
                .from('users')
                .upsert({
                    id: user.id,
                    email: user.email,
                    status: 'ativo',
                    plano_ativo: plan, // STARTER or PRO
                    prompts_used: 0, // Reset or init prompts used
                    data_expiracao: expirationDate.toISOString()
                }, { onConflict: 'id' })
                .eq('id', user.id)

            if (updateUserError) console.error('Error updating user status:', updateUserError)
        }

        return new Response(
            JSON.stringify({
                success: true,
                subscriptionId,
                paymentId,
                pixQrCodeBase64: pixQrCode,
                pixCopyPaste: pixQRCodeText,
                debugStatus: subData.status // Return status for debugging
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error(error)
        return new Response(
            JSON.stringify({
                error: error.message || 'An error occurred',
                details: JSON.stringify(error, Object.getOwnPropertyNames(error))
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
