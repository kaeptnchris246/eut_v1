import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  AlertTriangle,
  Award
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function PortfolioAnalytics({ investments, spvs }) {
  // Calculate portfolio metrics
  const totalInvested = investments.reduce((sum, inv) => sum + (inv.invested_amount || 0), 0);
  const currentValue = investments.reduce((sum, inv) => sum + (inv.current_value || inv.invested_amount || 0), 0);
  const totalReturn = currentValue - totalInvested;
  const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested * 100) : 0;

  // Calculate Sharpe Ratio (simplified)
  const returns = investments.map(inv => {
    const invReturn = inv.current_value ? ((inv.current_value - inv.invested_amount) / inv.invested_amount) : 0;
    return invReturn;
  });
  const avgReturn = returns.length > 0 ? returns.reduce((sum, r) => sum + r, 0) / returns.length : 0;
  const variance = returns.length > 0 ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length : 0;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) : 0;

  // Calculate Max Drawdown
  const drawdowns = investments.map(inv => {
    if (!inv.current_value) return 0;
    const peak = Math.max(inv.invested_amount, inv.current_value);
    return ((peak - inv.current_value) / peak) * 100;
  });
  const maxDrawdown = Math.max(...drawdowns, 0);

  // Sortino Ratio (downside deviation)
  const negativeReturns = returns.filter(r => r < 0);
  const downsideDeviation = negativeReturns.length > 0
    ? Math.sqrt(negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length)
    : stdDev;
  const sortinoRatio = downsideDeviation > 0 ? (avgReturn / downsideDeviation) : 0;

  // Asset Allocation by Category
  const categoryAllocation = {};
  investments.forEach(inv => {
    const spv = spvs.find(s => s.id === inv.spv_id);
    if (spv) {
      const category = spv.category || 'other';
      categoryAllocation[category] = (categoryAllocation[category] || 0) + (inv.current_value || inv.invested_amount || 0);
    }
  });

  const allocationData = Object.keys(categoryAllocation).map(cat => ({
    name: cat.replace(/_/g, ' '),
    value: categoryAllocation[cat],
    percentage: (categoryAllocation[cat] / currentValue * 100).toFixed(1)
  }));

  const COLORS = ['#D4AF37', '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'];

  // Performance over time (mock data - in production from historical records)
  const performanceOverTime = [
    { month: 'Jan', value: totalInvested * 0.95, benchmark: totalInvested * 0.97 },
    { month: 'Feb', value: totalInvested * 0.98, benchmark: totalInvested * 0.99 },
    { month: 'Mär', value: totalInvested * 1.02, benchmark: totalInvested * 1.01 },
    { month: 'Apr', value: totalInvested * 1.05, benchmark: totalInvested * 1.03 },
    { month: 'Mai', value: totalInvested * 1.08, benchmark: totalInvested * 1.05 },
    { month: 'Jun', value: currentValue, benchmark: totalInvested * 1.07 },
  ];

  // SPV Performance Comparison
  const spvPerformance = investments.map(inv => {
    const returnPct = inv.current_value 
      ? ((inv.current_value - inv.invested_amount) / inv.invested_amount * 100)
      : 0;
    return {
      name: inv.spv_name.substring(0, 15),
      return: returnPct,
      invested: inv.invested_amount
    };
  }).sort((a, b) => b.return - a.return);

  return (
    <div className="space-y-6">
      {/* Risk Metrics Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-green-400" />
              <span className="text-xs text-gray-400">Sharpe Ratio</span>
            </div>
            <div className="text-3xl font-bold text-white">{sharpeRatio.toFixed(2)}</div>
            <p className="text-xs text-gray-400 mt-1">
              {sharpeRatio > 1 ? 'Sehr gut' : sharpeRatio > 0.5 ? 'Gut' : 'Verbesserbar'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-gray-400">Sortino Ratio</span>
            </div>
            <div className="text-3xl font-bold text-white">{sortinoRatio.toFixed(2)}</div>
            <p className="text-xs text-gray-400 mt-1">Downside Risk</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-500/30 bg-gradient-to-br from-red-500/10 to-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              <span className="text-xs text-gray-400">Max Drawdown</span>
            </div>
            <div className="text-3xl font-bold text-red-400">-{maxDrawdown.toFixed(1)}%</div>
            <p className="text-xs text-gray-400 mt-1">Largest Loss</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-gray-400">Volatilität</span>
            </div>
            <div className="text-3xl font-bold text-white">{(stdDev * 100).toFixed(1)}%</div>
            <p className="text-xs text-gray-400 mt-1">
              {stdDev < 0.1 ? 'Niedrig' : stdDev < 0.2 ? 'Mittel' : 'Hoch'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio vs Benchmark */}
      <Card className="border-2 border-gray-700 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-white">Portfolio Performance vs. Markt-Benchmark</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={performanceOverTime}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="benchmarkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b7280" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#000',
                  border: '2px solid #D4AF37',
                  borderRadius: '12px'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#D4AF37"
                fillOpacity={1}
                fill="url(#portfolioGrad)"
                strokeWidth={3}
                name="Mein Portfolio"
              />
              <Area
                type="monotone"
                dataKey="benchmark"
                stroke="#6b7280"
                fillOpacity={1}
                fill="url(#benchmarkGrad)"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="S&P 500 Benchmark"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 rounded-lg bg-black/50 border border-gray-700">
            <p className="text-sm text-gray-300">
              <strong className="text-[#D4AF37]">Outperformance:</strong> Ihr Portfolio übertrifft den Benchmark um{' '}
              <span className="text-green-400 font-bold">
                +{((currentValue - performanceOverTime[5].benchmark) / performanceOverTime[5].benchmark * 100).toFixed(2)}%
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Asset Allocation */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2 border-gray-700 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-[#D4AF37]" />
              Asset Allocation nach Kategorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
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
                    backgroundColor: '#000',
                    border: '2px solid #D4AF37',
                    borderRadius: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {allocationData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-black/50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-sm text-gray-300 capitalize">{item.name}</span>
                  </div>
                  <span className="text-white font-semibold text-sm">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-700 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-white">SPV Performance Vergleich</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={spvPerformance.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" angle={-20} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#000',
                    border: '2px solid #D4AF37',
                    borderRadius: '12px'
                  }}
                />
                <Bar dataKey="return" radius={[8, 8, 0, 0]}>
                  {spvPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.return >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {spvPerformance.slice(0, 3).map((spv, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-black/50 border border-gray-700">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#D4AF37]/20 text-[#D4AF37]">#{idx + 1}</Badge>
                    <span className="text-sm text-white font-semibold">{spv.name}</span>
                  </div>
                  <span className={`font-bold ${spv.return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {spv.return >= 0 ? '+' : ''}{spv.return.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment Summary */}
      <Card className="border-2 border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/10 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <BarChart3 className="w-8 h-8 text-[#D4AF37] flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-3">Portfolio Risk Assessment</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-black/50 border border-[#D4AF37]/30">
                  <p className="text-xs text-gray-400 mb-1">Sharpe Ratio</p>
                  <p className="text-lg font-bold text-white">{sharpeRatio.toFixed(2)}</p>
                  <p className="text-xs text-[#D4AF37] mt-1">
                    {sharpeRatio > 1 ? 'Exzellent' : sharpeRatio > 0.5 ? 'Gut' : 'Durchschnittlich'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-black/50 border border-[#D4AF37]/30">
                  <p className="text-xs text-gray-400 mb-1">Sortino Ratio</p>
                  <p className="text-lg font-bold text-white">{sortinoRatio.toFixed(2)}</p>
                  <p className="text-xs text-[#D4AF37] mt-1">Downside Protection</p>
                </div>
                <div className="p-3 rounded-lg bg-black/50 border border-[#D4AF37]/30">
                  <p className="text-xs text-gray-400 mb-1">Max Drawdown</p>
                  <p className="text-lg font-bold text-red-400">-{maxDrawdown.toFixed(1)}%</p>
                  <p className="text-xs text-[#D4AF37] mt-1">
                    {maxDrawdown < 10 ? 'Niedrig' : maxDrawdown < 20 ? 'Moderat' : 'Hoch'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}