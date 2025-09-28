import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  type: 'buy' | 'sell';
  amount_fcfa: number;
  amount_usdt: number;
  network: string;
  address?: string;
  phone: string;
  momo_operator: string;
  status: 'created' | 'pending' | 'confirmed' | 'completed' | 'failed' | 'cancelled';
  created_at: number;
  customer_name?: string;
}

// Mock data
const mockOrders: Order[] = [
  {
    id: 'buy_a1b2c3',
    type: 'buy',
    amount_fcfa: 50000,
    amount_usdt: 75.76,
    network: 'TRC20',
    address: 'TKzxh8...9xKl2A',
    phone: '+22790123456',
    momo_operator: 'om',
    status: 'pending',
    created_at: Date.now() - 300000,
    customer_name: 'Amadou Diallo'
  },
  {
    id: 'sell_d4e5f6',
    type: 'sell',
    amount_fcfa: 132000,
    amount_usdt: 200,
    network: 'ERC20',
    phone: '+22791234567',
    momo_operator: 'mtn',
    status: 'confirmed',
    created_at: Date.now() - 600000,
    customer_name: 'Fatima Ba'
  },
  {
    id: 'buy_g7h8i9',
    type: 'buy',
    amount_fcfa: 25000,
    amount_usdt: 37.88,
    network: 'BEP20',
    address: '0x742d...A42C',
    phone: '+22792345678',
    momo_operator: 'moov',
    status: 'completed',
    created_at: Date.now() - 900000,
    customer_name: 'Ibrahim Kone'
  }
];

const statusConfig = {
  created: { label: 'Créé', variant: 'secondary' as const, icon: Clock },
  pending: { label: 'En attente', variant: 'default' as const, icon: Clock },
  confirmed: { label: 'Confirmé', variant: 'default' as const, icon: CheckCircle },
  completed: { label: 'Terminé', variant: 'default' as const, icon: CheckCircle },
  failed: { label: 'Échoué', variant: 'destructive' as const, icon: AlertCircle },
  cancelled: { label: 'Annulé', variant: 'secondary' as const, icon: AlertCircle }
};

export default function AdminInterface() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  // Filter orders
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(order => order.type === typeFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, typeFilter]);

  const handleOrderAction = async (orderId: string, action: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: action === 'complete' ? 'completed' : 'confirmed' as any }
          : order
      ));

      toast({
        title: "Action effectuée",
        description: `Commande ${orderId} mise à jour avec succès`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer l'action",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshOrders = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Données actualisées",
        description: "Liste des commandes mise à jour",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'actualiser les données",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Statistics
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    totalVolumeFCFA: orders.reduce((sum, o) => sum + o.amount_fcfa, 0),
    totalVolumeUSDT: orders.reduce((sum, o) => sum + o.amount_usdt, 0)
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Administration G-Transfert
            </h1>
            <p className="text-muted-foreground">Gestion des commandes et transactions</p>
          </div>
          <Button 
            onClick={refreshOrders} 
            disabled={isLoading}
            className="crypto-button-secondary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="crypto-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Commandes total</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
              </div>
            </div>
          </Card>

          <Card className="crypto-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/20 rounded-lg">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-foreground">{stats.pendingOrders}</p>
              </div>
            </div>
          </Card>

          <Card className="crypto-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volume FCFA</p>
                <p className="text-xl font-bold text-foreground">
                  {stats.totalVolumeFCFA.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="crypto-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volume USDT</p>
                <p className="text-xl font-bold text-foreground">
                  {stats.totalVolumeUSDT.toFixed(2)}
                </p>
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
                  placeholder="Rechercher par ID, nom ou téléphone..."
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
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="confirmed">Confirmé</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="failed">Échoué</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="crypto-input w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="buy">Achat</SelectItem>
                  <SelectItem value="sell">Vente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Orders Table */}
        <Card className="crypto-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Réseau</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const statusInfo = statusConfig[order.status];
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-sm text-muted-foreground">{order.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.type === 'buy' ? 'default' : 'secondary'}>
                          {order.type === 'buy' ? 'Achat' : 'Vente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {order.amount_fcfa.toLocaleString()} FCFA
                          </div>
                          <div className="text-muted-foreground">
                            {order.amount_usdt.toFixed(6)} USDT
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.network}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-4 h-4" />
                          <Badge variant={statusInfo.variant} className="status-badge">
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <Button
                              size="sm"
                              onClick={() => handleOrderAction(order.id, 'complete')}
                              disabled={isLoading}
                              className="text-xs"
                            >
                              Terminer
                            </Button>
                          )}
                          {order.status === 'created' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOrderAction(order.id, 'confirm')}
                              disabled={isLoading}
                              className="text-xs"
                            >
                              Confirmer
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
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune commande trouvée
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}