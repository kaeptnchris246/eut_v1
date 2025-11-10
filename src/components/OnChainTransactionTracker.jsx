import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
  RefreshCw
} from 'lucide-react';

export default function OnChainTransactionTracker({ txHash, network = 'sepolia' }) {
  const [txData, setTxData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const explorerUrls = {
    sepolia: 'https://sepolia.etherscan.io',
    mainnet: 'https://etherscan.io',
    polygon: 'https://polygonscan.com',
  };

  const fetchTransactionData = async () => {
    if (!txHash) return;

    setIsLoading(true);
    setError(null);

    try {
      // In production, fetch from Etherscan API
      // const apiKey = process.env.ETHERSCAN_API_KEY;
      // const response = await fetch(
      //   `https://api-sepolia.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${apiKey}`
      // );
      // const data = await response.json();

      // Simulate transaction data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockTxData = {
        hash: txHash,
        status: Math.random() > 0.2 ? 'success' : 'pending',
        blockNumber: Math.floor(Math.random() * 1000000 + 5000000),
        confirmations: Math.floor(Math.random() * 50 + 12),
        from: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        to: '0x742d35Cc6634C0532925a3b8D4f3c5e8a7B',
        gasUsed: '0.00234',
        gasPrice: '25',
        timestamp: Date.now() - Math.floor(Math.random() * 3600000),
        value: '0.5',
      };

      setTxData(mockTxData);
    } catch (err) {
      setError('Fehler beim Abrufen der Transaction-Daten');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (txHash) {
      fetchTransactionData();
      
      // Auto-refresh every 15 seconds if pending
      const interval = setInterval(() => {
        if (txData?.status === 'pending') {
          fetchTransactionData();
        }
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [txHash]);

  if (!txHash) {
    return null;
  }

  if (isLoading && !txData) {
    return (
      <Card className="border-2 border-gray-700 bg-gray-900">
        <CardContent className="p-4 flex items-center gap-3">
          <Zap className="w-5 h-5 text-[#D4AF37] animate-spin" />
          <p className="text-sm text-gray-400">Lade Transaction-Daten...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-red-500/30 bg-red-500/10">
        <CardContent className="p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!txData) return null;

  return (
    <Card className={`border-2 ${
      txData.status === 'success' ? 'border-green-500/30 bg-green-500/10' :
      txData.status === 'pending' ? 'border-yellow-500/30 bg-yellow-500/10' :
      'border-red-500/30 bg-red-500/10'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-base flex items-center gap-2">
            {txData.status === 'success' ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Bestätigt
              </>
            ) : txData.status === 'pending' ? (
              <>
                <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />
                Ausstehend
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-400" />
                Fehlgeschlagen
              </>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchTransactionData}
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400 text-xs mb-1">Block</p>
            <p className="text-white font-mono">{txData.blockNumber?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Confirmations</p>
            <Badge className={`${
              txData.confirmations >= 12 ? 'bg-green-500/20 text-green-400' :
              txData.confirmations >= 6 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {txData.confirmations || 0}
            </Badge>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Gas Used</p>
            <p className="text-white font-semibold">{txData.gasUsed} ETH</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Gas Price</p>
            <p className="text-white font-semibold">{txData.gasPrice} Gwei</p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-black/50 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Transaction Hash</p>
          <div className="flex items-center gap-2">
            <code className="text-xs text-[#D4AF37] break-all flex-1">
              {txHash}
            </code>
            <a
              href={`${explorerUrls[network]}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <ExternalLink className="w-4 h-4 text-gray-400 hover:text-[#D4AF37]" />
            </a>
          </div>
        </div>

        {txData.status === 'pending' && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-xs text-yellow-400">
              ⏳ Warte auf {12 - (txData.confirmations || 0)} weitere Confirmations...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}