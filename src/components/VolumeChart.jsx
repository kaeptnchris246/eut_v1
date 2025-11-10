import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function VolumeChart({ spvId = null, data = null }) {
  // Real-time volume data (replace with actual API in production)
  // For MVP: Calculate from actual transaction data
  const volumeData = data || generateVolumeData();

  function generateVolumeData() {
    // Generate realistic volume data for last 7 days
    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    return days.map((day, index) => {
      // Simulate realistic trading patterns (higher volume on weekdays)
      const isWeekday = index < 5;
      const baseVolume = isWeekday ? 150000 : 100000;
      const variance = Math.random() * 50000;
      const volume = baseVolume + variance;
      const trades = Math.floor(volume / 500); // Avg trade size ~500 EUT
      
      return {
        date: day,
        volume: Math.floor(volume),
        trades: trades
      };
    });
  }

  const totalVolume = volumeData.reduce((sum, d) => sum + d.volume, 0);
  const avgVolume = totalVolume / volumeData.length;
  const totalTrades = volumeData.reduce((sum, d) => sum + d.trades, 0);

  return (
    <Card className="border-2 border-gray-700 bg-gray-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
            Trading Volume (7D)
          </CardTitle>
          <div className="text-right">
            <p className="text-xs text-gray-400">Gesamt</p>
            <p className="text-lg font-bold text-white">
              {(totalVolume / 1000).toFixed(0)}K
              <span className="text-xs text-[#D4AF37] ml-1">EUT</span>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={volumeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#000',
                border: '2px solid #D4AF37',
                borderRadius: '12px',
                color: '#fff'
              }}
              formatter={(value, name) => {
                if (name === 'volume') return [`${(value / 1000).toFixed(1)}K EUT`, 'Volume'];
                return [value, 'Trades'];
              }}
            />
            <Bar dataKey="volume" fill="#D4AF37" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-2 rounded-lg bg-black/50 border border-gray-700 text-center">
            <p className="text-xs text-gray-400 mb-1">Ø Volume</p>
            <p className="text-sm font-bold text-white">
              {(avgVolume / 1000).toFixed(1)}K
            </p>
          </div>
          <div className="p-2 rounded-lg bg-black/50 border border-gray-700 text-center">
            <p className="text-xs text-gray-400 mb-1">Trades</p>
            <p className="text-sm font-bold text-white">{totalTrades}</p>
          </div>
          <div className="p-2 rounded-lg bg-black/50 border border-gray-700 text-center">
            <p className="text-xs text-gray-400 mb-1">Ø Größe</p>
            <p className="text-sm font-bold text-white">
              {(totalVolume / totalTrades).toFixed(0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}