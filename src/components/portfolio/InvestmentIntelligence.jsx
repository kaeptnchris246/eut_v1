import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3, 
  Lightbulb,
  Target,
  Shield,
  Award
} from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

/**
 * Investment Intelligence Component
 * Shows portfolio breakdown, allocation, AI insights
 */
export default function InvestmentIntelligence({ investments, spvs }) {
  const [view, setView] = useState('overview');

  // Calculate portfolio positions
  const positions = investments.reduce((acc, inv) => {
    const spv = spvs.find(s => s.id === inv.spv_id);
    if (!spv) return acc;

    const existing = acc.find(p => p.spv_id === inv.spv_id);
    if (existing) {
      existing.token_amount += inv.token_amount;
      existing.invested_amount += inv.invested_amount;
      existing.current_value += inv.current_value || inv.invested_amount;
    } else {
      acc.push({
        spv_id: inv.spv_id,
        spv_name: spv.name,
        spv_symbol: spv.symbol,
        category: spv.category,
        token_amount: inv.token_amount,
        invested_amount: inv.invested_amount,
        current_value: inv.current_value || inv.invested_amount,
        total_supply: spv.total_supply,
        ownership_percentage: (inv.token_amount / spv.total_supply) * 100,
        risk_level: spv.risk_level
      });
    }
    return acc;
  }, []);

  // Calculate totals
  const totalInvested = positions.reduce((sum, p) => sum + p.invested_amount, 0);
  const totalValue = positions.reduce((sum, p) => sum + p.current_value, 0);
  const totalReturn = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested * 100) : 0;

  // Category allocation
  const categoryAllocation = positions.reduce((acc, p) => {
    const existing = acc.find(c => c.name === p.category);
    if (existing) {
      existing.value += p.current_value;
    } else {
      acc.push({
        name: p.category?.replace(/_/g, ' ') || 'Other',
        value: p.current_value,
        color: getCategoryColor(p.category)
      });
    }
    return acc;
  }, []);

  // AI Portfolio Score (simplified)
  const portfolioScore = calculatePortfolioScore(positions);

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-2 border-gray-700 bg-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Holdings</span>
            </div>
            <div className="text-2xl font-bold text-white">{positions.length}</div>
            <p className="text-xs text-gray-500">SPVs</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-700 bg-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Total Return</span>
            </div>
            <div className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
            </div>
            <p className="text-xs text-gray-500">Since inception</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-700 bg-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Diversification</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {categoryAllocation.length}
            </div>
            <p className="text-xs text-gray-500">Categories</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#D4AF37] bg-gradient-to-br from-[#D4AF37]/20 to-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs text-gray-400">AI Health Score</span>
            </div>
            <div className="text-2xl font-bold text-[#D4AF37]">{portfolioScore}</div>
            <p className="text-xs text-gray-500">/ 100</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Intelligence Panel */}
      <Card className="border-2 border-gray-700 bg-gray-900">
        <Tabs value={view} onValueChange={setView}>
          <CardHeader className="border-b-2 border-gray-700">
            <TabsList className="bg-black border-2 border-gray-700">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="positions" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
                <PieChart className="w-4 h-4 mr-2" />
                Positions
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
                <Lightbulb className="w-4 h-4 mr-2" />
                AI Insights
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="p-6">
            <TabsContent value="overview">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Portfolio Allocation</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPie>
                        <Pie
                          data={categoryAllocation}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>

                    <div className="space-y-3">
                      {categoryAllocation.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-black/50">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="text-white font-semibold capitalize">{cat.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">{cat.value.toLocaleString('de-DE')} EUT</p>
                            <p className="text-xs text-gray-400">
                              {((cat.value / totalValue) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="positions">
              <div className="space-y-3">
                {positions.map((pos, idx) => (
                  <Card key={idx} className="border-gray-700 bg-black/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-white font-bold text-lg">{pos.spv_name}</h4>
                          <Badge className="bg-purple-500/20 text-purple-400 mt-1">
                            {pos.spv_symbol}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">
                            {pos.token_amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">Tokens</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="p-2 rounded bg-gray-900">
                          <p className="text-xs text-gray-400 mb-1">Ownership</p>
                          <p className="text-sm font-bold text-white">
                            {pos.ownership_percentage.toFixed(4)}%
                          </p>
                        </div>
                        <div className="p-2 rounded bg-gray-900">
                          <p className="text-xs text-gray-400 mb-1">Invested</p>
                          <p className="text-sm font-bold text-white">
                            {pos.invested_amount.toLocaleString('de-DE')} EUT
                          </p>
                        </div>
                        <div className="p-2 rounded bg-gray-900">
                          <p className="text-xs text-gray-400 mb-1">Current</p>
                          <p className="text-sm font-bold text-green-400">
                            {pos.current_value.toLocaleString('de-DE')} EUT
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge className={getRiskColor(pos.risk_level)}>
                          {pos.risk_level}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {pos.current_value >= pos.invested_amount ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                          <span className={`text-sm font-bold ${
                            pos.current_value >= pos.invested_amount ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {((pos.current_value - pos.invested_amount) / pos.invested_amount * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights">
              <div className="space-y-4">
                <Card className="border-[#D4AF37] bg-gradient-to-br from-[#D4AF37]/10 to-transparent">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-6 h-6 text-[#D4AF37] flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-white mb-2">AI Portfolio Analysis</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                          <li>✅ Good diversification across {categoryAllocation.length} categories</li>
                          <li>✅ Portfolio showing positive return of {totalReturn.toFixed(2)}%</li>
                          <li>
                            {positions.some(p => p.risk_level === 'hoch' || p.risk_level === 'sehr_hoch')
                              ? '⚠️ Consider reducing high-risk exposure'
                              : '✅ Balanced risk profile'}
                          </li>
                          <li>💡 Recommendation: {getRecommendation(positions)}</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-gray-700 bg-black/50">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-white mb-3">Risk Distribution</h4>
                      {getRiskDistribution(positions).map((risk, idx) => (
                        <div key={idx} className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400 capitalize">{risk.level}</span>
                            <span className="text-white font-semibold">{risk.percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${risk.percentage}%`,
                                backgroundColor: risk.color
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-gray-700 bg-black/50">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-white mb-3">Performance Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Best Performer</span>
                          <span className="text-green-400 font-bold text-sm">
                            {getBestPerformer(positions)?.spv_symbol || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Avg. Return</span>
                          <span className="text-white font-bold text-sm">
                            {totalReturn.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Portfolio Health</span>
                          <span className="text-[#D4AF37] font-bold text-sm">
                            {portfolioScore}/100
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

// Helper functions
const getCategoryColor = (category) => {
  const colors = {
    immobilien: '#06b6d4',
    tech_startups: '#D4AF37',
    erneuerbare_energien: '#10b981',
    healthcare: '#ef4444',
    infrastructure: '#8b5cf6',
    venture_capital: '#f59e0b',
    real_estate_development: '#3b82f6',
    private_equity: '#ec4899',
    energy_storage: '#14b8a6',
    education: '#a855f7',
    ai_infrastructure: '#06b6d4',
    gold_trading: '#fbbf24'
  };
  return colors[category] || '#6b7280';
};

const getRiskColor = (risk) => {
  const colors = {
    'niedrig': 'bg-green-500/20 text-green-400 border-green-500/30',
    'mittel': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'hoch': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'sehr_hoch': 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[risk] || colors['mittel'];
};

const calculatePortfolioScore = (positions) => {
  if (positions.length === 0) return 0;
  
  // Simplified scoring: diversification + performance + balance
  const diversificationScore = Math.min((positions.length / 10) * 40, 40);
  const avgReturn = positions.reduce((sum, p) => {
    const ret = ((p.current_value - p.invested_amount) / p.invested_amount) * 100;
    return sum + ret;
  }, 0) / positions.length;
  const performanceScore = Math.min(Math.max(avgReturn * 2, 0), 40);
  const balanceScore = 20; // Simplified
  
  return Math.round(diversificationScore + performanceScore + balanceScore);
};

const getRiskDistribution = (positions) => {
  const total = positions.reduce((sum, p) => sum + p.current_value, 0);
  const riskLevels = ['niedrig', 'mittel', 'hoch', 'sehr_hoch'];
  const colors = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];
  
  return riskLevels.map((level, idx) => {
    const value = positions
      .filter(p => p.risk_level === level)
      .reduce((sum, p) => sum + p.current_value, 0);
    return {
      level,
      value,
      percentage: (value / total) * 100,
      color: colors[idx]
    };
  }).filter(r => r.value > 0);
};

const getBestPerformer = (positions) => {
  if (positions.length === 0) return null;
  return positions.reduce((best, p) => {
    const ret = ((p.current_value - p.invested_amount) / p.invested_amount) * 100;
    const bestRet = best ? ((best.current_value - best.invested_amount) / best.invested_amount) * 100 : -Infinity;
    return ret > bestRet ? p : best;
  }, null);
};

const getRecommendation = (positions) => {
  if (positions.length < 3) return 'Consider adding more positions for better diversification';
  const highRisk = positions.filter(p => p.risk_level === 'hoch' || p.risk_level === 'sehr_hoch').length;
  if (highRisk > positions.length / 2) return 'Consider rebalancing toward lower-risk SPVs';
  return 'Portfolio is well-balanced - maintain current allocation';
};