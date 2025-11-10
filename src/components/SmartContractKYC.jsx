import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle2, AlertCircle, Zap, ExternalLink, Code } from 'lucide-react';
import { toast } from 'sonner';

// Smart Contract ABIs (simplified for demo)
const KYC_REGISTRY_ABI = [
  "function isVerified(address user) public view returns (bool)",
  "function verifyUser(address user) public",
  "function revokeVerification(address user) public",
  "event UserVerified(address indexed user, uint256 timestamp)",
  "event VerificationRevoked(address indexed user, uint256 timestamp)"
];

const KYC_REGISTRY_ADDRESS = "0x742d35Cc6634C0532925a3b8D4f3c5e8a7B"; // Sepolia Testnet

export default function SmartContractKYC({ walletAddress, onVerified }) {
  const [isChecking, setIsChecking] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);

  useEffect(() => {
    if (walletAddress) {
      checkVerificationStatus();
    }
  }, [walletAddress]);

  const checkVerificationStatus = async () => {
    if (!walletAddress) return;

    setIsChecking(true);

    try {
      // In production:
      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const contract = new ethers.Contract(KYC_REGISTRY_ADDRESS, KYC_REGISTRY_ABI, provider);
      // const isVerified = await contract.isVerified(walletAddress);

      // Demo simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      const isVerified = false; // Simulate not verified initially

      setVerificationStatus(isVerified ? 'verified' : 'not_verified');
      
      if (isVerified && onVerified) {
        onVerified(walletAddress);
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      toast.error('Fehler beim Prüfen des Verifizierungsstatus');
    } finally {
      setIsChecking(false);
    }
  };

  const verifyOnChain = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask nicht gefunden!');
      return;
    }

    setIsVerifying(true);
    toast.info('Bereite Smart Contract Transaktion vor...');

    try {
      // In production:
      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const signer = provider.getSigner();
      // const contract = new ethers.Contract(KYC_REGISTRY_ADDRESS, KYC_REGISTRY_ABI, signer);
      
      // toast.info('Bitte bestätigen Sie die Transaktion in MetaMask...');
      // const tx = await contract.verifyUser(walletAddress);
      
      // toast.info('Transaktion eingereicht, warte auf Bestätigung...');
      // const receipt = await tx.wait();

      // Demo simulation
      await new Promise(resolve => setTimeout(resolve, 3000));
      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

      setTxHash(mockTxHash);
      setVerificationStatus('verified');

      toast.success('On-Chain KYC erfolgreich!', {
        description: 'Ihre Wallet ist jetzt im KYC Registry verifiziert'
      });

      if (onVerified) {
        onVerified(walletAddress, mockTxHash);
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Verifizierung fehlgeschlagen: ' + error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isChecking) {
    return (
      <Card className="border-2 border-gray-700 bg-gray-900">
        <CardContent className="p-6 text-center">
          <Zap className="w-12 h-12 text-[#D4AF37] mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Prüfe On-Chain Status...</p>
        </CardContent>
      </Card>
    );
  }

  if (verificationStatus === 'verified') {
    return (
      <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-12 h-12 text-green-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-white text-lg mb-2">✅ On-Chain verifiziert</p>
              <p className="text-sm text-gray-300 mb-3">
                Ihre Wallet ist im KYC Registry Smart Contract registriert
              </p>
              {txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-green-400 hover:text-green-300"
                >
                  <ExternalLink className="w-3 h-3" />
                  View on Etherscan
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-base">
          <Code className="w-5 h-5 text-purple-400" />
          Smart Contract Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-black/50 border border-purple-500/30">
          <div className="grid md:grid-cols-2 gap-3 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Contract:</span>
              <span className="text-purple-400 font-mono text-xs">KYCRegistry</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Standard:</span>
              <span className="text-white">ERC-1643</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Network:</span>
              <Badge className="bg-green-500/20 text-green-400 text-xs">Sepolia</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Gas:</span>
              <span className="text-white">~0.002 ETH</span>
            </div>
          </div>
          
          <code className="text-xs text-gray-400 break-all block p-2 bg-black rounded">
            {KYC_REGISTRY_ADDRESS}
          </code>
        </div>

        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <p className="text-sm text-blue-300 mb-2">
            <strong>Was passiert bei der Verifizierung?</strong>
          </p>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• Smart Contract Call: kycRegistry.verifyUser(yourAddress)</li>
            <li>• On-Chain Eintrag im KYC Registry</li>
            <li>• SPV Token Transfers werden freigeschaltet</li>
            <li>• Permanent gespeichert auf Blockchain</li>
          </ul>
        </div>

        <Button
          onClick={verifyOnChain}
          disabled={isVerifying || !walletAddress}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-6"
        >
          {isVerifying ? (
            <>
              <Zap className="w-5 h-5 mr-2 animate-spin" />
              Transaktion wird verarbeitet...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 mr-2" />
              On-Chain Verification starten
            </>
          )}
        </Button>

        {!walletAddress && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-xs text-yellow-400">
              ⚠️ Bitte verbinden Sie zuerst Ihre Wallet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}