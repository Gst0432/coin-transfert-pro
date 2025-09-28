import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRetryPayment } from '@/hooks/useRetryPayment';
import { usePayoutManagement } from '@/hooks/usePayoutManagement';
import { Search, RotateCcw, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw, Eye, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PaginationCustom } from '@/components/ui/pagination-custom';

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
  status: 'pending' | 'pending_admin_validation' | 'processing' | 'completed' | 'rejected' | 'failed';
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
  pending_admin_validation: { label: 'Validation admin', variant: 'default' as const, icon: AlertCircle },
  processing: { label: 'En traitement', variant: 'default' as const, icon: Clock },
  completed: { label: 'Complétée', variant: 'default' as const, icon: CheckCircle },
  rejected: { label: 'Rejetée', variant: 'destructive' as const, icon: XCircle },
  failed: { label: 'Échouée', variant: 'destructive' as const, icon: AlertCircle },
};

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [paginatedTransactions, setPaginatedTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  
  const { toast } = useToast();
  const { retryPayment, isLoading: isRetrying } = useRetryPayment();
  const { handlePayoutAction, isLoading: isProcessingPayout } = usePayoutManagement();

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    paginateTransactions();
  }, [filteredTransactions, currentPage, itemsPerPage]);

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
    setCurrentPage(1); // Reset to first page when filters change
  };

  const paginateTransactions = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedTransactions(filteredTransactions.slice(startIndex, endIndex));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
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

      toast({
        title: "Transaction mise à jour",
        description: `Transaction ${action === 'approve' ? 'approuvée' : 'rejetée'} avec succès`,
      });

      await fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la transaction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryPayment = async (transaction: Transaction) => {
    try {
      await retryPayment({
        transactionId: transaction.id,
        paymentMethod: 'moneroo'
      });

      toast({
        title: "Paiement relancé",
        description: "La transaction a été relancée avec succès",
      });

      await fetchTransactions();
    } catch (error) {
      console.error('Error retrying payment:', error);
      toast({
        title: "Erreur",
        description: "Impossible de relancer le paiement",
        variant: "destructive",
      });
    }
  };

  const handleConfirmPayout = async (transactionId: string) => {
    try {
      await handlePayoutAction({
        transactionId,
        action: 'confirm'
      });

      toast({
        title: "Payout confirmé",
        description: "Le payout a été confirmé avec succès",
      });

      await fetchTransactions();
    } catch (error) {
      console.error('Error confirming payout:', error);
      toast({
        title: "Erreur",
        description: "Impossible de confirmer le payout",
        variant: "destructive",
      });
    }
  };

  const handleRejectPayout = async (transactionId: string) => {
    try {
      await handlePayoutAction({
        transactionId,
        action: 'reject'
      });

      toast({
        title: "Payout rejeté",
        description: "Le payout a été rejeté",
      });

      await fetchTransactions();
    } catch (error) {
      console.error('Error rejecting payout:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le payout",
        variant: "destructive",
      });
    }
  };

  const handleRetryPayout = async (transactionId: string) => {
    try {
      await handlePayoutAction({
        transactionId,
        action: 'retry'
      });

      toast({
        title: "Payout relancé",
        description: "Le payout a été relancé",
      });

      await fetchTransactions();
    } catch (error) {
      console.error('Error retrying payout:', error);
      toast({
        title: "Erreur",
        description: "Impossible de relancer le payout",
        variant: "destructive",
      });
    }
  };

  const canRetryTransaction = (transaction: Transaction) => {
    return ['failed', 'rejected'].includes(transaction.status);
  };

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'FCFA') {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
      }).format(amount);
    } else {
      return `${amount.toFixed(2)} USDT`;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    return type === 'fcfa_to_usdt' ? 'FCFA → USDT' : 'USDT → FCFA';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Gestion des Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher par ID de transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="pending_admin_validation">Validation admin</SelectItem>
                <SelectItem value="processing">En traitement</SelectItem>
                <SelectItem value="completed">Complétée</SelectItem>
                <SelectItem value="failed,rejected">À relancer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="fcfa_to_usdt">FCFA → USDT</SelectItem>
                <SelectItem value="usdt_to_fcfa">USDT → FCFA</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchTransactions} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Transaction</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Taux</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((transaction) => {
                const statusInfo = statusConfig[transaction.status];
                const StatusIcon = statusInfo.icon;
                
                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">
                      {transaction.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTransactionTypeLabel(transaction.transaction_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {formatAmount(transaction.amount_fcfa, 'FCFA')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatAmount(transaction.amount_usdt, 'USDT')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">
                        {transaction.exchange_rate.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant} className="flex items-center gap-1 w-fit">
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* Dialog pour voir les détails */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedTransaction(transaction)}
                              className="text-xs"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Détails
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Détails de la transaction</DialogTitle>
                            </DialogHeader>
                            {selectedTransaction && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>ID Transaction</Label>
                                    <p className="font-mono text-sm">{selectedTransaction.id}</p>
                                  </div>
                                  <div>
                                    <Label>Type</Label>
                                    <p>{getTransactionTypeLabel(selectedTransaction.transaction_type)}</p>
                                  </div>
                                  <div>
                                    <Label>Montant FCFA</Label>
                                    <p>{formatAmount(selectedTransaction.amount_fcfa, 'FCFA')}</p>
                                  </div>
                                  <div>
                                    <Label>Montant USDT</Label>
                                    <p>{formatAmount(selectedTransaction.amount_usdt, 'USDT')}</p>
                                  </div>
                                  <div>
                                    <Label>Taux de change</Label>
                                    <p>{selectedTransaction.exchange_rate.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <Label>Statut</Label>
                                    <Badge variant={statusConfig[selectedTransaction.status].variant}>
                                      {statusConfig[selectedTransaction.status].label}
                                    </Badge>
                                  </div>
                                </div>
                                
                                {selectedTransaction.source_wallet && (
                                  <div>
                                    <Label>Portefeuille source</Label>
                                    <pre className="text-xs bg-muted p-2 rounded mt-1">
                                      {JSON.stringify(selectedTransaction.source_wallet, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                
                                {selectedTransaction.destination_wallet && (
                                  <div>
                                    <Label>Portefeuille destination</Label>
                                    <pre className="text-xs bg-muted p-2 rounded mt-1">
                                      {JSON.stringify(selectedTransaction.destination_wallet, null, 2)}
                                    </pre>
                                  </div>
                                )}

                                {selectedTransaction.admin_notes && (
                                  <div>
                                    <Label>Notes administrateur</Label>
                                    <p className="text-sm bg-muted p-2 rounded mt-1">
                                      {selectedTransaction.admin_notes}
                                    </p>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <Label htmlFor="adminNotes">Ajouter une note</Label>
                                  <Textarea
                                    id="adminNotes"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Ajouter une note administrative..."
                                    rows={3}
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleTransactionAction(selectedTransaction.id, 'approve', adminNotes)}
                                      disabled={isLoading}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="w-4 h-4 mr-1" />
                                      Approuver
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleTransactionAction(selectedTransaction.id, 'reject', adminNotes)}
                                      disabled={isLoading}
                                    >
                                      <X className="w-4 h-4 mr-1" />
                                      Rejeter
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {/* Actions rapides selon le statut */}
                        {transaction.status === 'pending_admin_validation' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleConfirmPayout(transaction.id)}
                              disabled={isProcessingPayout}
                              className="text-xs bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Confirmer
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectPayout(transaction.id)}
                              disabled={isProcessingPayout}
                              className="text-xs"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Rejeter
                            </Button>
                          </>
                        )}
                        
                        {/* Bouton de relance pour les transactions échouées */}
                        {canRetryTransaction(transaction) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (transaction.admin_notes?.includes('Solde insuffisant')) {
                                handleRetryPayout(transaction.id);
                              } else {
                                handleRetryPayment(transaction);
                              }
                            }}
                            disabled={isRetrying || isProcessingPayout}
                            className="text-xs"
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
        
        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="border-t px-4 py-4">
            <PaginationCustom
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredTransactions.length}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucune transaction trouvée
          </div>
        )}
      </Card>
    </div>
  );
}