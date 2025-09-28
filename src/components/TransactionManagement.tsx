import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Clock, 
  Check, 
  X, 
  AlertCircle, 
  Search,
  RefreshCw,
  Eye,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRetryPayment } from '@/hooks/useRetryPayment';

interface Transaction {
  id: string;
  user_id: string;
  transaction_type: 'fcfa_to_usdt' | 'usdt_to_fcfa';
  amount_fcfa: number;
  amount_usdt: number;
  exchange_rate: number;
  fees_fcfa: number;
  fees_usdt: number;
  final_amount_fcfa: number;
  final_amount_usdt: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'failed';
  moneroo_payment_id?: string;
  moneroo_checkout_url?: string;
  source_wallet: any;
  destination_wallet: any;
  admin_notes?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
  processing: { label: 'En traitement', variant: 'default' as const, icon: Clock },
  completed: { label: 'Complétée', variant: 'default' as const, icon: Check },
  rejected: { label: 'Rejetée', variant: 'destructive' as const, icon: X },
  failed: { label: 'Échouée', variant: 'destructive' as const, icon: AlertCircle },
};

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  
  const { toast } = useToast();
  const { retryPayment, isLoading: isRetrying } = useRetryPayment();

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, statusFilter, typeFilter]);

  const fetchTransactions = async () => {
    setIsLoading(true);
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
        description: "Impossible de charger les transactions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.moneroo_payment_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'failed,rejected') {
        // Filter for transactions that can be retried
        filtered = filtered.filter(transaction => 
          ['failed', 'rejected'].includes(transaction.status)
        );
      } else {
        filtered = filtered.filter(transaction => transaction.status === statusFilter);
      }
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.transaction_type === typeFilter);
    }

    setFilteredTransactions(filtered);
  };

  const handleTransactionAction = async (transactionId: string, action: 'approve' | 'reject', notes?: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const newStatus = action === 'approve' ? 'completed' : 'rejected';
      
      const { error } = await supabase
        .from('transactions')
        .update({
          status: newStatus,
          admin_notes: notes || null,
          processed_by: user.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;

      // Update local state
      setTransactions(prev => prev.map(transaction => 
        transaction.id === transactionId 
          ? { 
              ...transaction, 
              status: newStatus as any,
              admin_notes: notes || null,
              processed_by: user.id,
              processed_at: new Date().toISOString()
            }
          : transaction
      ));

      toast({
        title: "Transaction mise à jour",
        description: `Transaction ${action === 'approve' ? 'approuvée' : 'rejetée'} avec succès`,
      });

      setSelectedTransaction(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la transaction",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryPayment = async (transaction: Transaction) => {
    try {
      const paymentMethod = transaction.transaction_type === 'fcfa_to_usdt' ? 'moneroo' : 'nowpayments';
      
      await retryPayment({
        transactionId: transaction.id,
        paymentMethod: paymentMethod
      });

      // Refresh transactions after retry
      await fetchTransactions();
      
    } catch (error) {
      console.error('Failed to retry payment:', error);
    }
  };

  const canRetryTransaction = (transaction: Transaction) => {
    return ['failed', 'rejected'].includes(transaction.status);
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

  const formatWalletInfo = (wallet: any, type: 'source' | 'destination') => {
    if (!wallet) return 'N/A';
    
    if (wallet.type === 'mobile') {
      return `${wallet.operator} - ${wallet.phoneNumber}`;
    } else if (wallet.type === 'crypto') {
      const address = wallet.address || '';
      return `${wallet.network} - ${address.slice(0, 8)}...${address.slice(-4)}`;
    }
    
    return 'N/A';
  };

  // Statistics
  const stats = {
    total: transactions.length,
    processing: transactions.filter(t => t.status === 'processing').length,
    completed: transactions.filter(t => t.status === 'completed').length,
    rejected: transactions.filter(t => t.status === 'rejected').length,
    failed: transactions.filter(t => t.status === 'failed').length,
    canRetry: transactions.filter(t => ['failed', 'rejected'].includes(t.status)).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Transactions</h2>
          <p className="text-muted-foreground">Validez ou rejetez les transactions</p>
        </div>
        <Button 
          onClick={fetchTransactions} 
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="crypto-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="crypto-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/20 rounded-lg">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">En traitement</p>
              <p className="text-2xl font-bold text-foreground">{stats.processing}</p>
            </div>
          </div>
        </Card>

        <Card className="crypto-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/20 rounded-lg">
              <Check className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Complétées</p>
              <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
            </div>
          </div>
        </Card>

        <Card className="crypto-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/20 rounded-lg">
              <X className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rejetées</p>
              <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
            </div>
          </div>
        </Card>

        <Card className="crypto-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <RotateCcw className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">À relancer</p>
              <p className="text-2xl font-bold text-foreground">{stats.canRetry}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="crypto-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par ID transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="crypto-input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="crypto-input w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="processing">En traitement</SelectItem>
                <SelectItem value="completed">Complétées</SelectItem>
                <SelectItem value="rejected">Rejetées</SelectItem>
                <SelectItem value="failed">Échouées</SelectItem>
                <SelectItem value="failed,rejected">À relancer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="crypto-input w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="fcfa_to_usdt">FCFA → USDT</SelectItem>
                <SelectItem value="usdt_to_fcfa">USDT → FCFA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="crypto-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Taux</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => {
                const statusInfo = statusConfig[transaction.status];
                const StatusIcon = statusInfo.icon;
                
                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">
                      {transaction.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.transaction_type === 'fcfa_to_usdt' ? 'default' : 'secondary'}>
                        {transaction.transaction_type === 'fcfa_to_usdt' ? 'FCFA → USDT' : 'USDT → FCFA'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {transaction.transaction_type === 'fcfa_to_usdt' 
                            ? `${transaction.amount_fcfa.toLocaleString()} FCFA`
                            : `${transaction.amount_usdt.toFixed(8)} USDT`
                          }
                        </div>
                        <div className="text-muted-foreground">
                          → {transaction.transaction_type === 'fcfa_to_usdt' 
                            ? `${transaction.final_amount_usdt?.toFixed(8) || 0} USDT`
                            : `${transaction.final_amount_fcfa?.toLocaleString() || 0} FCFA`
                          }
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {transaction.exchange_rate.toFixed(2)} FCFA
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusIcon className="w-4 h-4" />
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(transaction.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setAdminNotes(transaction.admin_notes || '');
                              }}
                              className="text-xs"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Voir
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Détails de la transaction</DialogTitle>
                            </DialogHeader>
                            {selectedTransaction && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <Label className="font-medium">ID Transaction</Label>
                                    <p className="font-mono">{selectedTransaction.id}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Type</Label>
                                    <p>{selectedTransaction.transaction_type === 'fcfa_to_usdt' ? 'FCFA → USDT' : 'USDT → FCFA'}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Portefeuille source</Label>
                                    <p>{formatWalletInfo(selectedTransaction.source_wallet, 'source')}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Portefeuille destination</Label>
                                    <p>{formatWalletInfo(selectedTransaction.destination_wallet, 'destination')}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Montant donné</Label>
                                    <p>{selectedTransaction.transaction_type === 'fcfa_to_usdt' 
                                      ? `${selectedTransaction.amount_fcfa.toLocaleString()} FCFA`
                                      : `${selectedTransaction.amount_usdt.toFixed(8)} USDT`
                                    }</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Montant final</Label>
                                    <p>{selectedTransaction.transaction_type === 'fcfa_to_usdt' 
                                      ? `${selectedTransaction.final_amount_usdt?.toFixed(8) || 0} USDT`
                                      : `${selectedTransaction.final_amount_fcfa?.toLocaleString() || 0} FCFA`
                                    }</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Frais appliqués</Label>
                                    <p>{selectedTransaction.transaction_type === 'fcfa_to_usdt' 
                                      ? `${selectedTransaction.fees_usdt} USDT`
                                      : `${selectedTransaction.fees_fcfa.toLocaleString()} FCFA`
                                    }</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Taux de change</Label>
                                    <p>1 USD = {selectedTransaction.exchange_rate.toFixed(2)} FCFA</p>
                                  </div>
                                </div>

                                {selectedTransaction.moneroo_payment_id && (
                                  <div>
                                    <Label className="font-medium">ID Paiement Moneroo</Label>
                                    <p className="font-mono text-sm">{selectedTransaction.moneroo_payment_id}</p>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <Label htmlFor="admin-notes">Notes admin</Label>
                                  <Textarea
                                    id="admin-notes"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Ajouter une note..."
                                    rows={3}
                                  />
                                </div>

                                {selectedTransaction.status === 'processing' && (
                                  <div className="flex gap-2 pt-4">
                                    <Button
                                      onClick={() => handleTransactionAction(selectedTransaction.id, 'approve', adminNotes)}
                                      disabled={isLoading}
                                      className="flex-1 bg-success hover:bg-success/90"
                                    >
                                      <Check className="w-4 h-4 mr-2" />
                                      Approuver
                                    </Button>
                                    <Button
                                      onClick={() => handleTransactionAction(selectedTransaction.id, 'reject', adminNotes)}
                                      disabled={isLoading}
                                      variant="destructive"
                                      className="flex-1"
                                    >
                                      <X className="w-4 h-4 mr-2" />
                                      Rejeter
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {/* Bouton de relance pour les transactions échouées */}
                        {canRetryTransaction(transaction) && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleRetryPayment(transaction)}
                            disabled={isRetrying}
                            className="text-xs bg-warning hover:bg-warning/90 text-warning-foreground"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Relancer
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucune transaction trouvée
          </div>
        )}
      </Card>
    </div>
  );
}