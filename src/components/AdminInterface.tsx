import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Settings,
  ShieldCheck,
  CreditCard,
  Wallet,
  Bell,
  Mail,
  Globe,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TransactionManagement from './TransactionManagement';
import AdminSettings from './AdminSettings';
import EmailConfiguration from './EmailConfiguration';
import FooterConfiguration from './FooterConfiguration';
import { AdminCredentialsManager } from './AdminCredentialsManager';
import { ApiKeysManager } from './ApiKeysManager';
import BrandingManager from './BrandingManager';
import { useBrandingSettings } from '@/hooks/useBrandingSettings';

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
  const { settings } = useBrandingSettings();
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header - Only visible on small screens */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-sm">
        <h1 className="text-xl font-semibold text-foreground">{settings.site_name} Admin</h1>
      </div>
      
      <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="hidden lg:flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {settings.site_name} - Administration
            </h1>
            <p className="text-muted-foreground">Gestion de la plateforme d'échange</p>
          </div>
        </div>

        {/* Tabs for Orders and Configuration */}
        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Identité
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="footer" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Footer
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Payouts
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          {/* Onglet Identité de marque */}
          <TabsContent value="branding">
            <BrandingManager />
          </TabsContent>

          {/* Onglet Configuration Email */}
          <TabsContent value="email">
            <EmailConfiguration />
          </TabsContent>

          {/* Onglet Configuration Footer */}
          <TabsContent value="footer">
            <FooterConfiguration />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="p-6 text-center text-muted-foreground">
              Module Commandes déplacé vers Transactions
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionManagement />
          </TabsContent>
          
          <TabsContent value="payouts" className="space-y-6">
            <div className="p-6 text-center text-muted-foreground">
              Module Payouts à venir...
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-6">
            <div className="p-6 text-center text-muted-foreground">
              Module Utilisateurs à venir...
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <div className="p-6 text-center text-muted-foreground">
              Module Notifications à venir...
            </div>
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <div className="space-y-6">
              <AdminCredentialsManager />
              <ApiKeysManager />
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Admin */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="text-center text-sm text-muted-foreground">
            Propulsé avec amour ❤️ par{' '}
            <a 
              href="https://gstartup.pro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              G-STARTUP
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}