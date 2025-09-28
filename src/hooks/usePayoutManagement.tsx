import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface PayoutAction {
  transactionId: string;
  action: 'confirm' | 'reject' | 'retry';
}

export const usePayoutManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handlePayoutAction = async (payoutData: PayoutAction) => {
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour effectuer cette action",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Processing payout action
      
      const { data, error } = await supabase.functions.invoke('initiate-payout', {
        body: {
          ...payoutData,
          adminId: user.id
        }
      });

      // Payout action completed

      if (error) {
        throw new Error(`Edge Function error: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Payout action failed');
      }

      // Success message based on action
      let successMessage = '';
      switch (payoutData.action) {
        case 'confirm':
          successMessage = 'Payout confirmé et exécuté avec succès';
          break;
        case 'reject':
          successMessage = 'Transaction rejetée avec succès';
          break;
        case 'retry':
          successMessage = 'Payout relancé avec succès';
          break;
      }

      toast({
        title: "Action réussie",
        description: successMessage,
      });

      return data;
    } catch (error) {
      console.error('Payout action error:', error);
      
      let errorMessage = 'Erreur inconnue';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Special handling for balance issues
      if (errorMessage.toLowerCase().includes('solde insuffisant')) {
        toast({
          title: "Solde insuffisant",
          description: "Le solde est insuffisant pour ce payout. La transaction a été marquée comme échouée et peut être relancée plus tard.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur de payout",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handlePayoutAction,
    isLoading
  };
};