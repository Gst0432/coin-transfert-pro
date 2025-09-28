import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ArrowLeft, Home, Briefcase, Clock, User, Smartphone, Wallet as WalletIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppSettings } from '@/hooks/useAppSettings';
import { calculateUSDTPurchase, calculateUSDTSale, formatAmount } from '@/utils/paymentUtils';
import TransactionSummary from './TransactionSummary';

export default function TradingInterface() {
  const [amountFcfa, setAmountFcfa] = useState('1000');
  const [amountUsdt, setAmountUsdt] = useState('');
  const [selectedNumber, setSelectedNumber] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [calculatedUsdt, setCalculatedUsdt] = useState(0);
  const [calculatedFcfa, setCalculatedFcfa] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInverted, setIsInverted] = useState(false); // false = FCFA->USDT, true = USDT->FCFA
  const [showSummary, setShowSummary] = useState(false);
  
  const { toast } = useToast();
  const { settings } = useAppSettings();
  
  // Configuration from admin settings

  // Mock wallets from localStorage simulation
  const mockWallets = [
    // Mobile Money wallets
    { id: '1', type: 'mobile_money', operator: 'Orange Money', country: 'Niger', phoneNumber: '+227 70 13 80 31', currency: 'FCFA' },
    { id: '2', type: 'mobile_money', operator: 'Airtel Money', country: 'Niger', phoneNumber: '+227 90 12 34 56', currency: 'FCFA' },
    { id: '3', type: 'mobile_money', operator: 'Mynita', country: 'Niger', phoneNumber: '+227 91 23 45 67', currency: 'FCFA' },
    { id: '4', type: 'mobile_money', operator: 'Amanata', country: 'Niger', phoneNumber: '+227 94 56 78 90', currency: 'FCFA' },
    // Crypto wallets
    { id: '5', type: 'crypto', network: 'TRC20', address: 'TQMfqFK7Lh8jKzHj2sTJbx6W...xyz123', currency: 'USDT' },
    { id: '6', type: 'crypto', network: 'ERC20', address: '0x742d35Cc6346C7ac8577A42C...5A42C', currency: 'USDT' },
    { id: '7', type: 'crypto', network: 'BEP20', address: 'TKzxh8xF9Gm3pL7qR4tB9...9xKl2A', currency: 'USDT' },
  ];

  // Calculate conversion
  useEffect(() => {
    if (!isInverted && amountFcfa) {
      const fcfa = parseFloat(amountFcfa);
      const usd = fcfa / settings.usdt_to_xof_rate;
      setCalculatedUsdt(usd);
      setAmountUsdt('');
    } else if (isInverted && amountUsdt) {
      const usd = parseFloat(amountUsdt);
      const fcfa = usd * settings.usdt_to_xof_rate;
      setCalculatedFcfa(fcfa);
      setAmountFcfa('');
    } else {
      setCalculatedUsdt(0);
      setCalculatedFcfa(0);
    }
  }, [amountFcfa, amountUsdt, isInverted, settings.usdt_to_xof_rate]);

  const handleInvert = () => {
    setIsInverted(!isInverted);
    setAmountFcfa('');
    setAmountUsdt('');
    setCalculatedUsdt(0);
    setCalculatedFcfa(0);
    setSelectedNumber('');
    setSelectedAddress('');
    toast({
      title: "Inversion automatique",
      description: `Basculé vers ${!isInverted ? "USDT → FCFA" : "FCFA → USDT"}`,
    });
  };

  const mobileWallets = mockWallets.filter(w => w.type === 'mobile_money');
  const cryptoWallets = mockWallets.filter(w => w.type === 'crypto');

  // Check if amount is below minimum
  const checkMinimumError = (currentAmount: string, minAmount: number) => {
    const amount = parseFloat(currentAmount);
    return isNaN(amount) || amount < minAmount;
  };

  const showFcfaMinError = !isInverted && amountFcfa && checkMinimumError(amountFcfa, settings.min_fcfa);
  const showUsdtMinError = isInverted && amountUsdt && checkMinimumError(amountUsdt, settings.min_usdt);

  const handleNext = () => {
    const amount = !isInverted ? parseFloat(amountFcfa) : parseFloat(amountUsdt);
    const minAmount = !isInverted ? settings.min_fcfa : settings.min_usdt;
    const currency = !isInverted ? 'FCFA' : 'USD';
    
    if (isNaN(amount) || amount < minAmount) {
      toast({
        title: "Montant invalide",
        description: `Montant minimum : ${minAmount.toLocaleString()} ${currency}`,
        variant: "destructive"
      });
      return;
    }

    if ((!isInverted && !selectedNumber) || (isInverted && !selectedAddress)) {
      toast({
        title: "Portefeuille source requis",
        description: `Veuillez sélectionner votre ${!isInverted ? 'numéro MoMo' : 'adresse crypto'}`,
        variant: "destructive"
      });
      return;
    }

    if ((!isInverted && !selectedAddress) || (isInverted && !selectedNumber)) {
      toast({
        title: "Portefeuille destination requis",
        description: `Veuillez sélectionner votre ${!isInverted ? 'adresse crypto' : 'numéro MoMo'}`,
        variant: "destructive"
      });
      return;
    }

    setShowSummary(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Transaction confirmée",
        description: "Votre transaction a été confirmée avec succès",
      });
      setShowSummary(false);
      // Reset form
      setAmountFcfa('1000');
      setAmountUsdt('');
      setSelectedNumber('');
      setSelectedAddress('');
      setCalculatedUsdt(0);
      setCalculatedFcfa(0);
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

  const handleBack = () => {
    setShowSummary(false);
  };

  if (showSummary) {
    return (
      <TransactionSummary
        isInverted={isInverted}
        amountFcfa={amountFcfa}
        amountUsdt={amountUsdt}
        calculatedUsdt={calculatedUsdt}
        calculatedFcfa={calculatedFcfa}
        selectedNumber={selectedNumber}
        selectedAddress={selectedAddress}
        mobileWallets={mobileWallets}
        cryptoWallets={cryptoWallets}
        rate={settings.usdt_to_xof_rate}
        fees={{
          usdt_withdrawal_fee: settings.usdt_withdrawal_fee,
          mobile_money_fee_percentage: settings.mobile_money_fee_percentage,
          moneroo_gateway_fee_percentage: settings.moneroo_gateway_fee_percentage,
          moneroo_fixed_fee: settings.moneroo_fixed_fee,
          nowpayments_fee: settings.nowpayments_fee_usdt
        }}
        onBack={handleBack}
        onConfirm={handleConfirm}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      {/* Content - Interface responsive */}
      <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-hidden">
        <div className="h-full max-w-sm sm:max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto flex flex-col">
          {/* Header avec bouton d'inversion */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6 flex-shrink-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground">
              {!isInverted ? "FCFA → USDT" : "USDT → FCFA"}
            </h1>
            <Button
              onClick={handleInvert}
              variant="outline"
              size="sm"
              className="gap-2 h-9 sm:h-10 lg:h-11 px-3 sm:px-4 lg:px-5 text-sm"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline">Inverser</span>
            </Button>
          </div>

          {/* Layout responsive - stacked on mobile, side by side on desktop */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-8 flex-1 overflow-hidden">
            {/* Je Donne Section */}
            <div className="flex flex-col space-y-3 sm:space-y-4 lg:space-y-5">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground">Je Donne</h2>
            
              <div className="relative">
                <div className="crypto-card p-3 sm:p-4 lg:p-5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-xs sm:text-sm text-muted-foreground mb-2">
                        Je Donne ({!isInverted ? 'FCFA' : 'USDT'})
                      </div>
                      <Input
                        type="number"
                        value={!isInverted ? amountFcfa : amountUsdt}
                        onChange={(e) => !isInverted ? setAmountFcfa(e.target.value) : setAmountUsdt(e.target.value)}
                        className="text-xl sm:text-2xl lg:text-3xl font-semibold bg-transparent border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="0"
                      />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <Badge className="bg-primary/20 text-primary border border-primary/30 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm">
                        <div className="flex items-center gap-1 sm:gap-2">
                          {!isInverted ? (
                            <>
                              <Smartphone className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="font-medium hidden sm:inline">Mobile Money</span>
                              <span className="font-medium sm:hidden">MoMo</span>
                            </>
                          ) : (
                            <>
                              <WalletIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="font-medium">Crypto</span>
                            </>
                          )}
                        </div>
                      </Badge>
                    </div>
                  </div>
                </div>
                {showFcfaMinError && (
                  <div className="text-xs text-destructive mt-2">
                    Minimum: {settings.min_fcfa.toLocaleString()} FCFA
                  </div>
                )}
                {showUsdtMinError && (
                  <div className="text-xs text-destructive mt-2">
                    Minimum: {settings.min_usdt} USDT
                  </div>
                )}
              </div>

              <div className="space-y-2 sm:space-y-3">
                <label className="text-sm sm:text-base font-medium text-foreground">
                  {!isInverted ? 'Compte Mobile Money' : 'Adresse Crypto'}
                </label>
                <Select 
                  value={!isInverted ? selectedNumber : selectedAddress} 
                  onValueChange={!isInverted ? setSelectedNumber : setSelectedAddress}
                >
                  <SelectTrigger className="crypto-input h-10 sm:h-11 lg:h-12 px-3 sm:px-4 text-sm sm:text-base">
                    <SelectValue placeholder={!isInverted ? "Sélectionnez votre numéro" : "Sélectionnez votre adresse"} />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover border shadow-lg">
                    {(!isInverted ? mobileWallets : cryptoWallets).map((wallet) => (
                      <SelectItem key={wallet.id} value={!isInverted ? wallet.phoneNumber : wallet.address}>
                        <div className="flex items-center gap-2 w-full">
                          {!isInverted ? (
                            <>
                              <Badge variant="outline" className="text-xs">{wallet.operator}</Badge>
                              <span className="font-mono text-sm">{wallet.phoneNumber}</span>
                            </>
                          ) : (
                            <>
                              <Badge variant="outline" className="text-xs">{wallet.network}</Badge>
                              <span className="font-mono text-sm">{wallet.address.slice(0, 8)}...{wallet.address.slice(-4)}</span>
                            </>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Je Reçois Section */}
            <div className="flex flex-col space-y-3 sm:space-y-4 lg:space-y-5">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground">Je Reçois</h2>
              
              <div className="relative">
                <div className="crypto-card p-3 sm:p-4 lg:p-5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-xs sm:text-sm text-muted-foreground mb-2">
                        Je Reçois ({!isInverted ? 'USDT' : 'FCFA'})
                      </div>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground">
                        {!isInverted 
                          ? (calculatedUsdt > 0 ? calculatedUsdt.toFixed(6) : '0.000000')
                          : (calculatedFcfa > 0 ? calculatedFcfa.toLocaleString() : '0')
                        }
                      </div>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <Badge className="bg-primary/20 text-primary border border-primary/30 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm">
                        <div className="flex items-center gap-1 sm:gap-2">
                          {!isInverted ? (
                            <>
                              <WalletIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="font-medium">Crypto</span>
                            </>
                          ) : (
                            <>
                              <Smartphone className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="font-medium hidden sm:inline">Mobile Money</span>
                              <span className="font-medium sm:hidden">MoMo</span>
                            </>
                          )}
                        </div>
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <label className="text-sm sm:text-base font-medium text-foreground">
                  {!isInverted ? 'Adresse de réception' : 'Compte de réception'}
                </label>
                <Select 
                  value={!isInverted ? selectedAddress : selectedNumber} 
                  onValueChange={!isInverted ? setSelectedAddress : setSelectedNumber}
                >
                  <SelectTrigger className="crypto-input h-10 sm:h-11 lg:h-12 px-3 sm:px-4 text-sm sm:text-base">
                    <SelectValue placeholder={!isInverted ? "Sélectionnez votre adresse" : "Sélectionnez votre numéro"} />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover border shadow-lg">
                    {(!isInverted ? cryptoWallets : mobileWallets).map((wallet) => (
                      <SelectItem key={wallet.id} value={!isInverted ? wallet.address : wallet.phoneNumber}>
                        <div className="flex items-center gap-2 w-full">
                          {!isInverted ? (
                            <>
                              <Badge variant="outline" className="text-xs">{wallet.network}</Badge>
                              <span className="font-mono text-sm">{wallet.address.slice(0, 8)}...{wallet.address.slice(-4)}</span>
                            </>
                          ) : (
                            <>
                              <Badge variant="outline" className="text-xs">{wallet.operator}</Badge>
                              <span className="font-mono text-sm">{wallet.phoneNumber}</span>
                            </>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Next Button - Fixed at bottom with enhanced styling */}
      <div className="flex-shrink-0 p-4 sm:p-5 lg:p-6 bg-background/95 backdrop-blur border-t border-border/50 z-10 shadow-lg">
        <div className="max-w-sm sm:max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto">
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="w-full h-12 sm:h-14 px-4 text-base sm:text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg transition-all duration-200"
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}