import { useState, useEffect } from 'react';
import { apiService } from '@/services/ApiService';
import { useToast } from '@/hooks/use-toast';

interface UnifiedTransaction {
  id: string;
  transaction_type: 'fcfa_to_usdt' | 'usdt_to_fcfa';
  amount_fcfa: number;
  amount_usdt: number;
  exchange_rate: number;
  fees_fcfa: number;
  fees_usdt: number;
  final_amount_fcfa?: number;
  final_amount_usdt?: number;
  source_wallet: any;
  destination_wallet: any;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
  user_id?: string;
  processed_at?: string;
  processed_by?: string;
  admin_notes?: string;
}

export const useUnifiedTransactions = () => {
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTransactions = async (params: any = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getTransactions(params);
      
      if (apiService.isSupabase()) {
        if (response.error) {
          throw new Error(response.error.message);
        }
        setTransactions(response.data || []);
      } else {
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch transactions');
        }
        setTransactions(response.data || []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTransaction = async (transactionData: Partial<UnifiedTransaction>) => {
    setIsLoading(true);
    
    try {
      const response = await apiService.createTransaction(transactionData);
      
      if (apiService.isSupabase()) {
        if (response.error) {
          throw new Error(response.error.message);
        }
        const newTransaction = response.data;
        setTransactions(prev => [newTransaction, ...prev]);
        toast({
          title: "Succès",
          description: "Transaction créée avec succès",
        });
        return newTransaction;
      } else {
        if (!response.success) {
          throw new Error(response.message || 'Failed to create transaction');
        }
        const newTransaction = response.data;
        setTransactions(prev => [newTransaction, ...prev]);
        toast({
          title: "Succès",
          description: "Transaction créée avec succès",
        });
        return newTransaction;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<UnifiedTransaction>) => {
    setIsLoading(true);

    try {
      const response = await apiService.updateTransaction(id, updates);
      
      if (apiService.isSupabase()) {
        if (response.error) {
          throw new Error(response.error.message);
        }
        const updatedTransaction = response.data;
        setTransactions(prev => 
          prev.map(t => t.id === id ? { ...t, ...updatedTransaction } : t)
        );
        return updatedTransaction;
      } else {
        if (!response.success) {
          throw new Error(response.message || 'Failed to update transaction');
        }
        const updatedTransaction = response.data;
        setTransactions(prev => 
          prev.map(t => t.id === id ? { ...t, ...updatedTransaction } : t)
        );
        return updatedTransaction;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const processPayment = async (transactionId: string, paymentMethod: 'moneroo' | 'nowpayments') => {
    setIsLoading(true);

    try {
      const response = await apiService.processPayment({
        transactionId,
        paymentMethod
      });

      if (apiService.isSupabase()) {
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        if (!response.data.success) {
          throw new Error(response.data.error || 'Payment processing failed');
        }

        // Redirect to checkout URL if provided
        if (response.data.checkoutUrl) {
          window.location.href = response.data.checkoutUrl;
        }

        return response.data;
      } else {
        if (!response.success) {
          throw new Error(response.message || 'Payment processing failed');
        }

        // Redirect to checkout URL if provided
        if (response.checkoutUrl) {
          window.location.href = response.checkoutUrl;
        }

        return response;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: "Erreur de paiement",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    processPayment,
    refetch: fetchTransactions
  };
};