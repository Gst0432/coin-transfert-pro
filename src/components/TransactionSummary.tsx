import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Smartphone, Wallet as WalletIcon, Info, Bitcoin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePaymentIntegration } from '@/hooks/usePaymentIntegration';
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
    moneroo_gateway_fee_percentage: number;
    moneroo_fixed_fee: number;
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
  const [paymentMethod, setPaymentMethod] = useState<'moneroo' | 'nowpayments'>(!isInverted ? 'moneroo' : 'nowpayments');
  const { 
    processMonerooPayment, 
    processNowPaymentsPayment, 
    createTransaction,
    isLoading: paymentLoading 
  } = usePaymentIntegration();

  // Calculate amounts and fees including Moneroo gateway fees
  const sourceAmount = !isInverted ? parseFloat(amountFcfa) : parseFloat(amountUsdt);
  const destinationAmount = !isInverted ? calculatedUsdt : calculatedFcfa;
  
  // Calculate Moneroo gateway fees (supportés par le client)
  const monerooGatewayFees = !isInverted 
    ? (sourceAmount * fees.moneroo_gateway_fee_percentage / 100) + fees.moneroo_fixed_fee // 3% + 100 FCFA
    : 0;
  
  // Calculate other fees
  const withdrawalFee = !isInverted 
    ? fees.usdt_withdrawal_fee // USDT withdrawal fee for crypto reception
    : fees.nowpayments_fee; // 0.5 USDT flat fee for NOWPayments (USDT to mobile money)
  
  // Total amount that client will pay (including gateway fees)
  const totalAmountToPay = !isInverted ? sourceAmount + monerooGatewayFees : sourceAmount;
  const finalAmount = destinationAmount - withdrawalFee;

  // Handle transaction confirmation
  const handleConfirm = async () => {
    if (isLoading || paymentLoading) return;
    
    try {
      // Create transaction first
      const transactionData = {
        amount_fcfa: !isInverted ? sourceAmount : calculatedFcfa,
        amount_usdt: !isInverted ? calculatedUsdt : sourceAmount,
        exchange_rate: rate,
        transaction_type: (!isInverted ? 'fcfa_to_usdt' : 'usdt_to_fcfa') as 'fcfa_to_usdt' | 'usdt_to_fcfa',
        source_wallet: !isInverted 
          ? { type: 'mobile', phoneNumber: selectedNumber, operator: sourceWallet?.operator }
          : { type: 'crypto', address: selectedAddress, network: sourceWallet?.network },
        destination_wallet: !isInverted 
          ? { type: 'crypto', address: selectedAddress, network: destinationWallet?.network }
          : { type: 'mobile', phoneNumber: selectedNumber, operator: destinationWallet?.operator },
        fees_fcfa: !isInverted ? monerooGatewayFees : (finalAmount * fees.mobile_money_fee_percentage / 100),
        fees_usdt: withdrawalFee,
        final_amount_fcfa: !isInverted ? null : finalAmount,
        final_amount_usdt: !isInverted ? finalAmount : null
      };

      const transaction = await createTransaction(transactionData);
      
      // Send transaction notifications
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Send transaction confirmation email and notification to user
          await supabase.functions.invoke('send-notification-email', {
            body: {
              userId: user.id,
              emailType: 'transaction_confirmation',
              data: {
                transactionId: transaction.id,
                type: transactionData.transaction_type,
                amount: !isInverted ? sourceAmount : sourceAmount,
                rate: rate
              }
            }
          });

          await supabase.functions.invoke('create-notification', {
            body: {
              userId: user.id,
              title: 'Transaction initiée',
              message: `Votre transaction ${!isInverted ? 'FCFA → USDT' : 'USDT → FCFA'} de ${!isInverted ? sourceAmount.toLocaleString() + ' FCFA' : sourceAmount + ' USDT'} est en cours de traitement.`,
              type: 'info',
              category: 'transaction',
              important: true,
              data: { transactionId: transaction.id, type: transactionData.transaction_type }
            }
          });
        }
      } catch (notificationError) {
        console.error('Error sending transaction notifications:', notificationError);
      }
      
      // Get real user data from auth instead of hardcoded values
      const { data: { user } } = await supabase.auth.getUser();
      const userDisplayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || "Client Exchange";
      const userEmail = user?.email || "client@exchange.com";
      const userPhoneNumber = user?.user_metadata?.phone_number || selectedNumber || "22700000000";
      
      const paymentData = {
        transactionId: transaction.id,
        amount: totalAmountToPay, // Inclut les frais de passerelle
        customerName: userDisplayName,
        customerEmail: userEmail, 
        customerPhone: !isInverted ? selectedNumber : userPhoneNumber,
        description: `${!isInverted ? 'Achat' : 'Vente'} ${!isInverted ? finalAmount.toFixed(8) + ' USDT' : finalAmount.toLocaleString() + ' FCFA'}`,
        transactionType: (!isInverted ? 'fcfa_to_usdt' : 'usdt_to_fcfa') as 'fcfa_to_usdt' | 'usdt_to_fcfa'
      };

      if (paymentMethod === 'moneroo' && !isInverted) {
        // Mobile Money to USDT via Moneroo
        await processMonerooPayment(paymentData);
        
        // Call onConfirm to go back to trading interface
        setTimeout(() => onConfirm(), 2000);
      } else if (paymentMethod === 'nowpayments' && isInverted) {
        // USDT to Mobile Money via NOWPayments
        await processNowPaymentsPayment(paymentData);
        
        // Call onConfirm to go back to trading interface
        setTimeout(() => onConfirm(), 2000);
      } else {
        throw new Error('Méthode de paiement non compatible avec le type de transaction');
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
      <div className="p-4 space-y-4 max-w-sm mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="gap-2 h-10 px-3 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            Récapitulatif
          </h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>

        {/* Transaction Type */}
        <Card className="crypto-card p-4">
          <div className="text-center">
            <h2 className="text-base font-semibold text-foreground mb-2">
              {!isInverted ? "FCFA → USDT" : "USDT → FCFA"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Vérifiez les détails
            </p>
          </div>
        </Card>

        {/* Source Amount */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Vous donnez</h3>
          <Card className="crypto-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-lg font-semibold text-foreground">
                  {!isInverted 
                    ? `${totalAmountToPay.toLocaleString()} FCFA`
                    : `${sourceAmount.toFixed(8)} USDT`
                  }
                </div>
                {!isInverted && monerooGatewayFees > 0 && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Dont {monerooGatewayFees.toLocaleString()} FCFA de frais
                  </div>
                )}
                <div className="text-sm text-muted-foreground mt-2">
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
              <Badge className="bg-primary/20 text-primary border border-primary/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  {!isInverted ? (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span className="text-sm">MoMo</span>
                    </>
                  ) : (
                    <>
                      <WalletIcon className="w-4 h-4" />
                      <span className="text-sm">Crypto</span>
                    </>
                  )}
                </div>
              </Badge>
            </div>
          </Card>
        </div>

        {/* Conversion Rate */}
        <Card className="crypto-card p-4">
          <div className="flex items-center gap-3 text-sm">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              1 USD = {rate.toFixed(2)} FCFA
            </span>
          </div>
        </Card>

        {/* Fees Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Frais</h3>
          <Card className="crypto-card p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Montant de base</span>
                <span className="font-medium text-sm">
                  {!isInverted 
                    ? `${sourceAmount.toLocaleString()} FCFA`
                    : `${sourceAmount.toLocaleString()} FCFA`
                  }
                </span>
              </div>
              
              {!isInverted && monerooGatewayFees > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Frais passerelle (3%+100)
                  </span>
                  <span className="text-destructive font-medium text-sm">
                    +{monerooGatewayFees.toLocaleString()} FCFA
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Montant à recevoir</span>
                <span className="font-medium text-sm">
                  {!isInverted 
                    ? `${destinationAmount.toFixed(8)} USDT`
                    : `${destinationAmount.toLocaleString()} FCFA`
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Frais retrait {!isInverted ? '' : '(3 USDT)'}
                </span>
                <span className="text-destructive font-medium text-sm">
                  -{!isInverted 
                    ? `${withdrawalFee} USDT`
                    : `${withdrawalFee} USDT`
                  }
                </span>
              </div>
              <div className="border-t border-border pt-3">
                {!isInverted && (
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-foreground">Total à payer</span>
                    <span className="text-lg font-semibold text-primary">
                      {totalAmountToPay.toLocaleString()} FCFA
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Vous recevrez</span>
                  <span className="text-lg font-semibold text-foreground">
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
                <div className="text-lg font-semibold text-foreground">
                  {!isInverted 
                    ? `${finalAmount.toFixed(8)} USDT`
                    : `${finalAmount.toLocaleString()} FCFA`
                  }
                </div>
                <div className="text-sm text-muted-foreground mt-2">
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
              <Badge className="bg-primary/20 text-primary border border-primary/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  {!isInverted ? (
                    <>
                      <WalletIcon className="w-4 h-4" />
                      <span className="text-sm">Crypto</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span className="text-sm">MoMo</span>
                    </>
                  )}
                </div>
              </Badge>
            </div>
          </Card>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Méthode paiement</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={paymentMethod === 'moneroo' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPaymentMethod('moneroo')}
              className="flex items-center gap-2 h-10 px-3 text-sm"
              disabled={isInverted} // Moneroo only for FCFA to USDT
            >
              <Smartphone className="w-4 h-4" />
              MoMo
            </Button>
            <Button
              type="button"
              variant={paymentMethod === 'nowpayments' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPaymentMethod('nowpayments')}
              className="flex items-center gap-2 h-10 px-3 text-sm"
              disabled={!isInverted} // NOWPayments only for USDT to FCFA
            >
              <Bitcoin className="w-4 h-4" />
              Crypto
            </Button>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isLoading || paymentLoading}
            className="w-full h-12 px-4 text-base font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl"
          >
            {isLoading || paymentLoading ? 'Traitement...' : 
             `Confirmer ${paymentMethod === 'moneroo' ? 'MoMo' : 'Crypto'}`}
          </Button>
        </div>
      </div>
    </div>
  );
}