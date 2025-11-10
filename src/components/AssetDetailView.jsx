import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Coins,
  BarChart3,
  Download,
  FileText,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function AssetDetailView({ investment, spv }) {
  if (!investment || !spv) return null;

  const gainLoss = (investment.current_value || investment.invested_amount) - investment.invested_amount;
  const gainLossPercent = (gainLoss / investment.invested_amount) * 100;
  const isLocked = investment.lock_period_end && new Date(investment.lock_period_end) > new Date();

  // Mock performance data
  const performanceData = [
    { date: 'Jan', value: investment.invested_amount * 0.95 },
    { date: 'Feb', value: investment.invested_amount * 0.98 },
    { date: 'Mär', value: investment.invested_amount * 1.02 },
    { date: 'Apr', value: investment.invested_amount * 1.05 },
    { date: 'Mai', value: investment.invested_amount * 1.08 },
    { date: 'Jun', value: investment.current_value || investment.invested_amount },
  ];

  // Calculate yield metrics
  const annualizedYield = spv.target_return || 0;
  const monthsHeld = investment.purchase_date 
    ? Math.floor((new Date() - new Date(investment.purchase_date)) / (1000 * 60 * 60 * 24 * 30))
    : 0;
  const actualYield = monthsHeld > 0 ? (gainLossPercent / monthsHeld) * 12 : 0;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2 border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/10 to-transparent">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl text-white mb-2">{spv.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/20 text-purple-400">
                  {spv.symbol} • {spv.token_standard || 'ERC-1400'}
                </Badge>
                <Badge className={`${
                  investment.status === 'aktiv' ? 'bg-green-500/20 text-green-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {investment.status}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400 mb-1">Aktueller Wert</p>
              <p className="text-3xl font-bold text-white">
                {(investment.current_value || investment.invested_amount).toLocaleString('de-DE')}
                <span className="text-lg text-[#D4AF37] ml-2">EUT</span>
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-700 bg-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <DollarSign className="w-4 h-4" />
              Investiert
            </div>
            <p className="text-2xl font-bold text-white">
              {investment.invested_amount.toLocaleString('de-DE')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              {gainLoss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              Gewinn/Verlust
            </div>
            <p className={`text-2xl font-bold ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {gainLoss >= 0 ? '+' : ''}{gainLoss.toLocaleString('de-DE')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Coins className="w-4 h-4" />
              Token Amount
            </div>
            <p className="text-2xl font-bold text-white">
              {investment.token_amount.toLocaleString('de-DE', { maximumFractionDigits: 4 })}
            </p>
            <p className="text-xs text-gray-500 mt-1">{spv.symbol}</p>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <BarChart3 className="w-4 h-4" />
              Rendite (annualisiert)
            </div>
            <p className="text-2xl font-bold text-green-400">
              {actualYield.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Ziel: {annualizedYield}% p.a.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="border-gray-700 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-white">Performance Entwicklung</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#000',
                  border: '2px solid #D4AF37',
                  borderRadius: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#D4AF37"
                strokeWidth={3}
                dot={{ fill: '#D4AF37' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Investment Details */}
      <Card className="border-gray-700 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-white">Investment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-gray-800">
              <p className="text-xs text-gray-400 mb-1">Kaufdatum</p>
              <p className="text-white font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                {format(new Date(investment.purchase_date), 'dd.MM.yyyy')}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-gray-800">
              <p className="text-xs text-gray-400 mb-1">Kaufpreis pro Token</p>
              <p className="text-white font-semibold">
                {investment.purchase_price.toLocaleString('de-DE')} EUT
              </p>
            </div>

            <div className="p-3 rounded-lg bg-gray-800">
              <p className="text-xs text-gray-400 mb-1">Aktueller Token-Preis</p>
              <p className="text-white font-semibold">
                {(spv.token_price_eut || spv.token_price).toLocaleString('de-DE')} EUT
              </p>
            </div>

            <div className="p-3 rounded-lg bg-gray-800">
              <p className="text-xs text-gray-400 mb-1">Price Appreciation</p>
              <p className={`font-semibold ${
                (spv.token_price_eut || spv.token_price) >= investment.purchase_price
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}>
                {(((spv.token_price_eut || spv.token_price) - investment.purchase_price) / investment.purchase_price * 100).toFixed(2)}%
              </p>
            </div>
          </div>

          {investment.dividends_earned && investment.dividends_earned > 0 && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300 mb-1">Erhaltene Dividenden</p>
                  <p className="text-2xl font-bold text-green-400">
                    {investment.dividends_earned.toLocaleString('de-DE')} EUT
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </div>
          )}

          {isLocked && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Lock Period aktiv</p>
                  <p className="text-xs text-gray-300">
                    Dieser Token ist gesperrt bis {format(new Date(investment.lock_period_end), 'dd.MM.yyyy')}.
                    Verkauf erst nach Ablauf der Sperrfrist möglich.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents Section */}
      {(spv.whitepaper_url || spv.prospectus_url) && (
        <Card className="border-gray-700 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#D4AF37]" />
              Dokumente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {spv.whitepaper_url && (
              <a href={spv.whitepaper_url} target="_blank" rel="noopener noreferrer">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white font-semibold">Whitepaper</p>
                      <p className="text-xs text-gray-400">Technical documentation</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-gray-400" />
                </div>
              </a>
            )}

            {spv.prospectus_url && (
              <a href={spv.prospectus_url} target="_blank" rel="noopener noreferrer">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-white font-semibold">Verkaufsprospekt</p>
                      <p className="text-xs text-gray-400">Legal documentation</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-gray-400" />
                </div>
              </a>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}