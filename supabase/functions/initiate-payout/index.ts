import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const monerooApiKey = Deno.env.get('MONEROO_API_KEY')!

// Helper function for Moneroo payout API calls
async function initiateMonerooPayout(amount: number, phone: string, operator: string = "mtn", currency: string = "XOF") {
  const response = await fetch('https://api.moneroo.io/v1/payouts/initialize-payout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${monerooApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currency: currency,
      amount: amount,
      phone: phone,
      operator: operator,
      reference: `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Moneroo payout API error: ${errorText}`)
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
    const { transactionId, action, adminId } = await req.json()

    console.log('Payout request:', { transactionId, action, adminId })

    if (!transactionId || !action || !adminId) {
      throw new Error('Transaction ID, action and admin ID are required')
    }

    // Get transaction details
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single()

    if (fetchError || !transaction) {
      throw new Error('Transaction not found')
    }

    // Verify admin permissions
    const { data: adminRole } = await supabase.rpc('has_role', {
      _user_id: adminId,
      _role: 'admin'
    })

    if (!adminRole) {
      throw new Error('Unauthorized: Admin role required')
    }

    let result: any = { success: true }

    switch (action) {
      case 'confirm':
        // Confirm and initiate Moneroo payout
        if (transaction.status !== 'pending_admin_validation') {
          throw new Error('Transaction is not pending admin validation')
        }

        try {
          // Get mobile money details from destination wallet
          const destinationWallet = transaction.destination_wallet
          const phone = destinationWallet?.number || destinationWallet?.phone
          const operator = destinationWallet?.operator || 'mtn'

          if (!phone) {
            throw new Error('No phone number found for payout')
          }

          console.log(`Initiating payout: ${transaction.final_amount_fcfa} FCFA to ${phone}`)

          // Initiate Moneroo payout
          const payoutResponse = await initiateMonerooPayout(
            parseFloat(transaction.final_amount_fcfa),
            phone,
            operator
          )

          console.log('Moneroo payout response:', payoutResponse)

          if (payoutResponse.transaction_id || payoutResponse.success) {
            // Update transaction as completed
            const { error: updateError } = await supabase
              .from('transactions')
              .update({
                status: 'completed',
                processed_by: adminId,
                processed_at: new Date().toISOString(),
                admin_notes: `Payout confirmé et exécuté - Transaction ID: ${payoutResponse.transaction_id || 'N/A'}`,
                updated_at: new Date().toISOString()
              })
              .eq('id', transactionId)

            if (updateError) {
              throw new Error(`Failed to update transaction: ${updateError.message}`)
            }

            result = {
              success: true,
              message: 'Payout Mobile Money confirmé et exécuté',
              moneroo_response: payoutResponse
            }
          } else {
            throw new Error(`Moneroo payout failed: ${JSON.stringify(payoutResponse)}`)
          }

        } catch (payoutError) {
          console.error('Payout initiation failed:', payoutError)
          
          // Detect if it's a balance issue
          const errorMessage = payoutError instanceof Error ? payoutError.message : 'Unknown error'
          let failureReason = 'Payout failed'
          
          if (errorMessage.toLowerCase().includes('insufficient') || 
              errorMessage.toLowerCase().includes('balance') ||
              errorMessage.toLowerCase().includes('solde')) {
            failureReason = 'Solde insuffisant'
          }

          // Update transaction as failed
          const { error: updateError } = await supabase
            .from('transactions')
            .update({
              status: 'failed',
              processed_by: adminId,
              processed_at: new Date().toISOString(),
              admin_notes: `${failureReason}: ${errorMessage} - Peut être relancé`,
              updated_at: new Date().toISOString()
            })
            .eq('id', transactionId)

          if (updateError) {
            console.error('Failed to update failed transaction:', updateError)
          }

          throw new Error(`Erreur Moneroo: ${errorMessage}`)
        }
        break

      case 'reject':
        // Reject transaction
        if (transaction.status !== 'pending_admin_validation') {
          throw new Error('Transaction is not pending admin validation')
        }

        const { error: rejectError } = await supabase
          .from('transactions')
          .update({
            status: 'rejected',
            processed_by: adminId,
            processed_at: new Date().toISOString(),
            admin_notes: `Transaction rejetée par admin le ${new Date().toLocaleString('fr-FR')}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionId)

        if (rejectError) {
          throw new Error(`Failed to reject transaction: ${rejectError.message}`)
        }

        result = {
          success: true,
          message: 'Transaction rejetée'
        }
        break

      case 'retry':
        // Retry failed payout
        if (!['failed', 'rejected'].includes(transaction.status)) {
          throw new Error('Can only retry failed or rejected transactions')
        }

        try {
          const destinationWallet = transaction.destination_wallet
          const phone = destinationWallet?.number || destinationWallet?.phone
          const operator = destinationWallet?.operator || 'mtn'

          if (!phone) {
            throw new Error('No phone number found for retry')
          }

          console.log(`Retrying payout: ${transaction.final_amount_fcfa} FCFA to ${phone}`)

          const retryResponse = await initiateMonerooPayout(
            parseFloat(transaction.final_amount_fcfa),
            phone,
            operator
          )

          console.log('Moneroo retry response:', retryResponse)

          if (retryResponse.transaction_id || retryResponse.success) {
            // Update transaction as completed
            const { error: updateError } = await supabase
              .from('transactions')
              .update({
                status: 'completed',
                processed_by: adminId,
                processed_at: new Date().toISOString(),
                admin_notes: `Payout relancé et réussi - Transaction ID: ${retryResponse.transaction_id || 'N/A'}`,
                updated_at: new Date().toISOString()
              })
              .eq('id', transactionId)

            if (updateError) {
              throw new Error(`Failed to update retry transaction: ${updateError.message}`)
            }

            result = {
              success: true,
              message: 'Payout relancé et réussi',
              moneroo_response: retryResponse
            }
          } else {
            throw new Error(`Moneroo retry failed: ${JSON.stringify(retryResponse)}`)
          }

        } catch (retryError) {
          console.error('Payout retry failed:', retryError)
          const errorMessage = retryError instanceof Error ? retryError.message : 'Unknown error'
          
          result = {
            success: false,
            message: `Échec retry: ${errorMessage}`
          }
        }
        break

      default:
        throw new Error(`Unsupported action: ${action}`)
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in initiate-payout function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})