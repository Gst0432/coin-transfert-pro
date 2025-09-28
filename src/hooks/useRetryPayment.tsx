import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RetryPaymentData {
  transactionId: string;
  paymentMethod: 'moneroo' | 'nowpayments';
}

export const useRetryPayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const retryPayment = async (retryData: RetryPaymentData) => {
    setIsLoading(true);
    
    try {
      // Retrying payment
      
      const { data, error } = await supabase.functions.invoke('retry-payment', {
        body: retryData
      });

      // Payment retry completed

      if (error) {
        throw new Error(`Edge Function error: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Payment retry failed');
      }

      toast({
        title: "Relance initiée",
        description: `La relance du paiement a été lancée avec succès`,
      });

      return data.result;
    } catch (error) {
      console.error('Retry payment error:', error);
      toast({
        title: "Erreur de relance",
        description: error instanceof Error ? error.message : 'Erreur inconnue',
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    retryPayment,
    isLoading
  };
};