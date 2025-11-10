import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingDown, DollarSign, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function SellInvestmentModal({ investment, user, onClose, onSuccess }) {
  const [sellAmount, setSellAmount] = useState('');
  const [isSelling, setIsSelling] = useState(false);
  
  if (!investment || !user) return null;

  const maxSellable = investment.token_amount;
  const currentValuePerToken = investment.current_value / investment.token_amount;
  const estimatedProceeds = parseFloat(sellAmount || 0) * currentValuePerToken;
  const originalCost = parseFloat(sellAmount || 0) * investment.purchase_price;
  const profitLoss = estimatedProceeds - originalCost;
  const profitLossPercent = originalCost > 0 ? (profitLoss / originalCost) * 100 : 0;

  // Check lock period
  const isLocked = investment.lock_period_end && new Date(investment.lock_period_end) > new Date();
  const lockEndDate = investment.lock_period_end ? new Date(investment.lock_period_end).toLocaleDateString('de-DE') : null;

  const handleSell = async () => {
    const amount = parseFloat(sellAmount);
    
    if (!amount || amount <= 0) {
      toast.error('Bitte geben Sie einen gültigen Betrag ein');
      return;
    }

    if (amount > maxSellable) {
      toast.error('Nicht genügend Token verfügbar');
      return;
    }

    if (isLocked) {
      toast.error(`Investment ist gesperrt bis ${lockEndDate}`);
      return;
    }

    setIsSelling(true);

    try {
      // Update investment
      const newTokenAmount = investment.token_amount - amount;
      const newInvestedAmount = newTokenAmount * investment.purchase_price;
      
      if (newTokenAmount <= 0) {
        // Full exit - update status
        await base44.entities.Investment.update(investment.id, {
          status: 'verkauft',
          token_amount: 0,
          current_value: 0,
        });
      } else {
        // Partial sale
        await base44.entities.Investment.update(investment.id, {
          token_amount: newTokenAmount,
          invested_amount: newInvestedAmount,
          current_value: newTokenAmount * currentValuePerToken,
        });
      }

      // Create transaction
      await base44.entities.Transaction.create({
        user_email: user.email,
        type: 'spv_verkauf',
        amount: estimatedProceeds,
        spv_id: investment.spv_id,
        spv_name: investment.spv_name,
        description: `Verkauf von ${amount.toFixed(4)} ${investment.spv_symbol} Token`,
        status: 'erfolgreich',
        fee: estimatedProceeds * 0.01, // 1% exit fee
      });

      // Update user wallet balance
      const exitFee = estimatedProceeds * 0.01;
      const netProceeds = estimatedProceeds - exitFee;
      
      await base44.auth.updateMe({
        wallet_balance: (user.wallet_balance || 0) + netProceeds,
      });

      toast.success(`${amount} Token erfolgreich verkauft! ${netProceeds.toFixed(2)} EUT wurden Ihrem Wallet gutgeschrieben.`);
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Sell error:', error);
      toast.error('Verkauf fehlgeschlagen: ' + error.message);
    } finally {
      setIsSelling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-2 border-red-500/30 bg-gradient-to-br from-gray-900 to-black">
        <CardHeader className="border-b border-gray-800">
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            Investment verkaufen
          </CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xl font-bold text-white">{investment.spv_name}</span>
            <Badge className="bg-[#D4AF37]/20 text-[#D4AF37]">{investment.spv_symbol}</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {isLocked && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <Clock className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-semibold text-sm">Investment gesperrt</p>
                <p className="text-gray-400 text-xs mt-1">
                  Verkauf möglich ab: {lockEndDate}
                </p>
              </div>
            </div>
          )}

          {/* Holdings Info */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-gray-900 border border-gray-800">
            <div>
              <p className="text-xs text-gray-400 mb-1">Verfügbare Token</p>
              <p className="text-lg font-bold text-white">{maxSellable.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Aktueller Wert/Token</p>
              <p className="text-lg font-bold text-white">{currentValuePerToken.toFixed(2)} EUT</p>
            </div>
          </div>

          {/* Sell Amount Input */}
          <div className="space-y-2">
            <Label className="text-white font-semibold">Anzahl Token verkaufen</Label>
            <div className="relative">
              <Input
                type="number"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                placeholder="0.00"
                max={maxSellable}
                step="0.0001"
                className="bg-gray-900 border-gray-700 text-white text-lg h-12"
                disabled={isLocked}
              />
              <Button
                onClick={() => setSellAmount(maxSellable.toString())}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#D4AF37] hover:text-[#B8941F]"
                disabled={isLocked}
              >
                Max
              </Button>
            </div>
          </div>

          {/* Calculation Display */}
          {sellAmount && parseFloat(sellAmount) > 0 && (
            <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-gray-900 to-black border-2 border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Verkaufswert</span>
                <span className="text-white font-semibold">{estimatedProceeds.toFixed(2)} EUT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Exit Fee (1%)</span>
                <span className="text-white font-semibold">-{(estimatedProceeds * 0.01).toFixed(2)} EUT</span>
              </div>
              <div className="flex justify-between text-sm pt-3 border-t border-gray-700">
                <span className="text-gray-400">Netto-Erlös</span>
                <span className="text-white font-bold">{(estimatedProceeds * 0.99).toFixed(2)} EUT</span>
              </div>
              
              <div className={`flex justify-between text-sm pt-3 border-t border-gray-700 ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <span>Gewinn/Verlust</span>
                <span className="font-bold">
                  {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} EUT ({profitLossPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-300">
              Der Verkauf erfolgt zum aktuellen NAV (Net Asset Value). Die Transaktion ist endgültig und kann nicht rückgängig gemacht werden.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-700"
              disabled={isSelling}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSell}
              disabled={isSelling || !sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > maxSellable || isLocked}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold"
            >
              {isSelling ? 'Wird verkauft...' : 'Verkaufen'}
            </Button>
          </div>

          {/* Security Note */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Shield className="w-3 h-3 text-[#D4AF37]" />
            <span>Sichere Transaktion. Erlös wird sofort Ihrem Wallet gutgeschrieben.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}