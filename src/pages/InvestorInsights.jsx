
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  Target,
  Shield,
  Calendar,
  FileText,
  Coins,
  BarChart3,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Users,
  Globe,
  Briefcase,
  Activity // Add if not already imported
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MarketNewsWidget from '@/components/MarketNewsWidget';
import VolumeChart from '@/components/VolumeChart';

export default function InvestorInsights() {
  const [user, setUser] = useState(null);
  const [selectedSPV, setSelectedSPV] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const { data: spvs } = useQuery({
    queryKey: ['spvs'],
    queryFn: () => base44.entities.SPV.list(),
    initialData: [],
  });

  const { data: investments } = useQuery({
    queryKey: ['my-investments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Investment.filter({ investor_email: user.email });
    },
    enabled: !!user?.email,
    initialData: [],
  });

  // Select first investment's SPV or first SPV as default
  useEffect(() => {
    if (!selectedSPV && investments.length > 0) {
      const firstInvestment = investments[0];
      const spv = spvs.find(s => s.id === firstInvestment.spv_id);
      setSelectedSPV(spv);
    } else if (!selectedSPV && spvs.length > 0) {
      setSelectedSPV(spvs[0]);
    }
  }, [investments, spvs, selectedSPV]);

  if (!selectedSPV) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]" />
      </div>
    );
  }

  // Mock data for demonstration
  const tokenomicsData = {
    totalSupply: selectedSPV.total_supply,
    circulating: selectedSPV.total_supply - selectedSPV.available_supply,
    locked: selectedSPV.available_supply,
    distribution: [
      { name: 'Investoren', value: 60, color: '#D4AF37' },
      { name: 'Team & Advisor', value: 15, color: '#10b981' },
      { name: 'Reserve', value: 20, color: '#3b82f6' },
      { name: 'Marketing', value: 5, color: '#8b5cf6' },
    ]
  };

  const roadmapMilestones = [
    {
      quarter: 'Q4 2024',
      title: 'Platform Launch',
      status: 'completed',
      achievements: ['Beta Release', 'First 100 Investors', 'KYC System Live']
    },
    {
      quarter: 'Q1 2025',
      title: 'Market Expansion',
      status: 'in_progress',
      achievements: ['Multi-Currency Support', 'Mobile App', 'Secondary Market']
    },
    {
      quarter: 'Q2 2025',
      title: 'Advanced Features',
      status: 'upcoming',
      achievements: ['AI Trading Bot', 'Staking Program', 'Governance Module']
    },
    {
      quarter: 'Q3 2025',
      title: 'Global Scaling',
      status: 'upcoming',
      achievements: ['International Licenses', 'Institutional Partnerships', 'DeFi Integration']
    }
  ];

  const keyMetrics = [
    { label: 'Total AUM', value: `${((selectedSPV.key_metrics?.aum || 0) / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'text-[#D4AF37]' },
    { label: 'Active Investors', value: selectedSPV.key_metrics?.number_of_investors || 0, icon: Users, color: 'text-green-400' },
    { label: 'Avg. Return', value: `${selectedSPV.key_metrics?.avg_return || selectedSPV.target_return}%`, icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Risk Rating', value: selectedSPV.risk_level, icon: Shield, color: 'text-purple-400' }
  ];

  const documents = [
    {
      title: 'Whitepaper',
      description: 'Comprehensive technical documentation',
      url: selectedSPV.whitepaper_url,
      icon: FileText,
      size: '2.4 MB',
      pages: 45,
      lang: 'EN/DE'
    },
    {
      title: 'Verkaufsprospekt',
      description: 'Legal documentation and terms',
      url: selectedSPV.prospectus_url,
      icon: Shield,
      size: '1.8 MB',
      pages: 32,
      lang: 'DE'
    },
    {
      title: 'Business Plan',
      description: 'Strategic roadmap and financials',
      url: '#',
      icon: Briefcase,
      size: '3.2 MB',
      pages: 58,
      lang: 'EN'
    },
    {
      title: 'Exposé',
      description: 'Investment opportunity overview',
      url: '#',
      icon: Globe,
      size: '1.2 MB',
      pages: 12,
      lang: 'EN/DE/TH'
    }
  ];

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-transparent rounded-3xl blur-xl" />
          <Card className="border-[#D4AF37]/30 border-2 bg-gradient-to-br from-gray-900/95 via-black to-black backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-full blur-2xl" />
            <CardContent className="p-6 md:p-8 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                  <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] mb-3">Investor Insights Dashboard</Badge>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
                    {selectedSPV.name}
                  </h1>
                  <p className="text-gray-400">Konsolidierte Investoren-Informationen</p>
                </div>
                <Link to={createPageUrl(`SPVDetails?id=${selectedSPV.id}`)}>
                  <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-black font-bold">
                    <Eye className="w-4 h-4 mr-2" />
                    Vollständige Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SPV Selector */}
        {spvs.length > 1 && (
          <Card className="border-gray-800 bg-gray-900/50">
            <CardContent className="p-4">
              <div className="flex gap-2 overflow-x-auto">
                {spvs.filter(s => s.status === 'aktiv').map(spv => (
                  <Button
                    key={spv.id}
                    variant={selectedSPV?.id === spv.id ? 'default' : 'outline'}
                    onClick={() => setSelectedSPV(spv)}
                    className={`flex-shrink-0 ${
                      selectedSPV?.id === spv.id
                        ? 'bg-[#D4AF37] text-black'
                        : 'bg-gray-900 text-white border-gray-700'
                    }`}
                  >
                    {spv.symbol}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {keyMetrics.map((metric, idx) => (
            <Card key={idx} className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black relative">
              {idx === 0 && (
                <div className="absolute top-2 right-2">
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-green-400 animate-pulse" />
                    <span className="text-xs text-green-400 font-bold">LIVE</span>
                  </div>
                </div>
              )}
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                  <span className="text-xs text-gray-400">{metric.label}</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white">{metric.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
          <Tabs defaultValue="overview" className="w-full">
            <CardHeader className="border-b-2 border-gray-700">
              <TabsList className="bg-gray-900 border-2 border-gray-700 grid grid-cols-2 md:grid-cols-5">
                <TabsTrigger value="overview" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
                  Übersicht
                </TabsTrigger>
                <TabsTrigger value="tokenomics" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
                  Tokenomics
                </TabsTrigger>
                <TabsTrigger value="strategy" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
                  Strategie
                </TabsTrigger>
                <TabsTrigger value="risks" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
                  Risiken
                </TabsTrigger>
                <TabsTrigger value="roadmap" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
                  Roadmap
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Executive Summary</h3> {/* Changed text-xl to text-2xl */}
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {selectedSPV.long_description || selectedSPV.description}
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-gray-900 border-2 border-gray-700">
                      <p className="text-gray-400 text-sm mb-1">Investment Focus</p>
                      <p className="text-white font-semibold capitalize">{selectedSPV.category?.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-900 border-2 border-gray-700">
                      <p className="text-gray-400 text-sm mb-1">Token Standard</p>
                      <p className="text-purple-400 font-semibold">{selectedSPV.token_standard || 'ERC-1400'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-900 border-2 border-gray-700">
                      <p className="text-gray-400 text-sm mb-1">Minimum Investment</p>
                      <p className="text-white font-semibold">{selectedSPV.minimum_investment_eut} EUT</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-900 border-2 border-gray-700">
                      <p className="text-gray-400 text-sm mb-1">Duration</p>
                      <p className="text-white font-semibold">{selectedSPV.duration_months} Monate</p>
                    </div>
                  </div>
                </div>

                {/* Live Market Data Section - NEW */}
                <div className="grid md:grid-cols-2 gap-6">
                  <VolumeChart spvId={selectedSPV.id} />
                  <Card className="border-2 border-gray-700 bg-black/50">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#D4AF37] animate-pulse" />
                        Live Market Data
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-gray-900">
                        <span className="text-gray-400">Current Price</span>
                        <span className="text-xl font-bold text-white">
                          {(selectedSPV.token_price_eut || selectedSPV.token_price).toFixed(2)}
                          <span className="text-sm text-[#D4AF37] ml-2">EUT</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-gray-900">
                        <span className="text-gray-400">24h Change</span>
                        <Badge className="bg-green-500/20 text-green-400">
                          +{(Math.random() * 5).toFixed(2)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-gray-900">
                        <span className="text-gray-400">Market Cap</span>
                        <span className="text-lg font-bold text-white">
                          {(((selectedSPV.total_supply - selectedSPV.available_supply) * (selectedSPV.token_price_eut || selectedSPV.token_price)) / 1000000).toFixed(2)}M EUT
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-gray-900">
                        <span className="text-gray-400">24h Volume</span>
                        <span className="text-lg font-bold text-white">
                          {(Math.random() * 500 + 100).toFixed(0)}K EUT
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-gray-900">
                        <span className="text-gray-400">Circulating</span>
                        <span className="text-lg font-bold text-white">
                          {(selectedSPV.total_supply - selectedSPV.available_supply).toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Market News Section - NEW */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#D4AF37]" />
                    Latest News & Updates
                  </h3>
                  <MarketNewsWidget spvSymbol={selectedSPV.symbol} />
                </div>


                {/* Documents Section */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#D4AF37]" />
                    Wichtige Dokumente
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {documents.map((doc, idx) => (
                      <Card key={idx} className="border-gray-700 bg-gray-900/50 hover:bg-gray-900/80 transition-all">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                              <doc.icon className="w-6 h-6 text-[#D4AF37]" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-white mb-1">{doc.title}</h4>
                              <p className="text-sm text-gray-400 mb-2">{doc.description}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>{doc.size}</span>
                                <span>•</span>
                                <span>{doc.pages} pages</span>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">{doc.lang}</Badge>
                              </div>
                            </div>
                            {doc.url && (
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="outline" className="border-[#D4AF37] text-[#D4AF37]">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Tokenomics Tab */}
              <TabsContent value="tokenomics" className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Coins className="w-5 h-5 text-[#D4AF37]" />
                    Token Economics
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <Card className="border-2 border-gray-700 bg-gray-900">
                      <CardContent className="p-5">
                        <p className="text-gray-400 text-sm mb-1">Total Supply</p>
                        <p className="text-3xl font-bold text-white">{tokenomicsData.totalSupply.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">{selectedSPV.symbol} Token</p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-gray-700 bg-gray-900">
                      <CardContent className="p-5">
                        <p className="text-gray-400 text-sm mb-1">Circulating</p>
                        <p className="text-3xl font-bold text-green-400">{tokenomicsData.circulating.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {((tokenomicsData.circulating / tokenomicsData.totalSupply) * 100).toFixed(1)}% of supply
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-gray-700 bg-gray-900">
                      <CardContent className="p-5">
                        <p className="text-gray-400 text-sm mb-1">Available</p>
                        <p className="text-3xl font-bold text-blue-400">{tokenomicsData.locked.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">Ready for investment</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-2 border-gray-700 bg-gray-900">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Token Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {tokenomicsData.distribution.map((item, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-300">{item.name}</span>
                              <span className="text-white font-bold">{item.value}%</span>
                            </div>
                            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${item.value}%`, backgroundColor: item.color }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-400" />
                    Variable Token Pricing
                  </h4>
                  <p className="text-sm text-gray-300">
                    Der Token-Preis ist <strong>nicht fixiert</strong> und basiert auf dem NAV (Net Asset Value)
                    der zugrundeliegenden Assets. Der Preis steigt mit der Performance und Nachfrage.
                  </p>
                </div>
              </TabsContent>

              {/* Strategy Tab */}
              <TabsContent value="strategy" className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#D4AF37]" />
                    Geschäftsstrategie & Ziele
                  </h3>
                  <div className="space-y-4">
                    <Card className="border-gray-700 bg-gray-900/50">
                      <CardContent className="p-5">
                        <h4 className="font-bold text-white mb-2">Investment Thesis</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {selectedSPV.category === 'erneuerbare_energien'
                            ? 'Fokus auf zukunftsfähige Energielösungen mit stabilen Cash-Flows und ESG-Compliance. Investitionen in Solar, Wind und Energiespeicherung mit langfristigem Wertsteigerungspotential.'
                            : selectedSPV.category === 'immobilien'
                            ? 'Diversifiziertes Immobilienportfolio in wachstumsstarken Metropolregionen. Kombination aus Mietrendite und Wertsteigerung durch strategische Entwicklungsprojekte.'
                            : 'Strategische Investments in hochskalierbare Tech-Unternehmen mit nachweisbarem Product-Market-Fit und erfahrenen Management-Teams.'
                          }
                        </p>
                      </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="border-gray-700 bg-gray-900/50">
                        <CardContent className="p-5">
                          <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            Revenue Model
                          </h4>
                          <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>Quarterly dividend distributions</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>Asset appreciation & NAV growth</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>Exit strategy: Trade sale or IPO</span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border-gray-700 bg-gray-900/50">
                        <CardContent className="p-5">
                          <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-blue-400" />
                            Target Returns
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Expected Annual Return</p>
                              <p className="text-2xl font-bold text-green-400">{selectedSPV.target_return}% p.a.</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Historical Performance</p>
                              <p className="text-lg font-semibold text-white">
                                {selectedSPV.key_metrics?.avg_return || selectedSPV.target_return}% avg
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Risks Tab */}
              <TabsContent value="risks" className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-yellow-400" />
                    Risiko-Analyse
                  </h3>

                  <Card className="border-2 border-yellow-500/30 bg-yellow-500/10 mb-6">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold text-white mb-2">Risikoprofil: {selectedSPV.risk_level}</h4>
                          <p className="text-sm text-gray-300">
                            Dieses Investment ist als <strong>{selectedSPV.risk_level}</strong> Risiko eingestuft.
                            Bitte lesen Sie die vollständigen Risikohinweise im Verkaufsprospekt.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border-gray-700 bg-gray-900/50">
                      <CardContent className="p-5">
                        <h4 className="font-bold text-white mb-3">Marktrisiken</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                          <li className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span>Volatilität des Token-Preises basierend auf NAV</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span>Allgemeine Marktbedingungen und Rezessionsrisiken</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span>Liquiditätsrisiko im Sekundärmarkt</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-700 bg-gray-900/50">
                      <CardContent className="p-5">
                        <h4 className="font-bold text-white mb-3">Operationelle Risiken</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                          <li className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span>Smart Contract & Technologie-Risiken</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span>Regulatorische Unsicherheiten</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span>Plattform- und Manager-Risiko</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-gray-700 bg-gray-900/50">
                    <CardContent className="p-5">
                      <h4 className="font-bold text-white mb-3">Risiko-Mitigation</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                          <CheckCircle2 className="w-5 h-5 text-green-400 mb-2" />
                          <p className="text-xs text-gray-300">
                            <strong className="text-white">Diversifikation:</strong> Portfolio über mehrere Assets gestreut
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                          <CheckCircle2 className="w-5 h-5 text-green-400 mb-2" />
                          <p className="text-xs text-gray-300">
                            <strong className="text-white">Due Diligence:</strong> Umfassende Prüfung aller Assets
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                          <CheckCircle2 className="w-5 h-5 text-green-400 mb-2" />
                          <p className="text-xs text-gray-300">
                            <strong className="text-white">Compliance:</strong> Regulierte Struktur & Reporting
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Roadmap Tab */}
              <TabsContent value="roadmap" className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#D4AF37]" />
                    Projekt-Roadmap & Meilensteine
                  </h3>

                  <div className="space-y-4">
                    {roadmapMilestones.map((milestone, idx) => (
                      <Card key={idx} className={`border-2 ${
                        milestone.status === 'completed' ? 'border-green-500/30 bg-green-500/10' :
                        milestone.status === 'in_progress' ? 'border-blue-500/30 bg-blue-500/10' :
                        'border-gray-700 bg-gray-900/50'
                      }`}>
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              milestone.status === 'completed' ? 'bg-green-500/20 border-2 border-green-500' :
                              milestone.status === 'in_progress' ? 'bg-blue-500/20 border-2 border-blue-500' :
                              'bg-gray-700 border-2 border-gray-600'
                            }`}>
                              {milestone.status === 'completed' ? (
                                <CheckCircle2 className="w-6 h-6 text-green-400" />
                              ) : milestone.status === 'in_progress' ? (
                                <Calendar className="w-6 h-6 text-blue-400" />
                              ) : (
                                <Calendar className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-bold text-white text-lg">{milestone.title}</h4>
                                <Badge className={
                                  milestone.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                  milestone.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }>
                                  {milestone.quarter}
                                </Badge>
                              </div>
                              <ul className="space-y-1.5">
                                {milestone.achievements.map((achievement, aidx) => (
                                  <li key={aidx} className="flex items-center gap-2 text-sm text-gray-300">
                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                      milestone.status === 'completed' ? 'bg-green-400' :
                                      milestone.status === 'in_progress' ? 'bg-blue-400' :
                                      'bg-gray-500'
                                    }`} />
                                    {achievement}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                  <h4 className="font-semibold text-white mb-2">Automatisches Update-Protokoll</h4>
                  <p className="text-sm text-gray-300">
                    Dieser Roadmap wird automatisch mit erreichten Meilensteinen aktualisiert.
                    Alle Updates werden transparent dokumentiert und Investoren per E-Mail benachrichtigt.
                  </p>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* CTA Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/10 to-transparent">
            <CardContent className="p-6 text-center">
              <Briefcase className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Investieren Sie jetzt</h3>
              <p className="text-gray-300 text-sm mb-4">
                Werden Sie Teil dieser Erfolgsgeschichte
              </p>
              <Link to={createPageUrl(`SPVDetails?id=${selectedSPV.id}`)}>
                <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold">
                  Jetzt investieren
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent">
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Vollständige Dokumentation</h3>
              <p className="text-gray-300 text-sm mb-4">
                Laden Sie alle Dokumente herunter
              </p>
              {selectedSPV.whitepaper_url && (
                <a href={selectedSPV.whitepaper_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-blue-500 text-blue-400">
                    <Download className="w-4 h-4 mr-2" />
                    Whitepaper herunterladen
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
