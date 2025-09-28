import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Calendar,
  ArrowUpDown,
  Clock, 
  Check, 
  X, 
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Eye,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PaginationCustom } from '@/components/ui/pagination-custom';

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

export default function History() {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL LOGIC
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Function definitions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
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

  const filterAndSortTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.admin_notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.transaction_type === typeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'date') {
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
      } else {
        aValue = a.transaction_type === 'fcfa_to_usdt' ? a.amount_fcfa : a.amount_usdt;
        bValue = b.transaction_type === 'fcfa_to_usdt' ? b.amount_fcfa : b.amount_usdt;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  // Effects - ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL LOGIC
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchTransactions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterAndSortTransactions();
  }, [transactions, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  const getStatusBadge = (status: Transaction['status']) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock, color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
      processing: { label: 'Traitement', variant: 'default' as const, icon: Clock, color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
      completed: { label: 'Complétée', variant: 'default' as const, icon: Check, color: 'bg-green-500/10 text-green-600 border-green-500/30' },
      rejected: { label: 'Rejetée', variant: 'destructive' as const, icon: X, color: 'bg-red-500/10 text-red-600 border-red-500/30' },
      failed: { label: 'Échouée', variant: 'destructive' as const, icon: AlertCircle, color: 'bg-red-500/10 text-red-600 border-red-500/30' },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={`gap-1 text-[11px] ${config.color}`}>
        <Icon className="w-2.5 h-2.5" />
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

  const getTypeIcon = (type: string) => {
    return type === 'fcfa_to_usdt' 
      ? <ArrowUp className="w-2.5 h-2.5 text-green-600" />
      : <ArrowDown className="w-2.5 h-2.5 text-blue-600" />;
  };

  // Pagination
  const paginationTotalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Stats
  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(t => t.status === 'completed').length;
  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-2 space-y-2 max-w-xs mx-auto">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="p-2 mb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-2 space-y-2 max-w-xs mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold text-foreground">Historique</h1>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-1 mb-2">
          <Card className="p-2 text-center">
            <div className="text-lg font-bold text-foreground">{totalTransactions}</div>
            <div className="text-[11px] text-muted-foreground">Total</div>
          </Card>
          <Card className="p-2 text-center">
            <div className="text-lg font-bold text-green-600">{completedTransactions}</div>
            <div className="text-[11px] text-muted-foreground">Complétées</div>
          </Card>
          <Card className="p-2 text-center">
            <div className="text-lg font-bold text-yellow-600">{pendingTransactions}</div>
            <div className="text-[11px] text-muted-foreground">En attente</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-2">
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 text-muted-foreground" />
              <Input
                placeholder="Rechercher par ID ou note..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-6 h-7 text-xs"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-7 text-[11px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="processing">En traitement</SelectItem>
                  <SelectItem value="completed">Complétées</SelectItem>
                  <SelectItem value="rejected">Rejetées</SelectItem>
                  <SelectItem value="failed">Échouées</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-7 text-[11px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="fcfa_to_usdt">FCFA → USDT</SelectItem>
                  <SelectItem value="usdt_to_fcfa">USDT → FCFA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-1">
              <Button
                variant={sortBy === 'date' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('date')}
                className="flex-1 h-7 px-2 text-[11px]"
              >
                <Calendar className="w-2.5 h-2.5 mr-1" />
                Date
              </Button>
              <Button
                variant={sortBy === 'amount' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('amount')}
                className="flex-1 h-7 px-2 text-[11px]"
              >
                <ArrowUpDown className="w-2.5 h-2.5 mr-1" />
                Montant
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="h-7 px-2 text-[11px]"
              >
                {sortOrder === 'asc' ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
              </Button>
            </div>
          </div>
        </Card>

        {/* Transaction List */}
        {filteredTransactions.length === 0 ? (
          <Card className="p-4 text-center">
            <h3 className="text-base font-medium text-foreground mb-1">
              Aucune transaction
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                ? "Aucune transaction ne correspond aux filtres sélectionnés."
                : "Vous n'avez pas encore effectué de transactions."
              }
            </p>
          </Card>
        ) : (
          <div className="space-y-1">
            {currentTransactions.map((transaction) => (
              <Card key={transaction.id} className="p-2">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-1">
                    {getTypeIcon(transaction.transaction_type)}
                    <div>
                      <h3 className="text-xs font-medium text-foreground">
                        {transaction.transaction_type === 'fcfa_to_usdt' ? 'FCFA → USDT' : 'USDT → FCFA'}
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusBadge(transaction.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTransaction(transaction)}
                      className="h-6 w-6 p-0"
                    >
                      <Eye className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] mb-1">
                  <div>
                    <p className="text-muted-foreground">Donné</p>
                    <p className="font-medium text-foreground">
                      {transaction.transaction_type === 'fcfa_to_usdt' 
                        ? `${transaction.amount_fcfa.toLocaleString()} FCFA`
                        : `${transaction.amount_usdt.toFixed(6)} USDT`
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reçu</p>
                    <p className="font-medium text-foreground">
                      {transaction.transaction_type === 'fcfa_to_usdt' 
                        ? `${transaction.final_amount_usdt?.toFixed(6) || 0} USDT`
                        : `${transaction.final_amount_fcfa?.toLocaleString() || 0} FCFA`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>ID: {transaction.id.slice(0, 8)}...</span>
                  <span>
                    Frais: {transaction.transaction_type === 'fcfa_to_usdt' 
                      ? `${transaction.fees_usdt} USDT`
                      : `${transaction.fees_fcfa.toLocaleString()} FCFA`
                    }
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-7 px-2 text-[11px]"
            >
              Précédent
            </Button>
            
            <span className="text-[11px] text-muted-foreground">
              Page {currentPage} sur {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-7 px-2 text-[11px]"
            >
              Suivant
            </Button>
          </div>
        )}

        {/* Transaction Detail Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 z-50">
            <Card className="w-full max-w-xs p-2 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold">Détails de la transaction</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTransaction(null)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-2.5 h-2.5" />
                </Button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-muted-foreground">ID de transaction</label>
                  <p className="text-xs font-mono">{selectedTransaction.id}</p>
                </div>

                <div>
                  <label className="text-[11px] text-muted-foreground">Type</label>
                  <p className="text-xs">{selectedTransaction.transaction_type === 'fcfa_to_usdt' ? 'FCFA → USDT' : 'USDT → FCFA'}</p>
                </div>

                <div>
                  <label className="text-[11px] text-muted-foreground">Statut</label>
                  <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-muted-foreground">Montant donné</label>
                    <p className="text-xs font-medium">
                      {selectedTransaction.transaction_type === 'fcfa_to_usdt' 
                        ? `${selectedTransaction.amount_fcfa.toLocaleString()} FCFA`
                        : `${selectedTransaction.amount_usdt.toFixed(8)} USDT`
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground">Montant reçu</label>
                    <p className="text-xs font-medium">
                      {selectedTransaction.transaction_type === 'fcfa_to_usdt' 
                        ? `${selectedTransaction.final_amount_usdt?.toFixed(8) || 0} USDT`
                        : `${selectedTransaction.final_amount_fcfa?.toLocaleString() || 0} FCFA`
                      }
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-muted-foreground">Taux de change</label>
                  <p className="text-xs">1 USD = {selectedTransaction.exchange_rate.toFixed(2)} FCFA</p>
                </div>

                <div>
                  <label className="text-[11px] text-muted-foreground">Frais</label>
                  <p className="text-xs">
                    {selectedTransaction.transaction_type === 'fcfa_to_usdt' 
                      ? `${selectedTransaction.fees_usdt} USDT`
                      : `${selectedTransaction.fees_fcfa.toLocaleString()} FCFA`
                    }
                  </p>
                </div>

                <div>
                  <label className="text-[11px] text-muted-foreground">Date de création</label>
                  <p className="text-xs">{formatDate(selectedTransaction.created_at)}</p>
                </div>

                <div>
                  <label className="text-[11px] text-muted-foreground">Dernière mise à jour</label>
                  <p className="text-xs">{formatDate(selectedTransaction.updated_at)}</p>
                </div>

                {selectedTransaction.admin_notes && (
                  <div>
                    <label className="text-[11px] text-muted-foreground">Notes administrateur</label>
                    <p className="text-xs bg-muted p-2 rounded text-foreground">{selectedTransaction.admin_notes}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}