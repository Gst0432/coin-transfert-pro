import { AppSettings } from '@/hooks/useAppSettings';

export interface PaymentCalculation {
  sourceAmount: number;
  destinationAmount: number;
  gatewayFees: number;
  platformFees: number;
  totalFees: number;
  finalAmount: number;
  exchangeRate: number;
}

/**
 * Calcule les montants pour un achat d'USDT (FCFA → USDT)
 * Client paie en FCFA via Moneroo → Reçoit USDT
 */
export const calculateUSDTPurchase = (
  usdtAmount: number, 
  settings: AppSettings
): PaymentCalculation => {
  const exchangeRate = settings.usdt_to_xof_rate;
  
  // Montant FCFA nécessaire pour l'USDT demandé
  const baseAmountFCFA = usdtAmount * exchangeRate;
  
  // Frais Moneroo (supportés par le client)
  const monerooPercentageFee = baseAmountFCFA * (settings.moneroo_gateway_fee_percentage / 100);
  const gatewayFees = monerooPercentageFee + settings.moneroo_fixed_fee;
  
  // Frais de retrait USDT (déduits du montant final USDT)
  const platformFees = settings.usdt_withdrawal_fee;
  const finalUSDTAmount = usdtAmount - platformFees;
  
  // Montant total que le client doit payer
  const totalAmountFCFA = baseAmountFCFA + gatewayFees;
  
  return {
    sourceAmount: totalAmountFCFA,
    destinationAmount: finalUSDTAmount,
    gatewayFees: gatewayFees,
    platformFees: platformFees,
    totalFees: gatewayFees + platformFees * exchangeRate, // Frais totaux en FCFA équivalent
    finalAmount: finalUSDTAmount,
    exchangeRate: exchangeRate
  };
};

/**
 * Calcule les montants pour une vente d'USDT (USDT → FCFA)
 * Client envoie USDT via NOWPayments → Reçoit FCFA via Moneroo
 */
export const calculateUSDTSale = (
  usdtAmount: number,
  settings: AppSettings
): PaymentCalculation => {
  const exchangeRate = settings.usdt_to_xof_rate;
  
  // Montant FCFA brut pour l'USDT reçu
  const baseFCFAAmount = usdtAmount * exchangeRate;
  
  // Frais NOWPayments (déduits en USDT)
  const nowpaymentsFeeUSDT = settings.nowpayments_fee_usdt;
  const effectiveUSDT = usdtAmount - nowpaymentsFeeUSDT;
  
  // Montant FCFA après frais NOWPayments
  const fcfaAfterUSDTFees = effectiveUSDT * exchangeRate;
  
  // Frais Mobile Money (sur le montant final FCFA)
  const mobileFees = fcfaAfterUSDTFees * (settings.mobile_money_fee_percentage / 100);
  
  // Montant final que le client recevra
  const finalFCFAAmount = fcfaAfterUSDTFees - mobileFees;
  
  const totalFeesUSDT = nowpaymentsFeeUSDT;
  const totalFeesFCFA = mobileFees;
  
  return {
    sourceAmount: usdtAmount,
    destinationAmount: finalFCFAAmount,
    gatewayFees: nowpaymentsFeeUSDT * exchangeRate, // Frais NOWPayments en FCFA équivalent
    platformFees: mobileFees,
    totalFees: totalFeesUSDT * exchangeRate + totalFeesFCFA,
    finalAmount: finalFCFAAmount,
    exchangeRate: exchangeRate
  };
};

/**
 * Valide les montants minimum selon la configuration
 */
export const validateMinimumAmounts = (
  amount: number,
  type: 'usdt' | 'fcfa',
  settings: AppSettings
): { isValid: boolean; message?: string } => {
  if (type === 'usdt') {
    if (amount < settings.min_usdt) {
      return {
        isValid: false,
        message: `Montant minimum : ${settings.min_usdt} USDT`
      };
    }
  } else if (type === 'fcfa') {
    if (amount < settings.min_fcfa) {
      return {
        isValid: false,
        message: `Montant minimum : ${settings.min_fcfa.toLocaleString()} FCFA`
      };
    }
  }
  
  return { isValid: true };
};

/**
 * Formate les montants selon le type de devise
 */
export const formatAmount = (amount: number, currency: 'USDT' | 'FCFA'): string => {
  if (currency === 'USDT') {
    return `${amount.toFixed(8)} USDT`;
  } else {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  }
};

/**
 * Génère un ID de transaction unique
 */
export const generateTransactionId = (type: 'buy' | 'sell'): string => {
  const prefix = type === 'buy' ? 'BUY' : 'SELL';
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}_${timestamp}_${random}`.toUpperCase();
};

/**
 * Détermine la méthode de paiement selon le type de transaction
 */
export const getPaymentMethod = (transactionType: 'fcfa_to_usdt' | 'usdt_to_fcfa') => {
  return {
    fcfa_to_usdt: 'moneroo',    // Achat USDT : paiement FCFA via Moneroo
    usdt_to_fcfa: 'nowpayments' // Vente USDT : dépôt USDT via NOWPayments
  }[transactionType];
};

/**
 * Calcule le montant équivalent dans l'autre devise
 */
export const convertAmount = (
  amount: number,
  fromCurrency: 'USDT' | 'FCFA',
  toCurrency: 'USDT' | 'FCFA',
  exchangeRate: number
): number => {
  if (fromCurrency === toCurrency) return amount;
  
  if (fromCurrency === 'USDT' && toCurrency === 'FCFA') {
    return amount * exchangeRate;
  } else if (fromCurrency === 'FCFA' && toCurrency === 'USDT') {
    return amount / exchangeRate;
  }
  
  return 0;
};