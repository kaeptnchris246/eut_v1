
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  Building2, 
  DollarSign,
  PieChart,
  Download,
  ArrowUpRight,
  Calendar
} from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format } from "date-fns";
import PortfolioAnalytics from '@/components/PortfolioAnalytics';
import AIRebalancing from '@/components/AIRebalancing';
import OnChainTransactionTracker from '@/components/OnChainTransactionTracker';
import SellInvestmentModal from '@/components/SellInvestmentModal';

export default function Portfolio() {
  const [user, setUser] = useState(null);
  const [selectedInvestmentForSale, setSelectedInvestmentForSale] = useState(null);
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

  const { data: investments, isLoading } = useQuery({
    queryKey: ['my-investments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Investment.filter({ investor_email: user.email });
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: transactions } = useQuery({
    queryKey: ['my-transactions', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Transaction.filter({ user_email: user.email }, '-created_date', 20);
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: spvs } = useQuery({
    queryKey: ['spvs'],
    queryFn: () => base44.entities.SPV.list(),
    initialData: [],
  });

  // Calculate portfolio metrics
  const totalInvested = investments.reduce((sum, inv) => sum + (inv.invested_amount || 0), 0);
  const currentValue = investments.reduce((sum, inv) => sum + (inv.current_value || inv.invested_amount || 0), 0);
  const unrealizedGainLoss = currentValue - totalInvested;
  const unrealizedGainLossPercent = totalInvested > 0 ? ((unrealizedGainLoss / totalInvested) * 100) : 0;
  const totalDividends = investments.reduce((sum, inv) => sum + (inv.dividends_earned || 0), 0);

  // Portfolio allocation data
  const allocationData = investments.map(inv => ({
    name: inv.spv_name,
    value: inv.current_value || inv.invested_amount || 0,
  }));

  // Mock performance data (in real app, this would come from historical data)
  const performanceData = [
    { date: 'Jan', value: totalInvested * 0.9 },
    { date: 'Feb', value: totalInvested * 0.95 },
    { date: 'Mär', value: totalInvested * 1.02 },
    { date: 'Apr', value: totalInvested * 1.08 },
    { date: 'Mai', value: totalInvested * 1.15 },
    { date: 'Jun', value: currentValue },
  ];

  const COLORS = ['#D4AF37', '#F4E4B0', '#B8941F', '#8B7A3A', '#6B5D2A', '#4A3F1C'];

  const exportPortfolio = () => {
    const data = investments.map(inv => ({
      'SPV Name': inv.spv_name,
      'Symbol': inv.spv_symbol,
      'Token Amount': inv.token_amount,
      'Invested': inv.invested_amount,
      'Current Value': inv.current_value || inv.invested_amount,
      'Purchase Price': inv.purchase_price,
      'Purchase Date': format(new Date(inv.purchase_date), 'dd.MM.yyyy'),
      'Status': inv.status,
      'Dividends': inv.dividends_earned || 0,
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Mein Portfolio</h1>
            <p className="text-gray-400">Übersicht über Ihre Investments</p>
          </div>
          <Button
            onClick={exportPortfolio}
            variant="outline"
            className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
            disabled={investments.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium text-gray-400">Investiert</CardTitle>
                <DollarSign className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {totalInvested.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-gray-400">UTK</p>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium text-gray-400">Aktueller Wert</CardTitle>
                <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {currentValue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-gray-400">UTK</p>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium text-gray-400">Unrealisierter Gewinn/Verlust</CardTitle>
                {unrealizedGainLoss >= 0 ? 
                  <TrendingUp className="w-5 h-5 text-green-400" /> :
                  <TrendingDown className="w-5 h-5 text-red-400" />
                }
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold mb-1 ${unrealizedGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {unrealizedGainLoss >= 0 ? '+' : ''}{unrealizedGainLoss.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <p className={`text-sm ${unrealizedGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {unrealizedGainLoss >= 0 ? '+' : ''}{unrealizedGainLossPercent.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium text-gray-400">Dividenden</CardTitle>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 mb-1">
                {totalDividends.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-gray-400">UTK erhalten</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
                Portfolio Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Line type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={3} dot={{ fill: '#D4AF37' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Allocation Chart */}
          <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#D4AF37]" />
                Portfolio Allokation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allocationData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-gray-400">Keine Investments vorhanden</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Holdings & Transactions Tabs */}
        <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
          <Tabs defaultValue="holdings" className="w-full">
            <CardHeader className="border-b-2 border-gray-700">
              <TabsList className="bg-gray-900 border-2 border-gray-700 grid grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="holdings" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
                  Holdings
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="rebalancing" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
                  AI Rebalancing
                </TabsTrigger>
                <TabsTrigger value="transactions" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
                  Transaktionen
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-6">
              <TabsContent value="holdings" className="mt-0">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D4AF37]" />
                  </div>
                ) : investments.length > 0 ? (
                  <div className="space-y-4">
                    {investments.map((inv) => {
                      const gainLoss = (inv.current_value || inv.invested_amount) - inv.invested_amount;
                      const gainLossPercent = (gainLoss / inv.invested_amount) * 100;
                      const isLocked = inv.lock_period_end && new Date(inv.lock_period_end) > new Date();
                      
                      return (
                        <div key={inv.id} className="p-6 rounded-xl border border-gray-800 bg-gray-900/30 hover:bg-gray-900/50 transition-all space-y-4">
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center flex-shrink-0">
                                <span className="text-black font-bold text-lg">
                                  {inv.spv_symbol?.substring(0, 2) || 'SP'}
                                </span>
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-white mb-1">{inv.spv_name}</h3>
                                <p className="text-sm text-gray-400 mb-2">{inv.spv_symbol}</p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30">
                                    {inv.token_amount.toLocaleString('de-DE', { minimumFractionDigits: 4 })} Token
                                  </Badge>
                                  <Badge className={`${
                                    inv.status === 'aktiv' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                    inv.status === 'gesperrt' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                    'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                  }`}>
                                    {inv.status}
                                  </Badge>
                                  {isLocked && (
                                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                      Gesperrt bis {format(new Date(inv.lock_period_end), 'dd.MM.yyyy')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs text-gray-400 mb-1">Investiert</p>
                                <p className="text-lg font-semibold text-white">
                                  {inv.invested_amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} UTK
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 mb-1">Aktueller Wert</p>
                                <p className="text-lg font-semibold text-white">
                                  {(inv.current_value || inv.invested_amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })} UTK
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 mb-1">Gewinn/Verlust</p>
                                <p className={`text-lg font-semibold ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {gainLoss >= 0 ? '+' : ''}{gainLoss.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                                  <span className="text-xs ml-1">
                                    ({gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                                  </span>
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 mb-1">Kaufdatum</p>
                                <p className="text-sm text-white flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(inv.purchase_date), 'dd.MM.yyyy')}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-4 border-t border-gray-800">
                            <Button
                              onClick={() => setSelectedInvestmentForSale(inv)}
                              variant="outline"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                              disabled={inv.status !== 'aktiv' || isLocked}
                            >
                              <TrendingDown className="w-4 h-4 mr-2" />
                              Verkaufen
                            </Button>
                            <Link to={createPageUrl(`SPVDetails?id=${inv.spv_id}`)}>
                              <Button variant="outline" className="border-gray-700">
                                <ArrowUpRight className="w-4 h-4 mr-2" />
                                Details
                              </Button>
                            </Link>
                          </div>

                          {/* On-Chain Transaction Tracker */}
                          {inv.is_onchain && inv.onchain_tx_hash && (
                            <OnChainTransactionTracker txHash={inv.onchain_tx_hash} network="sepolia" />
                          )}

                          {inv.dividends_earned && inv.dividends_earned > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-800">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-400">Erhaltene Dividenden:</span>
                                <span className="text-green-400 font-semibold">
                                  +{inv.dividends_earned.toLocaleString('de-DE', { minimumFractionDigits: 2 })} UTK
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Building2 className="w-16 h-16 text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Noch keine Investments</h3>
                    <p className="text-gray-400 mb-4">Entdecken Sie SPVs im Marktplatz</p>
                    <Link to={createPageUrl("Marketplace")}>
                      <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold">
                        <ArrowUpRight className="w-4 h-4 mr-2" />
                        Zum Marktplatz
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              {/* Analytics Tab - NEW */}
              <TabsContent value="analytics" className="mt-0 space-y-6">
                <PortfolioAnalytics investments={investments} spvs={spvs} />
              </TabsContent>

              {/* AI Rebalancing Tab - NEW */}
              <TabsContent value="rebalancing" className="mt-0">
                <AIRebalancing 
                  user={user} 
                  investments={investments} 
                  spvs={spvs}
                  onRebalance={() => {
                    queryClient.invalidateQueries(['my-investments']);
                    queryClient.invalidateQueries(['my-transactions']);
                    loadUser();
                  }}
                />
              </TabsContent>

              <TabsContent value="transactions" className="mt-0">
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-800 bg-gray-900/30 hover:bg-gray-900/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            tx.type.includes('kauf') || tx.type === 'dividende' ? 'bg-green-500/20' : 
                            tx.type.includes('verkauf') ? 'bg-red-500/20' : 
                            'bg-[#D4AF37]/20'
                          }`}>
                            {tx.type.includes('kauf') || tx.type === 'dividende' ? 
                              <TrendingUp className="w-5 h-5 text-green-400" /> : 
                              <TrendingDown className="w-5 h-5 text-red-400" />
                            }
                          </div>
                          <div>
                            <p className="font-semibold text-white">{tx.description || tx.type}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-sm text-gray-400">
                                {format(new Date(tx.created_date), 'dd.MM.yyyy HH:mm')}
                              </p>
                              {tx.spv_name && (
                                <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                                  {tx.spv_name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            tx.type.includes('verkauf') || tx.type === 'dividende' ? 'text-green-400' : 'text-white'
                          }`}>
                            {tx.type.includes('verkauf') || tx.type === 'dividende' ? '+' : '-'}
                            {tx.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} UTK
                          </p>
                          <Badge className={`mt-1 ${
                            tx.status === 'erfolgreich' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            tx.status === 'ausstehend' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    Noch keine Transaktionen
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* Sell Investment Modal */}
      {selectedInvestmentForSale && (
        <SellInvestmentModal
          investment={selectedInvestmentForSale}
          user={user}
          onClose={() => setSelectedInvestmentForSale(null)}
          onSuccess={() => {
            queryClient.invalidateQueries(['my-investments']);
            queryClient.invalidateQueries(['my-transactions']);
            loadUser();
          }}
        />
      )}
    </div>
  );
}
