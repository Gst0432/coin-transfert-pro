import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY')!

// Helper function for NOWPayments API calls
async function nowpaymentsRequest(endpoint: string, data: any) {
  const response = await fetch(`https://api.nowpayments.io/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'x-api-key': nowpaymentsApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`NOWPayments API error: ${errorText}`)
  }
  
  return await response.json()
}

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

      const { event, reference, status, metadata } = webhookData
      
      // Handle payment success for USDT purchase (FCFA → USDT)
      if (event === 'payment.success' && metadata?.type === 'buy') {
        const transactionId = metadata.transaction_id
        const usdtAmount = metadata.usdt_amount
        const usdtAddress = metadata.usdt_address

        if (!transactionId || !usdtAmount || !usdtAddress) {
          console.error('Missing required metadata for USDT payout')
          return new Response('Missing metadata', { status: 400 })
        }

        console.log(`Processing USDT payout: ${usdtAmount} USDT to ${usdtAddress}`)

        // Create NOWPayments payout to send USDT to client
        try {
          const payout = await nowpaymentsRequest('payout', {
            ipn_callback_url: `${supabaseUrl}/functions/v1/nowpayments-webhook`,
            currency: 'usdttrc20',
            addresses: [{
              address: usdtAddress,
              amount: parseFloat(usdtAmount)
            }]
          })

          console.log('NOWPayments payout created:', payout)

          // Update transaction status to processing
          const { error: updateError } = await supabase
            .from('transactions')
            .update({
              status: 'processing',
              updated_at: new Date().toISOString()
            })
            .eq('id', transactionId)

          if (updateError) {
            console.error('Error updating transaction:', updateError)
            throw updateError
          }

          console.log(`Transaction ${transactionId} updated to processing - USDT payout initiated`)

        } catch (payoutError) {
          console.error('Error creating NOWPayments payout:', payoutError)
          
          // Detect specific error types for better admin visibility
          const errorMessage = payoutError instanceof Error ? payoutError.message : 'Unknown error'
          let failureReason = 'USDT payout failed'
          
          // Check for common failure reasons
          if (errorMessage.toLowerCase().includes('insufficient')) {
            failureReason = 'Solde insuffisant - USDT payout'
          } else if (errorMessage.toLowerCase().includes('balance')) {
            failureReason = 'Problème de solde - USDT payout'
          } else if (errorMessage.toLowerCase().includes('limit')) {
            failureReason = 'Limite dépassée - USDT payout'
          }
          
          // Update transaction as failed with detailed reason
          await supabase
            .from('transactions')
            .update({
              status: 'failed',
              admin_notes: `${failureReason}: ${errorMessage} - Peut être relancé`,
              updated_at: new Date().toISOString()
            })
            .eq('id', transactionId)
            
          console.log(`Transaction ${transactionId} marked as failed - reason: ${failureReason}`)
        }
      }
      
      // Handle transfer success for FCFA payout (USDT → FCFA)
      else if (event === 'transfer.success' && metadata?.type === 'payout') {
        const transactionId = metadata.transaction_id
        
        if (!transactionId) {
          console.error('No transaction ID found in transfer webhook')
          return new Response('Missing transaction ID', { status: 400 })
        }

        // Update transaction as completed
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionId)

        if (updateError) {
          console.error('Error updating transaction:', updateError)
          throw updateError
        }

        console.log(`Transaction ${transactionId} completed - FCFA transfer successful`)
      }
      
      // Handle other webhook events (legacy support)
      else {
        const transactionId = reference || metadata?.transaction_id
        
        if (!transactionId) {
          console.error('No transaction ID found in webhook data')
          return new Response('Missing transaction ID', { status: 400 })
        }

        // Update transaction status based on Moneroo webhook
        let newStatus = 'processing'
        if (status === 'successful' || status === 'completed') {
          newStatus = 'processing'
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
      }

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