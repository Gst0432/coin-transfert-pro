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

    // Handle USDT deposit confirmation (USDT → FCFA)
    if (payment_status === 'finished' && transaction.transaction_type === 'usdt_to_fcfa') {
      console.log(`Processing FCFA payout for USDT sale: ${pay_amount} USDT received`)

      // Get app settings for exchange rate
      const { data: settings } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'exchange_rate')
        .single()

      const exchangeRate = settings?.setting_value?.rate || 650
      const fcfaAmount = parseFloat(pay_amount) * exchangeRate

      // Get destination wallet (mobile money number)
      const mobileNumber = transaction.destination_wallet?.number || transaction.destination_wallet?.address

      if (!mobileNumber) {
        console.error('No mobile number found for FCFA payout')
        await supabase
          .from('transactions')
          .update({
            status: 'failed',
            admin_notes: 'No mobile number found for FCFA payout',
            updated_at: new Date().toISOString()
          })
          .eq('id', order_id)
        
        return new Response('No mobile number found', { status: 400 })
      }

      try {
        // Send FCFA via Moneroo transfer
        const transfer = await monerooRequest('transfer', {
          amount: fcfaAmount,
          currency: 'XOF',
          recipient: mobileNumber,
          callback_url: `${supabaseUrl}/functions/v1/moneroo-webhook`,
          metadata: {
            type: 'payout',
            transaction_id: order_id
          }
        })

        console.log('Moneroo transfer created:', transfer)

        // Update transaction status to processing
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: 'processing',
            updated_at: new Date().toISOString()
          })
          .eq('id', order_id)

        if (updateError) {
          console.error('Error updating transaction:', updateError)
          throw updateError
        }

        console.log(`Transaction ${order_id} updated to processing - FCFA transfer initiated`)

      } catch (transferError) {
        console.error('Error creating Moneroo transfer:', transferError)
        
        // Detect specific error types for better admin visibility
        const errorMessage = transferError instanceof Error ? transferError.message : 'Unknown error'
        let failureReason = 'FCFA transfer failed'
        
        // Check for common failure reasons
        if (errorMessage.toLowerCase().includes('insufficient')) {
          failureReason = 'Solde insuffisant - FCFA transfer'
        } else if (errorMessage.toLowerCase().includes('balance')) {
          failureReason = 'Problème de solde - FCFA transfer'
        } else if (errorMessage.toLowerCase().includes('limit')) {
          failureReason = 'Limite dépassée - FCFA transfer'
        } else if (errorMessage.toLowerCase().includes('recipient')) {
          failureReason = 'Numéro mobile invalide - FCFA transfer'
        }
        
        // Update transaction as failed with detailed reason
        await supabase
          .from('transactions')
          .update({
            status: 'failed',
            admin_notes: `${failureReason}: ${errorMessage} - Peut être relancé`,
            updated_at: new Date().toISOString()
          })
          .eq('id', order_id)
          
        console.log(`Transaction ${order_id} marked as failed - reason: ${failureReason}`)
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