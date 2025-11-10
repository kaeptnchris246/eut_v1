
import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Wallet, 
  PieChart, 
  Building2,
  AlertCircle,
  Clock,
  Activity,
  Zap
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { convertCurrency, formatCurrency, convertToAllCurrencies } from "@/utils/currency";
import CurrencySelector from "@/components/CurrencySelector";
import { subscribeToWalletUpdates, subscribeToInvestmentUpdates, subscribeToSPVUpdates } from "@/utils/realtimeSync";

import PriceTickerWidget from '../components/PriceTickerWidget';
import MarketNewsWidget from '../components/MarketNewsWidget';
import VolumeChart from '../components/VolumeChart';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('EUT');
  const [realtimeStatus, setRealtimeStatus] = useState({ wallet: false, investments: false, spvs: false });
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  // Realtime Sync - Wallet Updates
  useEffect(() => {
    if (!user?.email) return;

    console.log('[Dashboard] Setting up realtime wallet sync');
    const unsubscribeWallet = subscribeToWalletUpdates(user.email, (newBalance) => {
      console.log('[Dashboard] Wallet balance updated:', newBalance);
      setUser(prev => ({ ...prev, wallet_balance: newBalance }));
      setRealtimeStatus(prev => ({ ...prev, wallet: true }));
      
      // Invalidate queries to refresh related data (like investments if their value depends on wallet balance, or just for consistency)
      queryClient.invalidateQueries(['my-investments']); 
    });

    return () => {
      unsubscribeWallet();
      setRealtimeStatus(prev => ({ ...prev, wallet: false }));
    };
  }, [user?.email, queryClient]);

  // Realtime Sync - Investment Updates
  useEffect(() => {
    if (!user?.email) return;

    console.log('[Dashboard] Setting up realtime investment sync');
    const unsubscribeInvestments = subscribeToInvestmentUpdates(user.email, (investment) => {
      console.log('[Dashboard] Investment updated:', investment);
      setRealtimeStatus(prev => ({ ...prev, investments: true }));
      
      // Optimistic update: refresh investments query
      queryClient.invalidateQueries(['my-investments', user.email]);
    });

    return () => {
      unsubscribeInvestments();
      setRealtimeStatus(prev => ({ ...prev, investments: false }));
    };
  }, [user?.email, queryClient]);

  // Realtime Sync - SPV Price Updates
  useEffect(() => {
    console.log('[Dashboard] Setting up realtime SPV sync');
    const unsubscribeSPVs = subscribeToSPVUpdates(null, (spv) => { // null for all SPVs
      console.log('[Dashboard] SPV updated:', spv.name);
      setRealtimeStatus(prev => ({ ...prev, spvs: true }));
      
      // Refresh SPV list
      queryClient.invalidateQueries(['spvs']);
      // Also potentially invalidate investments if their current_value depends on SPV prices
      queryClient.invalidateQueries(['my-investments']);
    });

    return () => {
      unsubscribeSPVs();
      setRealtimeStatus(prev => ({ ...prev, spvs: false }));
    };
  }, [queryClient]);

  const { data: investments, isLoading: investmentsLoading } = useQuery({
    queryKey: ['my-investments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Investment.filter({ investor_email: user.email });
    },
    enabled: !!user?.email,
    initialData: [],
    refetchInterval: 30000, // Fallback: refresh every 30s
  });

  const { data: spvs } = useQuery({
    queryKey: ['spvs'],
    queryFn: () => base44.entities.SPV.list(),
    initialData: [],
    refetchInterval: 30000, // Fallback: refresh every 30s
  });

  const { data: transactions } = useQuery({
    queryKey: ['recent-transactions', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const txs = await base44.entities.Transaction.filter({ user_email: user.email }, '-created_date', 5);
      return txs;
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const portfolioData = [
    { month: 'Jan', portfolio: 10000, benchmark: 10000 },
    { month: 'Feb', portfolio: 12500, benchmark: 10800 },
    { month: 'Mär', portfolio: 11800, benchmark: 11200 },
    { month: 'Apr', portfolio: 15200, benchmark: 12500 },
    { month: 'Mai', portfolio: 17600, benchmark: 13800 },
    { month: 'Jun', portfolio: 19200, benchmark: 14500 },
  ];

  const allocationData = [
    { name: 'Immobilien', value: 35, color: '#06b6d4' },
    { name: 'Tech Startups', value: 25, color: '#D4AF37' },
    { name: 'Erneuerbare Energien', value: 20, color: '#10b981' },
    { name: 'Infrastruktur', value: 15, color: '#8b5cf6' },
    { name: 'Liquidität', value: 5, color: '#6b7280' },
  ];

  const monthlyPerformance = [
    { month: 'Jan', return: 2.5 },
    { month: 'Feb', return: 3.8 },
    { month: 'Mär', return: -1.2 },
    { month: 'Apr', return: 4.5 },
    { month: 'Mai', return: 5.2 },
    { month: 'Jun', return: 3.9 },
  ];

  // Portfolio calculations in EUT
  const totalInvested = investments.reduce((sum, inv) => sum + (inv.invested_amount || 0), 0);
  const portfolioValue = investments.reduce((sum, inv) => sum + (inv.current_value || inv.invested_amount || 0), 0);
  const portfolioReturn = totalInvested > 0 ? ((portfolioValue - totalInvested) / totalInvested * 100) : 0;
  const walletBalance = user?.wallet_balance || 0;

  // Multi-currency conversion
  const walletBalanceCurrency = convertCurrency(walletBalance, 'EUT', selectedCurrency);
  const totalInvestedCurrency = convertCurrency(totalInvested, 'EUT', selectedCurrency);
  const portfolioValueCurrency = convertCurrency(portfolioValue, 'EUT', selectedCurrency);

  const t = (key) => {
    const translations = {
      welcomeBack: 'Willkommen zurück',
      portfolioPerformance: 'Portfolio Performance',
      discoverInvestments: 'Investments entdecken',
      walletBalance: 'Wallet Balance',
      available: 'Verfügbar',
      invested: 'Investiert',
      active: 'Aktiv',
      portfolioValue: 'Portfolio Wert',
      investments: 'Investments'
    };
    return translations[key] || key;
  };

  const getKYCAlert = () => {
    if (!user) return null;
    const status = user.kyc_status || 'nicht_verifiziert';
    
    if (status === 'nicht_verifiziert') {
      return (
        <Card className="border-[#D4AF37] border-2 bg-gradient-to-br from-[#D4AF37]/20 via-black to-black backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-transparent" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[#D4AF37]/20 border-2 border-[#D4AF37]">
                <AlertCircle className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  KYC Verifizierung erforderlich
                  <Badge className="bg-[#D4AF37] text-black font-bold">Aktion erforderlich</Badge>
                </h3>
                <p className="text-gray-300 mb-4">
                  Um in SPVs investieren zu können, müssen Sie Ihre Identität verifizieren.
                </p>
                <Link to={createPageUrl("KYC")}>
                  <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold shadow-xl">
                    <Zap className="w-4 h-4 mr-2" />
                    Jetzt verifizieren
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (status === 'in_prüfung') {
      return (
        <Card className="border-blue-500/50 border-2 bg-gradient-to-br from-blue-500/20 via-black to-black backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20 border-2 border-blue-500">
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">KYC in Prüfung</h3>
                <p className="text-gray-300">
                  Ihre Dokumente werden geprüft. Dies dauert in der Regel 1-2 Werktage.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  // Realtime Status Indicator
  const isRealtimeActive = realtimeStatus.wallet || realtimeStatus.investments || realtimeStatus.spvs;

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-[#D4AF37]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-[#D4AF37]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
          {/* Header with Currency Selector + Realtime Status */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-transparent rounded-2xl md:rounded-3xl blur-xl" />
            <Card className="border-[#D4AF37]/30 border-2 bg-gradient-to-br from-gray-900/95 via-black to-black backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-full blur-2xl" />
              <CardContent className="p-4 md:p-6 lg:p-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="w-full md:w-auto">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                        <span className="text-white">{t('welcomeBack')},</span>
                        <br />
                        <span className="bg-gradient-to-r from-[#D4AF37] via-[#F4E4B0] to-[#D4AF37] bg-clip-text text-transparent break-words">
                          {user?.full_name?.split(' ')[0] || 'Investor'}
                        </span>
                      </h1>
                      {/* Realtime Status Indicator */}
                      {isRealtimeActive && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-xs font-bold text-green-400 uppercase">LIVE</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm md:text-base lg:text-lg text-gray-400 flex items-center gap-2">
                      <Activity className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]" />
                      {t('portfolioPerformance')}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <CurrencySelector 
                      selectedCurrency={selectedCurrency}
                      onCurrencyChange={setSelectedCurrency}
                      compact={true}
                    />
                    <Link to={createPageUrl("Marketplace")} className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold text-base md:text-lg px-6 md:px-8 py-4 md:py-6 shadow-2xl shadow-[#D4AF37]/50 transition-all hover:scale-105">
                        <Building2 className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                        {t('discoverInvestments')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* KYC Alert */}
          {getKYCAlert()}

          {/* Premium Stats Cards - NOW WITH MULTI-CURRENCY */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            <Card className="group border-[#D4AF37]/30 border-2 bg-gradient-to-br from-gray-900/95 via-black to-black backdrop-blur-xl hover:border-[#D4AF37] transition-all duration-500 hover:scale-105 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="pb-3 relative z-10">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-300 uppercase tracking-wider">{t('walletBalance')}</CardTitle>
                  <div className="p-2 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/30">
                    <Wallet className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl md:text-4xl font-bold text-white mb-2">
                  {formatCurrency(walletBalanceCurrency, selectedCurrency)}
                </div>
                <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 text-xs">{t('available')}</Badge>
              </CardContent>
            </Card>

            <Card className="group border-green-500/30 border-2 bg-gradient-to-br from-gray-900/95 via-black to-black backdrop-blur-xl hover:border-green-500 transition-all duration-500 hover:scale-105 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="pb-3 relative z-10">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-300 uppercase tracking-wider">{t('invested')}</CardTitle>
                  <div className="p-2 rounded-xl bg-green-500/20 border border-green-500/30">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl md:text-4xl font-bold text-white mb-2">
                  {formatCurrency(totalInvestedCurrency, selectedCurrency)}
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">{t('active')}</Badge>
              </CardContent>
            </Card>

            <Card className="group border-blue-500/30 border-2 bg-gradient-to-br from-gray-900/95 via-black to-black backdrop-blur-xl hover:border-blue-500 transition-all duration-500 hover:scale-105 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="pb-3 relative z-10">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-300 uppercase tracking-wider">{t('portfolioValue')}</CardTitle>
                  <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30">
                    <PieChart className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl md:text-4xl font-bold text-white mb-2">
                  {formatCurrency(portfolioValueCurrency, selectedCurrency)}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs border ${portfolioReturn >= 0 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                    {portfolioReturn >= 0 ? '+' : ''}{portfolioReturn.toFixed(2)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="group border-purple-500/30 border-2 bg-gradient-to-br from-gray-900/95 via-black to-black backdrop-blur-xl hover:border-purple-500 transition-all duration-500 hover:scale-105 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="pb-3 relative z-10">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-300 uppercase tracking-wider">{t('investments')}</CardTitle>
                  <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
                    <Building2 className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl md:text-4xl font-bold text-white mb-2">
                  {investments.length}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold text-base md:text-lg">SPVs</span>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">{t('active')}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Overview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <PriceTickerWidget />
            <VolumeChart />
            <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-bold text-gray-300">Market Status: Live</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">EUT Price</span>
                    <span className="text-lg font-bold text-white">
                      1.00 <span className="text-xs text-gray-500">USD</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">24h Volume</span>
                    <span className="text-lg font-bold text-white">2.4M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Active SPVs</span>
                    <span className="text-lg font-bold text-white">{spvs.filter(s => s.status === 'aktiv').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Market Cap</span>
                    <span className="text-lg font-bold text-[#D4AF37]">
                      {(spvs.reduce((sum, spv) => sum + ((spv.total_supply - spv.available_supply) * (spv.token_price_eut || spv.token_price)), 0) / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Premium Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Portfolio Performance Chart */}
            <Card className="border-[#D4AF37]/30 border-2 bg-gradient-to-br from-gray-900/95 via-black to-black backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-full blur-2xl" />
              <CardHeader className="border-b border-gray-800/50 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-xl font-bold mb-1">Portfolio Performance</CardTitle>
                    <p className="text-sm text-gray-400">vs. Benchmark (letzte 6 Monate)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#D4AF37]" />
                    <span className="text-xs text-gray-400">Portfolio</span>
                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                    <span className="text-xs text-gray-400">Benchmark</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 relative z-10">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={portfolioData}>
                    <defs>
                      <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6b7280" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#000', 
                        border: '2px solid #D4AF37',
                        borderRadius: '12px',
                        color: '#fff',
                        boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)'
                      }}
                      labelStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="portfolio" 
                      stroke="#D4AF37" 
                      fillOpacity={1} 
                      fill="url(#colorPortfolio)" 
                      strokeWidth={3}
                      name="Portfolio"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="benchmark" 
                      stroke="#6b7280" 
                      fillOpacity={1} 
                      fill="url(#colorBenchmark)" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Benchmark"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Returns Chart */}
            <Card className="border-[#D4AF37]/30 border-2 bg-gradient-to-br from-gray-900/95 via-black to-black backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl" />
              <CardHeader className="border-b border-gray-800/50 relative z-10">
                <CardTitle className="text-white text-xl font-bold">Monatliche Renditen</CardTitle>
                <p className="text-sm text-gray-400">Prozentuale Performance pro Monat</p>
              </CardHeader>
              <CardContent className="p-6 relative z-10">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#000', 
                        border: '2px solid #10b981',
                        borderRadius: '12px',
                        color: '#fff',
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
                      }}
                      labelStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    />
                    <Bar 
                      dataKey="return" 
                      fill="#10b981"
                      radius={[8, 8, 0, 0]}
                      name="Rendite (%)"
                    >
                      {monthlyPerformance.map((entry, index) => (
                        <rect 
                          key={`bar-${index}`}
                          fill={entry.return >= 0 ? '#10b981' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Active Investments & Market News */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card className="border-[#D4AF37]/30 border-2 bg-gradient-to-br from-gray-900/95 via-black to-black backdrop-blur-xl">
              <CardHeader className="border-b border-gray-800/50">
                <CardTitle className="text-white text-xl font-bold">Aktive Investments</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {investmentsLoading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
                    </div>
                  </div>
                ) : investments.length > 0 ? (
                  <div className="space-y-3">
                    {investments.slice(0, 4).map((inv) => (
                      <div key={inv.id} className="group p-4 rounded-xl bg-gray-900/50 hover:bg-gray-900/80 transition-all border-2 border-gray-800 hover:border-[#D4AF37]/50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                              <span className="text-black font-bold text-lg">
                                {inv.spv_symbol?.substring(0, 2) || 'SP'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-white text-lg mb-1">{inv.spv_name}</p>
                              <p className="text-sm text-gray-400">{inv.token_amount.toFixed(2)} Token</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white text-lg">
                              {formatCurrency(convertCurrency(inv.invested_amount, 'EUT', selectedCurrency), selectedCurrency)}
                            </p>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1 font-semibold">
                              Aktiv
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <div className="w-20 h-20 rounded-2xl bg-[#D4AF37]/10 border-2 border-[#D4AF37]/30 flex items-center justify-center mb-4">
                      <Building2 className="w-10 h-10 text-[#D4AF37]" />
                    </div>
                    <p className="text-gray-400 mb-4 text-lg">Noch keine Investments</p>
                    <Link to={createPageUrl("Marketplace")}>
                      <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold">
                        SPVs entdecken
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <MarketNewsWidget compact={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
