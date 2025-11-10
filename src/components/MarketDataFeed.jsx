import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

export default function MarketDataFeed({ symbol = 'BTC', compact = false }) {
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMarketData = async () => {
    try {
      // In production: fetch from CoinGecko or Binance API
      // const response = await fetch(
      //   `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true`
      // );
      // const data = await response.json();

      // Simulate market data
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockData = {
        price: 45678.34 + (Math.random() * 1000 - 500),
        change24h: Math.random() * 10 - 5,
        volume24h: 28500000000 + Math.random() * 1000000000,
        volatility: Math.random() * 3 + 1,
        sentiment: Math.random() > 0.5 ? 'bullish' : Math.random() > 0.25 ? 'neutral' : 'bearish',
        lastUpdate: Date.now()
      };

      setMarketData(mockData);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();

    // Update every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, [symbol]);

  if (isLoading || !marketData) {
    return compact ? (
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Activity className="w-3 h-3 animate-pulse" />
        <span>Loading...</span>
      </div>
    ) : null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-white font-semibold">
            ${marketData.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <Badge className={`text-xs ${
          marketData.change24h >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {marketData.change24h >= 0 ? '+' : ''}{marketData.change24h.toFixed(2)}%
        </Badge>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Activity className="w-3 h-3" />
          <span>Vol: ${(marketData.volatility).toFixed(2)}%</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-2 border-gray-700 bg-gray-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#D4AF37]" />
          Live Market Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-black/50 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Price</p>
            <p className="text-xl font-bold text-white">
              ${marketData.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-black/50 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">24h Change</p>
            <div className="flex items-center gap-2">
              {marketData.change24h >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <p className={`text-xl font-bold ${marketData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {marketData.change24h >= 0 ? '+' : ''}{marketData.change24h.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-black/50 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">24h Volume</p>
            <p className="text-sm font-semibold text-white">
              ${(marketData.volume24h / 1000000000).toFixed(2)}B
            </p>
          </div>
          <div className="p-3 rounded-lg bg-black/50 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Volatility</p>
            <p className="text-sm font-semibold text-white">
              {marketData.volatility.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-black/50 border border-gray-700">
          <span className="text-sm text-gray-400">Market Sentiment</span>
          <Badge className={`${
            marketData.sentiment === 'bullish' ? 'bg-green-500/20 text-green-400' :
            marketData.sentiment === 'bearish' ? 'bg-red-500/20 text-red-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {marketData.sentiment}
          </Badge>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Last update: {new Date(marketData.lastUpdate).toLocaleTimeString('de-DE')}
        </p>
      </CardContent>
    </Card>
  );
}