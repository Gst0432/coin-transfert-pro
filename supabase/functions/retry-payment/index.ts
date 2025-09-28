import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { transactionId, paymentMethod } = await req.json();

    console.log('Retrying payment for transaction:', transactionId, 'method:', paymentMethod);

    if (!transactionId || !paymentMethod) {
      throw new Error('Transaction ID and payment method are required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get transaction details
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch transaction: ${fetchError.message}`);
    }

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Check if transaction can be retried
    if (!['failed', 'rejected'].includes(transaction.status)) {
      throw new Error(`Cannot retry transaction with status: ${transaction.status}`);
    }

    let result;

    if (paymentMethod === 'moneroo') {
      // Retry Moneroo payment (for FCFA transactions)
      result = await retryMonerooPayment(transaction);
    } else if (paymentMethod === 'nowpayments') {
      // Retry NOWPayments (for USDT transactions)
      result = await retryNowPaymentsPayment(transaction);
    } else {
      throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }

    // Update transaction status to processing with retry info
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: 'processing',
        admin_notes: `Relance manuelle par admin - ${new Date().toLocaleString('fr-FR')} - Motif: ${getRetryReason(transaction)}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);

    if (updateError) {
      console.error('Failed to update transaction status:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment retry initiated successfully',
        result: result
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error retrying payment:', error);
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

async function retryMonerooPayment(transaction: any) {
  console.log('Retrying Moneroo payment for transaction:', transaction.id);
  
  const monerooApiKey = Deno.env.get('MONEROO_API_KEY');
  if (!monerooApiKey) {
    throw new Error('MONEROO_API_KEY not configured');
  }

  // Get user info for Moneroo payment
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('display_name, phone_number')
    .eq('id', transaction.user_id)
    .single();

  if (profileError) {
    throw new Error(`Failed to get user profile: ${profileError.message}`);
  }

  // Create new Moneroo payment request
  const paymentData = {
    amount: transaction.amount_fcfa,
    currency: "XOF",
    description: `Retry - Achat ${transaction.amount_usdt} USDT - ${transaction.id}`,
    return_url: `${Deno.env.get('SITE_URL') || 'https://coin-transfert-pro.lovable.app'}/payment-success`,
    cancel_url: `${Deno.env.get('SITE_URL') || 'https://coin-transfert-pro.lovable.app'}/payment-cancel`,
    webhook_url: `https://bvleffevnnugjdwygqyz.supabase.co/functions/v1/moneroo-webhook`,
    customer: {
      email: `${transaction.user_id}@temp.com`,
      first_name: profile?.display_name?.split(' ')[0] || 'User',
      last_name: profile?.display_name?.split(' ').slice(1).join(' ') || 'Name',
    },
    metadata: {
      transaction_id: transaction.id,
      retry: true
    }
  };

  console.log('Creating Moneroo payment with data:', paymentData);

  const response = await fetch('https://api.moneroo.io/v1/payments/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${monerooApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  const result = await response.json();
  console.log('Moneroo retry API response:', result);

  if (!response.ok || !result.success) {
    throw new Error(`Moneroo retry API error: ${JSON.stringify(result)}`);
  }

  return {
    payment_id: result.data.payment.id,
    checkout_url: result.data.checkout_url
  };
}

async function retryNowPaymentsPayment(transaction: any) {
  console.log('Retrying NOWPayments for transaction:', transaction.id);
  
  const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
  if (!nowpaymentsApiKey) {
    throw new Error('NOWPAYMENTS_API_KEY not configured');
  }

  // Create new NOWPayments invoice
  const invoiceData = {
    price_amount: transaction.amount_usdt,
    price_currency: "usdttrc20",
    pay_currency: "usdttrc20",
    order_id: `${transaction.id}-retry-${Date.now()}`,
    order_description: `Retry - Vente ${transaction.amount_fcfa.toLocaleString()} FCFA - ${transaction.id}`,
    ipn_callback_url: `https://bvleffevnnugjdwygqyz.supabase.co/functions/v1/nowpayments-webhook`,
    success_url: `${Deno.env.get('SITE_URL') || 'https://coin-transfert-pro.lovable.app'}/wallet?status=success`,
    cancel_url: `${Deno.env.get('SITE_URL') || 'https://coin-transfert-pro.lovable.app'}/trading`,
  };

  console.log('Creating NOWPayments retry invoice with data:', invoiceData);

  const response = await fetch('https://api.nowpayments.io/v1/invoice', {
    method: 'POST',
    headers: {
      'x-api-key': nowpaymentsApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(invoiceData),
  });

  const result = await response.json();
  console.log('NOWPayments retry API response:', result);

  if (!response.ok) {
    throw new Error(`NOWPayments retry API error: ${JSON.stringify(result)}`);
  }

  return {
    invoice_id: result.id,
    payment_address: result.payment_address || result.order?.payment_address,
    invoice_url: result.invoice_url
  };
}

// Helper function to determine retry reason based on previous failure
function getRetryReason(transaction: any): string {
  const adminNotes = transaction.admin_notes || '';
  
  if (adminNotes.includes('Solde insuffisant')) {
    return 'Solde insuffisant résolu';
  } else if (adminNotes.includes('Problème de solde')) {
    return 'Problème de solde résolu';
  } else if (adminNotes.includes('Limite dépassée')) {
    return 'Limite rétablie';
  } else if (adminNotes.includes('mobile invalide')) {
    return 'Numéro mobile corrigé';
  } else if (adminNotes.includes('failed')) {
    return 'Erreur technique résolue';
  }
  
  return 'Nouvelle tentative manuelle';
}