import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Link as LinkIcon, Shield, Zap, Database, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SmartContractInfo() {
  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Smart Contract Integration
          </h1>
          <p className="text-gray-400">Technische Architektur für tokenisierte SPVs</p>
        </div>

        {/* Current State */}
        <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Shield className="w-8 h-8 text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-2">Aktueller Status: MVP (Off-Chain)</h3>
                <p className="text-gray-300 text-sm">
                  Diese Plattform ist ein <strong>funktionaler Prototyp</strong>, der die SPV-Präsentation 
                  und Investment-Flows zeigt. Die eigentliche Blockchain-Integration erfolgt in Phase 2-3 
                  gemäß Blueprint.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Architecture Overview */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#D4AF37]" />
                Token-Typen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-900/30 border border-[#D4AF37]/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-[#D4AF37] text-black">ERC-20</Badge>
                  <span className="font-semibold text-white">Utility Token (UTK)</span>
                </div>
                <p className="text-sm text-gray-300">
                  Zahlungsmittel auf der Plattform. Standard ERC-20 Token auf Ethereum/Polygon.
                </p>
                <div className="mt-3 p-3 bg-black/50 rounded font-mono text-xs text-gray-400">
                  <p>Contract: 0x742d...4A7B (Ethereum)</p>
                  <p>Symbol: UTK</p>
                  <p>Decimals: 18</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gray-900/30 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-500 text-black">ERC-1400</Badge>
                  <span className="font-semibold text-white">SPV Security Tokens</span>
                </div>
                <p className="text-sm text-gray-300">
                  Regulierte Security Tokens mit KYC-Whitelist, Transfer-Restrictions und Partitionen.
                </p>
                <div className="mt-3 p-3 bg-black/50 rounded font-mono text-xs text-gray-400">
                  <p>Standard: ERC-1400 / ERC-1594</p>
                  <p>Features: Partitions, KYC-Gating</p>
                  <p>Compliance: MiCAR/ADGM konform</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#D4AF37]" />
                Zahlungsfluss
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-black font-bold">1</div>
                  <div>
                    <p className="text-white font-semibold">Investor kauft UTK</p>
                    <p className="text-sm text-gray-400">Fiat → UTK via Payment Gateway</p>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-[#D4AF37] ml-3" />

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-black font-bold">2</div>
                  <div>
                    <p className="text-white font-semibold">UTK → SPV-Token Swap</p>
                    <p className="text-sm text-gray-400">Smart Contract tauscht UTK gegen SPV-Token</p>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-[#D4AF37] ml-3" />

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-black font-bold">3</div>
                  <div>
                    <p className="text-white font-semibold">KYC-Check On-Chain</p>
                    <p className="text-sm text-gray-400">Compliance Registry prüft Investor-Status</p>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-[#D4AF37] ml-3" />

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-black font-bold">4</div>
                  <div>
                    <p className="text-white font-semibold">SPV-Token Transfer</p>
                    <p className="text-sm text-gray-400">Token in Investor-Wallet (Partition: P-LOCK)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Smart Contract Architecture */}
        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-[#D4AF37]" />
              Smart Contract Architektur (Phase 2-3)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-black/50 rounded-xl border border-gray-800 font-mono text-xs text-gray-300 overflow-x-auto">
              <pre>{`
┌─────────────────────────────────────────────────────────────┐
│                     EUPHENA ECOSYSTEM                        │
└─────────────────────────────────────────────────────────────┘

[1] EUT Token (ERC-20)
    ├─ Utility-Token für die Plattform
    ├─ Buyback & Burn Mechanismus
    └─ Staking für Premium Features

[2] KYC Compliance Registry (ERC-1643)
    ├─ Whitelist: investor → (status, jurisdiction, category)
    ├─ Funktion: isWhitelisted(address) → bool
    └─ Update durch: Compliance-Operator (Multi-Sig)

[3] SPV Factory Contract
    ├─ Deployment von neuen ERC-1400 SPV-Tokens
    ├─ Template: SPVSecurityToken.sol
    └─ Governance: DAO-Approval für neue SPVs

[4] Individual SPV Contracts (ERC-1400)
    ├─ Partitionen:
    │   ├─ P-LOCK (gesperrt für 6 Monate)
    │   ├─ P-FREE (handelbar)
    │   └─ P-PREF (bevorrechtigt bei Dividenden)
    ├─ Transfer-Rules:
    │   └─ require(KYCRegistry.isWhitelisted(from))
    │       require(KYCRegistry.isWhitelisted(to))
    ├─ Corporate Actions:
    │   ├─ distribute(partition, amount) → Dividenden
    │   ├─ redeemByPartition() → Rückkauf
    │   └─ controllerTransfer() → Notfall (Board 2-of-3)
    └─ Document Hash: keccak256(whitepaper) on-chain

[5] Treasury & Fee Management
    ├─ Fee Collector: sammelt 0.5% pro Trade
    ├─ Buyback Pool: 20% → EUT burn
    └─ Dividend Pool: 30% → SPV-Holder
              `}</pre>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-gray-900/30 border border-gray-800">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-[#D4AF37]" />
                  Benötigte Integrationen
                </h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ Fireblocks/BitGo (MPC Custody)</li>
                  <li>✓ Chainlink Oracles (NAV-Feeds)</li>
                  <li>✓ Web3.js / Ethers.js SDK</li>
                  <li>✓ The Graph (Event Indexing)</li>
                  <li>✓ OpenZeppelin Contracts</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-gray-900/30 border border-gray-800">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#D4AF37]" />
                  Security Maßnahmen
                </h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ Multi-Sig Wallets (3-of-5)</li>
                  <li>✓ Timelock für kritische Aktionen</li>
                  <li>✓ Pausable Emergency Stop</li>
                  <li>✓ Audit von CertiK/Hacken</li>
                  <li>✓ Bug Bounty Programm</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Steps */}
        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white">Implementierungs-Roadmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <Badge className="bg-green-500 text-black">Phase 1 ✓</Badge>
                <div className="flex-1">
                  <p className="font-semibold text-white mb-1">MVP: UI & Off-Chain Logic</p>
                  <p className="text-sm text-gray-300">
                    Aktueller Stand: Plattform-UI, User-Management, SPV-Präsentation, 
                    Investment-Tracking (Datenbank-basiert)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <Badge className="bg-blue-500 text-black">Phase 2</Badge>
                <div className="flex-1">
                  <p className="font-semibold text-white mb-1">Wallet Integration & EUT Token</p>
                  <ul className="text-sm text-gray-300 space-y-1 mt-2">
                    <li>• MetaMask/WalletConnect Integration</li>
                    <li>• EUT Token Deployment (ERC-20)</li>
                    <li>• Fireblocks MPC Custody Setup</li>
                    <li>• On/Off-Ramp via Payment Gateway</li>
                  </ul>
                  <p className="text-xs text-gray-400 mt-2">Dauer: 6-8 Wochen | Kosten: €40-60k</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <Badge className="bg-purple-500 text-black">Phase 3</Badge>
                <div className="flex-1">
                  <p className="font-semibold text-white mb-1">SPV Tokenisierung (ERC-1400)</p>
                  <ul className="text-sm text-gray-300 space-y-1 mt-2">
                    <li>• KYC Compliance Registry Deployment</li>
                    <li>• SPV Factory Contract</li>
                    <li>• ERC-1400 Templates mit Partitionen</li>
                    <li>• Corporate Actions (Dividenden, Redemption)</li>
                    <li>• Smart Contract Audit</li>
                  </ul>
                  <p className="text-xs text-gray-400 mt-2">Dauer: 10-14 Wochen | Kosten: €80-120k</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                <Badge className="bg-[#D4AF37] text-black">Phase 4</Badge>
                <div className="flex-1">
                  <p className="font-semibold text-white mb-1">Secondary Market & Advanced Features</p>
                  <ul className="text-sm text-gray-300 space-y-1 mt-2">
                    <li>• Orderbook für SPV-Token Trading</li>
                    <li>• Automated Market Maker (AMM)</li>
                    <li>• Staking & Governance</li>
                    <li>• Cross-Chain Bridges</li>
                  </ul>
                  <p className="text-xs text-gray-400 mt-2">Dauer: 12-16 Wochen | Kosten: €100-150k</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Integration */}
        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white">Wie funktioniert die Integration?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-white mb-3">1. Backend-Integration</h4>
              <p className="text-gray-300 text-sm mb-3">
                Base44 unterstützt momentan keine direkte Smart Contract Integration. 
                Für die Blockchain-Anbindung benötigen Sie:
              </p>
              <div className="p-4 bg-black/50 rounded-lg">
                <p className="text-sm text-gray-300 font-semibold mb-2">Optionen:</p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <strong className="text-white">A) Microservice-Architektur:</strong> Separater 
                    "Blockchain Service" (Node.js/Python) mit Web3.js, der mit Base44 über API kommuniziert
                  </li>
                  <li>
                    <strong className="text-white">B) Webhook-Integration:</strong> Smart Contract 
                    Events triggern Webhooks → Base44 Backend aktualisiert Datenbank
                  </li>
                  <li>
                    <strong className="text-white">C) Hybrid-Lösung:</strong> Off-Chain Tracking in Base44, 
                    On-Chain Settlement via separatem Service
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">2. Wallet-Integration im Frontend</h4>
              <div className="p-4 bg-black/50 rounded-lg font-mono text-xs text-gray-300">
                <pre>{`// Beispiel: MetaMask Connection
import { ethers } from 'ethers';

const connectWallet = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  
  // KYC Check via API
  const kycStatus = await fetch('/api/kyc/check', {
    method: 'POST',
    body: JSON.stringify({ address })
  });
  
  return { provider, signer, address };
};

// SPV Token Purchase
const investInSPV = async (spvAddress, utkAmount) => {
  const { signer } = await connectWallet();
  
  // Approve UTK spending
  const utkContract = new ethers.Contract(UTK_ADDRESS, ERC20_ABI, signer);
  await utkContract.approve(spvAddress, utkAmount);
  
  // Purchase SPV tokens
  const spvContract = new ethers.Contract(spvAddress, SPV_ABI, signer);
  const tx = await spvContract.purchase(utkAmount);
  await tx.wait();
};`}</pre>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">3. Event Listening & Synchronisation</h4>
              <div className="p-4 bg-black/50 rounded-lg font-mono text-xs text-gray-300">
                <pre>{`// Backend Service lauscht auf Blockchain Events
contract.on('Transfer', (from, to, amount, event) => {
  // Update Base44 database
  await fetch('/api/sync/transaction', {
    method: 'POST',
    body: JSON.stringify({
      user_address: to,
      spv_id: event.address,
      amount: amount,
      tx_hash: event.transactionHash
    })
  });
});`}</pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/10 to-transparent">
          <CardHeader>
            <CardTitle className="text-white">Nächste Schritte zur Blockchain-Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-[#D4AF37] font-bold">1.</span>
              <div>
                <p className="font-semibold text-white">Backend Functions aktivieren</p>
                <p>In Base44 Dashboard → Settings → Backend Functions aktivieren, um Custom APIs zu bauen</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-[#D4AF37] font-bold">2.</span>
              <div>
                <p className="font-semibold text-white">Smart Contracts entwickeln & deployen</p>
                <p>EUT (ERC-20), KYC Registry, SPV Templates (ERC-1400) auf Ethereum/Polygon Testnet</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-[#D4AF37] font-bold">3.</span>
              <div>
                <p className="font-semibold text-white">Custody-Partner integrieren</p>
                <p>Fireblocks oder BitGo für sichere MPC Wallet-Verwaltung</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-[#D4AF37] font-bold">4.</span>
              <div>
                <p className="font-semibold text-white">Payment Gateway</p>
                <p>Wio Bank (UAE) oder Solaris/ClearBank (EU) für Fiat Ein-/Auszahlungen</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-[#D4AF37] font-bold">5.</span>
              <div>
                <p className="font-semibold text-white">Audit & Compliance</p>
                <p>Smart Contract Audit, Regulatorische Genehmigungen (MiCAR/VARA/ADGM)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Bereit für die Blockchain-Integration?</h3>
            <p className="text-gray-300 mb-6">
              Kontaktieren Sie uns für eine detaillierte technische Beratung und Kosteneinschätzung
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold">
                Beratungsgespräch buchen
              </Button>
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-900">
                Blueprint herunterladen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}