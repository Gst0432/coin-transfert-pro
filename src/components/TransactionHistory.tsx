import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Check, X, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  transaction_type: 'fcfa_to_usdt' | 'usdt_to_fcfa';
  amount_fcfa: number;
  amount_usdt: number;
  exchange_rate: number;
  fees_fcfa: number;
  fees_usdt: number;
  final_amount_fcfa: number;
  final_amount_usdt: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'failed';
  source_wallet: any;
  destination_wallet: any;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
      processing: { label: 'En traitement', variant: 'default' as const, icon: Clock },
      completed: { label: 'Complétée', variant: 'default' as const, icon: Check },
      rejected: { label: 'Rejetée', variant: 'destructive' as const, icon: X },
      failed: { label: 'Échouée', variant: 'destructive' as const, icon: AlertCircle },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-lg font-medium text-foreground mb-2">
          Aucune transaction
        </h3>
        <p className="text-muted-foreground">
          Vous n'avez pas encore effectué de transactions.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground mb-4">
        Historique des transactions
      </h2>
      
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-medium text-foreground">
                {transaction.transaction_type === 'fcfa_to_usdt' ? 'FCFA → USDT' : 'USDT → FCFA'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(transaction.created_at)}
              </p>
            </div>
            {getStatusBadge(transaction.status)}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Montant donné</p>
              <p className="font-medium">
                {transaction.transaction_type === 'fcfa_to_usdt' 
                  ? `${transaction.amount_fcfa.toLocaleString()} FCFA`
                  : `${transaction.amount_usdt.toFixed(8)} USDT`
                }
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Montant reçu</p>
              <p className="font-medium">
                {transaction.transaction_type === 'fcfa_to_usdt' 
                  ? `${transaction.final_amount_usdt?.toFixed(8) || 0} USDT`
                  : `${transaction.final_amount_fcfa?.toLocaleString() || 0} FCFA`
                }
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Taux: 1 USD = {transaction.exchange_rate.toFixed(2)} FCFA
              </span>
              <span className="text-muted-foreground">
                Frais: {transaction.transaction_type === 'fcfa_to_usdt' 
                  ? `${transaction.fees_usdt} USDT`
                  : `${transaction.fees_fcfa.toLocaleString()} FCFA`
                }
              </span>
            </div>
          </div>

          {transaction.admin_notes && (
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Note admin:</p>
              <p className="text-sm">{transaction.admin_notes}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}