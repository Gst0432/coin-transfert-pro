import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

async function getMonerooApiKey() {
  // Use the live API key directly
  const liveApiKey = Deno.env.get('MONEROO_LIVE_API_KEY');
  if (liveApiKey) {
    console.log('Using Moneroo Live API key');
    return liveApiKey;
  }
  
  // Fallback to sandbox key
  const sandboxKey = Deno.env.get('MONEROO_API_KEY');
  console.log('Using Moneroo Sandbox API key');
  return sandboxKey;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    if (req.method === 'POST') {
      const { 
        transactionId,
        amount,
        customerName = "Client Exchange",
        customerEmail = "client@example.com",
        customerPhone = "22700000000",
        description = "Transaction Exchange"
      } = await req.json()

      console.log('Creating Moneroo payment for transaction:', transactionId, {
        amount,
        customerName,
        customerEmail,
        customerPhone
      })

      // Get the Moneroo API key
      const monerooApiKey = await getMonerooApiKey();

      if (!monerooApiKey) {
        throw new Error('Moneroo API key not configured');
      }

      // Create Moneroo payment
      const monerooResponse = await fetch('https://api.moneroo.io/v1/payments/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${monerooApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'XOF', // West African CFA franc
          customer: {
            first_name: customerName?.split(' ')[0] || 'Client',
            last_name: customerName?.split(' ').slice(1).join(' ') || 'Exchange',
            email: customerEmail || 'client@exchange.com',
            phone: customerPhone?.replace(/[^\d]/g, '') || '22700000000' // Keep as string for international format
          },
          description: description || `Achat USDT - Transaction ${transactionId}`,
          metadata: {
            transaction_id: transactionId,
            service: 'exchange'
          },
          callback_url: `${supabaseUrl}/functions/v1/moneroo-webhook`,
          return_url: `${req.headers.get('origin') || 'https://coin-transfert-pro.lovable.app'}/success`,
          cancel_url: `${req.headers.get('origin') || 'https://coin-transfert-pro.lovable.app'}/cancel`
        })
      })

      if (!monerooResponse.ok) {
        const errorText = await monerooResponse.text()
        console.error('Moneroo API Error Response:', {
          status: monerooResponse.status,
          statusText: monerooResponse.statusText,
          body: errorText
        })
        
        // Try to parse error details
        let errorDetails = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorDetails = errorJson.message || errorText;
        } catch {
          // Keep original error text if not JSON
        }
        
        throw new Error(`Moneroo API Error: ${errorDetails}`)
      }

      const monerooData = await monerooResponse.json()
      console.log('Moneroo payment created:', monerooData)

      // Update transaction with Moneroo details
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          moneroo_payment_id: monerooData.data.reference,
          moneroo_checkout_url: monerooData.data.checkout_url,
          status: 'processing'
        })
        .eq('id', transactionId)

      if (updateError) {
        console.error('Error updating transaction:', updateError)
        throw updateError
      }

      return new Response(
        JSON.stringify({
          success: true,
          checkout_url: monerooData.data.checkout_url,
          payment_id: monerooData.data.reference
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in process-moneroo-payment function:', error)
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