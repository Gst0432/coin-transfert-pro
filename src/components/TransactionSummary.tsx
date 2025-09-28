import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Smartphone, Wallet as WalletIcon, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TransactionSummaryProps {
  isInverted: boolean;
  amountFcfa: string;
  amountUsdt: string;
  calculatedUsdt: number;
  calculatedFcfa: number;
  selectedNumber: string;
  selectedAddress: string;
  mobileWallets: any[];
  cryptoWallets: any[];
  rate: number;
  fees: {
    usdt_withdrawal_fee: number;
    mobile_money_fee_percentage: number;
    nowpayments_fee: number;
  };
  onBack: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function TransactionSummary({
  isInverted,
  amountFcfa,
  amountUsdt,
  calculatedUsdt,
  calculatedFcfa,
  selectedNumber,
  selectedAddress,
  mobileWallets,
  cryptoWallets,
  rate,
  fees,
  onBack,
  onConfirm,
  isLoading
}: TransactionSummaryProps) {
  const { toast } = useToast();

  // Calculate amounts and fees
  const sourceAmount = !isInverted ? parseFloat(amountFcfa) : parseFloat(amountUsdt);
  const destinationAmount = !isInverted ? calculatedUsdt : calculatedFcfa;
  
  // Calculate fees
  const withdrawalFee = !isInverted 
    ? fees.usdt_withdrawal_fee // USDT withdrawal fee for crypto reception
    : fees.nowpayments_fee; // 0.5 USDT flat fee for NOWPayments (USDT to mobile money)
  
  const finalAmount = destinationAmount - withdrawalFee;

  // Handle transaction confirmation
  const handleConfirm = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour effectuer cette transaction",
          variant: "destructive",
        });
        return;
      }

      // Create transaction record
      const transactionData = {
        user_id: user.id,
        transaction_type: (!isInverted ? 'fcfa_to_usdt' : 'usdt_to_fcfa') as 'fcfa_to_usdt' | 'usdt_to_fcfa',
        amount_fcfa: !isInverted ? sourceAmount : calculatedFcfa,
        amount_usdt: !isInverted ? calculatedUsdt : sourceAmount,
        exchange_rate: rate,
        fees_fcfa: !isInverted ? 0 : (finalAmount * fees.mobile_money_fee_percentage / 100),
        fees_usdt: !isInverted ? withdrawalFee : withdrawalFee,
        final_amount_fcfa: !isInverted ? 0 : (calculatedFcfa - (calculatedFcfa * fees.mobile_money_fee_percentage / 100)),
        final_amount_usdt: !isInverted ? finalAmount : (calculatedUsdt - withdrawalFee),
        source_wallet: !isInverted 
          ? { type: 'mobile', phoneNumber: selectedNumber, operator: sourceWallet?.operator }
          : { type: 'crypto', address: selectedAddress, network: sourceWallet?.network },
        destination_wallet: !isInverted 
          ? { type: 'crypto', address: selectedAddress, network: destinationWallet?.network }
          : { type: 'mobile', phoneNumber: selectedNumber, operator: destinationWallet?.operator }
      };

      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select()
        .single();

      if (transactionError) {
        console.error('Transaction creation error:', transactionError);
        throw transactionError;
      }

      // If it's FCFA to USDT, redirect to Moneroo
      if (!isInverted) {
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
          'process-moneroo-payment',
          {
            body: {
              transactionId: transaction.id,
              amount: sourceAmount,
              customerName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Client',
              customerEmail: user.email,
              customerPhone: selectedNumber,
              description: `Achat ${finalAmount.toFixed(8)} USDT`
            }
          }
        );

        if (paymentError) {
          console.error('Payment creation error:', paymentError);
          throw paymentError;
        }

        // Redirect to Moneroo checkout
        if (paymentData?.checkout_url) {
          window.location.href = paymentData.checkout_url;
        } else {
          throw new Error('URL de paiement non reçue');
        }
      } else {
        // For USDT to mobile money, redirect to NOWPayments
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
          'process-nowpayments-payment',
          {
            body: {
              transactionId: transaction.id,
              amount: sourceAmount,
              customerEmail: user.email,
              description: `Conversion ${sourceAmount} USDT vers ${finalAmount.toLocaleString()} FCFA`
            }
          }
        );

        if (paymentError) {
          console.error('NOWPayments creation error:', paymentError);
          throw paymentError;
        }

        // Redirect to NOWPayments checkout
        if (paymentData?.checkout_url) {
          window.location.href = paymentData.checkout_url;
        } else {
          throw new Error('URL de paiement NOWPayments non reçue');
        }
      }

    } catch (error) {
      console.error('Error processing transaction:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  // Get wallet details
  const sourceWallet = !isInverted 
    ? mobileWallets.find(w => w.phoneNumber === selectedNumber)
    : cryptoWallets.find(w => w.address === selectedAddress);
    
  const destinationWallet = !isInverted 
    ? cryptoWallets.find(w => w.address === selectedAddress)
    : mobileWallets.find(w => w.phoneNumber === selectedNumber);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-3 space-y-3 max-w-sm mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="gap-1 h-8 px-3 text-xs"
          >
            <ArrowLeft className="w-3 h-3" />
            Retour
          </Button>
          <h1 className="text-lg font-bold text-foreground">
            Récapitulatif
          </h1>
          <div className="w-12" /> {/* Spacer for centering */}
        </div>

        {/* Transaction Type */}
        <Card className="crypto-card p-3">
          <div className="text-center">
            <h2 className="text-base font-bold text-foreground mb-2">
              {!isInverted ? "FCFA → USDT" : "USDT → FCFA"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Vérifiez les détails de votre transaction
            </p>
          </div>
        </Card>

        {/* Source Amount */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-foreground">Vous donnez</h3>
          <Card className="crypto-card p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-2xl font-bold text-foreground">
                  {!isInverted 
                    ? `${sourceAmount.toLocaleString()} FCFA`
                    : `${sourceAmount.toFixed(8)} USDT`
                  }
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {sourceWallet && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {!isInverted ? sourceWallet.operator : sourceWallet.network}
                      </Badge>
                      <span className="font-mono text-xs">
                        {!isInverted 
                          ? sourceWallet.phoneNumber 
                          : `${sourceWallet.address.slice(0, 8)}...${sourceWallet.address.slice(-4)}`
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Badge className="bg-primary/20 text-primary border border-primary/30">
                <div className="flex items-center gap-1.5">
                  {!isInverted ? (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span className="text-xs">MoMo</span>
                    </>
                  ) : (
                    <>
                      <WalletIcon className="w-4 h-4" />
                      <span className="text-xs">Crypto</span>
                    </>
                  )}
                </div>
              </Badge>
            </div>
          </Card>
        </div>

        {/* Conversion Rate */}
        <Card className="crypto-card p-3">
          <div className="flex items-center gap-2 text-sm">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Taux de conversion: 1 USD = {rate.toFixed(2)} FCFA
            </span>
          </div>
        </Card>

        {/* Fees Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Frais de transaction</h3>
          <Card className="crypto-card p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Montant à recevoir</span>
                <span className="font-medium">
                  {!isInverted 
                    ? `${destinationAmount.toFixed(8)} USDT`
                    : `${destinationAmount.toLocaleString()} FCFA`
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Frais de retrait {!isInverted ? '' : '(0.5 USDT)'}
                </span>
                <span className="text-destructive font-medium">
                  -{!isInverted 
                    ? `${withdrawalFee} USDT`
                    : `${withdrawalFee} USDT`
                  }
                </span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Montant final</span>
                  <span className="text-lg font-bold text-foreground">
                    {!isInverted 
                      ? `${finalAmount.toFixed(8)} USDT`
                      : `${finalAmount.toLocaleString()} FCFA`
                    }
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Destination */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Vous recevez sur</h3>
          <Card className="crypto-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-lg font-bold text-foreground">
                  {!isInverted 
                    ? `${finalAmount.toFixed(8)} USDT`
                    : `${finalAmount.toLocaleString()} FCFA`
                  }
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {destinationWallet && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {!isInverted ? destinationWallet.network : destinationWallet.operator}
                      </Badge>
                      <span className="font-mono text-xs">
                        {!isInverted 
                          ? `${destinationWallet.address.slice(0, 8)}...${destinationWallet.address.slice(-4)}`
                          : destinationWallet.phoneNumber
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Badge className="bg-primary/20 text-primary border border-primary/30">
                <div className="flex items-center gap-1.5">
                  {!isInverted ? (
                    <>
                      <WalletIcon className="w-4 h-4" />
                      <span className="text-xs">Crypto</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span className="text-xs">MoMo</span>
                    </>
                  )}
                </div>
              </Badge>
            </div>
          </Card>
        </div>

        {/* Confirm Button */}
        <div className="pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full h-12 text-base font-semibold bg-teal-500 hover:bg-teal-600 text-white rounded-lg"
          >
            {isLoading ? 'Traitement...' : 'Confirmer la transaction'}
          </Button>
        </div>
      </div>
    </div>
  );
}