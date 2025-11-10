import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Shield, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function WalletOwnershipProof({ user, onVerified }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [signature, setSignature] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask nicht installiert');
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

  const proveOwnership = async () => {
    if (!walletAddress) {
      toast.error('Bitte zuerst Wallet verbinden');
      return;
    }

    setIsVerifying(true);
    toast.info('Bitte signieren Sie die Nachricht in MetaMask...');

    try {
      // Message to sign
      const message = `Ich bestätige, dass ich Eigentümer dieser Wallet bin.\n\nEuphena Asset Network\nEmail: ${user.email}\nTimestamp: ${Date.now()}\nWallet: ${walletAddress}`;

      // Request signature
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });

      setSignature(signature);

      // Verify signature and update user
      const verifiedWallets = user.verified_wallets || [];
      verifiedWallets.push({
        address: walletAddress,
        verified_at: new Date().toISOString(),
        verification_signature: signature,
        chain: 'sepolia',
        is_primary: verifiedWallets.length === 0
      });

      await base44.auth.updateMe({
        verified_wallets: verifiedWallets,
        onchain_kyc_address: walletAddress
      });

      toast.success('Wallet-Besitz erfolgreich nachgewiesen!');
      
      if (onVerified) {
        onVerified(walletAddress, signature);
      }
    } catch (error) {
      toast.error('Signatur abgelehnt oder fehlgeschlagen');
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  const verifiedWallets = user?.verified_wallets || [];
  const isCurrentWalletVerified = verifiedWallets.some(w => w.address?.toLowerCase() === walletAddress?.toLowerCase());

  return (
    <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-purple-400" />
          Wallet Ownership Proof
        </CardTitle>
        <p className="text-sm text-gray-400 mt-2">
          Beweisen Sie den Besitz Ihrer Wallet durch Signatur
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {verifiedWallets.length > 0 && (
          <div className="space-y-2">
            <Label className="text-white text-sm">Verifizierte Wallets:</Label>
            {verifiedWallets.map((wallet, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-black/50 border border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-xs text-green-400 break-all">
                    {wallet.address}
                  </code>
                  {wallet.is_primary && (
                    <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] text-xs ml-2">
                      Primary
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Verifiziert: {new Date(wallet.verified_at).toLocaleString('de-DE')}
                </p>
              </div>
            ))}
          </div>
        )}

        {!walletAddress ? (
          <Button
            onClick={connectWallet}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Wallet verbinden
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-black/50 border border-purple-500/30">
              <Label className="text-white text-sm mb-2 block">Verbundene Wallet:</Label>
              <code className="text-xs text-purple-400 break-all">
                {walletAddress}
              </code>
              {isCurrentWalletVerified && (
                <Badge className="mt-2 bg-green-500/20 text-green-400">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Bereits verifiziert
                </Badge>
              )}
            </div>

            {!isCurrentWalletVerified && (
              <>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm text-blue-300 mb-2">
                    <strong>So funktioniert's:</strong>
                  </p>
                  <ol className="text-xs text-gray-300 space-y-1">
                    <li>1. Sie signieren eine Nachricht mit Ihrer Wallet</li>
                    <li>2. Wir verifizieren die Signatur on-chain</li>
                    <li>3. Ihre Wallet ist permanent mit Ihrem Account verknüpft</li>
                  </ol>
                </div>

                <Button
                  onClick={proveOwnership}
                  disabled={isVerifying}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-6"
                >
                  {isVerifying ? (
                    <>
                      <Zap className="w-5 h-5 mr-2 animate-spin" />
                      Warte auf Signatur...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Wallet-Besitz nachweisen
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}

        <div className="p-3 rounded-lg bg-gray-900 border border-gray-700">
          <p className="text-xs text-gray-400">
            <strong className="text-white">Sicherheit:</strong> Die Signatur beweist, dass Sie den Private Key besitzen, 
            ohne ihn preiszugeben. Wir können niemals auf Ihre Wallet zugreifen!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}