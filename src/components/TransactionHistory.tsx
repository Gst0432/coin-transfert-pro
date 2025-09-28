import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Check, X, AlertCircle, RefreshCw } from 'lucide-react';
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
      <Badge variant={config.variant} className="gap-1 text-[11px]">
        <Icon className="w-2.5 h-2.5" />
        {config.label}
      </Badge>
    );
  };

  const formatWalletInfo = (wallet: any) => {
    if (!wallet) return 'N/A';
    
    if (wallet.type === 'mobile') {
      const phone = wallet.phoneNumber || '';
      const operator = wallet.operator || '';
      return `${operator} - ${phone.slice(0, 8)}***${phone.slice(-2)}`;
    } else if (wallet.type === 'crypto') {
      const address = wallet.address || '';
      const network = wallet.network || '';
      return `${network} - ${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    
    return 'N/A';
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
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-foreground">
          Historique récent
        </h2>
        <Button
          onClick={fetchTransactions}
          variant="outline"
          size="sm"
          className="gap-1 h-7 px-2 text-[11px]"
        >
          <RefreshCw className="w-2.5 h-2.5" />
          Actualiser
        </Button>
      </div>
      
      {transactions.slice(0, 5).map((transaction) => (
        <Card key={transaction.id} className="p-2">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-xs font-medium text-foreground">
                {transaction.transaction_type === 'fcfa_to_usdt' ? 'FCFA → USDT' : 'USDT → FCFA'}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {formatDate(transaction.created_at)}
              </p>
            </div>
            {getStatusBadge(transaction.status)}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <p className="text-muted-foreground">Montant donné</p>
              <p className="font-medium">
                {transaction.transaction_type === 'fcfa_to_usdt' 
                  ? `${transaction.amount_fcfa.toLocaleString()} FCFA`
                  : `${transaction.amount_usdt.toFixed(6)} USDT`
                }
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Montant reçu</p>
              <p className="font-medium">
                {transaction.transaction_type === 'fcfa_to_usdt' 
                  ? `${transaction.final_amount_usdt?.toFixed(6) || 0} USDT`
                  : `${transaction.final_amount_fcfa?.toLocaleString() || 0} FCFA`
                }
              </p>
            </div>
          </div>

          <div className="mt-1 pt-1 border-t border-border">
            <div className="flex items-center justify-between text-[11px]">
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

          <div className="mt-1 text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source:</span>
              <span className="font-mono text-right">{formatWalletInfo(transaction.source_wallet)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Destination:</span>
              <span className="font-mono text-right">{formatWalletInfo(transaction.destination_wallet)}</span>
            </div>
          </div>

          {transaction.admin_notes && (
            <div className="mt-2 p-2 bg-muted rounded-lg">
              <p className="text-[11px] text-muted-foreground mb-1">Note admin:</p>
              <p className="text-[11px]">{transaction.admin_notes}</p>
            </div>
          )}
        </Card>
      ))}
      
      {transactions.length > 5 && (
        <div className="text-center pt-2">
          <p className="text-[11px] text-muted-foreground">
            {transactions.length - 5} transaction(s) de plus disponible(s) dans l'historique complet
          </p>
        </div>
      )}
    </div>
  );
}