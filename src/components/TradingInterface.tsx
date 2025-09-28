import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowDownUp, Smartphone, CreditCard, Shield, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderData {
  type: 'buy' | 'sell';
  amount_fcfa?: number;
  amount_usdt?: number;
  network: string;
  address?: string;
  phone_number?: string;
  payment_method: string;
  momo_operator?: string;
}

export default function TradingInterface() {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [amountFcfa, setAmountFcfa] = useState('');
  const [amountUsdt, setAmountUsdt] = useState('');
  const [network, setNetwork] = useState('TRC20');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [momoOperator, setMomoOperator] = useState('om');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  
  const { toast } = useToast();
  
  const RATE = 660; // 1 USDT = 660 FCFA
  const MIN_FCFA = 3000;
  const MIN_USDT = 2;

  // Calculate conversion
  useEffect(() => {
    if (mode === 'buy' && amountFcfa) {
      const fcfa = parseFloat(amountFcfa);
      const usdt = fcfa / RATE;
      setCalculatedAmount(usdt);
    } else if (mode === 'sell' && amountUsdt) {
      const usdt = parseFloat(amountUsdt);
      const fcfa = usdt * RATE;
      setCalculatedAmount(fcfa);
    } else {
      setCalculatedAmount(0);
    }
  }, [amountFcfa, amountUsdt, mode]);

  const validateAddress = (addr: string, net: string) => {
    if (!addr) return { ok: false, msg: 'Adresse requise' };
    if (net === 'TRC20') {
      const re = /^T[a-zA-Z0-9]{25,34}$/;
      return re.test(addr) ? { ok: true } : { ok: false, msg: 'Adresse TRC20 invalide' };
    }
    const re = /^0x[a-fA-F0-9]{40}$/;
    return re.test(addr) ? { ok: true } : { ok: false, msg: 'Adresse ERC20/BEP20 invalide' };
  };

  const handleSubmit = async () => {
    if (mode === 'buy') {
      const fcfa = parseFloat(amountFcfa);
      if (isNaN(fcfa) || fcfa < MIN_FCFA) {
        toast({
          title: "Montant invalide",
          description: `Montant minimum : ${MIN_FCFA.toLocaleString()} FCFA`,
          variant: "destructive"
        });
        return;
      }

      const validation = validateAddress(cryptoAddress, network);
      if (!validation.ok) {
        toast({
          title: "Adresse invalide",
          description: validation.msg,
          variant: "destructive"
        });
        return;
      }

      if (paymentMethod === 'momo' && !phoneNumber) {
        toast({
          title: "Numéro requis",
          description: "Veuillez renseigner votre numéro de téléphone",
          variant: "destructive"
        });
        return;
      }
    } else {
      const usdt = parseFloat(amountUsdt);
      if (isNaN(usdt) || usdt < MIN_USDT) {
        toast({
          title: "Montant invalide",
          description: `Montant minimum : ${MIN_USDT} USDT`,
          variant: "destructive"
        });
        return;
      }

      if (!phoneNumber) {
        toast({
          title: "Numéro requis",
          description: "Renseignez votre numéro pour recevoir le paiement",
          variant: "destructive"
        });
        return;
      }
    }

    setIsLoading(true);
    
    try {
      const orderData: OrderData = {
        type: mode,
        network,
        payment_method: paymentMethod,
        momo_operator: momoOperator,
        phone_number: phoneNumber,
        ...(mode === 'buy' ? { amount_fcfa: parseFloat(amountFcfa), address: cryptoAddress } : { amount_usdt: parseFloat(amountUsdt) })
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Commande créée",
        description: `Votre ordre ${mode === 'buy' ? 'd\'achat' : 'de vente'} a été créé avec succès`,
      });

      // Reset form
      setAmountFcfa('');
      setAmountUsdt('');
      setCryptoAddress('');
      setPhoneNumber('');
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la commande",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'buy' ? 'sell' : 'buy');
    setAmountFcfa('');
    setAmountUsdt('');
    setCalculatedAmount(0);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            G-<span className="text-primary">Transfert</span>
          </h1>
          <p className="text-muted-foreground">Échangez USDT et FCFA instantanément</p>
        </div>

        {/* Mode Switcher */}
        <Card className="crypto-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Badge variant={mode === 'buy' ? 'default' : 'secondary'} className="status-success">
                {mode === 'buy' ? 'Achat' : 'Vente'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {mode === 'buy' ? 'FCFA → USDT' : 'USDT → FCFA'}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={switchMode} className="text-primary hover:text-primary-glow">
              <ArrowDownUp className="w-4 h-4 mr-2" />
              Inverser
            </Button>
          </div>

          {/* Amount Input */}
          <div className="space-y-4">
            <div>
              <Label className="text-foreground font-medium">
                {mode === 'buy' ? 'Montant à payer (FCFA)' : 'Montant USDT à vendre'}
              </Label>
              {mode === 'buy' ? (
                <Input
                  type="number"
                  placeholder={`Min. ${MIN_FCFA.toLocaleString()} FCFA`}
                  value={amountFcfa}
                  onChange={(e) => setAmountFcfa(e.target.value)}
                  className="crypto-input text-xl font-semibold mt-2"
                />
              ) : (
                <Input
                  type="number"
                  placeholder={`Min. ${MIN_USDT} USDT`}
                  value={amountUsdt}
                  onChange={(e) => setAmountUsdt(e.target.value)}
                  className="crypto-input text-xl font-semibold mt-2"
                  step="0.000001"
                />
              )}
              <div className="text-xs text-muted-foreground mt-1">
                Taux: 1 USDT = {RATE.toLocaleString()} FCFA
              </div>
            </div>

            {/* Calculated Amount */}
            <div className="crypto-card">
              <Label className="text-foreground font-medium">
                {mode === 'buy' ? 'Vous recevrez (USDT)' : 'Vous recevrez (FCFA)'}
              </Label>
              <div className="amount-display text-primary mt-2">
                {calculatedAmount > 0 ? (
                  mode === 'buy' ? 
                    `${calculatedAmount.toFixed(6)} USDT` : 
                    `${Math.round(calculatedAmount).toLocaleString()} FCFA`
                ) : (
                  mode === 'buy' ? '0.000000 USDT' : '0 FCFA'
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Network Selection */}
        <Card className="crypto-card">
          <Label className="text-foreground font-medium">Réseau blockchain</Label>
          <Select value={network} onValueChange={setNetwork}>
            <SelectTrigger className="crypto-input mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TRC20">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-warning" />
                  TRC20 (Tron) - Rapide
                </div>
              </SelectItem>
              <SelectItem value="ERC20">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  ERC20 (Ethereum)
                </div>
              </SelectItem>
              <SelectItem value="BEP20">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-warning" />
                  BEP20 (BSC)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </Card>

        {/* Crypto Address (for buy) */}
        {mode === 'buy' && (
          <Card className="crypto-card">
            <Label className="text-foreground font-medium">Votre adresse USDT</Label>
            <Input
              placeholder={`Adresse ${network}`}
              value={cryptoAddress}
              onChange={(e) => setCryptoAddress(e.target.value)}
              className="crypto-input mt-2 font-mono text-sm"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Assurez-vous que l'adresse correspond au réseau sélectionné
            </div>
          </Card>
        )}

        {/* Payment Method */}
        <Card className="crypto-card">
          <Label className="text-foreground font-medium">Mode de paiement</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger className="crypto-input mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="momo">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary" />
                  Mobile Money
                </div>
              </SelectItem>
              <SelectItem value="card">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Carte bancaire
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {paymentMethod === 'momo' && (
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-foreground font-medium">Opérateur</Label>
                <Select value={momoOperator} onValueChange={setMomoOperator}>
                  <SelectTrigger className="crypto-input mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="om">Orange Money</SelectItem>
                    <SelectItem value="mtn">MTN MoMo</SelectItem>
                    <SelectItem value="moov">Moov Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-foreground font-medium">Numéro de téléphone</Label>
                <Input
                  placeholder="+227XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="crypto-input mt-2"
                />
              </div>
            </div>
          )}
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="crypto-button-primary"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Traitement...
            </div>
          ) : (
            mode === 'buy' ? 'Acheter USDT' : 'Vendre USDT'
          )}
        </Button>

        <div className="text-center text-xs text-muted-foreground">
          Transactions sécurisées • Traitement instantané • Support 24/7
        </div>
      </div>
    </div>
  );
}