
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

        const { paymentId } = await req.json()
        const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY')
        const ASAAS_BASE_URL = Deno.env.get('ASAAS_BASE_URL')

        if (!paymentId) {
            throw new Error('Payment ID is required')
        }

        // Check status in Asaas
        const response = await fetch(`${ASAAS_BASE_URL}/payments/${paymentId}`, {
            headers: { 'access_token': ASAAS_API_KEY! }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch payment status from Asaas')
        }

        const paymentData = await response.json()
        const status = paymentData.status // e.g., RECEIVED, CONFIRMED, OVERDUE, PENDING

        // Update payments table
        await supabaseClient
            .from('payments')
            .update({ status: status, paid_at: status === 'RECEIVED' || status === 'CONFIRMED' ? new Date().toISOString() : null })
            .eq('asaas_payment_id', paymentId)

        // Update user status if approved
        if (status === 'RECEIVED' || status === 'CONFIRMED') {
            // Find which plan this payment belongs to
            const { data: paymentRecord } = await supabaseClient
                .from('payments')
                .select('plan')
                .eq('asaas_payment_id', paymentId)
                .single()

            if (paymentRecord) {
                await supabaseClient
                    .from('users')
                    .update({
                        status: 'ativo',
                        plano_ativo: paymentRecord.plan,
                        data_expiracao: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString() // Rudimentary expiration logic
                    })
                    .eq('id', user.id)
            }
        }

        return new Response(
            JSON.stringify({ status }),
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
