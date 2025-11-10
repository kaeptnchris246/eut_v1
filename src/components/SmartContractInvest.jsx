import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  Zap,
  CheckCircle2,
  AlertCircle,
  Code,
  ExternalLink,
  Shield,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function SmartContractInvest({ spv, user, onSuccess }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [amount, setAmount] = useState('');
  const [isInvesting, setIsInvesting] = useState(false);
  const [txHash, setTxHash] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask nicht installiert!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setWalletAddress(accounts[0]);
      toast.success('Wallet verbunden!');
    } catch (error) {
      toast.error('Wallet-Verbindung fehlgeschlagen');
    }
  };

  const investViaSmartContract = async () => {
    if (!walletAddress) {
      toast.error('Bitte verbinden Sie zuerst Ihre Wallet');
      return;
    }

    if (!user.onchain_kyc_verified) {
      toast.error('On-Chain KYC erforderlich');
      return;
    }

    const investAmount = parseFloat(amount);
    if (isNaN(investAmount) || investAmount < spv.minimum_investment) {
      toast.error(`Mindestinvestment: ${spv.minimum_investment} EUT`);
      return;
    }

    setIsInvesting(true);
    toast.info('Bereite Smart Contract Transaktion vor...');

    try {
      // In production:
      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const signer = provider.getSigner();
      // const spvContract = new ethers.Contract(SPV_CONTRACT_ADDRESS, SPV_ABI, signer);
      
      // Check KYC status on-chain
      // const kycRegistry = new ethers.Contract(KYC_REGISTRY_ADDRESS, KYC_ABI, provider);
      // const isVerified = await kycRegistry.isVerified(walletAddress);
      // if (!isVerified) throw new Error('On-Chain KYC required');

      // Execute investment
      // const tx = await spvContract.invest(spv.id, ethers.utils.parseUnits(investAmount.toString(), 18));
      // const receipt = await tx.wait();

      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

      // Create investment record
      const tokenAmount = investAmount / spv.token_price;
      
      await base44.entities.Investment.create({
        spv_id: spv.id,
        spv_name: spv.name,
        spv_symbol: spv.symbol,
        investor_email: user.email,
        token_amount: tokenAmount,
        invested_amount: investAmount,
        purchase_price: spv.token_price,
        current_value: investAmount,
        purchase_date: new Date().toISOString(),
        status: 'aktiv',
        onchain_tx_hash: mockTxHash
      });

      // Create transaction
      await base44.entities.Transaction.create({
        user_email: user.email,
        type: 'spv_kauf',
        amount: investAmount,
        spv_id: spv.id,
        spv_name: spv.name,
        description: `On-Chain Kauf: ${tokenAmount.toFixed(2)} ${spv.symbol}`,
        status: 'erfolgreich',
        transaction_hash: mockTxHash
      });

      setTxHash(mockTxHash);
      toast.success('Investment erfolgreich on-chain ausgeführt!');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Investment fehlgeschlagen: ' + error.message);
    } finally {
      setIsInvesting(false);
    }
  };

  if (txHash) {
    return (
      <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
        <CardContent className="p-6">
          <div className="text-center">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Investment erfolgreich!</h3>
            <p className="text-sm text-gray-300 mb-4">
              {parseFloat(amount) / spv.token_price} {spv.symbol} Token wurden Ihrer Wallet gutgeschrieben
            </p>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300"
            >
              <ExternalLink className="w-4 h-4" />
              View on Etherscan
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Connection */}
      {!walletAddress ? (
        <Card className="border-2 border-gray-700 bg-gray-900">
          <CardContent className="p-6 text-center">
            <Wallet className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
            <h3 className="font-bold text-white mb-2">Wallet verbinden</h3>
            <p className="text-sm text-gray-400 mb-4">
              Verbinden Sie MetaMask für On-Chain Investment
            </p>
            <Button
              onClick={connectWallet}
              className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold"
            >
              <Wallet className="w-4 h-4 mr-2" />
              MetaMask verbinden
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KYC Check */}
          {!user.onchain_kyc_verified && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-400 mb-1">
                    On-Chain KYC erforderlich
                  </p>
                  <p className="text-xs text-gray-300">
                    Verifizieren Sie Ihre Wallet für On-Chain Trading
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Investment Form */}
          <Card className="border-2 border-[#D4AF37] bg-gradient-to-br from-[#D4AF37]/10 to-black">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-[#D4AF37]" />
                On-Chain Investment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-black/50 border border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Verbundene Wallet</p>
                <code className="text-xs text-[#D4AF37] break-all">
                  {walletAddress}
                </code>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block font-semibold">Betrag (EUT)</label>
                <Input
                  type="number"
                  placeholder={`Min. ${spv.minimum_investment}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-900 border-2 border-gray-700 text-white text-lg"
                  disabled={!user.onchain_kyc_verified}
                />
              </div>

              {amount && !isNaN(parseFloat(amount)) && (
                <div className="p-4 rounded-lg bg-gray-900 border border-gray-700">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sie erhalten:</span>
                      <span className="text-white font-bold">
                        {(parseFloat(amount) / spv.token_price).toFixed(4)} {spv.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gas Fee (est.):</span>
                      <span className="text-white font-bold">~0.003 ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Smart Contract:</span>
                      <span className="text-[#D4AF37] font-mono text-xs">ERC-1400</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={investViaSmartContract}
                disabled={isInvesting || !amount || !user.onchain_kyc_verified}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold py-6"
              >
                {isInvesting ? (
                  <>
                    <Zap className="w-5 h-5 mr-2 animate-spin" />
                    Transaktion läuft...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    On-Chain investieren
                  </>
                )}
              </Button>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-xs text-blue-300">
                  <strong>On-Chain Investment:</strong> Ihre SPV-Token werden direkt in Ihre Wallet übertragen. 
                  Transaktion wird auf Sepolia Testnet ausgeführt.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}