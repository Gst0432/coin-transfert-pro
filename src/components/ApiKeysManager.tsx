import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Key, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function ApiKeysManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [showKeys, setShowKeys] = useState({
    moneroo: false,
    monerooLive: false,
    nowpayments: false
  });
  
  const [apiKeys, setApiKeys] = useState({
    moneroo: '',
    monerooLive: '',
    nowpayments: ''
  });

  const { toast } = useToast();
  const { user } = useAuth();

  const handleInputChange = (key: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
  };

  const toggleVisibility = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleUpdateApiKeys = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer cette action",
        variant: "destructive",
      });
      return;
    }

    // Valider que au moins une clé est fournie
    const hasKeys = Object.values(apiKeys).some(key => key.trim().length > 0);
    if (!hasKeys) {
      toast({
        title: "Erreur",
        description: "Veuillez fournir au moins une clé API",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('update-api-keys', {
        body: {
          adminId: user.id,
          apiKeys: {
            moneroo: apiKeys.moneroo.trim() || null,
            monerooLive: apiKeys.monerooLive.trim() || null,
            nowpayments: apiKeys.nowpayments.trim() || null
          }
        }
      });

      if (error) {
        throw new Error(`Erreur de fonction: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la mise à jour des clés API');
      }

      toast({
        title: "Succès",
        description: "Clés API mises à jour avec succès",
      });

      // Réinitialiser les champs
      setApiKeys({
        moneroo: '',
        monerooLive: '',
        nowpayments: ''
      });

    } catch (error: any) {
      console.error('Erreur lors de la mise à jour des clés API:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour les clés API",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Gestion des Clés API
        </CardTitle>
        <CardDescription>
          Modifiez les clés API pour les services de paiement. Les clés existantes seront remplacées uniquement si vous en fournissez de nouvelles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Moneroo API Key (Sandbox) */}
        <div className="space-y-2">
          <Label htmlFor="moneroo-key">Clé API Moneroo (Sandbox)</Label>
          <div className="relative">
            <Input
              id="moneroo-key"
              type={showKeys.moneroo ? "text" : "password"}
              value={apiKeys.moneroo}
              onChange={(e) => handleInputChange('moneroo', e.target.value)}
              placeholder="Entrez la nouvelle clé API Moneroo (sandbox)"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => toggleVisibility('moneroo')}
            >
              {showKeys.moneroo ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Utilisée pour les tests et le développement
          </p>
        </div>

        {/* Moneroo Live API Key */}
        <div className="space-y-2">
          <Label htmlFor="moneroo-live-key">Clé API Moneroo (Production)</Label>
          <div className="relative">
            <Input
              id="moneroo-live-key"
              type={showKeys.monerooLive ? "text" : "password"}
              value={apiKeys.monerooLive}
              onChange={(e) => handleInputChange('monerooLive', e.target.value)}
              placeholder="Entrez la nouvelle clé API Moneroo (production)"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => toggleVisibility('monerooLive')}
            >
              {showKeys.monerooLive ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Utilisée pour les transactions en production
          </p>
        </div>

        {/* NOWPayments API Key */}
        <div className="space-y-2">
          <Label htmlFor="nowpayments-key">Clé API NOWPayments</Label>
          <div className="relative">
            <Input
              id="nowpayments-key"
              type={showKeys.nowpayments ? "text" : "password"}
              value={apiKeys.nowpayments}
              onChange={(e) => handleInputChange('nowpayments', e.target.value)}
              placeholder="Entrez la nouvelle clé API NOWPayments"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => toggleVisibility('nowpayments')}
            >
              {showKeys.nowpayments ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Utilisée pour les paiements en cryptomonnaies
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleUpdateApiKeys}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isLoading ? 'Mise à jour...' : 'Mettre à jour les clés'}
          </Button>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">⚠️ Important</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Les clés API sont stockées de manière sécurisée dans Supabase</li>
            <li>• Seules les clés non-vides seront mises à jour</li>
            <li>• Les changements prendront effet immédiatement</li>
            <li>• Testez vos clés après les avoir mises à jour</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}