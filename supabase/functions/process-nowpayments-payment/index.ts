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
    const { transactionId, amount, customerEmail, description, subPartnerId } = await req.json();

    console.log('Processing NOWPayments write-off for transaction:', transactionId);

    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
    if (!nowpaymentsApiKey) {
      throw new Error('NOWPAYMENTS_API_KEY not configured');
    }

    // Use NOWPayments write-off API to transfer funds from sub-partner account
    const writeOffData = {
      currency: "usdt", // Use USDT exclusively as requested
      amount: amount,
      sub_partner_id: subPartnerId || "1631380403" // Default sub-partner ID or from request
    };

    console.log('Creating NOWPayments write-off with data:', writeOffData);

    const response = await fetch('https://api.nowpayments.io/v1/sub-partner/write-off', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${nowpaymentsApiKey}`,
        'x-api-key': nowpaymentsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(writeOffData),
    });

    const result = await response.json();
    console.log('NOWPayments write-off API response:', result);

    if (!response.ok) {
      throw new Error(`NOWPayments write-off API error: ${JSON.stringify(result)}`);
    }

    // Update transaction with NOWPayments write-off transfer ID
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const transferResult = result.result || result;
    
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
          nowpayments_payment_id: transferResult.id,
          nowpayments_checkout_url: null, // No checkout URL for write-off transfers
          status: transferResult.status === 'WAITING' ? 'processing' : 
                  transferResult.status === 'COMPLETED' ? 'completed' : 
                  transferResult.status === 'REJECTED' ? 'failed' : 'processing'
        }),
      }
    );

    if (!updateResponse.ok) {
      console.error('Failed to update transaction:', await updateResponse.text());
    }

    return new Response(
      JSON.stringify({
        success: true,
        transfer_id: transferResult.id,
        transfer_status: transferResult.status,
        amount: transferResult.amount,
        currency: transferResult.currency,
        from_sub_id: transferResult.from_sub_id,
        to_sub_id: transferResult.to_sub_id,
        created_at: transferResult.created_at,
        updated_at: transferResult.updated_at
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