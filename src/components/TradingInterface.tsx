import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Home, Briefcase, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TradingInterface() {
  const [amountFcfa, setAmountFcfa] = useState('1000');
  const [selectedNumber, setSelectedNumber] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [calculatedUsdt, setCalculatedUsdt] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  
  const RATE = 595.23; // 1 USD = 595.23 FCFA (approximatif du screenshot)
  const MIN_FCFA = 3000;
  const MIN_USD = 2;

  // Calculate conversion
  useEffect(() => {
    if (amountFcfa) {
      const fcfa = parseFloat(amountFcfa);
      const usd = fcfa / RATE;
      setCalculatedUsdt(usd);
    } else {
      setCalculatedUsdt(0);
    }
  }, [amountFcfa]);

  const handleConfirm = async () => {
    const fcfa = parseFloat(amountFcfa);
    if (isNaN(fcfa) || fcfa < MIN_FCFA) {
      toast({
        title: "Montant invalide",
        description: `Montant minimum : ${MIN_FCFA.toLocaleString()} FCFA`,
        variant: "destructive"
      });
      return;
    }

    if (!selectedNumber) {
      toast({
        title: "Numéro requis",
        description: "Veuillez sélectionner un numéro MoMo",
        variant: "destructive"
      });
      return;
    }

    if (!selectedAddress) {
      toast({
        title: "Adresse requise",
        description: "Veuillez sélectionner une adresse USD",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Transaction confirmée",
        description: "Votre transaction a été confirmée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header - Only visible on small screens */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-sm">
        <h1 className="text-xl font-semibold text-foreground">Achats & Ventes</h1>
      </div>
      
      {/* Content */}
      <div className="p-4 lg:p-8 space-y-6 max-w-4xl mx-auto">
        {/* Je Donne Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Je Donne</h2>
          
          <div className="relative">
            <div className="crypto-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">Je Donne (FCFA)</div>
                  <Input
                    type="number"
                    value={amountFcfa}
                    onChange={(e) => setAmountFcfa(e.target.value)}
                    className="text-4xl font-bold bg-transparent border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="0"
                  />
                </div>
                <div className="ml-4">
                  <Badge className="bg-primary/20 text-primary border border-primary/30 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        OM
                      </div>
                      <span className="font-semibold">OM Niger</span>
                    </div>
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-sm text-destructive mt-2">
              Montant minimum: {MIN_FCFA.toLocaleString()} FCFA
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-foreground font-medium">
              Renseignez votre Numéro MoMo (FCFA)
            </label>
            <Select value={selectedNumber} onValueChange={setSelectedNumber}>
              <SelectTrigger className="crypto-input h-14">
                <SelectValue placeholder="Sélectionnez un numéro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="+22770138031">+227 70 13 80 31</SelectItem>
                <SelectItem value="+22790123456">+227 90 12 34 56</SelectItem>
                <SelectItem value="+22791234567">+227 91 23 45 67</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Je Reçois Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Je Reçois</h2>
          
          <div className="relative">
            <div className="crypto-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">Je Reçois (USD)</div>
                  <div className="text-4xl font-bold text-foreground">
                    {calculatedUsdt > 0 ? calculatedUsdt.toFixed(8) : '0.00000000'}
                  </div>
                </div>
                <div className="ml-4">
                  <Badge className="bg-primary/20 text-primary border border-primary/30 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        $
                      </div>
                      <span className="font-semibold">VOLET (USD)</span>
                    </div>
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-sm text-destructive mt-2">
              Montant minimum: {MIN_USD} USD
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-foreground font-medium">
              Renseignez votre Adresse (USD)
            </label>
            <Select value={selectedAddress} onValueChange={setSelectedAddress}>
              <SelectTrigger className="crypto-input h-14">
                <SelectValue placeholder="Sélectionnez une adresse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="addr1">1A1zP1...4frfgt (Bitcoin)</SelectItem>
                <SelectItem value="addr2">0x742d...5A42C (Ethereum)</SelectItem>
                <SelectItem value="addr3">TKzxh8...9xKl2A (Tron)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full h-14 text-lg font-semibold bg-teal-500 hover:bg-teal-600 text-white rounded-xl"
          >
            {isLoading ? 'Traitement...' : 'Confirmer'}
          </Button>
        </div>
      </div>
    </div>
  );
}