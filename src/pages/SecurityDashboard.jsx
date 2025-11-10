import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Lock,
  Unlock,
  Eye,
  MapPin,
  Smartphone
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SecurityDashboard() {
  const [user, setUser] = useState(null);

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

  // Only admins can see this page
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="border-2 border-red-500/30 bg-red-500/10 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Lock className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Zugriff verweigert</h2>
            <p className="text-gray-400">
              Nur Administratoren haben Zugriff auf das Security Dashboard
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: securityEvents, isLoading } = useQuery({
    queryKey: ['security-events'],
    queryFn: () => base44.entities.SecurityAudit.list('-created_date', 50),
    initialData: [],
  });

  const suspiciousEvents = securityEvents.filter(e => e.is_suspicious);
  const flaggedEvents = securityEvents.filter(e => e.status === 'flagged');
  const totalEvents = securityEvents.length;

  // Activity by hour (mock data)
  const activityData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    events: Math.floor(Math.random() * 50)
  }));

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 md:w-10 md:h-10 text-[#D4AF37]" />
            Security Dashboard
          </h1>
          <p className="text-sm md:text-base text-gray-400">
            Echtzeit-Überwachung & Fraud Detection
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-2 border-gray-700 bg-gray-900">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs md:text-sm text-gray-400">Gesamt Events (24h)</p>
                <Activity className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white">{totalEvents}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-500/30 bg-yellow-500/10">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs md:text-sm text-gray-400">Flagged</p>
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-yellow-400">{flaggedEvents.length}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-500/30 bg-red-500/10">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs md:text-sm text-gray-400">Suspicious</p>
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-red-400">{suspiciousEvents.length}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-500/30 bg-green-500/10">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs md:text-sm text-gray-400">Sicher</p>
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-green-400">
                {((totalEvents - suspiciousEvents.length) / Math.max(totalEvents, 1) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Chart */}
        <Card className="border-2 border-gray-700 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-white text-lg md:text-xl">24h Aktivität</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#000',
                    border: '2px solid #D4AF37',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="events"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Security Events */}
        <Card className="border-2 border-gray-700 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-white text-lg md:text-xl">Letzte Security Events</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D4AF37]" />
              </div>
            ) : (
              <div className="space-y-2">
                {securityEvents.slice(0, 10).map((event, idx) => (
                  <div key={idx} className={`p-3 md:p-4 rounded-lg border ${
                    event.is_suspicious ? 'border-red-500/30 bg-red-500/10' :
                    event.status === 'flagged' ? 'border-yellow-500/30 bg-yellow-500/10' :
                    'border-gray-700 bg-gray-900/50'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {event.is_suspicious ? (
                          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm md:text-base truncate">
                            {event.event_type}
                          </p>
                          <p className="text-xs md:text-sm text-gray-400 truncate">
                            {event.user_email}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {event.ip_address && (
                              <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                                <MapPin className="w-3 h-3 mr-1" />
                                {event.ip_address}
                              </Badge>
                            )}
                            {event.geo_location?.is_vpn && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                                VPN
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={`text-xs ${
                          event.risk_score >= 70 ? 'bg-red-500/20 text-red-400' :
                          event.risk_score >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          Risk: {event.risk_score || 0}
                        </Badge>
                        <span className="text-xs text-gray-500 hidden md:inline">
                          {new Date(event.created_date).toLocaleString('de-DE')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}