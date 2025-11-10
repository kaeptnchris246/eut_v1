import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Activity, Wifi, WifiOff } from 'lucide-react';

/**
 * Realtime Sync Status Indicator Component
 * Shows live connection status and sync channels
 */
export default function RealtimeIndicator({ 
  isActive = false, 
  channels = {}, 
  compact = false 
}) {
  const activeChannels = Object.values(channels).filter(Boolean).length;
  const totalChannels = Object.keys(channels).length;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${
        isActive 
          ? 'bg-green-500/20 border border-green-500/30' 
          : 'bg-gray-500/20 border border-gray-500/30'
      }`}>
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
        <span className={`text-xs font-bold uppercase ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
          {isActive ? 'LIVE' : 'OFFLINE'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/50 border border-gray-700">
      <div className={`p-2 rounded-lg ${
        isActive ? 'bg-green-500/20' : 'bg-gray-500/20'
      }`}>
        {isActive ? (
          <Wifi className="w-4 h-4 text-green-400" />
        ) : (
          <WifiOff className="w-4 h-4 text-gray-400" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-white">Realtime Sync</span>
          <Badge className={`text-xs ${
            isActive 
              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
              : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
          }`}>
            {isActive ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        {totalChannels > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Activity className="w-3 h-3" />
            <span>{activeChannels}/{totalChannels} channels active</span>
          </div>
        )}
      </div>
      {isActive && (
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      )}
    </div>
  );
}