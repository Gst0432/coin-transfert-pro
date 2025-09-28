import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PaymentData {
  transactionId: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
  transactionType: 'fcfa_to_usdt' | 'usdt_to_fcfa';
}

export function usePaymentIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const processMonerooPayment = async (paymentData: PaymentData) => {
    setIsLoading(true);
    try {
      // Processing Moneroo payment
      
      const { data, error } = await supabase.functions.invoke('process-moneroo-payment', {
        body: paymentData
      });

      if (error) {
        console.error('Moneroo payment error:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Payment processing failed');
      }

      toast({
        title: "Paiement initialisé",
        description: "Redirection vers la page de paiement Moneroo..."
      });

      // Redirect to checkout URL
      if (data.checkout_url) {
        window.open(data.checkout_url, '_blank');
      }

      return data;
    } catch (error) {
      console.error('Error processing Moneroo payment:', error);
      toast({
        title: "Erreur de paiement",
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const processNowPaymentsPayment = async (paymentData: PaymentData) => {
    setIsLoading(true);
    try {
      // Processing NOWPayments payment
      
      const { data, error } = await supabase.functions.invoke('process-nowpayments-payment', {
        body: paymentData
      });

      if (error) {
        console.error('NOWPayments payment error:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Payment processing failed');
      }

      toast({
        title: "Paiement crypto initialisé",
        description: "Redirection vers la page de paiement crypto..."
      });

      // Redirect to checkout URL
      if (data.checkout_url || data.payment_url) {
        window.open(data.checkout_url || data.payment_url, '_blank');
      }

      return data;
    } catch (error) {
      console.error('Error processing NOWPayments payment:', error);
      toast({
        title: "Erreur de paiement crypto",
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createTransaction = async (transactionData: {
    amount_fcfa: number;
    amount_usdt: number;
    exchange_rate: number;
    transaction_type: 'fcfa_to_usdt' | 'usdt_to_fcfa';
    source_wallet: any;
    destination_wallet: any;
    fees_fcfa?: number;
    fees_usdt?: number;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transactionData,
          user_id: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating transaction:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la transaction",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    processMonerooPayment,
    processNowPaymentsPayment,
    createTransaction,
    isLoading
  };
}