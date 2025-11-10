import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function PriceTickerWidget() {
  const [priceUpdates, setPriceUpdates] = useState({});

  const { data: spvs } = useQuery({
    queryKey: ['spvs-ticker'],
    queryFn: () => base44.entities.SPV.list(),
    initialData: [],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    // Real-time price simulation (replace with actual price feed in production)
    const interval = setInterval(() => {
      const updates = {};
      spvs.forEach(spv => {
        // Simulate realistic price changes (-0.5% to +0.5%)
        const change = (Math.random() - 0.5) * 1;
        const currentPrice = spv.token_price_eut || spv.token_price || 1;
        const newPrice = currentPrice * (1 + change / 100);
        
        updates[spv.id] = {
          price: newPrice,
          change: change,
          volume24h: Math.random() * 100000 + 50000,
          lastUpdate: Date.now()
        };
      });
      setPriceUpdates(updates);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [spvs]);

  const getDisplaySPVs = () => {
    return spvs.filter(spv => spv.status === 'aktiv').slice(0, 5);
  };

  return (
    <Card className="border-2 border-gray-700 bg-black/50 backdrop-blur-xl">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-[#D4AF37] animate-pulse" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Live Prices
          </span>
        </div>
        <div className="space-y-2">
          {getDisplaySPVs().map(spv => {
            const update = priceUpdates[spv.id];
            const price = update ? update.price : (spv.token_price_eut || spv.token_price || 1);
            const change = update ? update.change : 0;
            const isPositive = change >= 0;

            return (
              <div
                key={spv.id}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-900/50 hover:bg-gray-900 transition-all group"
              >
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center text-xs font-bold text-black">
                    {spv.symbol?.substring(0, 3) || 'SPV'}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm group-hover:text-[#D4AF37] transition-colors">
                      {spv.symbol || spv.name}
                    </p>
                    <p className="text-xs text-gray-500">{spv.name?.substring(0, 15)}...</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">
                    {price.toFixed(2)}
                    <span className="text-[#D4AF37] text-xs ml-1">EUT</span>
                  </p>
                  <div className="flex items-center gap-1">
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 text-green-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-400" />
                    )}
                    <span className={`text-xs font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}{change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Last Update</span>
            <span className="text-gray-400">{new Date().toLocaleTimeString('de-DE')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}