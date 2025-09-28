import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    if (req.method === 'POST') {
      const webhookData = await req.json()
      console.log('Moneroo webhook received:', webhookData)

      const { reference, status, transaction_id } = webhookData
      
      // Find transaction by moneroo_payment_id or metadata
      const transactionId = transaction_id || webhookData.metadata?.transaction_id
      
      if (!transactionId) {
        console.error('No transaction ID found in webhook data')
        return new Response('Missing transaction ID', { status: 400 })
      }

      // Update transaction status based on Moneroo webhook
      let newStatus = 'processing'
      if (status === 'successful' || status === 'completed') {
        newStatus = 'processing' // Keep as processing until admin validates
      } else if (status === 'failed' || status === 'cancelled') {
        newStatus = 'failed'
      }

      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)

      if (updateError) {
        console.error('Error updating transaction:', updateError)
        throw updateError
      }

      console.log(`Transaction ${transactionId} updated to status: ${newStatus}`)

      return new Response('OK', { 
        status: 200,
        headers: corsHeaders 
      })
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('Error in moneroo-webhook function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})