import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Bot,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Settings,
  Activity,
  Target,
  Shield,
  Zap,
  AlertCircle,
  Play,
  Pause,
  BarChart3,
  LineChart as LineChartIcon,
  Brain,
  History
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from "sonner";
import RLBacktestEngine from '@/components/RLBacktestEngine';
import ExplainerBox from '@/components/ExplainerBox';
import MarketDataFeed from '@/components/MarketDataFeed';

export default function TradingBot() {
  const [user, setUser] = useState(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  // Bot Config
  const { data: botConfig, isLoading: configLoading } = useQuery({
    queryKey: ['bot-config', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const configs = await base44.entities.BotConfig.filter({ user_email: user.email });
      return configs[0] || null;
    },
    enabled: !!user?.email,
  });

  // Bot Trades
  const { data: botTrades } = useQuery({
    queryKey: ['bot-trades', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.BotTrade.filter({ user_email: user.email }, '-created_date', 50);
    },
    enabled: !!user?.email,
    initialData: [],
  });

  // Bot Performance
  const { data: botPerformance } = useQuery({
    queryKey: ['bot-performance', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.BotPerformance.filter({ user_email: user.email }, '-date', 30);
    },
    enabled: !!user?.email,
    initialData: [],
  });

  // Create/Update Bot Config
  const updateBotMutation = useMutation({
    mutationFn: async (configData) => {
      if (botConfig?.id) {
        return await base44.entities.BotConfig.update(botConfig.id, configData);
      } else {
        return await base44.entities.BotConfig.create({ ...configData, user_email: user.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bot-config']);
      toast.success('Bot-Konfiguration gespeichert!');
      setIsConfiguring(false);
    },
    onError: (error) => {
      toast.error('Fehler beim Speichern: ' + error.message);
    }
  });

  // Default Config
  const [config, setConfig] = useState({
    is_active: false,
    strategy: 'balanced',
    budget: 1000,
    risk_parameters: {
      max_position_size_percentage: 20,
      stop_loss_percentage: 10,
      take_profit_percentage: 20,
      trailing_stop_enabled: false,
      trailing_stop_percentage: 5,
      max_daily_loss_percentage: 5,
      max_drawdown_percentage: 15
    },
    ai_learning: {
      self_optimization_enabled: true,
      learning_rate: 0.1,
      min_trades_for_optimization: 20
    }
  });

  useEffect(() => {
    if (botConfig) {
      setConfig(botConfig);
    }
  }, [botConfig]);

  const toggleBot = async () => {
    if (!botConfig) {
      toast.error('Bitte konfigurieren Sie zuerst den Bot');
      setIsConfiguring(true);
      return;
    }

    const newStatus = !config.is_active;
    
    if (newStatus && user.wallet_balance < config.budget) {
      toast.error('Nicht genug EUT verfügbar. Bitte laden Sie Ihr Wallet auf.');
      return;
    }

    updateBotMutation.mutate({ ...config, is_active: newStatus });
  };

  const saveConfig = () => {
    if (config.budget > user.wallet_balance) {
      toast.error('Budget überschreitet verfügbares Guthaben');
      return;
    }

    if (config.budget < 100) {
      toast.error('Mindestbudget: 100 EUT');
      return;
    }

    updateBotMutation.mutate(config);
  };

  // Calculate Stats
  const openTrades = botTrades.filter(t => t.status === 'open');
  const closedTrades = botTrades.filter(t => t.status === 'closed');
  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
  const winningTrades = closedTrades.filter(t => t.profit_loss > 0).length;
  const losingTrades = closedTrades.filter(t => t.profit_loss < 0).length;
  const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length * 100) : 0;

  // Performance Chart Data
  const performanceChartData = botPerformance.map(p => ({
    date: new Date(p.date).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' }),
    profit: p.total_profit_loss,
    trades: p.total_trades,
    winRate: p.win_rate
  }));

  // Strategy Performance Comparison
  const strategyComparisonData = botConfig?.live_trading_stats ? [
    {
      strategy: 'Conservative',
      trades: botPerformance.reduce((sum, p) => sum + (p.strategy_performance?.conservative?.trades || 0), 0),
      winRate: botPerformance.length > 0 ? (botPerformance.reduce((sum, p) => sum + (p.strategy_performance?.conservative?.win_rate || 0), 0) / botPerformance.length) : 0,
      avgReturn: botPerformance.length > 0 ? (botPerformance.reduce((sum, p) => sum + (p.strategy_performance?.conservative?.avg_return || 0), 0) / botPerformance.length) : 0
    },
    {
      strategy: 'Balanced',
      trades: botPerformance.reduce((sum, p) => sum + (p.strategy_performance?.balanced?.trades || 0), 0),
      winRate: botPerformance.length > 0 ? (botPerformance.reduce((sum, p) => sum + (p.strategy_performance?.balanced?.win_rate || 0), 0) / botPerformance.length) : 0,
      avgReturn: botPerformance.length > 0 ? (botPerformance.reduce((sum, p) => sum + (p.strategy_performance?.balanced?.avg_return || 0), 0) / botPerformance.length) : 0
    },
    {
      strategy: 'Aggressive',
      trades: botPerformance.reduce((sum, p) => sum + (p.strategy_performance?.aggressive?.trades || 0), 0),
      winRate: botPerformance.length > 0 ? (botPerformance.reduce((sum, p) => sum + (p.strategy_performance?.aggressive?.win_rate || 0), 0) / botPerformance.length) : 0,
      avgReturn: botPerformance.length > 0 ? (botPerformance.reduce((sum, p) => sum + (p.strategy_performance?.aggressive?.avg_return || 0), 0) / botPerformance.length) : 0
    }
  ] : [];

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-transparent rounded-3xl blur-xl" />
          <Card className="border-[#D4AF37]/30 border-2 bg-gradient-to-br from-gray-900/95 via-black to-black backdrop-blur-xl relative">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                    <Bot className="w-8 h-8 md:w-10 md:h-10 text-[#D4AF37]" />
                    AI Trading Bot
                  </h1>
                  <p className="text-sm md:text-base text-gray-400">Automatisierter SPV-Handel mit KI & Reinforcement Learning</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-1">Status</p>
                    <Badge className={`${config.is_active ? 'bg-green-500/20 text-green-400 border-green-500' : 'bg-gray-500/20 text-gray-400 border-gray-500'} border-2 font-bold`}>
                      {config.is_active ? (
                        <><Activity className="w-3 h-3 mr-1 animate-pulse" /> Aktiv</>
                      ) : (
                        <><Pause className="w-3 h-3 mr-1" /> Inaktiv</>
                      )}
                    </Badge>
                  </div>
                  <Button
                    onClick={toggleBot}
                    disabled={updateBotMutation.isPending}
                    className={`${config.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-black font-bold px-6 py-6 text-lg`}
                  >
                    {config.is_active ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                    {config.is_active ? 'Bot Stoppen' : 'Bot Starten'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Explainer */}
        <ExplainerBox title="Wie funktioniert der AI Trading Bot?" type="info">
          <div className="space-y-2 text-sm">
            <p><strong>🤖 Reinforcement Learning:</strong> Der Bot lernt aus jedem Trade und optimiert seine Strategie kontinuierlich</p>
            <p><strong>📊 Technische Indikatoren:</strong> RSI, MACD, Moving Averages, Volatilitätsanalyse</p>
            <p><strong>🧠 Sentiment-Analyse:</strong> Analyse von News, Social Media und Market Sentiment</p>
            <p><strong>🎯 Risk Management:</strong> Stop-Loss, Take-Profit, Trailing-Stop, Position-Sizing</p>
            <p><strong>⚡ Self-Optimization:</strong> Nach 20+ Trades passt der Bot automatisch Parameter an basierend auf Performance</p>
          </div>
        </ExplainerBox>

        {/* Performance Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-gray-700 bg-gradient-to-br from-gray-900 to-black">
            <CardContent className="p-4 md:p-6">
              <div className="flex justify-between items-start mb-3">
                <p className="text-xs md:text-sm text-gray-400">Gesamt P&L</p>
                <DollarSign className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <p className={`text-2xl md:text-3xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">EUT</p>
            </CardContent>
          </Card>

          <Card className="border-gray-700 bg-gradient-to-br from-gray-900 to-black">
            <CardContent className="p-4 md:p-6">
              <div className="flex justify-between items-start mb-3">
                <p className="text-xs md:text-sm text-gray-400">Win Rate</p>
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {winRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">{winningTrades}W / {losingTrades}L</p>
            </CardContent>
          </Card>

          <Card className="border-gray-700 bg-gradient-to-br from-gray-900 to-black">
            <CardContent className="p-4 md:p-6">
              <div className="flex justify-between items-start mb-3">
                <p className="text-xs md:text-sm text-gray-400">Offene Positionen</p>
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {openTrades.length}
              </p>
              <p className="text-xs text-gray-500">{closedTrades.length} Geschlossen</p>
            </CardContent>
          </Card>

          <Card className="border-gray-700 bg-gradient-to-br from-gray-900 to-black">
            <CardContent className="p-4 md:p-6">
              <div className="flex justify-between items-start mb-3">
                <p className="text-xs md:text-sm text-gray-400">Budget</p>
                <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {config.budget}
              </p>
              <p className="text-xs text-gray-500">EUT verfügbar</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
          <Tabs defaultValue="dashboard" className="w-full">
            <CardHeader className="border-b-2 border-gray-700">
              <TabsList className="bg-gray-900 border-2 border-gray-700 grid grid-cols-2 md:grid-cols-5">
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black text-xs md:text-sm">
                  <BarChart3 className="w-4 h-4 mr-1 md:mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="config" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black text-xs md:text-sm">
                  <Settings className="w-4 h-4 mr-1 md:mr-2" />
                  Konfiguration
                </TabsTrigger>
                <TabsTrigger value="trades" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black text-xs md:text-sm">
                  <History className="w-4 h-4 mr-1 md:mr-2" />
                  Trades
                </TabsTrigger>
                <TabsTrigger value="backtest" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black text-xs md:text-sm">
                  <Brain className="w-4 h-4 mr-1 md:mr-2" />
                  Backtest
                </TabsTrigger>
                <TabsTrigger value="ai" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black text-xs md:text-sm">
                  <Zap className="w-4 h-4 mr-1 md:mr-2" />
                  AI Learning
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-4 md:p-6">
              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-6">
                {/* Performance Chart */}
                <Card className="border-gray-800 bg-black/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <LineChartIcon className="w-5 h-5 text-[#D4AF37]" />
                      Performance History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {performanceChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={performanceChartData}>
                          <defs>
                            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="date" stroke="#999" style={{ fontSize: '12px' }} />
                          <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1a1a1a', 
                              border: '2px solid #D4AF37',
                              borderRadius: '12px',
                              color: '#fff'
                            }} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="profit" 
                            stroke="#10b981" 
                            fillOpacity={1} 
                            fill="url(#profitGradient)" 
                            strokeWidth={3}
                            name="P&L (EUT)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-400">
                        Noch keine Performance-Daten. Bot starten für Live-Trading.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Strategy Comparison */}
                {strategyComparisonData.length > 0 && (
                  <Card className="border-gray-800 bg-black/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
                        Strategie-Vergleich
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={strategyComparisonData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="strategy" stroke="#999" />
                          <YAxis stroke="#999" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1a1a1a', 
                              border: '2px solid #D4AF37',
                              borderRadius: '12px',
                              color: '#fff'
                            }} 
                          />
                          <Legend />
                          <Bar dataKey="winRate" fill="#10b981" name="Win Rate (%)" radius={[8, 8, 0, 0]} />
                          <Bar dataKey="avgReturn" fill="#D4AF37" name="Ø Return (%)" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Market Data Feed */}
                <MarketDataFeed />
              </TabsContent>

              {/* Configuration Tab */}
              <TabsContent value="config" className="space-y-6">
                <div className="space-y-6">
                  {/* Strategy Selection */}
                  <div>
                    <Label className="text-white text-lg font-semibold mb-4 block">Trading-Strategie</Label>
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { 
                          value: 'conservative', 
                          label: 'Conservative',
                          icon: Shield,
                          description: 'Niedriges Risiko, stabile Rendite',
                          features: ['Stop-Loss: 5%', 'Max Position: 10%', 'Fokus: Blue-Chip SPVs']
                        },
                        { 
                          value: 'balanced', 
                          label: 'Balanced',
                          icon: Target,
                          description: 'Ausgewogenes Risiko/Rendite-Verhältnis',
                          features: ['Stop-Loss: 10%', 'Max Position: 20%', 'Mix aus verschiedenen SPVs']
                        },
                        { 
                          value: 'aggressive', 
                          label: 'Aggressive',
                          icon: Zap,
                          description: 'Hohes Risiko, hohe Rendite',
                          features: ['Stop-Loss: 15%', 'Max Position: 30%', 'Early-Stage SPVs']
                        }
                      ].map(({ value, label, icon: Icon, description, features }) => (
                        <button
                          key={value}
                          onClick={() => setConfig({ ...config, strategy: value })}
                          className={`p-6 rounded-xl border-2 transition-all text-left ${
                            config.strategy === value
                              ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-lg shadow-[#D4AF37]/20'
                              : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                          }`}
                        >
                          <Icon className={`w-8 h-8 mb-3 ${config.strategy === value ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                          <h3 className="text-white font-bold text-lg mb-2">{label}</h3>
                          <p className="text-sm text-gray-400 mb-3">{description}</p>
                          <ul className="space-y-1">
                            {features.map((feature, idx) => (
                              <li key={idx} className="text-xs text-gray-500 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="space-y-3">
                    <Label className="text-white text-lg font-semibold">Trading Budget</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={config.budget}
                        onChange={(e) => setConfig({ ...config, budget: parseFloat(e.target.value) || 0 })}
                        className="bg-gray-900 border-gray-700 text-white text-2xl font-bold"
                        min={100}
                        max={user?.wallet_balance || 0}
                      />
                      <span className="text-gray-400">EUT</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Verfügbar: {user?.wallet_balance || 0} EUT | Min: 100 EUT
                    </p>
                  </div>

                  {/* Risk Parameters */}
                  <div className="space-y-4">
                    <Label className="text-white text-lg font-semibold">Risiko-Parameter</Label>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label className="text-gray-300">Max. Position Size</Label>
                          <span className="text-[#D4AF37] font-bold">{config.risk_parameters.max_position_size_percentage}%</span>
                        </div>
                        <Slider
                          value={[config.risk_parameters.max_position_size_percentage]}
                          onValueChange={([val]) => setConfig({
                            ...config,
                            risk_parameters: { ...config.risk_parameters, max_position_size_percentage: val }
                          })}
                          min={5}
                          max={50}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label className="text-gray-300">Stop Loss</Label>
                          <span className="text-red-400 font-bold">{config.risk_parameters.stop_loss_percentage}%</span>
                        </div>
                        <Slider
                          value={[config.risk_parameters.stop_loss_percentage]}
                          onValueChange={([val]) => setConfig({
                            ...config,
                            risk_parameters: { ...config.risk_parameters, stop_loss_percentage: val }
                          })}
                          min={5}
                          max={30}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label className="text-gray-300">Take Profit</Label>
                          <span className="text-green-400 font-bold">{config.risk_parameters.take_profit_percentage}%</span>
                        </div>
                        <Slider
                          value={[config.risk_parameters.take_profit_percentage]}
                          onValueChange={([val]) => setConfig({
                            ...config,
                            risk_parameters: { ...config.risk_parameters, take_profit_percentage: val }
                          })}
                          min={5}
                          max={50}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label className="text-gray-300">Max. Daily Loss</Label>
                          <span className="text-red-400 font-bold">{config.risk_parameters.max_daily_loss_percentage}%</span>
                        </div>
                        <Slider
                          value={[config.risk_parameters.max_daily_loss_percentage]}
                          onValueChange={([val]) => setConfig({
                            ...config,
                            risk_parameters: { ...config.risk_parameters, max_daily_loss_percentage: val }
                          })}
                          min={1}
                          max={20}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Trailing Stop */}
                    <div className="p-4 rounded-lg bg-gray-900 border border-gray-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-white">Trailing Stop aktivieren</Label>
                        <Switch
                          checked={config.risk_parameters.trailing_stop_enabled}
                          onCheckedChange={(checked) => setConfig({
                            ...config,
                            risk_parameters: { ...config.risk_parameters, trailing_stop_enabled: checked }
                          })}
                        />
                      </div>
                      {config.risk_parameters.trailing_stop_enabled && (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label className="text-gray-300">Trailing Stop %</Label>
                            <span className="text-[#D4AF37] font-bold">{config.risk_parameters.trailing_stop_percentage}%</span>
                          </div>
                          <Slider
                            value={[config.risk_parameters.trailing_stop_percentage]}
                            onValueChange={([val]) => setConfig({
                              ...config,
                              risk_parameters: { ...config.risk_parameters, trailing_stop_percentage: val }
                            })}
                            min={1}
                            max={15}
                            step={0.5}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Learning Settings */}
                  <div className="space-y-4">
                    <Label className="text-white text-lg font-semibold flex items-center gap-2">
                      <Brain className="w-5 h-5 text-[#D4AF37]" />
                      AI Self-Optimization
                    </Label>
                    
                    <div className="p-4 rounded-lg bg-gray-900 border border-gray-700 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Automatische Optimierung</Label>
                          <p className="text-xs text-gray-400 mt-1">
                            Bot passt Parameter nach {config.ai_learning.min_trades_for_optimization} Trades automatisch an
                          </p>
                        </div>
                        <Switch
                          checked={config.ai_learning.self_optimization_enabled}
                          onCheckedChange={(checked) => setConfig({
                            ...config,
                            ai_learning: { ...config.ai_learning, self_optimization_enabled: checked }
                          })}
                        />
                      </div>

                      {config.ai_learning.self_optimization_enabled && (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label className="text-gray-300">Learning Rate</Label>
                              <span className="text-[#D4AF37] font-bold">{config.ai_learning.learning_rate.toFixed(2)}</span>
                            </div>
                            <Slider
                              value={[config.ai_learning.learning_rate * 100]}
                              onValueChange={([val]) => setConfig({
                                ...config,
                                ai_learning: { ...config.ai_learning, learning_rate: val / 100 }
                              })}
                              min={1}
                              max={50}
                              step={1}
                              className="w-full"
                            />
                            <p className="text-xs text-gray-500">
                              Höher = Schnellere Anpassung (aber potenziell instabiler)
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-gray-300">Min. Trades für Optimierung</Label>
                            <Input
                              type="number"
                              value={config.ai_learning.min_trades_for_optimization}
                              onChange={(e) => setConfig({
                                ...config,
                                ai_learning: { ...config.ai_learning, min_trades_for_optimization: parseInt(e.target.value) || 20 }
                              })}
                              className="bg-black border-gray-700 text-white"
                              min={10}
                              max={100}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-4 pt-6 border-t border-gray-800">
                    <Button
                      onClick={saveConfig}
                      disabled={updateBotMutation.isPending}
                      className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold text-lg px-8 py-6"
                    >
                      <Settings className="w-5 h-5 mr-2" />
                      Konfiguration speichern
                    </Button>
                    {config.is_active && (
                      <div className="flex items-center gap-2 text-yellow-400">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">Änderungen werden beim nächsten Trade aktiv</span>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Trades Tab */}
              <TabsContent value="trades" className="space-y-4">
                {botTrades.length > 0 ? (
                  <div className="space-y-3">
                    {botTrades.map((trade) => (
                      <Card key={trade.id} className="border-gray-800 bg-gray-900/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                trade.trade_type === 'buy' ? 'bg-green-500/20 border-2 border-green-500' : 'bg-red-500/20 border-2 border-red-500'
                              }`}>
                                {trade.trade_type === 'buy' ? 
                                  <TrendingUp className="w-6 h-6 text-green-400" /> : 
                                  <TrendingDown className="w-6 h-6 text-red-400" />
                                }
                              </div>
                              <div>
                                <p className="font-bold text-white">{trade.spv_name}</p>
                                <p className="text-sm text-gray-400">
                                  {trade.token_amount?.toFixed(4)} Token @ {trade.entry_price} EUT
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={`text-xs ${
                                    trade.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                                    trade.status === 'closed' ? 'bg-gray-500/20 text-gray-400' :
                                    trade.status === 'stopped_out' ? 'bg-red-500/20 text-red-400' :
                                    'bg-green-500/20 text-green-400'
                                  }`}>
                                    {trade.status}
                                  </Badge>
                                  <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] text-xs">
                                    {trade.strategy}
                                  </Badge>
                                  {trade.ai_confidence && (
                                    <span className="text-xs text-gray-500">
                                      AI: {trade.ai_confidence}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              {trade.status === 'closed' && (
                                <>
                                  <p className={`text-xl font-bold ${trade.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {trade.profit_loss >= 0 ? '+' : ''}{trade.profit_loss?.toFixed(2)} EUT
                                  </p>
                                  <p className={`text-sm ${trade.profit_loss_percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {trade.profit_loss_percentage >= 0 ? '+' : ''}{trade.profit_loss_percentage?.toFixed(2)}%
                                  </p>
                                </>
                              )}
                              {trade.status === 'open' && (
                                <>
                                  <p className="text-sm text-gray-400">Entry</p>
                                  <p className="text-lg font-bold text-white">{trade.entry_price} EUT</p>
                                </>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(trade.opened_at).toLocaleDateString('de-DE')}
                              </p>
                            </div>
                          </div>
                          
                          {trade.execution_reason && (
                            <div className="mt-3 pt-3 border-t border-gray-800">
                              <p className="text-xs text-gray-400">
                                <strong>Grund:</strong> {trade.execution_reason}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Noch keine Trades. Bot starten für Live-Trading.</p>
                  </div>
                )}
              </TabsContent>

              {/* Backtest Tab */}
              <TabsContent value="backtest">
                <RLBacktestEngine user={user} />
              </TabsContent>

              {/* AI Learning Tab */}
              <TabsContent value="ai" className="space-y-6">
                <Card className="border-gray-800 bg-black/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="w-5 h-5 text-[#D4AF37]" />
                      AI Learning Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {botConfig?.ai_learning?.parameter_adjustments?.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-400 mb-3">
                          Der Bot hat folgende Parameter-Optimierungen vorgenommen:
                        </p>
                        {botConfig.ai_learning.parameter_adjustments.slice(0, 10).map((adj, idx) => (
                          <div key={idx} className="p-4 rounded-lg bg-gray-900 border border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-semibold">{adj.parameter}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(adj.date).toLocaleDateString('de-DE')}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-gray-400">{adj.old_value}</span>
                              <span className="text-[#D4AF37]">→</span>
                              <span className="text-[#D4AF37] font-bold">{adj.new_value}</span>
                              {adj.performance_impact && (
                                <Badge className={`${
                                  adj.performance_impact > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                } text-xs`}>
                                  {adj.performance_impact > 0 ? '+' : ''}{adj.performance_impact.toFixed(2)}%
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">{adj.reason}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 mb-2">Noch keine AI-Optimierungen</p>
                        <p className="text-sm text-gray-500">
                          Nach {config.ai_learning.min_trades_for_optimization} Trades beginnt die automatische Optimierung
                        </p>
                      </div>
                    )}

                    {/* ML Insights from Performance */}
                    {botPerformance.length > 0 && botPerformance[0].ml_insights && (
                      <div className="space-y-4 pt-6 border-t border-gray-800">
                        <h3 className="text-white font-semibold">Machine Learning Erkenntnisse</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-gray-900 border border-gray-700">
                            <p className="text-sm text-gray-400 mb-2">Optimale Entry-Zeiten</p>
                            <div className="space-y-1">
                              {botPerformance[0].ml_insights.optimal_entry_times?.map((time, idx) => (
                                <Badge key={idx} className="bg-[#D4AF37]/20 text-[#D4AF37] text-xs mr-2">
                                  {time}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 rounded-lg bg-gray-900 border border-gray-700">
                            <p className="text-sm text-gray-400 mb-2">Empfohlene Position Size</p>
                            <p className="text-2xl font-bold text-white">
                              {botPerformance[0].ml_insights.recommended_position_size}%
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-gray-900 border border-gray-700">
                            <p className="text-sm text-gray-400 mb-2">Sentiment Accuracy</p>
                            <p className="text-2xl font-bold text-green-400">
                              {botPerformance[0].ml_insights.sentiment_accuracy?.toFixed(1)}%
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-gray-900 border border-gray-700">
                            <p className="text-sm text-gray-400 mb-2">Volatility Prediction</p>
                            <p className="text-2xl font-bold text-blue-400">
                              {botPerformance[0].ml_insights.volatility_prediction_accuracy?.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}