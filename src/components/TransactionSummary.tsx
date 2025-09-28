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
      <div className="p-2 space-y-2 max-w-xs mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="gap-1 h-8 px-1.5 text-[11px]"
          >
            <ArrowLeft className="w-2.5 h-2.5" />
            Retour
          </Button>
          <h1 className="text-lg font-bold text-foreground">
            Récapitulatif
          </h1>
          <div className="w-12" /> {/* Spacer for centering */}
        </div>

        {/* Transaction Type */}
        <Card className="crypto-card p-2">
          <div className="text-center">
            <h2 className="text-base font-bold text-foreground mb-2">
              {!isInverted ? "FCFA → USDT" : "USDT → FCFA"}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Vérifiez les détails de votre transaction
            </p>
          </div>
        </Card>

        {/* Source Amount */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-foreground">Vous donnez</h3>
          <Card className="crypto-card p-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-2xl font-bold text-foreground">
                  {!isInverted 
                    ? `${totalAmountToPay.toLocaleString()} FCFA`
                    : `${sourceAmount.toFixed(8)} USDT`
                  }
                </div>
                {!isInverted && monerooGatewayFees > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Dont {monerooGatewayFees.toLocaleString()} FCFA de frais passerelle
                  </div>
                )}
                <div className="text-sm text-muted-foreground mt-1">
                  {sourceWallet && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[11px]">
                        {!isInverted ? sourceWallet.operator : sourceWallet.network}
                      </Badge>
                      <span className="font-mono text-[11px]">
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
                      <Smartphone className="w-2.5 h-2.5" />
                      <span className="text-[11px]">MoMo</span>
                    </>
                  ) : (
                    <>
                      <WalletIcon className="w-2.5 h-2.5" />
                      <span className="text-[11px]">Crypto</span>
                    </>
                  )}
                </div>
              </Badge>
            </div>
          </Card>
        </div>

        {/* Conversion Rate */}
        <Card className="crypto-card p-2">
          <div className="flex items-center gap-2 text-xs">
            <Info className="w-2.5 h-2.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              Taux de conversion: 1 USD = {rate.toFixed(2)} FCFA
            </span>
          </div>
        </Card>

        {/* Fees Breakdown */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-foreground">Frais de transaction</h3>
          <Card className="crypto-card p-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground">Montant de base</span>
                <span className="font-medium text-xs">
                  {!isInverted 
                    ? `${sourceAmount.toLocaleString()} FCFA`
                    : `${sourceAmount.toLocaleString()} FCFA`
                  }
                </span>
              </div>
              
              {!isInverted && monerooGatewayFees > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-muted-foreground">
                    Frais passerelle Moneroo (3% + 100 FCFA)
                  </span>
                  <span className="text-destructive font-medium text-xs">
                    +{monerooGatewayFees.toLocaleString()} FCFA
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground">Montant à recevoir</span>
                <span className="font-medium text-xs">
                  {!isInverted 
                    ? `${destinationAmount.toFixed(8)} USDT`
                    : `${destinationAmount.toLocaleString()} FCFA`
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground">
                  Frais de retrait {!isInverted ? '' : '(3 USDT)'}
                </span>
                <span className="text-destructive font-medium text-xs">
                  -{!isInverted 
                    ? `${withdrawalFee} USDT`
                    : `${withdrawalFee} USDT`
                  }
                </span>
              </div>
              <div className="border-t border-border pt-2">
                {!isInverted && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-foreground">Total à payer</span>
                    <span className="text-lg font-bold text-primary">
                      {totalAmountToPay.toLocaleString()} FCFA
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-foreground">Vous recevrez</span>
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
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-foreground">Vous recevez sur</h3>
          <Card className="crypto-card p-2">
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
                      <Badge variant="outline" className="text-[11px]">
                        {!isInverted ? destinationWallet.network : destinationWallet.operator}
                      </Badge>
                      <span className="font-mono text-[11px]">
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
                      <WalletIcon className="w-2.5 h-2.5" />
                      <span className="text-[11px]">Crypto</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-2.5 h-2.5" />
                      <span className="text-[11px]">MoMo</span>
                    </>
                  )}
                </div>
              </Badge>
            </div>
          </Card>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-foreground">Méthode de paiement</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={paymentMethod === 'moneroo' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPaymentMethod('moneroo')}
              className="flex items-center gap-1 h-7 px-2 text-[11px]"
              disabled={isInverted} // Moneroo only for FCFA to USDT
            >
              <Smartphone className="w-2.5 h-2.5" />
              Mobile Money
            </Button>
            <Button
              type="button"
              variant={paymentMethod === 'nowpayments' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPaymentMethod('nowpayments')}
              className="flex items-center gap-1 h-7 px-2 text-[11px]"
              disabled={!isInverted} // NOWPayments only for USDT to FCFA
            >
              <Bitcoin className="w-2.5 h-2.5" />
              Crypto
            </Button>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="pt-2">
          <Button
            onClick={handleConfirm}
            disabled={isLoading || paymentLoading}
            className="w-full h-8 px-2 text-xs font-semibold bg-teal-500 hover:bg-teal-600 text-white rounded-lg"
          >
            {isLoading || paymentLoading ? 'Traitement...' : 
             `Confirmer avec ${paymentMethod === 'moneroo' ? 'Mobile Money' : 'Crypto'}`}
          </Button>
        </div>
      </div>
    </div>
  );
}