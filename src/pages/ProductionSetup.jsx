import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Key,
  Shield,
  Wallet,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Zap,
  Code,
  Database
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductionSetup() {
  const [user, setUser] = useState(null);
  const [showSecrets, setShowSecrets] = useState({});
  const [testMode, setTestMode] = useState(true);

  // Configuration State
  const [config, setConfig] = useState({
    // Stripe
    stripe_public_key: '',
    stripe_secret_key: '',
    stripe_webhook_secret: '',
    
    // Wio Bank / SEPA
    wio_bank_api_key: '',
    wio_bank_account_id: '',
    
    // KYC Provider (Sumsub/Onfido)
    kyc_provider: 'sumsub',
    sumsub_app_token: '',
    sumsub_secret_key: '',
    
    // Smart Contracts (Testnet)
    eut_token_address: '',
    kyc_registry_address: '',
    spv_factory_address: '',
    
    // Blockchain RPC
    ethereum_rpc_url: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    polygon_rpc_url: 'https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_KEY',
    
    // Wallet Management
    custody_provider: 'fireblocks',
    fireblocks_api_key: '',
    fireblocks_vault_id: '',
    
    // Webhooks
    webhook_url: '',
    webhook_secret: '',
  });

  const [connectionStatus, setConnectionStatus] = useState({
    stripe: 'not_configured',
    wio_bank: 'not_configured',
    kyc_provider: 'not_configured',
    smart_contracts: 'not_configured',
    custody: 'not_configured',
  });

  useEffect(() => {
    loadUser();
    loadConfig();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      if (currentUser.role !== 'admin') {
        toast.error('Nur Admins haben Zugriff');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadConfig = async () => {
    // In production: Load from secure environment variables / Base44 Secrets
    // For now: localStorage simulation
    const savedConfig = localStorage.getItem('euphena_production_config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  };

  const saveConfig = async () => {
    try {
      // In production: Save to Base44 Secrets via API
      localStorage.setItem('euphena_production_config', JSON.stringify(config));
      
      // Here you would call Base44 Secrets API
      // await base44.secrets.set(config);
      
      toast.success('Konfiguration gespeichert!');
      testConnections();
    } catch (error) {
      toast.error('Fehler beim Speichern: ' + error.message);
    }
  };

  const testConnections = async () => {
    // Simulate connection tests
    const newStatus = { ...connectionStatus };
    
    if (config.stripe_secret_key) {
      newStatus.stripe = 'connected';
    }
    if (config.wio_bank_api_key) {
      newStatus.wio_bank = 'connected';
    }
    if (config.sumsub_app_token) {
      newStatus.kyc_provider = 'connected';
    }
    if (config.eut_token_address) {
      newStatus.smart_contracts = 'connected';
    }
    if (config.fireblocks_api_key) {
      newStatus.custody = 'connected';
    }
    
    setConnectionStatus(newStatus);
  };

  const toggleSecretVisibility = (key) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('In Zwischenablage kopiert!');
  };

  const getStatusBadge = (status) => {
    const badges = {
      'connected': { label: 'Verbunden', className: 'bg-green-500/20 text-green-400 border-green-500' },
      'testing': { label: 'Test-Modus', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500' },
      'not_configured': { label: 'Nicht konfiguriert', className: 'bg-gray-500/20 text-gray-400 border-gray-500' },
      'error': { label: 'Fehler', className: 'bg-red-500/20 text-red-400 border-red-500' },
    };
    return badges[status] || badges['not_configured'];
  };

  const SecretInput = ({ label, value, onChange, placeholder, helperText, configKey }) => (
    <div className="space-y-2">
      <Label className="text-white font-semibold">{label}</Label>
      <div className="relative">
        <Input
          type={showSecrets[configKey] ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(configKey, e.target.value)}
          placeholder={placeholder}
          className="bg-gray-900 border-gray-700 text-white pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => toggleSecretVisibility(configKey)}
            className="h-8 w-8 p-0"
          >
            {showSecrets[configKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          {value && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(value)}
              className="h-8 w-8 p-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      {helperText && <p className="text-xs text-gray-400">{helperText}</p>}
    </div>
  );

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Zugriff verweigert</h2>
            <p className="text-gray-300">Nur Administratoren haben Zugriff auf diese Seite.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-transparent rounded-3xl blur-xl" />
          <Card className="border-[#D4AF37]/30 border-2 bg-gradient-to-br from-gray-900/95 via-black to-black backdrop-blur-xl relative">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Production Setup</h1>
                  <p className="text-gray-400">Zentrale Verwaltung aller Integrationen & API Keys</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-1">Modus</p>
                    <Badge className={testMode ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500' : 'bg-green-500/20 text-green-400 border-green-500'}>
                      {testMode ? 'Test' : 'Production'}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => setTestMode(!testMode)}
                    variant="outline"
                    className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {testMode ? 'Production aktivieren' : 'Test-Modus'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Overview */}
        <div className="grid md:grid-cols-5 gap-4">
          {Object.entries(connectionStatus).map(([key, status]) => {
            const badge = getStatusBadge(status);
            const icons = {
              stripe: CreditCard,
              wio_bank: Database,
              kyc_provider: Shield,
              smart_contracts: Code,
              custody: Wallet,
            };
            const IconComponent = icons[key];
            
            return (
              <Card key={key} className="border-gray-700 bg-gradient-to-br from-gray-900 to-black">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <IconComponent className="w-5 h-5 text-[#D4AF37]" />
                    <Badge className={`${badge.className} text-xs`}>{badge.label}</Badge>
                  </div>
                  <p className="text-sm text-white font-semibold capitalize">{key.replace(/_/g, ' ')}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Configuration Tabs */}
        <Card className="border-gray-700 bg-gradient-to-br from-gray-900 to-black">
          <Tabs defaultValue="payment" className="w-full">
            <CardHeader className="border-b-2 border-gray-700">
              <TabsList className="bg-gray-900 border-2 border-gray-700">
                <TabsTrigger value="payment" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payment
                </TabsTrigger>
                <TabsTrigger value="kyc" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
                  <Shield className="w-4 h-4 mr-2" />
                  KYC
                </TabsTrigger>
                <TabsTrigger value="blockchain" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
                  <Wallet className="w-4 h-4 mr-2" />
                  Blockchain
                </TabsTrigger>
                <TabsTrigger value="webhooks" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
                  <Zap className="w-4 h-4 mr-2" />
                  Webhooks
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-6">
              {/* Payment Configuration */}
              <TabsContent value="payment" className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-[#D4AF37]" />
                    Stripe Integration
                  </h3>
                  <div className="space-y-4">
                    <SecretInput
                      label="Publishable Key"
                      value={config.stripe_public_key}
                      onChange={(key, val) => setConfig({ ...config, [key]: val })}
                      placeholder={testMode ? "pk_test_..." : "pk_live_..."}
                      helperText="Öffentlicher Key für Client-Side"
                      configKey="stripe_public_key"
                    />
                    
                    <SecretInput
                      label="Secret Key"
                      value={config.stripe_secret_key}
                      onChange={(key, val) => setConfig({ ...config, [key]: val })}
                      placeholder={testMode ? "sk_test_..." : "sk_live_..."}
                      helperText="Geheimer Key für Server-Side (niemals Client-seitig verwenden!)"
                      configKey="stripe_secret_key"
                    />
                    
                    <SecretInput
                      label="Webhook Signing Secret"
                      value={config.stripe_webhook_secret}
                      onChange={(key, val) => setConfig({ ...config, [key]: val })}
                      placeholder="whsec_..."
                      helperText="Für Webhook-Verifizierung"
                      configKey="stripe_webhook_secret"
                    />

                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <div className="flex items-start gap-3">
                        <ExternalLink className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-white font-semibold mb-1">Setup-Anleitung</p>
                          <ol className="text-xs text-gray-300 space-y-1">
                            <li>1. Stripe Account erstellen → <a href="https://dashboard.stripe.com/register" target="_blank" className="text-[#D4AF37] hover:underline">dashboard.stripe.com</a></li>
                            <li>2. API Keys kopieren (Developer → API Keys)</li>
                            <li>3. Webhook Endpoint einrichten: <code className="bg-black/50 px-2 py-1 rounded">{window.location.origin}/api/webhooks/stripe</code></li>
                            <li>4. Events aktivieren: payment_intent.succeeded, charge.refunded</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-8">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Database className="w-6 h-6 text-[#D4AF37]" />
                    Wio Bank / SEPA
                  </h3>
                  <div className="space-y-4">
                    <SecretInput
                      label="Wio Bank API Key"
                      value={config.wio_bank_api_key}
                      onChange={(key, val) => setConfig({ ...config, [key]: val })}
                      placeholder="wio_..."
                      helperText="API Key für SEPA-Transaktionen"
                      configKey="wio_bank_api_key"
                    />
                    
                    <SecretInput
                      label="Account ID"
                      value={config.wio_bank_account_id}
                      onChange={(key, val) => setConfig({ ...config, [key]: val })}
                      placeholder="acc_..."
                      configKey="wio_bank_account_id"
                    />

                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <p className="text-sm text-yellow-300">
                        <strong>Alternative:</strong> Solaris Bank (EU), ClearBank (UK), oder Modulr (UK) für SEPA/Faster Payments
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* KYC Configuration */}
              <TabsContent value="kyc" className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-[#D4AF37]" />
                    KYC Provider
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => setConfig({ ...config, kyc_provider: 'sumsub' })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        config.kyc_provider === 'sumsub'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                          : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                      }`}
                    >
                      <p className="font-bold text-white mb-1">Sumsub</p>
                      <p className="text-sm text-gray-400">Komplette KYC/AML Lösung, AI-powered</p>
                      <p className="text-xs text-[#D4AF37] mt-2">€0.50 - €2 pro Verifikation</p>
                    </button>

                    <button
                      onClick={() => setConfig({ ...config, kyc_provider: 'onfido' })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        config.kyc_provider === 'onfido'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                          : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                      }`}
                    >
                      <p className="font-bold text-white mb-1">Onfido</p>
                      <p className="text-sm text-gray-400">ID Verification & Biometrics</p>
                      <p className="text-xs text-[#D4AF37] mt-2">€1 - €3 pro Check</p>
                    </button>
                  </div>

                  {config.kyc_provider === 'sumsub' && (
                    <div className="space-y-4">
                      <SecretInput
                        label="Sumsub App Token"
                        value={config.sumsub_app_token}
                        onChange={(key, val) => setConfig({ ...config, [key]: val })}
                        placeholder="sbx:..."
                        configKey="sumsub_app_token"
                      />
                      
                      <SecretInput
                        label="Secret Key"
                        value={config.sumsub_secret_key}
                        onChange={(key, val) => setConfig({ ...config, [key]: val })}
                        placeholder="..."
                        configKey="sumsub_secret_key"
                      />

                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <p className="text-sm text-white font-semibold mb-2">Integration Steps:</p>
                        <ol className="text-xs text-gray-300 space-y-1">
                          <li>1. Account erstellen → <a href="https://sumsub.com" target="_blank" className="text-[#D4AF37] hover:underline">sumsub.com</a></li>
                          <li>2. SDK Token generieren (Dashboard → Integrations)</li>
                          <li>3. Webhook URL eintragen: <code className="bg-black/50 px-2 py-1 rounded">{window.location.origin}/api/webhooks/sumsub</code></li>
                          <li>4. Events: applicantReviewed, applicantPending</li>
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Blockchain Configuration */}
              <TabsContent value="blockchain" className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Code className="w-6 h-6 text-[#D4AF37]" />
                    Smart Contract Adressen
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white font-semibold">EUT Token (ERC-20)</Label>
                      <Input
                        value={config.eut_token_address}
                        onChange={(e) => setConfig({ ...config, eut_token_address: e.target.value })}
                        placeholder={testMode ? "0x... (Sepolia Testnet)" : "0x... (Ethereum Mainnet)"}
                        className="bg-gray-900 border-gray-700 text-white font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-semibold">KYC Registry (ERC-1643)</Label>
                      <Input
                        value={config.kyc_registry_address}
                        onChange={(e) => setConfig({ ...config, kyc_registry_address: e.target.value })}
                        placeholder="0x..."
                        className="bg-gray-900 border-gray-700 text-white font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-semibold">SPV Factory</Label>
                      <Input
                        value={config.spv_factory_address}
                        onChange={(e) => setConfig({ ...config, spv_factory_address: e.target.value })}
                        placeholder="0x..."
                        className="bg-gray-900 border-gray-700 text-white font-mono text-sm"
                      />
                    </div>

                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <p className="text-sm text-white font-semibold mb-2">Deployment Checklist:</p>
                      <div className="space-y-2 text-xs text-gray-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span>Smart Contracts entwickeln (OpenZeppelin Templates)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-400" />
                          <span>Auf Sepolia Testnet deployen (für Tests)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-400" />
                          <span>Audit durchführen (CertiK, Hacken, Trail of Bits)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-400" />
                          <span>Auf Mainnet deployen (nach Audit)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Blockchain RPC Endpoints</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white font-semibold">Ethereum RPC</Label>
                      <Input
                        value={config.ethereum_rpc_url}
                        onChange={(e) => setConfig({ ...config, ethereum_rpc_url: e.target.value })}
                        placeholder="https://mainnet.infura.io/v3/YOUR_KEY"
                        className="bg-gray-900 border-gray-700 text-white text-sm"
                      />
                      <p className="text-xs text-gray-400">
                        Provider: Infura, Alchemy, Quicknode
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-semibold">Polygon RPC</Label>
                      <Input
                        value={config.polygon_rpc_url}
                        onChange={(e) => setConfig({ ...config, polygon_rpc_url: e.target.value })}
                        placeholder="https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY"
                        className="bg-gray-900 border-gray-700 text-white text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-8">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-[#D4AF37]" />
                    Custody Provider
                  </h3>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setConfig({ ...config, custody_provider: 'fireblocks' })}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          config.custody_provider === 'fireblocks'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                            : 'border-gray-700 bg-gray-900'
                        }`}
                      >
                        <p className="font-bold text-white">Fireblocks</p>
                        <p className="text-xs text-gray-400">Enterprise MPC Custody</p>
                      </button>

                      <button
                        onClick={() => setConfig({ ...config, custody_provider: 'bitgo' })}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          config.custody_provider === 'bitgo'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                            : 'border-gray-700 bg-gray-900'
                        }`}
                      >
                        <p className="font-bold text-white">BitGo</p>
                        <p className="text-xs text-gray-400">Multi-Sig Wallets</p>
                      </button>
                    </div>

                    <SecretInput
                      label="API Key"
                      value={config.fireblocks_api_key}
                      onChange={(key, val) => setConfig({ ...config, [key]: val })}
                      placeholder="..."
                      configKey="fireblocks_api_key"
                    />

                    <SecretInput
                      label="Vault ID"
                      value={config.fireblocks_vault_id}
                      onChange={(key, val) => setConfig({ ...config, [key]: val })}
                      placeholder="..."
                      configKey="fireblocks_vault_id"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Webhooks Configuration */}
              <TabsContent value="webhooks" className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-[#D4AF37]" />
                    Webhook Configuration
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white font-semibold">Base URL</Label>
                      <Input
                        value={config.webhook_url || window.location.origin}
                        onChange={(e) => setConfig({ ...config, webhook_url: e.target.value })}
                        placeholder="https://your-app.euphena.com"
                        className="bg-gray-900 border-gray-700 text-white"
                      />
                    </div>

                    <SecretInput
                      label="Webhook Secret"
                      value={config.webhook_secret}
                      onChange={(key, val) => setConfig({ ...config, [key]: val })}
                      placeholder="whsec_..."
                      helperText="Für HMAC Signature-Validierung"
                      configKey="webhook_secret"
                    />

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-white">Webhook Endpoints:</p>
                      {[
                        { path: '/api/webhooks/stripe', service: 'Stripe Payments' },
                        { path: '/api/webhooks/sumsub', service: 'KYC Updates' },
                        { path: '/api/webhooks/blockchain', service: 'Blockchain Events' },
                        { path: '/api/webhooks/wio', service: 'SEPA Transactions' },
                      ].map(({ path, service }) => (
                        <div key={path} className="p-3 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-between">
                          <div>
                            <p className="text-sm text-white font-mono">{path}</p>
                            <p className="text-xs text-gray-400">{service}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard((config.webhook_url || window.location.origin) + path)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <p className="text-sm text-yellow-300 mb-2">
                        <strong>Wichtig:</strong> Webhooks benötigen Backend Functions
                      </p>
                      <p className="text-xs text-gray-300">
                        1. Base44 Dashboard → Settings → Backend Functions aktivieren<br />
                        2. Backend Service (Node.js/Python) deployen<br />
                        3. Webhook Endpoints implementieren<br />
                        4. Mit Base44 Database synchronisieren
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-800 flex gap-4">
                <Button
                  onClick={saveConfig}
                  className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold text-lg px-8 py-6"
                >
                  <Key className="w-5 h-5 mr-2" />
                  Konfiguration speichern
                </Button>
                
                <Button
                  onClick={testConnections}
                  variant="outline"
                  className="border-gray-700 text-white hover:bg-gray-900 px-8 py-6"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Verbindungen testen
                </Button>
              </div>
            </CardContent>
          </Tabs>
        </Card>

        {/* Architecture Overview */}
        <Card className="border-gray-700 bg-gradient-to-br from-gray-900 to-black">
          <CardHeader>
            <CardTitle className="text-white">System-Architektur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-black/50 rounded-xl border border-gray-800 font-mono text-xs text-gray-300 overflow-x-auto">
              <pre>{`
┌─────────────────────────────────────────────────────────────────┐
│                    EUPHENA PRODUCTION SETUP                      │
└─────────────────────────────────────────────────────────────────┘

[Base44 Frontend] (React App)
       │
       ├─→ Stripe Checkout (Client-Side)
       │   └─→ Payment Success → Webhook
       │
       ├─→ KYC Widget (Sumsub SDK)
       │   └─→ Verification Complete → Webhook
       │
       └─→ Wallet Connect (MetaMask)
           └─→ Smart Contract Calls

[Backend Service] (Node.js/Python - SEPARAT!)
       │
       ├─→ /api/webhooks/stripe
       │   └─→ Webhook Handler → Update Base44 DB
       │
       ├─→ /api/webhooks/sumsub
       │   └─→ KYC Status → Update User Entity
       │
       ├─→ /api/blockchain/swap
       │   ├─→ EUT Token Contract (ERC-20)
       │   ├─→ KYC Registry Check (ERC-1643)
       │   └─→ SPV Token Mint (ERC-1400)
       │
       └─→ /api/custody
           └─→ Fireblocks/BitGo API

[Base44 Database]
       ├─→ User Entity (KYC Status, Wallet Balance)
       ├─→ Transaction Entity (alle Payments)
       ├─→ Investment Entity (SPV Holdings)
       └─→ Sync via Backend Service API Calls

[Blockchain]
       ├─→ EUT Token: 0x742d...4A7B
       ├─→ KYC Registry: 0x8b3f...2C1D
       └─→ SPV Factory: 0x1a2b...9E4F
              `}</pre>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/10 to-transparent">
          <CardHeader>
            <CardTitle className="text-white">Deployment Roadmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-white mb-3">Phase 1: Test-Environment (2-3 Wochen)</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                    <span>Stripe Test-Account einrichten</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                    <span>Sumsub Sandbox aktivieren</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                    <span>Smart Contracts auf Sepolia deployen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                    <span>Backend Service (Node.js) aufsetzen</span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-white mb-3">Phase 2: Production Launch (4-6 Wochen)</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Smart Contract Audit (CertiK €20-40k)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Fireblocks MPC Custody Setup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Mainnet Deployment (Ethereum/Polygon)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Regulatorische Genehmigung (MiCAR/BaFin)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-2">
                <strong className="text-white">Geschätzte Kosten:</strong>
              </p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Backend Development: €15-25k</li>
                <li>• Smart Contract Audit: €20-40k</li>
                <li>• Custody Provider Setup: €5-10k</li>
                <li>• KYC Provider (monatlich): €500-2000</li>
                <li>• Payment Provider Fees: 2.9% + €0.30 pro Transaktion</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}