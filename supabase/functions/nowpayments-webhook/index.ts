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
    const payload = await req.json();
    console.log('NOWPayments webhook received:', payload);

    const { payment_status, order_id, payment_id } = payload;

    if (!order_id) {
      console.error('No order_id in webhook payload');
      return new Response('Missing order_id', { status: 400 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Update transaction status based on payment status
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
    };

    if (processedAt) {
      updateData.processed_at = processedAt;
    }

    console.log('Updating transaction:', order_id, 'with status:', transactionStatus);

    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/transactions?id=eq.${order_id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Failed to update transaction:', errorText);
      throw new Error(`Failed to update transaction: ${errorText}`);
    }

    console.log('Transaction updated successfully');

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