import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const monerooApiKey = Deno.env.get('MONEROO_API_KEY')!

// Helper function for Moneroo API calls
async function monerooRequest(endpoint: string, data: any) {
  const response = await fetch(`https://api.moneroo.io/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${monerooApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Moneroo API error: ${errorText}`)
  }
  
  return await response.json()
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const payload = await req.json();
    console.log('NOWPayments webhook received:', payload);

    const { payment_status, order_id, payment_id, pay_amount } = payload;

    if (!order_id) {
      console.error('No order_id in webhook payload');
      return new Response('Missing order_id', { status: 400 });
    }

    // Get transaction details from database
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', order_id)
      .single()

    if (fetchError || !transaction) {
      console.error('Transaction not found:', order_id)
      return new Response('Transaction not found', { status: 404 })
    }

        // Handle USDT deposit confirmation (USDT → FCFA) - AUTO PAYOUT
        if (payment_status === 'finished' && transaction.transaction_type === 'usdt_to_fcfa') {
          console.log(`USDT deposit confirmed: ${pay_amount} USDT received for transaction ${order_id}`)

          // Get destination wallet info (phone number for Moneroo payout)
          const destinationWallet = transaction.destination_wallet;
          const phoneNumber = destinationWallet?.phone_number;
          const operator = destinationWallet?.operator || 'mtn';

          if (!phoneNumber) {
            console.error('No phone number found for FCFA payout');
            
            // Update transaction to require manual validation
            await supabase
              .from('transactions')
              .update({
                status: 'pending_admin_validation',
                admin_notes: `USDT reçu: ${pay_amount} USDT - Numéro de téléphone manquant, validation manuelle requise`,
                updated_at: new Date().toISOString()
              })
              .eq('id', order_id)
              
            return new Response('Phone number missing', { status: 400 })
          }

          // Calculate FCFA amount from received USDT
          const fcfaAmount = parseFloat(pay_amount) * transaction.exchange_rate;

          console.log(`Initiating automatic FCFA payout: ${fcfaAmount} FCFA to ${phoneNumber}`)

          try {
            // Automatic Moneroo payout
            const payout = await monerooRequest('payouts/initialize-payout', {
              currency: 'XOF',
              amount: fcfaAmount,
              phone: phoneNumber,
              operator: operator,
              reference: `payout_${order_id}`,
              callback_url: `${supabaseUrl}/functions/v1/moneroo-webhook`,
              metadata: {
                type: 'payout',
                transaction_id: order_id
              }
            });

            console.log('Automatic Moneroo payout initiated:', payout);

            // Update transaction status to processing
            const { error: updateError } = await supabase
              .from('transactions')
              .update({
                status: 'processing',
                admin_notes: `USDT reçu: ${pay_amount} USDT - Payout FCFA automatique initié (${fcfaAmount} FCFA)`,
                updated_at: new Date().toISOString()
              })
              .eq('id', order_id)

            if (updateError) {
              console.error('Error updating transaction:', updateError)
              throw updateError
            }

            console.log(`Transaction ${order_id} updated to processing - automatic FCFA payout initiated`)

          } catch (payoutError) {
            console.error('Error with automatic Moneroo payout:', payoutError)
            
            // Detect specific error types for better admin visibility
            const errorMessage = payoutError instanceof Error ? payoutError.message : 'Unknown error'
            let failureReason = 'Payout FCFA automatique échoué'
            
            // Check for common failure reasons
            if (errorMessage.toLowerCase().includes('solde insuffisant') || errorMessage.toLowerCase().includes('insufficient')) {
              failureReason = 'Solde insuffisant - Payout FCFA'
            } else if (errorMessage.toLowerCase().includes('balance')) {
              failureReason = 'Problème de solde - Payout FCFA'
            } else if (errorMessage.toLowerCase().includes('limit')) {
              failureReason = 'Limite dépassée - Payout FCFA'
            } else if (errorMessage.toLowerCase().includes('recipient') || errorMessage.toLowerCase().includes('phone')) {
              failureReason = 'Numéro invalide - Payout FCFA'
            }
            
            // Update transaction to require manual validation due to error
            await supabase
              .from('transactions')
              .update({
                status: 'pending_admin_validation',
                admin_notes: `USDT reçu: ${pay_amount} USDT - ${failureReason}: ${errorMessage} - Validation manuelle requise`,
                updated_at: new Date().toISOString()
              })
              .eq('id', order_id)
              
            console.log(`Transaction ${order_id} marked for manual validation - reason: ${failureReason}`)
          }
        }
    
    // Handle other payment statuses
    else {
      let transactionStatus = 'processing';
      let processedAt = null;

      switch (payment_status) {
        case 'finished':
        case 'confirmed':
          transactionStatus = 'completed';
          processedAt = new Date().toISOString();
          break;
        case 'failed':
        case 'refunded':
        case 'expired':
          transactionStatus = 'failed';
          break;
        case 'partially_paid':
        case 'waiting':
        case 'confirming':
        case 'sending':
          transactionStatus = 'processing';
          break;
        default:
          transactionStatus = 'pending';
      }

      // Update transaction in database
      const updateData: any = {
        status: transactionStatus,
        updated_at: new Date().toISOString()
      };

      if (processedAt) {
        updateData.processed_at = processedAt;
      }

      console.log('Updating transaction:', order_id, 'with status:', transactionStatus);

      const { error: updateError } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', order_id)

      if (updateError) {
        console.error('Error updating transaction:', updateError)
        throw updateError
      }

      console.log('Transaction updated successfully');
    }

    return new Response('OK', {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('Error processing NOWPayments webhook:', error);
    return new Response('Internal Server Error', {
      headers: corsHeaders,
      status: 500,
    });
  }
});