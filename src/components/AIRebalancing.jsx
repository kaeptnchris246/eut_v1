import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  X,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function AIRebalancing({ user, investments, spvs, onRebalance }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const analyzePortfolio = async () => {
    setIsAnalyzing(true);
    toast.info('KI analysiert Ihr Portfolio...');

    try {
      const currentAllocation = investments.map(inv => {
        const spv = spvs.find(s => s.id === inv.spv_id);
        return {
          spv_name: inv.spv_name,
          category: spv?.category,
          amount: inv.current_value || inv.invested_amount,
          risk_level: spv?.risk_level
        };
      });

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analysiere dieses Investment-Portfolio und gib Rebalancing-Empfehlungen:

**Aktuelle Allocation:**
${JSON.stringify(currentAllocation, null, 2)}

**User Risk Profile:**
- Trading Bot Strategie: ${user.trading_bot_strategy || 'balanced'}
- Total Invested: ${investments.reduce((sum, inv) => sum + inv.invested_amount, 0)} EUT

**Verfügbare SPVs:**
${JSON.stringify(spvs.map(s => ({
  name: s.name,
  category: s.category,
  risk_level: s.risk_level,
  target_return: s.target_return,
  available: s.available_supply
})))}

Berücksichtige:
1. Diversifikation über Kategorien
2. Risiko-Balance basierend auf User-Profil
3. Aktuelle Marktbedingungen
4. Sharpe Ratio Optimierung
5. Konzentrationsrisiko minimieren

Empfehle konkrete Aktionen (buy/sell) mit Begründung.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            current_risk_score: { type: 'number' },
            current_diversification_score: { type: 'number' },
            recommended_actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string', enum: ['buy', 'sell', 'hold'] },
                  spv_name: { type: 'string' },
                  amount: { type: 'number' },
                  priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                  reasoning: { type: 'string' }
                }
              }
            },
            target_allocation: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  target_percentage: { type: 'number' },
                  current_percentage: { type: 'number' }
                }
              }
            },
            expected_improvements: {
              type: 'object',
              properties: {
                sharpe_ratio_improvement: { type: 'number' },
                risk_reduction: { type: 'number' },
                diversification_improvement: { type: 'number' }
              }
            },
            summary: { type: 'string' }
          }
        }
      });

      // Save recommendation
      await base44.entities.PortfolioRebalancing.create({
        user_email: user.email,
        analysis_date: new Date().toISOString(),
        current_allocation: currentAllocation,
        recommended_actions: analysis.recommended_actions,
        ai_reasoning: analysis.summary,
        risk_score: analysis.current_risk_score,
        diversification_score: analysis.current_diversification_score,
        expected_improvement: analysis.expected_improvements,
        status: 'pending'
      });

      setRecommendation(analysis);
      toast.success('Portfolio-Analyse abgeschlossen!');
    } catch (error) {
      toast.error('Analyse fehlgeschlagen: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const executeRebalancing = async () => {
    if (!recommendation) return;

    setIsExecuting(true);
    toast.info('Rebalancing wird ausgeführt...');

    try {
      // Execute each recommended action
      for (const action of recommendation.recommended_actions) {
        if (action.priority === 'high' || action.priority === 'medium') {
          // In production: Execute actual trades
          // For demo: Log the action
          console.log(`Executing ${action.action} ${action.amount} EUT of ${action.spv_name}`);
        }
      }

      // Update recommendation status
      const rebalancings = await base44.entities.PortfolioRebalancing.filter({ user_email: user.email }, '-created_date', 1);
      if (rebalancings[0]) {
        await base44.entities.PortfolioRebalancing.update(rebalancings[0].id, {
          status: 'executed',
          executed_at: new Date().toISOString()
        });
      }

      toast.success('Rebalancing erfolgreich ausgeführt!');
      setRecommendation(null);
      
      if (onRebalance) {
        onRebalance();
      }
    } catch (error) {
      toast.error('Rebalancing fehlgeschlagen: ' + error.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const rejectRebalancing = async () => {
    const rebalancings = await base44.entities.PortfolioRebalancing.filter({ user_email: user.email }, '-created_date', 1);
    if (rebalancings[0]) {
      await base44.entities.PortfolioRebalancing.update(rebalancings[0].id, {
        status: 'rejected'
      });
    }
    setRecommendation(null);
    toast.info('Rebalancing-Empfehlung abgelehnt');
  };

  return (
    <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
          AI Portfolio Rebalancing
        </CardTitle>
        <p className="text-sm text-gray-400 mt-2">
          KI-gestützte Optimierung Ihrer Asset-Allokation
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!recommendation ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-2xl bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-10 h-10 text-purple-400" />
            </div>
            <p className="text-gray-300 mb-6">
              Die KI analysiert Marktbedingungen, Ihr Risikoprofil und Diversifikation
            </p>
            <Button
              onClick={analyzePortfolio}
              disabled={isAnalyzing || investments.length === 0}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold px-8 py-6"
            >
              {isAnalyzing ? (
                <>
                  <Zap className="w-5 h-5 mr-2 animate-spin" />
                  KI analysiert...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Portfolio analysieren
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Scores */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-black/50 border border-purple-500/30">
                <p className="text-xs text-purple-300 mb-1">Risiko-Score</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-white">{recommendation.current_risk_score}</p>
                  <span className="text-sm text-gray-400">/ 100</span>
                </div>
                <div className="mt-2 w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                    style={{ width: `${recommendation.current_risk_score}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-black/50 border border-purple-500/30">
                <p className="text-xs text-purple-300 mb-1">Diversifikation</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-white">{recommendation.current_diversification_score}</p>
                  <span className="text-sm text-gray-400">/ 100</span>
                </div>
                <div className="mt-2 w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-300"
                    style={{ width: `${recommendation.current_diversification_score}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-black/50 border border-purple-500/30">
                <p className="text-xs text-purple-300 mb-1">Erwartete Verbesserung</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-green-400">
                    +{recommendation.expected_improvements?.diversification_improvement?.toFixed(1)}%
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-1">Diversifikation</p>
              </div>
            </div>

            {/* AI Summary */}
            <div className="p-4 rounded-lg bg-black/50 border border-purple-500/30">
              <p className="text-sm font-semibold text-purple-300 mb-2">KI-Analyse:</p>
              <p className="text-sm text-gray-300">{recommendation.summary}</p>
            </div>

            {/* Recommended Actions */}
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#D4AF37]" />
                Empfohlene Aktionen
              </h4>
              <div className="space-y-3">
                {recommendation.recommended_actions?.map((action, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border-2 ${
                    action.priority === 'high' ? 'border-red-500/30 bg-red-500/10' :
                    action.priority === 'medium' ? 'border-yellow-500/30 bg-yellow-500/10' :
                    'border-gray-700 bg-gray-900/50'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {action.action === 'buy' ? (
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        ) : action.action === 'sell' ? (
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <p className="font-bold text-white text-sm">
                            {action.action.toUpperCase()} {action.spv_name}
                          </p>
                          <p className="text-xs text-gray-400">{action.amount.toFixed(2)} EUT</p>
                        </div>
                      </div>
                      <Badge className={`${
                        action.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        action.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {action.priority} priority
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-300 pl-8">{action.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Improvements */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30">
              <p className="text-sm font-semibold text-green-300 mb-3">Erwartete Verbesserungen:</p>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Sharpe Ratio:</span>
                  <span className="text-green-400 font-bold">
                    +{recommendation.expected_improvements?.sharpe_ratio_improvement?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Risiko-Reduktion:</span>
                  <span className="text-green-400 font-bold">
                    -{recommendation.expected_improvements?.risk_reduction?.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Diversifikation:</span>
                  <span className="text-green-400 font-bold">
                    +{recommendation.expected_improvements?.diversification_improvement?.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={rejectRebalancing}
                variant="outline"
                className="flex-1 border-gray-700 text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4 mr-2" />
                Ablehnen
              </Button>
              <Button
                onClick={executeRebalancing}
                disabled={isExecuting}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold"
              >
                {isExecuting ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Wird ausgeführt...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Rebalancing ausführen
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}