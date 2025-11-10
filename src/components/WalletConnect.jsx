import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Zap,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

export default function WalletConnect({ compact = false, onConnect = null }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    checkIfWalletIsConnected();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) return;

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        await getChainId();
        await getBalance(accounts[0]);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const getChainId = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(parseInt(chainId, 16));
    } catch (error) {
      console.error('Error getting chain ID:', error);
    }
  };

  const getBalance = async (address) => {
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      
      // Convert from Wei to ETH
      const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
      setBalance(ethBalance.toFixed(4));
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setWalletAddress(null);
      setBalance(null);
    } else if (accounts[0] !== walletAddress) {
      setWalletAddress(accounts[0]);
      getBalance(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const connectWallet = async (walletType = 'metamask') => {
    if (!window.ethereum) {
      toast.error('MetaMask nicht installiert!', {
        description: 'Bitte installieren Sie MetaMask um fortzufahren.',
      });
      return;
    }

    setIsConnecting(true);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      setWalletAddress(accounts[0]);
      await getChainId();
      await getBalance(accounts[0]);
      
      toast.success('Wallet verbunden!', {
        description: `Adresse: ${formatAddress(accounts[0])}`,
      });

      if (onConnect) {
        onConnect(accounts[0]);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Wallet-Verbindung fehlgeschlagen', {
        description: error.message,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setBalance(null);
    toast.info('Wallet getrennt');
  };

  const switchToCorrectNetwork = async () => {
    try {
      // Sepolia Testnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // 11155111 in decimal = Sepolia
      });
      toast.success('Netzwerk gewechselt zu Sepolia Testnet');
    } catch (error) {
      if (error.code === 4902) {
        // Network not added, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/']
            }]
          });
          toast.success('Sepolia Testnet hinzugefügt!');
        } catch (addError) {
          toast.error('Fehler beim Hinzufügen des Netzwerks');
        }
      } else {
        toast.error('Fehler beim Netzwerkwechsel');
      }
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success('Adresse kopiert!');
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId) => {
    const networks = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon',
      80001: 'Mumbai Testnet',
    };
    return networks[chainId] || `Chain ID: ${chainId}`;
  };

  const isCorrectNetwork = chainId === 11155111; // Sepolia

  if (compact) {
    if (!walletAddress) {
      return (
        <Button
          onClick={() => connectWallet('metamask')}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold"
        >
          {isConnecting ? (
            'Verbinden...'
          ) : (
            <>
              <Wallet className="w-4 h-4 mr-2" />
              Wallet verbinden
            </>
          )}
        </Button>
      );
    }

    return (
      <div className="p-4 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-transparent border-2 border-[#D4AF37]/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-white">Wallet verbunden</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyAddress}
            className="h-8 text-xs"
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>
        <p className="text-xs text-gray-400 font-mono">{formatAddress(walletAddress)}</p>
        {balance && (
          <p className="text-xs text-[#D4AF37] mt-1">{balance} ETH</p>
        )}
      </div>
    );
  }

  return (
    <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center">
            <Wallet className="w-6 h-6 text-black" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Web3 Wallet</h3>
            <p className="text-sm text-gray-400">
              {walletAddress ? 'Verbunden' : 'MetaMask oder WalletConnect'}
            </p>
          </div>
        </div>

        {!walletAddress ? (
          <div className="space-y-3">
            <Button
              onClick={() => connectWallet('metamask')}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold py-6"
            >
              {isConnecting ? (
                <>
                  <Zap className="w-5 h-5 mr-2 animate-spin" />
                  Verbinden...
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5 mr-2" />
                  MetaMask verbinden
                </>
              )}
            </Button>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs">
              <Shield className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300">
                Ihre Wallet-Adresse wird nur für Transaktionen verwendet. Wir speichern keine privaten Keys.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Network Warning */}
            {!isCorrectNetwork && (
              <div className="p-4 rounded-lg bg-yellow-500/10 border-2 border-yellow-500/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-400 mb-2">
                      Falsches Netzwerk
                    </p>
                    <p className="text-xs text-gray-300 mb-3">
                      Bitte wechseln Sie zu Sepolia Testnet
                    </p>
                    <Button
                      onClick={switchToCorrectNetwork}
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Zu Sepolia wechseln
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Info */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-transparent border-2 border-[#D4AF37]/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white">Wallet-Adresse</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-8"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm font-mono text-gray-300 break-all mb-3">
                {walletAddress}
              </p>
              
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-700">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Balance</p>
                  <p className="text-base font-bold text-[#D4AF37]">{balance || '0.0000'} ETH</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Netzwerk</p>
                  <Badge className={`text-xs ${isCorrectNetwork ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {getNetworkName(chainId)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={disconnectWallet}
                className="flex-1 border-gray-700 text-white hover:bg-gray-800"
              >
                Trennen
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`https://sepolia.etherscan.io/address/${walletAddress}`, '_blank')}
                className="flex-1 border-gray-700 text-white hover:bg-gray-800"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Etherscan
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}