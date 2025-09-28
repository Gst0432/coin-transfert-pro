import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

async function getMonerooApiKey(supabase: any) {
  // Get Moneroo configuration from app_settings
  const { data: settings, error } = await supabase
    .from('app_settings')
    .select('setting_value')
    .eq('setting_key', 'moneroo_config')
    .single();

  if (error || !settings) {
    console.error('Error fetching Moneroo config:', error);
    // Fallback to environment variable
    return Deno.env.get('MONEROO_API_KEY');
  }

  const config = settings.setting_value as any;
  const mode = config.mode || 'sandbox';
  
  if (mode === 'live') {
    return config.live_api_key || Deno.env.get('MONEROO_LIVE_API_KEY');
  } else {
    return config.sandbox_api_key || Deno.env.get('MONEROO_API_KEY');
  }
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
        customerName,
        customerEmail,
        customerPhone,
        description
      } = await req.json()

      console.log('Creating Moneroo payment for transaction:', transactionId)

      // Get the appropriate Moneroo API key
      const monerooApiKey = await getMonerooApiKey(supabase);

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
          currency: 'XOF',
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone
          },
          description: description || `Achat USDT - Transaction ${transactionId}`,
          metadata: {
            transaction_id: transactionId
          },
          callback_url: `${supabaseUrl}/functions/v1/moneroo-webhook`,
          return_url: `${supabaseUrl.replace('https://', 'https://app.')}/wallet?status=success`,
          cancel_url: `${supabaseUrl.replace('https://', 'https://app.')}/wallet?status=cancelled`
        })
      })

      if (!monerooResponse.ok) {
        const errorText = await monerooResponse.text()
        console.error('Moneroo API Error:', errorText)
        throw new Error(`Moneroo API Error: ${errorText}`)
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