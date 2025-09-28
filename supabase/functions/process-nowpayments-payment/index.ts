import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transactionId, amount, customerEmail, description } = await req.json();

    console.log('Processing NOWPayments payment for transaction:', transactionId);

    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
    if (!nowpaymentsApiKey) {
      throw new Error('NOWPAYMENTS_API_KEY not configured');
    }

    // Create NOWPayments payment using standard API
    const paymentData = {
      price_amount: amount,
      price_currency: "USD",
      pay_currency: "USDT", // Use USDT exclusively as requested
      ipn_callback_url: `https://bvleffevnnugjdwygqyz.supabase.co/functions/v1/nowpayments-webhook`,
      order_id: transactionId,
      order_description: description || `Transaction Exchange - ${transactionId}`,
      success_url: `${req.headers.get('origin') || 'https://coin-transfert-pro.lovable.app'}/wallet?status=success`,
      cancel_url: `${req.headers.get('origin') || 'https://coin-transfert-pro.lovable.app'}/trading`,
    };

    console.log('Creating NOWPayments payment with data:', paymentData);

    const response = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'x-api-key': nowpaymentsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();
    console.log('NOWPayments API response:', result);

    if (!response.ok) {
      throw new Error(`NOWPayments API error: ${JSON.stringify(result)}`);
    }

    // Update transaction with NOWPayments payment ID
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/transactions?id=eq.${transactionId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
        },
        body: JSON.stringify({
          nowpayments_payment_id: result.payment_id,
          nowpayments_checkout_url: result.payment_url || result.invoice_url,
          status: 'processing'
        }),
      }
    );

    if (!updateResponse.ok) {
      console.error('Failed to update transaction:', await updateResponse.text());
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: result.payment_id,
        payment_url: result.payment_url || result.invoice_url,
        checkout_url: result.payment_url || result.invoice_url
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing NOWPayments payment:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});