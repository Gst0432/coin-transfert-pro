import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings,
  DollarSign,
  Percent,
  Globe,
  Shield,
  Save,
  RefreshCw,
  AlertTriangle,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppSettings } from '@/hooks/useAppSettings';

export default function AdminSettings() {
  const { settings, isLoading, updateMultipleSettings, refreshSettings } = useAppSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Sync local state when settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateMultipleSettings(localSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
    toast({
      title: "Modifications annulées",
      description: "Les paramètres ont été restaurés",
    });
  };

  const updateLocalSetting = (key: keyof typeof settings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configuration Plateforme</h2>
          <p className="text-muted-foreground">
            Gérez les paramètres globaux de votre plateforme d'échange
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={settings.platform_active ? 'default' : 'destructive'}>
            {settings.platform_active ? 'Actif' : 'Maintenance'}
          </Badge>
          
          <Button onClick={handleReset} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {/* Platform Status Alert */}
      {!settings.platform_active && (
        <Card className="crypto-card border-destructive bg-destructive/5">
          <div className="flex items-center gap-3 p-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Plateforme en maintenance</p>
              <p className="text-sm text-muted-foreground">{settings.maintenance_message}</p>
            </div>
          </div>
        </Card>
      )}

      <Tabs defaultValue="rates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="rates">Taux & Frais</TabsTrigger>
          <TabsTrigger value="limits">Limites</TabsTrigger>
          <TabsTrigger value="urls">URLs & Webhooks</TabsTrigger>
          <TabsTrigger value="platform">Plateforme</TabsTrigger>
          <TabsTrigger value="email">Email & Sécurité</TabsTrigger>
        </TabsList>

        {/* Taux et Frais */}
        <TabsContent value="rates" className="space-y-4">
          <Card className="crypto-card">
            <div className="flex items-center gap-3 p-4 border-b">
              <DollarSign className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Taux de Conversion</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="usdt_rate">Taux USDT → FCFA</Label>
                  <Input
                    id="usdt_rate"
                    type="number"
                    step="0.01"
                    value={localSettings.usdt_to_xof_rate}
                    onChange={(e) => updateLocalSetting('usdt_to_xof_rate', parseFloat(e.target.value))}
                    className="crypto-input"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    1 USDT = {localSettings.usdt_to_xof_rate} FCFA
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="crypto-card">
            <div className="flex items-center gap-3 p-4 border-b">
              <Percent className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Frais de Transaction</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="moneroo_fee">Frais Moneroo (%)</Label>
                  <Input
                    id="moneroo_fee"
                    type="number"
                    step="0.1"
                    value={localSettings.moneroo_gateway_fee_percentage}
                    onChange={(e) => updateLocalSetting('moneroo_gateway_fee_percentage', parseFloat(e.target.value))}
                    className="crypto-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="moneroo_fixed">Frais Moneroo Fixe (FCFA)</Label>
                  <Input
                    id="moneroo_fixed"
                    type="number"
                    value={localSettings.moneroo_fixed_fee}
                    onChange={(e) => updateLocalSetting('moneroo_fixed_fee', parseFloat(e.target.value))}
                    className="crypto-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="nowpayments_fee">Frais NOWPayments (USDT)</Label>
                  <Input
                    id="nowpayments_fee"
                    type="number"
                    step="0.1"
                    value={localSettings.nowpayments_fee_usdt}
                    onChange={(e) => updateLocalSetting('nowpayments_fee_usdt', parseFloat(e.target.value))}
                    className="crypto-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="mobile_fee">Frais Mobile Money (%)</Label>
                  <Input
                    id="mobile_fee"
                    type="number"
                    step="0.1"
                    value={localSettings.mobile_money_fee_percentage}
                    onChange={(e) => updateLocalSetting('mobile_money_fee_percentage', parseFloat(e.target.value))}
                    className="crypto-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="withdrawal_fee">Frais Retrait USDT</Label>
                  <Input
                    id="withdrawal_fee"
                    type="number"
                    step="0.1"
                    value={localSettings.usdt_withdrawal_fee}
                    onChange={(e) => updateLocalSetting('usdt_withdrawal_fee', parseFloat(e.target.value))}
                    className="crypto-input"
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Limites */}
        <TabsContent value="limits" className="space-y-4">
          <Card className="crypto-card">
            <div className="flex items-center gap-3 p-4 border-b">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Montants Minimum</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_usdt">Minimum USDT</Label>
                  <Input
                    id="min_usdt"
                    type="number"
                    step="0.1"
                    value={localSettings.min_usdt}
                    onChange={(e) => updateLocalSetting('min_usdt', parseFloat(e.target.value))}
                    className="crypto-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="min_fcfa">Minimum FCFA</Label>
                  <Input
                    id="min_fcfa"
                    type="number"
                    value={localSettings.min_fcfa}
                    onChange={(e) => updateLocalSetting('min_fcfa', parseFloat(e.target.value))}
                    className="crypto-input"
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* URLs & Webhooks */}
        <TabsContent value="urls" className="space-y-4">
          <Card className="crypto-card">
            <div className="flex items-center gap-3 p-4 border-b">
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">URLs et Webhooks</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <Label htmlFor="webhook_moneroo">Webhook Moneroo</Label>
                <Input
                  id="webhook_moneroo"
                  value={localSettings.webhook_moneroo_url}
                  onChange={(e) => updateLocalSetting('webhook_moneroo_url', e.target.value)}
                  className="crypto-input font-mono text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="webhook_nowpayments">Webhook NOWPayments</Label>
                <Input
                  id="webhook_nowpayments"
                  value={localSettings.webhook_nowpayments_url}
                  onChange={(e) => updateLocalSetting('webhook_nowpayments_url', e.target.value)}
                  className="crypto-input font-mono text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="success_url">URL de Succès</Label>
                <Input
                  id="success_url"
                  value={localSettings.success_url}
                  onChange={(e) => updateLocalSetting('success_url', e.target.value)}
                  className="crypto-input font-mono text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="cancel_url">URL d'Annulation</Label>
                <Input
                  id="cancel_url"
                  value={localSettings.cancel_url}
                  onChange={(e) => updateLocalSetting('cancel_url', e.target.value)}
                  className="crypto-input font-mono text-sm"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Plateforme */}
        <TabsContent value="platform" className="space-y-4">
          <Card className="crypto-card">
            <div className="flex items-center gap-3 p-4 border-b">
              <Settings className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Statut de la Plateforme</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="platform_active">Plateforme Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Désactivez pour mettre la plateforme en maintenance
                  </p>
                </div>
                <Switch
                  id="platform_active"
                  checked={localSettings.platform_active}
                  onCheckedChange={(checked) => updateLocalSetting('platform_active', checked)}
                />
              </div>
              
              <div>
                <Label htmlFor="maintenance_message">Message de Maintenance</Label>
                <Textarea
                  id="maintenance_message"
                  value={localSettings.maintenance_message}
                  onChange={(e) => updateLocalSetting('maintenance_message', e.target.value)}
                  placeholder="Message affiché lors de la maintenance..."
                  rows={3}
                  className="crypto-input"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Email & Sécurité */}
        <TabsContent value="email" className="space-y-4">
          <Card className="crypto-card">
            <div className="flex items-center gap-3 p-4 border-b">
              <Mail className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Configuration Email Resend</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label htmlFor="resend_api_key">Clé API Resend</Label>
                <Input
                  id="resend_api_key"
                  type="password"
                  value={localSettings.resend_api_key}
                  onChange={(e) => updateLocalSetting('resend_api_key', e.target.value)}
                  placeholder="re_xxxxxxxxxxxx"
                  className="crypto-input"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Clé API obtenue depuis votre tableau de bord Resend
                </p>
              </div>

              <div>
                <Label htmlFor="resend_from_email">Email d'expéditeur</Label>
                <Input
                  id="resend_from_email"
                  type="email"
                  value={localSettings.resend_from_email}
                  onChange={(e) => updateLocalSetting('resend_from_email', e.target.value)}
                  placeholder="noreply@votredomaine.com"
                  className="crypto-input"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Adresse email vérifiée dans Resend
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div>
                  <Label htmlFor="password_reset_enabled" className="text-base font-medium">
                    Réinitialisation de mot de passe
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Permettre aux utilisateurs de réinitialiser leur mot de passe par email
                  </p>
                </div>
                <Switch
                  id="password_reset_enabled"
                  checked={localSettings.password_reset_enabled}
                  onCheckedChange={(checked) => updateLocalSetting('password_reset_enabled', checked)}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}