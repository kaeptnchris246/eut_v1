
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExplainerBox from '@/components/ExplainerBox';
import PriceTickerWidget from '../components/PriceTickerWidget';
import { 
  Search, 
  TrendingUp, 
  Building2, 
  ArrowUpRight,
  Star,
  PieChart,
  TrendingDown
} from "lucide-react";

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("alle");
  const [priceUpdates, setPriceUpdates] = useState({});

  const { data: spvs, isLoading } = useQuery({
    queryKey: ['spvs'],
    queryFn: () => base44.entities.SPV.list('-created_date'),
    initialData: [],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Real-time price simulation
  useEffect(() => {
    if (spvs.length === 0) return;

    const interval = setInterval(() => {
      const updates = {};
      spvs.forEach(spv => {
        const change = (Math.random() - 0.5) * 2; // -1% to +1%
        const currentPrice = priceUpdates[spv.id]?.price || spv.token_price_eut || spv.token_price;
        const newPrice = currentPrice * (1 + change / 100);
        
        updates[spv.id] = {
          price: newPrice,
          change: change,
          lastUpdate: Date.now()
        };
      });
      setPriceUpdates(updates);
    }, 5000);

    return () => clearInterval(interval);
  }, [spvs, priceUpdates]); // Depend on spvs and priceUpdates for current price

  const categories = [
    { value: "alle", label: "Alle" },
    { value: "immobilien", label: "Immobilien" },
    { value: "tech_startups", label: "Tech Startups" },
    { value: "erneuerbare_energien", label: "Erneuerbare Energien" },
    { value: "healthcare", label: "Healthcare" },
    { value: "infrastructure", label: "Infrastructure" },
  ];

  const filteredSPVs = spvs.filter(spv => {
    const matchesSearch = spv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spv.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "alle" || spv.category === selectedCategory;
    const isActive = spv.status === 'aktiv';
    return matchesSearch && matchesCategory && isActive;
  });

  const getRiskColor = (risk) => {
    const colors = {
      'niedrig': 'bg-green-500/20 text-green-400 border-green-500/30',
      'mittel': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'hoch': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'sehr_hoch': 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[risk] || colors['mittel'];
  };

  const getCategoryColor = (category) => {
    const colors = {
      'immobilien': 'from-blue-500 to-cyan-500',
      'tech_startups': 'from-[#D4AF37] to-[#F4E4B0]',
      'erneuerbare_energien': 'from-green-500 to-emerald-500',
      'healthcare': 'from-red-500 to-orange-500',
      'infrastructure': 'from-gray-500 to-gray-400',
    };
    return colors[category] || 'from-[#D4AF37] to-[#B8941F]';
  };

  const totalMarketCap = spvs.reduce((sum, spv) => {
    const currentPrice = priceUpdates[spv.id]?.price || spv.token_price_eut || spv.token_price;
    // Assuming 'total_supply - available_supply' is the currently tokenized/sold supply
    // Or if total_supply is the total available tokens, then current_supply is total_supply.
    // For market cap, typically total tokens * current price.
    // Let's assume total_supply refers to the total number of tokens for the SPV.
    return sum + (spv.total_supply * currentPrice); 
  }, 0);

  const activeSPVsCount = spvs.filter(s => s.status === 'aktiv').length;

  const averageTargetReturn = spvs.length > 0 
    ? (spvs.reduce((sum, s) => sum + s.target_return, 0) / spvs.length).toFixed(1)
    : 'N/A';

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
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
                      Unternehmensanteile
                    </span>
                  </h1>
                  <p className="text-sm md:text-base text-gray-400">
                    Investieren Sie in tokenisierte Unternehmensanteile
                  </p>
                </div>
                <Link to={createPageUrl("Portfolio")}>
                  <Button className="w-full md:w-auto bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold px-8 py-6 shadow-2xl">
                    <PieChart className="w-5 h-5 mr-2" />
                    Mein Portfolio
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Market Data */}
        <div className="grid lg:grid-cols-4 gap-4">
          <PriceTickerWidget />
          <Card className="lg:col-span-3 border-gray-800 bg-gradient-to-br from-gray-900/50 to-black backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Total Market Cap</p>
                  <p className="text-xl font-bold text-white">
                    {(totalMarketCap / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-[#D4AF37]">EUT</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">24h Volume</p>
                  <p className="text-xl font-bold text-white">2.8M</p>
                  <Badge className="bg-green-500/20 text-green-400 text-xs">+12%</Badge>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Active SPVs</p>
                  <p className="text-xl font-bold text-white">
                    {activeSPVsCount}
                  </p>
                  <p className="text-xs text-gray-500">Live</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Avg. Return</p>
                  <p className="text-xl font-bold text-green-400">+{averageTargetReturn}%</p>
                  <p className="text-xs text-gray-500">p.a.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Explainer Box */}
        <ExplainerBox title="Wie funktioniert das Investment-System?" type="help">
          <div className="space-y-2">
            <p className="mb-2">
              <strong>1. EUT Token kaufen:</strong> EUT (Euphena Utility Token) ist die Plattform-Währung. 
              Kaufen Sie EUT mit Fiat (EUR/USD) oder Crypto.
            </p>
            <p className="mb-2">
              <strong>2. SPV Security Token kaufen:</strong> Jeder SPV (Unternehmensanteil) hat seinen eigenen Security Token 
              (z.B. GWX für GreenWave, PCX für PinkCross). Sie tauschen Ihre EUT gegen diese SPV-Tokens.
            </p>
            <p className="text-[#D4AF37] font-semibold">
              Token-Preise sind VARIABEL und basieren auf dem NAV (Net Asset Value) des Unternehmens - 
              sie steigen mit der Performance und Nachfrage!
            </p>
          </div>
        </ExplainerBox>

        {/* Search and Filter */}
        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="SPV suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white"
                />
              </div>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="bg-gray-900/50 border border-gray-700">
                  {categories.map(cat => (
                    <TabsTrigger 
                      key={cat.value} 
                      value={cat.value}
                      className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                    >
                      {cat.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* SPV Grid - UPDATED with live prices */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]" />
          </div>
        ) : filteredSPVs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSPVs.map((spv) => {
              const priceData = priceUpdates[spv.id];
              const currentPrice = priceData ? priceData.price : (spv.token_price_eut || spv.token_price);
              const priceChange = priceData ? priceData.change : 0;
              const isPriceUp = priceChange >= 0;

              return (
                <Link key={spv.id} to={createPageUrl(`SPVDetails?id=${spv.id}`)}>
                  <Card className="group border-gray-800 bg-gradient-to-br from-gray-900/50 to-black backdrop-blur-xl hover:border-[#D4AF37]/50 transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden h-full">
                    {/* Image Header */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                      {spv.image_url ? (
                        <img 
                          src={spv.image_url} 
                          alt={spv.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${getCategoryColor(spv.category)} opacity-80`} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <Badge className={getRiskColor(spv.risk_level)}>
                          {spv.risk_level}
                        </Badge>
                        {priceData && (
                          <Badge className={`${isPriceUp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} flex items-center gap-1`}>
                            {isPriceUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isPriceUp ? '+' : ''}{priceChange.toFixed(2)}%
                          </Badge>
                        )}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="bg-black/80 text-[#D4AF37] border-[#D4AF37]/30 mb-2">
                          {spv.category?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <CardTitle className="text-white text-xl group-hover:text-[#D4AF37] transition-colors mb-1">
                            {spv.name}
                          </CardTitle>
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                            {spv.symbol} • {spv.token_standard || 'ERC-1400'}
                          </Badge>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {spv.description}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Token Preis (in EUT)</p>
                          <div className="flex items-baseline gap-1">
                            <p className="text-lg font-bold text-white">
                              {currentPrice.toFixed(2)}
                            </p>
                            <span className="text-xs text-[#D4AF37]">EUT</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {spv.nav_per_token ? `NAV: ${spv.nav_per_token} EUT` : 'Live'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Ziel-Rendite</p>
                          <p className="text-lg font-bold text-green-400 flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {spv.target_return}% p.a.
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                          <span>Verfügbar</span>
                          <span>{spv.available_supply} / {spv.total_supply}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F4E4B0] rounded-full"
                            style={{ width: `${(spv.available_supply / spv.total_supply) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-800">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Min. Investment</span>
                          <span className="text-white font-semibold">
                            {spv.minimum_investment} EUT
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-gray-400">Laufzeit</span>
                          <span className="text-white font-semibold">
                            {spv.duration_months} Monate
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black backdrop-blur-xl">
            <CardContent className="py-12 text-center">
              <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Keine SPVs gefunden</h3>
              <p className="text-gray-400">
                Versuchen Sie eine andere Kategorie oder Suchbegriff
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
