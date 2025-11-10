
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Shield,
  FileText,
  Building2,
  AlertTriangle
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from "sonner";
import SmartContractInvest from '@/components/SmartContractInvest';
import ExplainerBox from '@/components/ExplainerBox';

export default function SPVDetails() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [investAmount, setInvestAmount] = useState("");
  const [isInvesting, setIsInvesting] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const spvId = urlParams.get('id');

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

  const { data: spv, isLoading } = useQuery({
    queryKey: ['spv', spvId],
    queryFn: async () => {
      const spvs = await base44.entities.SPV.filter({ id: spvId });
      return spvs[0];
    },
    enabled: !!spvId,
  });

  const handleInvest = async () => {
    if (!user) {
      toast.error("Bitte melden Sie sich an");
      base44.auth.redirectToLogin();
      return;
    }

    if (user.kyc_status !== 'verifiziert') {
      toast.error("Bitte schließen Sie zuerst die KYC-Verifizierung ab");
      navigate(createPageUrl("KYC"));
      return;
    }

    const amount = parseFloat(investAmount);
    const minInvestment = spv.minimum_investment_eut || spv.minimum_investment;
    if (isNaN(amount) || amount < minInvestment) {
      toast.error(`Mindestinvestment: ${minInvestment} EUT`);
      return;
    }

    if (amount > user.wallet_balance) {
      toast.error("Unzureichendes Wallet-Guthaben");
      navigate(createPageUrl("Wallet"));
      return;
    }

    setIsInvesting(true);

    try {
      const tokenPrice = spv.token_price_eut || spv.token_price;
      const tokenAmount = amount / tokenPrice;

      // Create investment
      await base44.entities.Investment.create({
        spv_id: spv.id,
        spv_name: spv.name,
        spv_symbol: spv.symbol,
        investor_email: user.email,
        token_amount: tokenAmount,
        invested_amount: amount,
        purchase_price: tokenPrice,
        current_value: amount,
        purchase_date: new Date().toISOString(),
        status: 'aktiv',
      });

      // Create transaction
      await base44.entities.Transaction.create({
        user_email: user.email,
        type: 'spv_kauf',
        amount: amount,
        spv_id: spv.id,
        spv_name: spv.name,
        description: `Kauf von ${tokenAmount.toFixed(2)} ${spv.symbol} Token`,
        status: 'erfolgreich',
      });

      // Update user wallet
      await base44.auth.updateMe({
        wallet_balance: user.wallet_balance - amount,
        total_invested: (user.total_invested || 0) + amount,
      });

      // Update SPV available supply
      await base44.entities.SPV.update(spv.id, {
        available_supply: spv.available_supply - tokenAmount,
        key_metrics: {
          ...(spv.key_metrics || {}),
          total_invested: (spv.key_metrics?.total_invested || 0) + amount,
          number_of_investors: (spv.key_metrics?.number_of_investors || 0) + 1,
        }
      });

      toast.success("Investment erfolgreich!");
      setInvestAmount("");
      queryClient.invalidateQueries();
      navigate(createPageUrl("Portfolio"));
    } catch (error) {
      toast.error("Investment fehlgeschlagen: " + error.message);
      console.error(error);
    }

    setIsInvesting(false);
  };

  if (isLoading || !spv) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]" />
      </div>
    );
  }

  const mockPerformanceData = spv.nav_history || spv.performance_history || [
    { date: '2024-01', nav_per_token: (spv.token_price_eut || spv.token_price) * 0.85, percentage_change: 0 },
    { date: '2024-02', nav_per_token: (spv.token_price_eut || spv.token_price) * 0.90, percentage_change: 5.9 },
    { date: '2024-03', nav_per_token: (spv.token_price_eut || spv.token_price) * 0.94, percentage_change: 4.4 },
    { date: '2024-04', nav_per_token: (spv.token_price_eut || spv.token_price) * 0.97, percentage_change: 3.2 },
    { date: '2024-05', nav_per_token: (spv.token_price_eut || spv.token_price) * 0.99, percentage_change: 2.1 },
    { date: '2024-06', nav_per_token: (spv.token_price_eut || spv.token_price), percentage_change: 1.0 },
  ];

  const allocationData = [
    { name: 'Projekt A', value: 35 },
    { name: 'Projekt B', value: 25 },
    { name: 'Projekt C', value: 20 },
    { name: 'Reserve', value: 20 },
  ];

  const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'];

  const getRiskColor = (risk) => {
    const colors = {
      'niedrig': 'bg-green-500/20 text-green-400 border-green-500/30',
      'mittel': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'hoch': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'sehr_hoch': 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[risk] || colors['mittel'];
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Marketplace"))}
          className="text-gray-300 hover:text-white hover:bg-gray-900 border-2 border-transparent hover:border-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zum Marktplatz
        </Button>

        {/* Explainer: Token Economics */}
        <ExplainerBox title="Token-System verstehen" type="info">
          <p className="mb-2">
            <strong>Security Token ({spv.symbol}):</strong> Dies ist ein regulierter digitaler Wertpapier-Token nach {spv.token_standard || 'ERC-1400'} Standard.
          </p>
          <p className="mb-2">
            <strong>Kaufprozess:</strong> Sie zahlen mit EUT (Euphena Utility Token).
            Aktueller Preis: <span className="text-[#D4AF37] font-bold">{spv.token_price_eut || spv.token_price} EUT pro {spv.symbol}</span>
          </p>
          <p className="text-blue-300">
            <strong>Wichtig:</strong> Der Token-Preis ist variabel und ändert sich basierend auf dem NAV (Net Asset Value)
            und der Marktnachfrage - ähnlich wie Aktienpreise!
          </p>
        </ExplainerBox>

        {/* Hero Section */}
        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden border-2 border-gray-700">
          {spv.image_url ? (
            <img src={spv.image_url} alt={spv.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#B8941F]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <Badge className={`${getRiskColor(spv.risk_level)} mb-4 font-bold`}>
              Risiko: {spv.risk_level}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{spv.name}</h1>
            <p className="text-xl text-gray-200">{spv.description}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <DollarSign className="w-4 h-4" />
                    Token Preis
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {spv.token_price_eut || spv.token_price}
                    <span className="text-sm text-[#D4AF37] ml-1">EUT</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                      {spv.token_standard || 'ERC-1400'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <TrendingUp className="w-4 h-4" />
                    Ziel-Rendite
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    {spv.target_return}% p.a.
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <Calendar className="w-4 h-4" />
                    Laufzeit
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {spv.duration_months} <span className="text-sm">Mon.</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <Users className="w-4 h-4" />
                    Investoren
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {spv.key_metrics?.number_of_investors || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
              <Tabs defaultValue="overview" className="w-full">
                <CardHeader className="border-b-2 border-gray-700">
                  <TabsList className="bg-gray-900 border-2 border-gray-700">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black data-[state=active]:font-bold">Übersicht</TabsTrigger>
                    <TabsTrigger value="performance" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black data-[state=active]:font-bold">NAV & Performance</TabsTrigger>
                    <TabsTrigger value="legal" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black data-[state=active]:font-bold">Rechtliches</TabsTrigger>
                    <TabsTrigger value="documents" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black data-[state=active]:font-bold">Dokumente</TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="p-6">
                  <TabsContent value="overview" className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">Über diesen SPV</h3>
                      <p className="text-gray-300 leading-relaxed">
                        {spv.long_description || spv.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">Portfolio Allokation</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={allocationData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {allocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>

                  <TabsContent value="performance">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
                          NAV Entwicklung (Net Asset Value pro Token)
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                          Der NAV zeigt den echten Wert pro Token basierend auf den zugrundeliegenden Assets
                        </p>
                        <ResponsiveContainer width="100%" height={350}>
                          <LineChart data={mockPerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#fff'
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="nav_per_token"
                              stroke="#D4AF37"
                              strokeWidth={3}
                              dot={{ fill: '#D4AF37', r: 5 }}
                              name="NAV (EUT)"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-gray-900 border-2 border-gray-700">
                          <p className="text-gray-400 text-sm mb-1">Aktueller NAV</p>
                          <p className="text-2xl font-bold text-[#D4AF37]">
                            {spv.nav_per_token ? spv.nav_per_token.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (spv.token_price_eut || spv.token_price).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUT
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-900 border-2 border-gray-700">
                          <p className="text-gray-400 text-sm mb-1">Gesamt AUM</p>
                          <p className="text-2xl font-bold text-white">
                            {((spv.key_metrics?.aum || spv.key_metrics?.total_invested || 0) / 1000000).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M EUT
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-900 border-2 border-gray-700">
                          <p className="text-gray-400 text-sm mb-1">Ø Rendite</p>
                          <p className="text-2xl font-bold text-green-400">
                            +{spv.key_metrics?.avg_return || spv.target_return}%
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <p className="text-sm text-blue-300">
                          <strong>NAV-Entwicklung:</strong> Der Preis dieser Security Tokens schwankt basierend auf
                          dem echten Wert der zugrundeliegenden Assets (Immobilien, Energieanlagen, etc.) plus Performance.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="legal">
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-gray-900 border-2 border-gray-700">
                          <p className="text-gray-400 text-sm mb-1">Rechtsform</p>
                          <p className="text-white font-semibold">{spv.legal_entity || 'GmbH & Co. KG'}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-900 border-2 border-gray-700">
                          <p className="text-gray-400 text-sm mb-1">Handelsregister</p>
                          <p className="text-white font-semibold">{spv.registration_number || 'HRB XXXXX'}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-900 border-2 border-gray-700">
                          <p className="text-gray-400 text-sm mb-1">Jurisdiktion</p>
                          <p className="text-white font-semibold">{spv.jurisdiction || 'Deutschland'}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-900 border-2 border-gray-700">
                          <p className="text-gray-400 text-sm mb-1">Manager</p>
                          <p className="text-white font-semibold">{spv.manager_name || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                        <div className="flex gap-4">
                          <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white mb-2">Risikohinweis</h4>
                            <p className="text-sm text-gray-300">
                              Investitionen in SPVs sind mit Risiken verbunden. Der Wert kann schwanken und
                              es besteht das Risiko eines Totalverlusts. Bitte lesen Sie den Verkaufsprospekt
                              sorgfältig durch, bevor Sie investieren.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="documents">
                    <div className="space-y-4">
                      {spv.whitepaper_url && (
                        <a
                          href={spv.whitepaper_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900 border-2 border-gray-700 hover:bg-gray-800 transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-cyan-400" />
                              <div>
                                <p className="font-semibold text-white">Whitepaper</p>
                                <p className="text-sm text-gray-400">Detaillierte Projektbeschreibung</p>
                              </div>
                            </div>
                            <Download className="w-5 h-5 text-gray-400" />
                          </div>
                        </a>
                      )}

                      {spv.prospectus_url && (
                        <a
                          href={spv.prospectus_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900 border-2 border-gray-700 hover:bg-gray-800 transition-colors">
                            <div className="flex items-center gap-3">
                              <Shield className="w-5 h-5 text-purple-400" />
                              <div>
                                <p className="font-semibold text-white">Verkaufsprospekt</p>
                                <p className="text-sm text-gray-400">Rechtliche Dokumente</p>
                              </div>
                            </div>
                            <Download className="w-5 h-5 text-gray-400" />
                          </div>
                        </a>
                      )}

                      {spv.documents?.map((doc, index) => (
                        <a
                          key={index}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900 border-2 border-gray-700 hover:bg-gray-800 transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-green-400" />
                              <div>
                                <p className="font-semibold text-white">{doc.name}</p>
                                <p className="text-sm text-gray-400">{doc.type}</p>
                              </div>
                            </div>
                            <Download className="w-5 h-5 text-gray-400" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Investment Sidebar */}
          <div className="space-y-6">
            {/* Traditional Investment Card */}
            <Card className="border-2 border-[#D4AF37] bg-gradient-to-br from-[#D4AF37]/10 to-black shadow-2xl">
              <CardHeader className="border-b-2 border-[#D4AF37]/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-xl font-bold">Investieren</CardTitle>
                    <p className="text-xs text-gray-400 mt-1">Mit EUT aus Ihrem Wallet</p>
                  </div>
                  <Badge className="bg-[#D4AF37]/20 text-[#D4AF37]">
                    {spv.symbol}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block font-semibold">Betrag (EUT)</label>
                  <Input
                    type="number"
                    placeholder={`Min. ${spv.minimum_investment_eut || spv.minimum_investment}`}
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    className="bg-gray-900 border-2 border-gray-700 text-white text-lg focus:border-[#D4AF37]"
                  />
                  {user && (
                    <p className="text-xs text-gray-400 mt-2">
                      Verfügbar: {user.wallet_balance?.toLocaleString('de-DE')} EUT
                    </p>
                  )}
                </div>

                {investAmount && !isNaN(parseFloat(investAmount)) && (
                  <div className="p-4 rounded-lg bg-gray-900 border-2 border-gray-700">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Sie erhalten</span>
                      <span className="text-white font-bold">
                        {(parseFloat(investAmount) / (spv.token_price_eut || spv.token_price)).toFixed(4)} {spv.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Token-Standard</span>
                      <span className="text-purple-400 font-mono text-xs">{spv.token_standard || 'ERC-1400'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Gebühren</span>
                      <span className="text-white font-bold">0 EUT</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleInvest}
                  disabled={isInvesting || !investAmount || spv.available_supply <= 0}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold text-lg py-6"
                >
                  {isInvesting ? 'Wird verarbeitet...' : 'Jetzt investieren'}
                </Button>

                <div className="pt-4 border-t-2 border-gray-700 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Min. Investment</span>
                    <span className="text-white font-bold">{(spv.minimum_investment_eut || spv.minimum_investment).toLocaleString('de-DE')} EUT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Verfügbar</span>
                    <span className="text-white font-bold">
                      {spv.available_supply.toLocaleString('de-DE')} Token
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sperrfrist</span>
                    <span className="text-white font-bold">6 Monate</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Smart Contract Investment - NEW */}
            <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-purple-500/20 text-purple-400">On-Chain</Badge>
                  <Badge className="bg-[#D4AF37]/20 text-[#D4AF37]">ERC-1400</Badge>
                </div>
                <CardTitle className="text-white text-lg">Smart Contract Investment</CardTitle>
                <p className="text-xs text-gray-400 mt-1">
                  Direktes Investment via Blockchain
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <SmartContractInvest
                  spv={spv}
                  user={user}
                  onSuccess={() => {
                    queryClient.invalidateQueries();
                    toast.success('Weiterleitung zum Portfolio...');
                    setTimeout(() => navigate(createPageUrl('Portfolio')), 2000);
                  }}
                />
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
              <CardHeader>
                <CardTitle className="text-white text-sm font-bold">Manager Kontakt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center border-2 border-white">
                    <Building2 className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{spv.manager_name || 'SPV Manager'}</p>
                    <p className="text-sm text-gray-400">{spv.manager_email || 'manager@spv.com'}</p>
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
