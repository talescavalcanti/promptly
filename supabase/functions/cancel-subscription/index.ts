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
        // Client for auth (uses user's token)
        const supabaseAuth = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // Admin client for database updates (uses service role)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const {
            data: { user },
        } = await supabaseAuth.auth.getUser()

        if (!user) {
            throw new Error('User not authenticated')
        }

        console.log('Canceling subscription for user:', user.id)

        const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY')
        const ASAAS_BASE_URL = Deno.env.get('ASAAS_BASE_URL')

        // Get User Profile
        const { data: userProfile, error: profileError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileError || !userProfile) {
            throw new Error('User profile not found')
        }

        console.log('User profile found:', userProfile.plano_ativo, userProfile.status)

        const asaasCustomerId = userProfile.asaas_customer_id

        // If user has Asaas subscription, try to cancel it
        if (asaasCustomerId && ASAAS_API_KEY && ASAAS_BASE_URL) {
            console.log('Trying to cancel Asaas subscription for customer:', asaasCustomerId)

            try {
                const subscriptionsResponse = await fetch(
                    `${ASAAS_BASE_URL}/subscriptions?customer=${asaasCustomerId}&status=ACTIVE`,
                    {
                        headers: { 'access_token': ASAAS_API_KEY }
                    }
                )

                const subscriptionsData = await subscriptionsResponse.json()
                console.log('Asaas subscriptions:', subscriptionsData)

                if (subscriptionsData.data && subscriptionsData.data.length > 0) {
                    const subscriptionToCancel = subscriptionsData.data[0]
                    const subscriptionId = subscriptionToCancel.id

                    // Cancel in Asaas
                    const cancelResponse = await fetch(`${ASAAS_BASE_URL}/subscriptions/${subscriptionId}`, {
                        method: 'DELETE',
                        headers: {
                            'access_token': ASAAS_API_KEY,
                            'Content-Type': 'application/json'
                        }
                    })

                    const cancelData = await cancelResponse.json()
                    console.log('Asaas cancel response:', cancelData)

                    // Update payment record if exists
                    await supabaseAdmin
                        .from('payments')
                        .update({ status: 'CANCELED' })
                        .eq('asaas_subscription_id', subscriptionId)
                }
            } catch (asaasError) {
                console.error('Asaas cancellation error (continuing with DB update):', asaasError)
                // Continue to update database even if Asaas fails
            }
        }

        // ALWAYS update user status in database
        const { error: updateUserError } = await supabaseAdmin
            .from('users')
            .update({
                status: 'canceled'
                // Keep plano_ativo as is - they keep access until period ends
            })
            .eq('id', user.id)

        if (updateUserError) {
            console.error('Error updating user status:', updateUserError)
            throw new Error('Failed to update subscription status in database')
        }

        console.log('User status updated to canceled successfully')

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Subscription canceled successfully'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error('Error canceling subscription:', error)
        return new Response(
            JSON.stringify({
                error: error.message || 'An error occurred',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
