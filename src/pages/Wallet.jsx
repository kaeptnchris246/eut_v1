import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import WalletConnect from "@/components/WalletConnect";

export default function Wallet() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

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

  const { data: transactions } = useQuery({
    queryKey: ['all-transactions', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Transaction.filter({ user_email: user.email }, '-created_date');
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const getTransactionIcon = (type) => {
    if (type.includes('kauf') || type === 'einzahlung' || type === 'dividende') {
      return <ArrowDownLeft className="w-4 h-4 md:w-5 md:h-5 text-green-400" />;
    }
    return <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-red-400" />;
  };

  const getStatusBadge = (status) => {
    const badges = {
      'erfolgreich': { label: 'Erfolgreich', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      'ausstehend': { label: 'Ausstehend', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      'fehlgeschlagen': { label: 'Fehlgeschlagen', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
      'storniert': { label: 'Storniert', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    };
    const badge = badges[status] || badges['erfolgreich'];
    return <Badge className={`${badge.className} text-xs`}>{badge.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Wallet</h1>
          <p className="text-sm md:text-base text-gray-400">Verwalten Sie Ihre EUT Token</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Card */}
            <Card className="border-[#D4AF37] border-2 bg-gradient-to-br from-[#D4AF37]/10 to-black shadow-2xl">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <WalletIcon className="w-8 h-8 md:w-10 md:h-10 text-[#D4AF37]" />
                  <span className="text-sm md:text-base text-gray-300 font-semibold">Verfügbares Guthaben</span>
                </div>
                <div className="text-4xl md:text-6xl font-bold text-white mb-2">
                  {(user?.wallet_balance || 0).toLocaleString('de-DE')}
                  <span className="text-2xl md:text-3xl text-[#D4AF37] ml-3">EUT</span>
                </div>
                <p className="text-sm md:text-lg text-gray-400">
                  ≈ €{((user?.wallet_balance || 0) * 1.2).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </p>
                
                <Link to={createPageUrl("BuyEUT")}>
                  <Button className="mt-6 w-full md:w-auto bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold text-base md:text-lg px-8 py-6">
                    <Plus className="w-5 h-5 mr-2" />
                    EUT kaufen
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card className="border-gray-700 border-2 bg-gradient-to-br from-gray-900 to-black">
              <Tabs defaultValue="all" className="w-full">
                <CardHeader className="border-b-2 border-gray-700">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <CardTitle className="text-lg md:text-xl text-white">Transaktionshistorie</CardTitle>
                    <TabsList className="bg-gray-900 border-2 border-gray-700 w-full md:w-auto">
                      <TabsTrigger value="all" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black data-[state=active]:font-bold text-xs md:text-sm">Alle</TabsTrigger>
                      <TabsTrigger value="token_kauf" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black data-[state=active]:font-bold text-xs md:text-sm">Käufe</TabsTrigger>
                      <TabsTrigger value="spv_kauf" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black data-[state=active]:font-bold text-xs md:text-sm">Investments</TabsTrigger>
                    </TabsList>
                  </div>
                </CardHeader>

                <CardContent className="p-4 md:p-6">
                  <TabsContent value="all" className="mt-0">
                    {transactions.length > 0 ? (
                      <div className="space-y-3">
                        {transactions.map((tx) => (
                          <div 
                            key={tx.id} 
                            className="flex items-center justify-between p-4 md:p-5 rounded-xl bg-gray-900 border-2 border-gray-700 hover:border-[#D4AF37] transition-all"
                          >
                            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                              <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                                tx.type.includes('kauf') || tx.type === 'einzahlung' || tx.type === 'dividende'
                                  ? 'bg-green-500/20 border-green-400' 
                                  : 'bg-red-500/20 border-red-400'
                              }`}>
                                {getTransactionIcon(tx.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-sm md:text-lg truncate">{tx.description || tx.type}</p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                                  <p className="text-xs md:text-sm text-gray-400">
                                    {new Date(tx.created_date).toLocaleString('de-DE')}
                                  </p>
                                  {tx.spv_name && (
                                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-300 font-semibold w-fit">
                                      {tx.spv_name}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <p className={`text-base md:text-xl font-bold ${
                                tx.type.includes('verkauf') || tx.type === 'einzahlung' || tx.type === 'dividende'
                                  ? 'text-green-400' 
                                  : 'text-white'
                              }`}>
                                {tx.type.includes('verkauf') || tx.type === 'einzahlung' || tx.type === 'dividende' ? '+' : '-'}
                                {tx.amount.toLocaleString('de-DE')}
                              </p>
                              {getStatusBadge(tx.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <WalletIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-sm md:text-base text-gray-400">Noch keine Transaktionen</p>
                      </div>
                    )}
                  </TabsContent>

                  {['token_kauf', 'spv_kauf'].map(type => (
                    <TabsContent key={type} value={type} className="mt-0">
                      {transactions.filter(tx => tx.type === type).length > 0 ? (
                        <div className="space-y-3">
                          {transactions.filter(tx => tx.type === type).map((tx) => (
                            <div 
                              key={tx.id} 
                              className="flex items-center justify-between p-4 md:p-5 rounded-xl bg-gray-900 border-2 border-gray-700 hover:border-[#D4AF37] transition-all"
                            >
                              <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                                  tx.type.includes('kauf') ? 'bg-green-500/20 border-green-400' : 'bg-red-500/20 border-red-400'
                                }`}>
                                  {getTransactionIcon(tx.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-white text-sm md:text-lg truncate">{tx.description || tx.type}</p>
                                  <p className="text-xs md:text-sm text-gray-400 mt-1">
                                    {new Date(tx.created_date).toLocaleString('de-DE')}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <p className={`text-base md:text-xl font-bold ${
                                  tx.type === 'spv_verkauf' ? 'text-green-400' : 'text-white'
                                }`}>
                                  {tx.type === 'spv_verkauf' ? '+' : '-'}
                                  {tx.amount.toLocaleString('de-DE')}
                                </p>
                                {getStatusBadge(tx.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-sm md:text-base text-gray-400">Keine {type.replace(/_/g, ' ')} Transaktionen</p>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <WalletConnect />

            <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to={createPageUrl("BuyEUT")}>
                  <Button className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold">
                    <Plus className="w-4 h-4 mr-2" />
                    EUT kaufen
                  </Button>
                </Link>
                <Link to={createPageUrl("Marketplace")}>
                  <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-gray-900">
                    Investieren
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm mb-1">Tipp</p>
                    <p className="text-xs text-gray-300">
                      Kaufen Sie jetzt EUT mit Fiat und profitieren Sie von 0% Gebühren im ersten Monat!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}