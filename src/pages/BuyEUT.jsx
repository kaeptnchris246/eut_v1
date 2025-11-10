
import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CreditCard,
  Wallet,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Info,
  DollarSign,
  Euro,
  Shield,
  Zap,
  ArrowRight,
  HelpCircle,
  Building,
  Search,
  Code, // Added for Production Integration Guide
  Settings // Added for Production Integration Guide
} from 'lucide-react';
import { toast } from 'sonner';
import WalletConnect from '@/components/WalletConnect';
import { Link } from 'react-router-dom'; // Assuming react-router-dom for Link component
import { createPageUrl } from '@/utils'; // New import as per changes

// Simple inline translation helper
const useTranslation = () => {
  const t = (key) => {
    const translations = {
      // General
      portfolio: 'Portfolio',
      dashboard: 'Dashboard',
      marketplace: 'Marktplatz',
      
      // Buy EUT
      buyEUTTokens: 'EUT Token kaufen',
      buyEuphenaUtilityToken: 'Kaufen Sie Euphena Utility Token',
      platformCurrency: 'Plattform-Währung',
      eutPlatformCurrencyDescription: 'EUT ist die Währung dieser Plattform. Nutzen Sie EUT um in SPV Security Tokens zu investieren.',
      selectPaymentMethod: 'Zahlungsmethode wählen',
      cardPayment: 'Karten Zahlung',
      sepaTransfer: 'SEPA Überweisung',
      cryptoTransfer: 'Crypto Transfer',
      
      // Payment details
      provider: 'Anbieter',
      availableIn: 'Verfügbar in',
      fees: 'Gebühren',
      processingTime: 'Bearbeitungszeit',
      creditCardProvider: 'Kreditkarten-Anbieter',
      supported: 'Unterstützt',
      
      // Amount & Currency
      amount: 'Betrag',
      selectCurrency: 'Währung wählen',
      enterAmount: 'Betrag eingeben',
      minAmount: 'Min. Betrag',
      
      // Summary
      summary: 'Zusammenfassung',
      youReceive: 'Sie erhalten',
      total: 'Gesamt',
      buyNow: 'Jetzt kaufen',
      processing: 'Wird verarbeitet...',
      
      // Wallet
      walletConnectStep1: 'Verbinden Sie Ihre Wallet (MetaMask, WalletConnect, etc.)',
      walletConnectStep2: 'Geben Sie den EUT-Betrag ein, den Sie kaufen möchten',
      walletConnectStep3: 'Senden Sie die entsprechende Crypto-Menge an den Smart Contract',
      onChainPurchaseTitle: 'On-Chain Kauf Anleitung',
      smartContract: 'Smart Contract',
      
      // Security & Features
      securePaymentMsg: 'Ihre Zahlung ist durch SSL-Verschlüsselung und 3D-Secure geschützt',
      instantTransferTitle: 'Sofortige Übertragung',
      instantTransferDesc: 'EUT werden sofort nach erfolgreicher Zahlung gutgeschrieben',
      secureRegulatedTitle: 'Sicher & Reguliert',
      secureRegulatedDesc: 'Lizenzierte Zahlungsanbieter und regulierte Krypto-Börsen',
      fairFeesTitle: 'Faire Gebühren',
      fairFeesDesc: 'Transparente Gebührenstruktur ohne versteckte Kosten',
      
      // Transaction types
      via: 'via',
      buyOf: 'Kauf von',
      simulated: 'Simuliert',
      transferInitiated: 'Überweisung initiiert',
      successfullyPurchased: 'erfolgreich gekauft',
      purchaseFailed: 'Kauf fehlgeschlagen',
      paymentFailed: 'Zahlung fehlgeschlagen',
      connectWalletPrompt: 'Bitte verbinden Sie Ihre Wallet',
      
      // Status
      cancel: 'Abbrechen',
      simulatePayment: 'Zahlung simulieren',
      securePayment: 'Sichere Zahlung',
      
      // Token
      eutToken: 'EUT Token',
    };
    return translations[key] || key;
  };
  
  return { t };
};

// Detailed provider information
const PROVIDER_DETAILS = [
  {
    id: 'stripe',
    name: 'Stripe',
    displayName: 'Kreditkarte / Debitkarte (Stripe)',
    icon: CreditCard,
    description: 'Visa, Mastercard, American Express',
    fees: '2.9% + €0.30',
    flatFee: 0.30,
    percentageFee: 0.029,
    processingTime: 'Sofort',
    currencies: ['EUR', 'USD', 'GBP'],
    provider: 'Stripe',
    category: 'card',
    minAmount: { EUR: 10, USD: 10, GBP: 10 },
  },
  {
    id: 'wyre',
    name: 'Wyre',
    displayName: 'Wyre (Globale Karten)',
    icon: CreditCard,
    description: 'Unterstützt 100+ Länder',
    fees: '2.5% + $0.50',
    flatFee: 0.50, // Assuming USD base for flat fee
    percentageFee: 0.025,
    processingTime: 'Sofort',
    currencies: ['EUR', 'USD', 'GBP', 'AUD', 'CAD'],
    provider: 'Wyre',
    regions: ['Global', 'USA', 'EU', 'UK', 'APAC'],
    category: 'card',
    minAmount: { EUR: 10, USD: 10, GBP: 10 },
  },
  {
    id: 'banxa',
    name: 'Banxa',
    displayName: 'Banxa (Regional)',
    icon: CreditCard,
    description: 'SEPA, iDEAL, Sofort',
    fees: '1.99% - 3.99%',
    flatFee: 0,
    percentageFee: 0.0299, // Using 2.99% as a common rate
    processingTime: 'Sofort - 1 Stunde',
    currencies: ['EUR', 'USD', 'GBP', 'AUD'],
    provider: 'Banxa',
    regions: ['EU', 'UK', 'AUS'],
    category: 'card',
    minAmount: { EUR: 10, USD: 10, GBP: 10 },
  },
  {
    id: 'sepa',
    name: 'SEPA',
    displayName: 'SEPA Überweisung',
    icon: Euro, // Kept Euro here, but will use Building for the main tab trigger icon
    description: 'Banküberweisung innerhalb EU',
    fees: '€1.00',
    flatFee: 1.00,
    percentageFee: 0,
    processingTime: '1-2 Werktage',
    currencies: ['EUR'], // Standard SEPA is EUR only
    provider: 'Direkt',
    category: 'sepa',
    minAmount: { EUR: 10 },
  },
  {
    id: 'crypto',
    name: 'Crypto',
    displayName: 'Crypto Transfer',
    icon: Wallet,
    description: 'USDT, USDC, ETH (ERC-20)',
    fees: 'Gas Fees (0.5% EUT)', // Custom fee for crypto based on EUT amount
    flatFee: 0,
    percentageFee: 0.005, // 0.5%
    processingTime: '~15 Minuten',
    currencies: ['USDT', 'USDC', 'ETH', 'BTC'],
    provider: 'Blockchain',
    onChain: true,
    category: 'crypto',
    minAmount: { EUT: 10 },
  },
];

// Main categories for the TabsList
const MAIN_PAYMENT_CATEGORIES = [
  { id: 'card', name: 'Karten Zahlung', icon: CreditCard, description: 'Kredit- & Debitkarten' },
  { id: 'sepa', name: 'SEPA Überweisung', icon: Building, description: 'Banküberweisung (EUR)' }, // Changed icon to Building
  { id: 'crypto', name: 'Crypto Transfer', icon: Wallet, description: 'USDT, USDC, ETH, BTC' },
];

export default function BuyEUT() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  // selectedMethod refers to the MAIN_PAYMENT_CATEGORIES ids ('card', 'sepa', 'crypto')
  const [selectedMethod, setSelectedMethod] = useState('card');
  // selectedProvider will store the specific provider when selectedMethod is 'card' (e.g., 'stripe')
  // or will be effectively derived for 'sepa' and 'crypto'
  const [selectedProvider, setSelectedProvider] = useState('stripe'); // Default to stripe for card
  // 'amount' is fiat amount for 'card'/'sepa', EUT amount for 'crypto'
  const [amount, setAmount] = useState('');
  // Fiat currency selection for 'card'/'sepa'
  const [currency, setCurrency] = useState('EUR');
  // Crypto currency selection for 'crypto'
  const [cryptoCurrency, setCryptoCurrency] = useState('USDT');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    // Reset relevant states when main category changes
    setAmount(''); // Always reset amount
    if (selectedMethod === 'sepa') {
        setCurrency('EUR');
        setSelectedProvider('sepa'); // Default to SEPA provider for SEPA tab
    } else if (selectedMethod === 'card') {
        setCurrency('EUR');
        setSelectedProvider('stripe'); // Default to Stripe for card
    } else if (selectedMethod === 'crypto') {
        setCryptoCurrency('USDT');
        setSelectedProvider('crypto'); // Default to Crypto provider for Crypto tab
    }
  }, [selectedMethod]);


  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  // EUT to Fiat rates (how much fiat 1 EUT is worth)
  // For crypto: how much crypto 1 EUT is worth (e.g., 1 EUT = 0.000022 BTC)
  const exchangeRates = {
    EUT_TO_EUR: 1.0,
    EUT_TO_USD: 1.1,
    EUT_TO_GBP: 0.85,
    EUT_TO_USDT: 1.05,
    EUT_TO_USDC: 1.0,
    EUT_TO_ETH: 0.0003,
    EUT_TO_BTC: 0.000015,
  };

  // Helper to get the currently active detailed provider (e.g., Stripe, or SEPA)
  const getActiveProviderDetails = useMemo(() => {
      if (selectedMethod === 'card') {
          // If selectedProvider is null (initial state), default to 'stripe'
          const providerId = selectedProvider || 'stripe';
          return PROVIDER_DETAILS.find(p => p.id === providerId);
      }
      // For sepa and crypto, the category matches the id for a unique provider
      return PROVIDER_DETAILS.find(p => p.category === selectedMethod);
  }, [selectedMethod, selectedProvider]);

  const getMinAmount = () => {
    const activeProvider = getActiveProviderDetails;
    if (!activeProvider) return 0;

    if (selectedMethod === 'crypto') {
        return activeProvider.minAmount?.EUT || 10;
    } else {
        return activeProvider.minAmount?.[currency] || 10;
    }
  };

  // Calculates EUT from a fiat amount (for 'card'/'sepa'), or returns input amount (for 'crypto' where input is EUT)
  const calculateEUT = (inputAmount = amount) => {
    if (!inputAmount || isNaN(parseFloat(inputAmount))) return 0;
    const numAmount = parseFloat(inputAmount);

    if (selectedMethod === 'crypto') {
      return numAmount.toFixed(2); // If crypto is selected, the input 'amount' is already EUT amount
    } else {
      const rateKey = `EUT_TO_${currency}`;
      const rate = exchangeRates[rateKey];
      if (!rate) return 0;
      return (numAmount / rate).toFixed(2);
    }
  };

  // Calculates crypto amount needed when EUT amount is specified
  const calculateCryptoAmountNeeded = (eutAmountInput = amount) => {
    if (!eutAmountInput || isNaN(parseFloat(eutAmountInput))) return 0;
    const numEutAmount = parseFloat(eutAmountInput);

    const rateKey = `EUT_TO_${cryptoCurrency}`;
    const rate = exchangeRates[rateKey];

    if (!rate) {
      console.warn(`No exchange rate found for EUT to ${cryptoCurrency}`);
      return 0;
    }
    return (numEutAmount * rate).toFixed(6); // Use more precision for crypto
  };

  const calculateFees = (inputAmount = amount) => {
    if (!inputAmount || isNaN(parseFloat(inputAmount))) return 0;
    const numAmount = parseFloat(inputAmount);

    const activeProvider = getActiveProviderDetails;
    if (!activeProvider) return 0;

    if (selectedMethod === 'crypto') {
        // For crypto, 'amount' is EUT. Fee is a percentage of EUT amount.
        return (numAmount * activeProvider.percentageFee).toFixed(2); // Fee in EUT terms
    } else {
        // For fiat payments
        // This is a simplification; a real system would handle cross-currency fee conversions accurately.
        // For now, assume flat fee is fixed in its base currency (e.g. Stripe's €0.30 in EUR)
        // and percentage fee applies to the input amount's currency.
        let totalFee = (numAmount * activeProvider.percentageFee) + activeProvider.flatFee;
        return totalFee.toFixed(2);
    }
  };

  // Total cost in the selected currency (fiat) or EUT (for crypto)
  const totalCost = useMemo(() => {
    if (!amount || isNaN(parseFloat(amount))) return 0;
    const numAmount = parseFloat(amount);

    if (selectedMethod === 'crypto') {
        // For crypto, total cost is EUT amount + EUT fees
        return (numAmount + parseFloat(calculateFees(amount))).toFixed(2);
    } else {
        // For fiat, total cost is fiat amount + fiat fees
        return (numAmount + parseFloat(calculateFees(amount))).toFixed(2);
    }
  }, [amount, selectedMethod, calculateFees]);

  const handlePurchase = async () => {
    const minAmount = getMinAmount();
    const numAmount = parseFloat(amount);

    if (!amount || numAmount < minAmount) {
      toast.error(`${t('minAmount')}: ${minAmount} ${selectedMethod === 'crypto' ? 'EUT' : currency}`);
      return;
    }

    if (selectedMethod === 'card') {
      // Real Stripe Integration
      handleStripeCheckout();
      return;
    }

    if (selectedMethod === 'crypto') {
      toast.info(t('connectWalletPrompt'));
      // Crypto payments would be handled by WalletConnect component
    }

    setIsPurchasing(true);
    let eutAmountToCredit = 0;
    let description = '';
    let status = 'erfolgreich';
    let paymentMethodIdForTransaction = '';

    try {
      const activeProvider = getActiveProviderDetails;

      if (selectedMethod === 'crypto') {
        eutAmountToCredit = numAmount;
        description = `${t('buyOf')} ${eutAmountToCredit} EUT ${t('via')} ${cryptoCurrency} (on-chain)`;
        paymentMethodIdForTransaction = 'crypto';
      } else { // 'sepa'
        eutAmountToCredit = parseFloat(calculateEUT(amount));
        description = `${t('buyOf')} ${eutAmountToCredit} EUT ${t('via')} ${activeProvider.displayName}`;
        paymentMethodIdForTransaction = activeProvider.id;

        if (selectedMethod === 'sepa') {
          status = 'ausstehend';
        }
      }

      await base44.entities.Transaction.create({
        user_email: user.email,
        type: 'token_kauf',
        amount: eutAmountToCredit,
        description: description,
        status: status,
        payment_method: paymentMethodIdForTransaction,
      });

      if (status !== 'ausstehend') {
        await base44.auth.updateMe({
          wallet_balance: (user.wallet_balance || 0) + eutAmountToCredit,
        });
      }

      toast.success(
        status === 'ausstehend'
          ? t('transferInitiated')
          : `${eutAmountToCredit} EUT ${t('successfullyPurchased')}!`
      );

      setAmount('');
      queryClient.invalidateQueries();
      loadUser();
    } catch (error) {
      toast.error(`${t('purchaseFailed')}: ` + error.message);
      console.error(error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleStripeCheckout = async () => {
    setIsPurchasing(true);
    
    try {
      const eutAmountToCredit = parseFloat(calculateEUT(amount));
      const totalAmount = parseFloat(totalCost);
      
      // In production: Create Stripe Checkout Session via Backend
      // For now: Show modal explaining the process
      
      // PRODUCTION CODE (requires backend endpoint):
      /*
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency: currency.toLowerCase(),
          eutAmount: eutAmountToCredit,
          userEmail: user.email,
          provider: selectedProvider,
        }),
      });
      
      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await loadStripe('YOUR_STRIPE_PUBLIC_KEY');
      await stripe.redirectToCheckout({ sessionId });
      */
      
      // For demo: Show information modal
      setShowStripeModal(true);
      
    } catch (error) {
      toast.error('Checkout-Initialisierung fehlgeschlagen: ' + error.message);
      console.error(error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const simulatePayment = async (providerName) => {
    setShowStripeModal(false);
    setIsPurchasing(true);

    try {
      const eutAmountToCredit = parseFloat(calculateEUT(amount));

      await base44.entities.Transaction.create({
        user_email: user.email,
        type: 'token_kauf',
        amount: eutAmountToCredit,
        description: `${t('buyOf')} ${eutAmountToCredit} EUT ${t('via')} ${providerName} (${t('simulated')})`,
        status: 'erfolgreich',
        payment_method: selectedProvider,
      });

      await base44.auth.updateMe({
        wallet_balance: (user.wallet_balance || 0) + eutAmountToCredit,
      });

      toast.success(`${eutAmountToCredit} EUT ${t('successfullyPurchased')}!`);
      setAmount('');
      queryClient.invalidateQueries();
      loadUser();
    } catch (error) {
      toast.error(`${t('paymentFailed')}: ` + error.message);
    } finally {
      setIsPurchasing(false);
    }
  };

  const selectedProviderForButton = getActiveProviderDetails;
  const IconComponent = selectedProviderForButton?.icon || CreditCard;

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-transparent rounded-3xl blur-xl" />
          <Card className="border-[#D4AF37]/30 border-2 bg-gradient-to-br from-gray-900/95 via-black to-black backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-full blur-2xl" />
            <CardContent className="p-6 md:p-8 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    <span className="bg-gradient-to-r from-[#D4AF37] via-[#F4E4B0] to-[#D4AF37] bg-clip-text text-transparent">
                      {t('buyEUTTokens')}
                    </span>
                  </h1>
                  <p className="text-sm md:text-base text-gray-400">
                    {t('buyEuphenaUtilityToken')}
                  </p>
                </div>
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center shadow-2xl shadow-[#D4AF37]/50">
                  <DollarSign className="w-12 h-12 md:w-16 md:h-16 text-black" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Explainer */}
        <Card className="border-blue-500/30 bg-blue-500/10">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <strong>{t('platformCurrency')}:</strong> {t('eutPlatformCurrencyDescription')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
          <CardHeader>
            <CardTitle className="text-white text-xl">{t('selectPaymentMethod')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedMethod} onValueChange={setSelectedMethod} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-900 border-2 border-gray-700">
                <TabsTrigger
                  value="card"
                  className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black font-bold"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {t('cardPayment')}
                </TabsTrigger>
                <TabsTrigger
                  value="sepa"
                  className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black font-bold"
                >
                  <Building className="w-4 h-4 mr-2" />
                  {t('sepaTransfer')}
                </TabsTrigger>
                <TabsTrigger
                  value="crypto"
                  className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black font-bold"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {t('cryptoTransfer')}
                </TabsTrigger>
              </TabsList>

              {/* SEPA Tab Content - Now just showing provider details and summary info, no amount/currency input */}
              <TabsContent value="sepa" className="mt-6 space-y-4">
                {(() => {
                  const sepaMethod = PROVIDER_DETAILS.find(m => m.id === 'sepa');
                  if (!sepaMethod) return null;
                  return (
                    <>
                       <div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
                           <div className="flex items-center justify-between mb-2">
                               <p className="text-sm font-semibold text-white">{t('provider')}</p>
                               <Badge className="bg-[#D4AF37]/20 text-[#D4AF37]">
                                   {sepaMethod.provider}
                               </Badge>
                           </div>
                           {sepaMethod.regions && (
                               <div className="flex gap-2 flex-wrap mt-2">
                                   <span className="text-xs text-gray-400">{t('availableIn')}:</span>
                                   {sepaMethod.regions.map(region => (
                                       <Badge key={region} className="bg-blue-500/20 text-blue-400 text-xs">
                                           {region}
                                       </Badge>
                                   ))}
                               </div>
                           )}
                       </div>

                       <div className="p-4 rounded-lg bg-gradient-to-r from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/30">
                         <div className="flex justify-between text-sm mt-2">
                           <span className="text-gray-400">{t('fees')}:</span>
                           <span className="text-white font-semibold">
                             {sepaMethod.fees}
                           </span>
                         </div>
                         <div className="flex justify-between text-sm mt-1">
                           <span className="text-gray-400">{t('processingTime')}:</span>
                           <span className="text-white font-semibold">{sepaMethod.processingTime}</span>
                         </div>
                       </div>
                    </>
                  );
                })()}
              </TabsContent>

              {/* Card Tab Content - Now just showing sub-provider selection and summary info, no amount/currency input */}
              <TabsContent value="card" className="mt-6 space-y-4">
                {/* Sub-selection for card providers */}
                <div>
                    <Label className="text-white font-semibold mb-3 block">{t('creditCardProvider')}</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {PROVIDER_DETAILS.filter(p => p.category === 'card').map(provider => (
                            <Button
                                key={provider.id}
                                variant={selectedProvider === provider.id ? "default" : "outline"}
                                onClick={() => setSelectedProvider(provider.id)}
                                className={`font-bold ${
                                    selectedProvider === provider.id
                                        ? 'bg-[#D4AF37] text-black border-[#D4AF37] hover:bg-[#B8941F]'
                                        : 'bg-gray-900 text-white border-gray-700 hover:bg-gray-800 hover:border-white'
                                } border-2`}
                            >
                                {provider.name}
                            </Button>
                        ))}
                    </div>
                </div>

                {(() => {
                  const cardProvider = getActiveProviderDetails; // This will be the specific card provider (Stripe, Wyre, Banxa)
                  if (!cardProvider || cardProvider.category !== 'card') return null; // Ensure it's a card provider

                  return (
                      <>
                       <div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
                           <div className="flex items-center justify-between mb-2">
                               <p className="text-sm font-semibold text-white">{t('provider')}</p>
                               <Badge className="bg-[#D4AF37]/20 text-[#D4AF37]">
                                   {cardProvider.provider}
                               </Badge>
                           </div>
                           {cardProvider.regions && (
                               <div className="flex gap-2 flex-wrap mt-2">
                                   <span className="text-xs text-gray-400">{t('availableIn')}:</span>
                                   {cardProvider.regions.map(region => (
                                       <Badge key={region} className="bg-blue-500/20 text-blue-400 text-xs">
                                           {region}
                                       </Badge>
                                   ))}
                               </div>
                           )}
                       </div>

                       <div className="p-4 rounded-lg bg-gradient-to-r from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/30">
                         <div className="flex justify-between text-sm mt-2">
                           <span className="text-gray-400">{t('fees')}:</span>
                           <span className="text-white font-semibold">{cardProvider.fees}</span>
                         </div>
                         <div className="flex justify-between text-sm mt-1">
                           <span className="text-gray-400">{t('processingTime')}:</span>
                           <span className="text-white font-semibold">{cardProvider.processingTime}</span>
                         </div>
                       </div>
                      </>
                  );
                })()}
              </TabsContent>

              {/* Crypto Tab Content - Now just showing provider details and summary info, no amount input */}
              <TabsContent value="crypto" className="mt-6 space-y-4">
                {(() => {
                    const cryptoMethod = PROVIDER_DETAILS.find(m => m.id === 'crypto');
                    if (!cryptoMethod) return null;
                    return (
                        <>
                            <div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold text-white">{t('provider')}</p>
                                    <Badge className="bg-[#D4AF37]/20 text-[#D4AF37]">
                                        {cryptoMethod.provider}
                                    </Badge>
                                </div>
                                <div className="flex gap-2 flex-wrap mt-2">
                                    <span className="text-xs text-gray-400">{t('supported')}:</span>
                                    {cryptoMethod.currencies.map(c => (
                                        <Badge key={c} className="bg-blue-500/20 text-blue-400 text-xs">
                                            {c}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-gradient-to-r from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/30">
                               <div className="flex justify-between text-sm">
                                 <span className="text-gray-400">{t('fees')} (EUT):</span>
                                 <span className="text-white font-semibold">{calculateFees()} EUT</span>
                               </div>
                                <div className="flex justify-between text-sm mt-1">
                                 <span className="text-gray-400">{t('processingTime')}:</span>
                                 <span className="text-white font-semibold">{cryptoMethod.processingTime}</span>
                               </div>
                            </div>
                        </>
                    );
                })()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Amount Input */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
              <CardHeader>
                <CardTitle className="text-white">{t('amount')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">{t('selectCurrency')}</label>
                  {selectedMethod === 'crypto' ? (
                    <div className="grid grid-cols-3 gap-2">
                      {['USDT', 'ETH', 'BTC'].map((crypto) => (
                        <Button
                          key={crypto}
                          onClick={() => setCryptoCurrency(crypto)}
                          className={`${
                            cryptoCurrency === crypto
                              ? 'bg-[#D4AF37] text-black'
                              : 'bg-gray-900 text-white border-2 border-gray-700 hover:border-[#D4AF37]'
                          } font-bold`}
                        >
                          {crypto}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {['EUR', 'USD', 'GBP'].map((curr) => (
                        <Button
                          key={curr}
                          onClick={() => setCurrency(curr)}
                          className={`${
                            currency === curr
                              ? 'bg-[#D4AF37] text-black'
                              : 'bg-900 text-white border-2 border-gray-700 hover:border-[#D4AF37]'
                          } font-bold`}
                        >
                          {curr}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">
                    {t('amount')} ({selectedMethod === 'crypto' ? 'EUT' : currency})
                  </label>
                  <Input
                    type="number"
                    placeholder={`${t('enterAmount')} ${t('minAmount')}: ${getMinAmount()} ${selectedMethod === 'crypto' ? 'EUT' : currency}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-gray-900 border-2 border-gray-700 text-white text-2xl h-16 placeholder:text-gray-600 focus:border-[#D4AF37]"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {t('minAmount')}: {getMinAmount()} {selectedMethod === 'crypto' ? 'EUT' : currency}
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[100, 500, 1000, 5000].map(amt => (
                    <Button
                      key={amt}
                      variant="outline"
                      onClick={() => setAmount(amt.toString())}
                      className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800 hover:border-[#D4AF37] font-semibold"
                    >
                      {amt}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Crypto Transfer Instructions - shown when selectedMethod is 'crypto' */}
            {selectedMethod === 'crypto' && (
              <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
                    <Info className="w-5 h-5 text-purple-400" />
                    {t('onChainPurchaseTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><strong className="text-white">1.</strong> {t('walletConnectStep1')}</p>
                    <p><strong className="text-white">2.</strong> {t('walletConnectStep2')}</p>
                    <p><strong className="text-white">3.</strong> {t('walletConnectStep3')}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-black/50 border border-purple-500/30">
                    <p className="text-xs text-purple-300 mb-2">{t('smartContract')}:</p>
                    <code className="text-xs md:text-sm text-[#D4AF37] break-all">
                      0x742d35Cc6634C0532925a3b8D...4A7B
                    </code>
                    <Badge className="mt-2 bg-green-500/20 text-green-400">
                      Sepolia Testnet
                    </Badge>
                  </div>

                  <WalletConnect compact />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="border-2 border-[#D4AF37] bg-gradient-to-br from-[#D4AF37]/10 to-black sticky top-4">
              <CardHeader>
                <CardTitle className="text-white text-base md:text-lg">{t('summary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6">
                {amount && !isNaN(parseFloat(amount)) ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{t('amount')}</span>
                        <span className="text-white font-semibold break-all text-right">
                          {selectedMethod === 'crypto' ? `${amount} EUT` : `${amount} ${currency}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{t('fees')}</span>
                        <span className="text-white font-semibold">
                          {calculateFees(amount)} {selectedMethod === 'crypto' ? 'EUT' : currency}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm pb-3 border-b border-gray-700">
                        <span className="text-gray-400">{t('total')}</span>
                        <span className="text-white font-bold">
                          {totalCost} {selectedMethod === 'crypto' ? 'EUT' : currency}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-transparent border-2 border-[#D4AF37]/30">
                        <p className="text-xs text-gray-400 mb-2">{t('youReceive')}</p>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <p className="text-2xl md:text-3xl font-bold text-white">
                            {calculateEUT(amount)}
                          </p>
                          <span className="text-base md:text-lg text-[#D4AF37] font-semibold">EUT</span>
                        </div>
                        {selectedMethod !== 'crypto' && (
                          <p className="text-xs text-gray-400 mt-2">
                            1 EUT = {exchangeRates[`EUT_TO_${currency}`]} {currency}
                          </p>
                        )}
                        {selectedMethod === 'crypto' && (
                           <p className="text-xs text-gray-400 mt-2">
                            1 EUT = {exchangeRates[`EUT_TO_${cryptoCurrency}`]} {cryptoCurrency}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handlePurchase}
                      disabled={isPurchasing || !amount || parseFloat(amount) < getMinAmount()}
                      className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold text-base md:text-lg py-6"
                    >
                      {isPurchasing ? (
                        t('processing')
                      ) : (
                        <>
                          <IconComponent className="w-5 h-5 mr-2" />
                          {t('buyNow')}
                        </>
                      )}
                    </Button>

                    <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-900/50 border border-gray-700 text-xs text-gray-400">
                      <Shield className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      <p>
                        {t('securePaymentMsg')}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">
                      {t('enterAmount')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-gray-700 bg-gradient-to-br from-gray-900 to-black">
            <CardContent className="p-6">
              <CheckCircle2 className="w-10 h-10 text-green-400 mb-3" />
              <h3 className="font-bold text-white mb-2">{t('instantTransferTitle')}</h3>
              <p className="text-sm text-gray-400">
                {t('instantTransferDesc')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-700 bg-gradient-to-br from-gray-900 to-black">
            <CardContent className="p-6">
              <Shield className="w-10 h-10 text-[#D4AF37] mb-3" />
              <h3 className="font-bold text-white mb-2">{t('secureRegulatedTitle')}</h3>
              <p className="text-sm text-gray-400">
                {t('secureRegulatedDesc')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-700 bg-gradient-to-br from-gray-900 to-black">
            <CardContent className="p-6">
              <TrendingUp className="w-10 h-10 text-blue-400 mb-3" />
              <h3 className="font-bold text-white mb-2">{t('fairFeesTitle')}</h3>
              <p className="text-sm text-gray-400">
                {t('fairFeesDesc')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Payment Modal with Stripe Integration Instructions */}
      {showStripeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full border-2 border-[#D4AF37] bg-gradient-to-br from-gray-900 to-black max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white">{selectedProviderForButton?.provider} Integration</CardTitle>
              <p className="text-sm text-gray-400">{t('securePayment')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Demo Mode Notice */}
              <div className="p-6 rounded-xl bg-blue-500/10 border-2 border-blue-500/30 text-center">
                <CreditCard className="w-16 h-16 text-blue-400 mx-auto mb-3" />
                <p className="text-white font-semibold mb-2">Demo-Modus Aktiv</p>
                <p className="text-sm text-gray-300 mb-3">
                  In Production würde hier die echte {selectedProviderForButton?.provider} Checkout-Seite geladen werden.
                </p>
                <Badge className="bg-[#D4AF37] text-black">
                  {selectedProviderForButton?.provider}
                </Badge>
              </div>

              {/* Transaction Details */}
              <div className="space-y-2 text-sm p-4 rounded-lg bg-gray-900 border border-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('amount')}:</span>
                  <span className="text-white font-bold">{totalCost} {currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('eutToken')}:</span>
                  <span className="text-[#D4AF37] font-bold">{calculateEUT(amount)} EUT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('provider')}:</span>
                  <span className="text-white font-bold">{selectedProviderForButton?.provider}</span>
                </div>
              </div>

              {/* Production Integration Guide */}
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <p className="text-sm text-white font-semibold mb-3">
                  <Code className="w-4 h-4 inline mr-2" />
                  Production Integration Steps:
                </p>
                <ol className="text-xs text-gray-300 space-y-2">
                  <li>
                    <strong className="text-white">1. Backend Setup:</strong>
                    <pre className="bg-black/50 p-2 rounded mt-1 overflow-x-auto">
{`// Backend: /api/payments/create-checkout-session
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/payments/create-checkout-session', async (req, res) => {
  const { amount, currency, eutAmount, userEmail, provider } = req.body;
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: currency,
        product_data: { name: 'EUT Token Purchase' },
        unit_amount: Math.round(amount * 100), // cents
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: '${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: '${window.location.origin}/buy-eut',
    metadata: {
      userEmail,
      eutAmount,
      provider,
    },
  });
  
  res.json({ sessionId: session.id });
});`}
                    </pre>
                  </li>
                  <li>
                    <strong className="text-white">2. Webhook Handler:</strong>
                    <pre className="bg-black/50 p-2 rounded mt-1 overflow-x-auto">
{`// Backend: /api/webhooks/stripe
app.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userEmail, eutAmount } = session.metadata;
    
    // Update user wallet in Base44 Database
    await updateUserWallet(userEmail, eutAmount);
    await createTransaction(userEmail, eutAmount, 'stripe');
  }
  
  res.json({ received: true });
});`}
                    </pre>
                  </li>
                  <li>
                    <strong className="text-white">3. Frontend Implementation:</strong>
                    <pre className="bg-black/50 p-2 rounded mt-1 overflow-x-auto">
{`// Install: npm install @stripe/stripe-js
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe('pk_live_...');
const response = await fetch('/api/payments/create-checkout-session', {
  method: 'POST',
  body: JSON.stringify({ amount, currency, eutAmount, userEmail }),
});
const { sessionId } = await response.json();
await stripe.redirectToCheckout({ sessionId });`}
                    </pre>
                  </li>
                </ol>
              </div>

              {/* Configuration Required Notice */}
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-300 font-semibold mb-1">Konfiguration erforderlich:</p>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• Stripe API Keys in Production Setup eintragen</li>
                      <li>• Backend Functions in Base44 Dashboard aktivieren</li>
                      <li>• Backend Service (Node.js/Python) deployen</li>
                      <li>• Webhook Endpoints konfigurieren</li>
                      <li>• SSL-Zertifikat für HTTPS erforderlich</li>
                    </ul>
                    <Link to={createPageUrl("ProductionSetup")}>
                      <Button size="sm" className="mt-3 bg-[#D4AF37] hover:bg-[#B8941F] text-black">
                        <Settings className="w-4 h-4 mr-2" />
                        Zur Production Setup
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Demo Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowStripeModal(false)}
                  variant="outline"
                  className="flex-1 border-gray-700"
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={() => simulatePayment(selectedProviderForButton?.provider)}
                  className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold"
                >
                  {t('simulatePayment')} (Demo)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
