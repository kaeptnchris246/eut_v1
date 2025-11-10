import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Lock, 
  Server, 
  Database, 
  Key, 
  AlertTriangle,
  CheckCircle2,
  Code,
  Zap,
  Eye,
  FileCode,
  Cloud,
  Terminal
} from "lucide-react";

export default function BACKEND_GUIDE() {
  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Server className="w-8 h-8 md:w-10 h-10 text-[#D4AF37]" />
            Backend Architecture & Security
          </h1>
          <p className="text-sm md:text-base text-gray-400">
            Vollständige Architektur-Übersicht für Production-Ready Deployment
          </p>
        </div>

        {/* Current State */}
        <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <AlertTriangle className="w-8 h-8 text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-2 text-lg">Aktueller Status: Frontend-Only MVP</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Diese Plattform läuft derzeit komplett auf <strong>Base44</strong> (Frontend + Database). 
                  Für Production wird ein <strong>separater Backend-Service</strong> benötigt.
                </p>
                <div className="grid md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded bg-black/30">
                    <p className="text-green-400 font-semibold mb-1">✓ Was funktioniert:</p>
                    <ul className="text-gray-300 space-y-1">
                      <li>• UI/UX komplett (React + Tailwind)</li>
                      <li>• Database (Base44 Entities)</li>
                      <li>• User Management & Auth</li>
                      <li>• SPV Management (CRUD)</li>
                      <li>• Investment Tracking</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded bg-black/30">
                    <p className="text-red-400 font-semibold mb-1">✗ Was fehlt für Production:</p>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Payment Processing (Stripe/SEPA)</li>
                      <li>• KYC API Integration</li>
                      <li>• Smart Contract Calls</li>
                      <li>• AI Trading Bot Logic</li>
                      <li>• Webhook Handlers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Architecture */}
        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-[#D4AF37]" />
              Production System-Architektur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-black/50 rounded-xl border border-gray-800 font-mono text-xs text-gray-300 overflow-x-auto">
              <pre>{`
┌────────────────────────────────────────────────────────────────────────────┐
│                        EUPHENA PRODUCTION ARCHITECTURE                      │
└────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ LAYER 1: CLIENT (Browser)                                                │
└─────────────────────────────────────────────────────────────────────────┘
    │
    ├─→ Base44 Frontend (React App)
    │   ├─→ Pages: Dashboard, Marketplace, Portfolio, TradingBot, etc.
    │   ├─→ Components: WalletConnect, KYC, SmartContractInvest
    │   └─→ Direct API Calls: Base44 Entities API (CRUD)
    │
    └─→ External SDKs (Client-Side)
        ├─→ MetaMask / WalletConnect (Web3 Wallet)
        ├─→ Stripe.js (Payment Widget)
        └─→ Sumsub SDK (KYC Widget)

            ↓ HTTPS / WSS
            
┌─────────────────────────────────────────────────────────────────────────┐
│ LAYER 2: BASE44 PLATFORM                                                 │
└─────────────────────────────────────────────────────────────────────────┘
    │
    ├─→ Base44 Auth & User Management
    │   ├─→ JWT-based Authentication
    │   ├─→ Role-Based Access Control (RBAC)
    │   └─→ Session Management
    │
    ├─→ Base44 Database (PostgreSQL)
    │   ├─→ Entities: User, SPV, Investment, Transaction, BotTrade, etc.
    │   ├─→ Row-Level Security (RLS) Rules
    │   └─→ Real-time Subscriptions (WebSockets)
    │
    └─→ Base44 API Gateway
        ├─→ REST Endpoints: /api/entities/{entity_name}
        ├─→ Authentication Middleware
        └─→ Rate Limiting

            ↓ Internal Network / API Calls
            
┌─────────────────────────────────────────────────────────────────────────┐
│ LAYER 3: CUSTOM BACKEND SERVICE (Node.js/Python) - SEPARAT!             │
└─────────────────────────────────────────────────────────────────────────┘
    │
    ├─→ Payment Gateway Integration
    │   ├─→ Stripe API (Card Payments)
    │   ├─→ Wio Bank / Solaris API (SEPA)
    │   ├─→ Webhook Handlers:
    │   │   ├─→ POST /webhooks/stripe → payment_intent.succeeded
    │   │   └─→ POST /webhooks/wio → sepa_transfer_completed
    │   └─→ Actions:
    │       ├─→ Verify HMAC Signature
    │       ├─→ Update User wallet_balance via Base44 API
    │       └─→ Create Transaction entity
    │
    ├─→ KYC Provider Integration
    │   ├─→ Sumsub API (or Onfido)
    │   ├─→ Webhook Handler:
    │   │   └─→ POST /webhooks/sumsub → applicantReviewed
    │   └─→ Actions:
    │       ├─→ Update User kyc_status
    │       ├─→ Update KYC Compliance Registry (On-Chain)
    │       └─→ Trigger Email notification
    │
    ├─→ Blockchain Service (Web3)
    │   ├─→ EUT Token Contract (ERC-20)
    │   │   └─→ Functions: transfer(), approve(), balanceOf()
    │   ├─→ KYC Registry Contract (ERC-1643)
    │   │   └─→ Functions: isWhitelisted(address), addToWhitelist()
    │   ├─→ SPV Factory & Individual SPV Contracts (ERC-1400)
    │   │   └─→ Functions: purchase(), redeem(), distributeD dividends()
    │   ├─→ Event Listeners:
    │   │   ├─→ Transfer event → Sync Investment entity
    │   │   └─→ DividendDistributed → Create Transaction
    │   └─→ MPC Custody (Fireblocks/BitGo):
    │       └─→ Secure Key Management for Platform Wallet
    │
    ├─→ AI Trading Bot Engine
    │   ├─→ Market Data Ingestion:
    │   │   ├─→ CoinGecko / Binance API (Price Data)
    │   │   ├─→ News API (Sentiment Analysis)
    │   │   └─→ Chainlink Oracles (On-Chain Data)
    │   ├─→ Reinforcement Learning Model:
    │   │   ├─→ TensorFlow.js / PyTorch
    │   │   ├─→ Q-Learning / PPO Algorithm
    │   │   └─→ Model Training Pipeline
    │   ├─→ Strategy Execution:
    │   │   ├─→ Technical Indicators (RSI, MACD, Bollinger Bands)
    │   │   ├─→ Risk Management (Stop-Loss, Take-Profit)
    │   │   └─→ Position Sizing
    │   └─→ Trade Execution → Update BotTrade entity
    │
    ├─→ Scheduled Jobs (Cron / Queue)
    │   ├─→ Daily: Update SPV NAV (Net Asset Value)
    │   ├─→ Hourly: AI Bot Market Analysis
    │   ├─→ Weekly: Dividend Distribution
    │   └─→ Monthly: Performance Reports
    │
    └─→ Security & Monitoring
        ├─→ Request Validation & Sanitization
        ├─→ Rate Limiting (per User / IP)
        ├─→ Fraud Detection (ML-based)
        ├─→ Logging: Winston / Elasticsearch
        └─→ Monitoring: Prometheus + Grafana

            ↓ API Calls / Webhooks
            
┌─────────────────────────────────────────────────────────────────────────┐
│ LAYER 4: EXTERNAL SERVICES                                               │
└─────────────────────────────────────────────────────────────────────────┘
    │
    ├─→ Payment Providers
    │   ├─→ Stripe (Cards, SEPA, Wallets)
    │   └─→ Wio Bank / Solaris (SEPA Direct)
    │
    ├─→ KYC/AML Providers
    │   ├─→ Sumsub (Automated KYC + Liveness)
    │   └─→ Onfido (ID Verification)
    │
    ├─→ Blockchain Infrastructure
    │   ├─→ Infura / Alchemy (Ethereum RPC)
    │   ├─→ The Graph (Event Indexing)
    │   └─→ Chainlink (Oracle Network)
    │
    ├─→ Custody Providers
    │   ├─→ Fireblocks (MPC Wallets)
    │   └─→ BitGo (Multi-Sig Wallets)
    │
    ├─→ Market Data
    │   ├─→ CoinGecko API (Crypto Prices)
    │   ├─→ Binance API (Trading Data)
    │   └─→ News API (Sentiment Data)
    │
    └─→ Email / SMS
        ├─→ SendGrid (Transactional Emails)
        └─→ Twilio (2FA SMS)

            ↓ Storage & CDN
            
┌─────────────────────────────────────────────────────────────────────────┐
│ LAYER 5: INFRASTRUCTURE                                                  │
└─────────────────────────────────────────────────────────────────────────┘
    │
    ├─→ Cloud Provider (AWS / GCP / Azure)
    │   ├─→ Compute: EC2 / Cloud Run / App Service
    │   ├─→ Database: RDS PostgreSQL (Base44 Backend)
    │   ├─→ Cache: Redis (Sessions, API Cache)
    │   ├─→ Queue: RabbitMQ / AWS SQS (Job Queue)
    │   └─→ Storage: S3 (KYC Documents, Whitepapers)
    │
    ├─→ CDN: CloudFlare (Static Assets, DDoS Protection)
    │
    └─→ DevOps
        ├─→ CI/CD: GitHub Actions / GitLab CI
        ├─→ Container: Docker + Kubernetes
        └─→ Secrets: Vault / AWS Secrets Manager
              `}</pre>
            </div>
          </CardContent>
        </Card>

        {/* Security Architecture */}
        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#D4AF37]" />
              Security Architecture (Defense in Depth)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Layer 1: Network Security */}
            <div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Badge className="bg-red-500 text-white">Layer 1</Badge>
                Network Security
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-red-400" />
                    DDoS Protection
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• CloudFlare Pro (Layer 3/4/7 Protection)</li>
                    <li>• Rate Limiting: 100 req/min per IP</li>
                    <li>• Geo-Blocking für Sanctioned Countries</li>
                    <li>• WAF Rules (SQL Injection, XSS Prevention)</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-red-400" />
                    TLS/SSL
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• TLS 1.3 Only (No TLS 1.0/1.1)</li>
                    <li>• Certificate Pinning (Mobile Apps)</li>
                    <li>• HSTS Header (max-age=31536000)</li>
                    <li>• Let's Encrypt / CloudFlare SSL</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Layer 2: Application Security */}
            <div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Badge className="bg-orange-500 text-white">Layer 2</Badge>
                Application Security
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Key className="w-4 h-4 text-orange-400" />
                    Authentication & Authorization
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                    <div>
                      <p className="font-semibold text-white mb-1">Frontend (Base44):</p>
                      <ul className="space-y-1">
                        <li>• JWT-based Auth (httpOnly Cookies)</li>
                        <li>• Role-Based Access Control (admin/user)</li>
                        <li>• Session Timeout: 30 min inactivity</li>
                        <li>• 2FA (TOTP via Google Authenticator)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-white mb-1">Backend API:</p>
                      <ul className="space-y-1">
                        <li>• API Key Authentication (Server-to-Server)</li>
                        <li>• OAuth 2.0 (für Third-Party Apps)</li>
                        <li>• Scoped Permissions (read/write)</li>
                        <li>• Rate Limiting per API Key</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-orange-400" />
                    Input Validation & Sanitization
                  </h4>
                  <div className="grid md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-white mb-1">Frontend:</p>
                      <ul className="text-gray-300 space-y-1">
                        <li>• Zod Schema Validation</li>
                        <li>• XSS Prevention (DOMPurify)</li>
                        <li>• CSRF Tokens</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-white mb-1">Backend:</p>
                      <ul className="text-gray-300 space-y-1">
                        <li>• Joi / Yup Validation</li>
                        <li>• SQL Injection Prevention (Parameterized Queries)</li>
                        <li>• NoSQL Injection Prevention</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-white mb-1">Database:</p>
                      <ul className="text-gray-300 space-y-1">
                        <li>• Row-Level Security (RLS)</li>
                        <li>• Stored Procedures (no direct table access)</li>
                        <li>• Read-Only Replicas</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Layer 3: Data Security */}
            <div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Badge className="bg-yellow-500 text-black">Layer 3</Badge>
                Data Security & Privacy
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-yellow-400" />
                    Encryption
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li><strong>At Rest:</strong> AES-256 (Database + S3)</li>
                    <li><strong>In Transit:</strong> TLS 1.3</li>
                    <li><strong>KYC Documents:</strong> Client-Side Encryption + Server-Side Encryption</li>
                    <li><strong>API Keys/Secrets:</strong> Vault / AWS Secrets Manager</li>
                    <li><strong>Passwords:</strong> Argon2id (not bcrypt!)</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-yellow-400" />
                    Privacy & Compliance
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• <strong>DSGVO:</strong> Right to Deletion, Data Export</li>
                    <li>• <strong>KYC Data Retention:</strong> 5 Jahre (MiCAR)</li>
                    <li>• <strong>PII Minimization:</strong> Nur notwendige Daten</li>
                    <li>• <strong>Anonymization:</strong> Analytics ohne PII</li>
                    <li>• <strong>Data Residency:</strong> EU Servers (DSGVO)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Layer 4: Smart Contract Security */}
            <div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Badge className="bg-green-500 text-black">Layer 4</Badge>
                Smart Contract Security
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <h4 className="font-semibold text-white mb-2">Audit & Testing</h4>
                  <div className="grid md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-white mb-1">Pre-Deployment:</p>
                      <ul className="text-gray-300 space-y-1">
                        <li>• Unit Tests (100% Coverage)</li>
                        <li>• Integration Tests</li>
                        <li>• Fuzzing (Echidna)</li>
                        <li>• Static Analysis (Slither)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-white mb-1">Professional Audit:</p>
                      <ul className="text-gray-300 space-y-1">
                        <li>• CertiK (€30-50k)</li>
                        <li>• Hacken (€20-40k)</li>
                        <li>• Trail of Bits (€40-80k)</li>
                        <li>• OpenZeppelin (€50-100k)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-white mb-1">Post-Deployment:</p>
                      <ul className="text-gray-300 space-y-1">
                        <li>• Bug Bounty (Immunefi)</li>
                        <li>• Monitoring (Forta Network)</li>
                        <li>• Upgradeable Proxy Pattern</li>
                        <li>• Timelocks (48h delay)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <h4 className="font-semibold text-white mb-2">Key Management (MPC Custody)</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                    <div>
                      <p className="font-semibold text-white mb-1">Fireblocks Setup:</p>
                      <ul className="space-y-1">
                        <li>• MPC Wallet (No Single Point of Failure)</li>
                        <li>• Multi-Approval Policy (3-of-5 für große Transfers)</li>
                        <li>• Automated Risk Scoring</li>
                        <li>• Travel Rule Compliance</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-white mb-1">Alternative: BitGo:</p>
                      <ul className="space-y-1">
                        <li>• Multi-Sig Wallets (2-of-3, 3-of-5)</li>
                        <li>• Hardware Security Modules (HSM)</li>
                        <li>• Insurance (bis $100M)</li>
                        <li>• Regulated Custody (Trust Company)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Layer 5: Monitoring & Incident Response */}
            <div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Badge className="bg-blue-500 text-white">Layer 5</Badge>
                Monitoring & Incident Response
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    Real-Time Monitoring
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• <strong>Application:</strong> Sentry (Error Tracking)</li>
                    <li>• <strong>Infrastructure:</strong> Prometheus + Grafana</li>
                    <li>• <strong>Logs:</strong> ELK Stack (Elasticsearch, Logstash, Kibana)</li>
                    <li>• <strong>Blockchain:</strong> Forta Network (Threat Detection)</li>
                    <li>• <strong>Alerts:</strong> PagerDuty (24/7 On-Call)</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-blue-400" />
                    Incident Response Plan
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• <strong>Severity Levels:</strong> Critical (15min), High (1h), Medium (4h), Low (24h)</li>
                    <li>• <strong>Emergency Pause:</strong> Circuit Breaker in Smart Contracts</li>
                    <li>• <strong>Rollback Strategy:</strong> Database Backups (every 6h)</li>
                    <li>• <strong>Communication:</strong> Status Page (status.euphena.com)</li>
                    <li>• <strong>Post-Mortem:</strong> Root Cause Analysis + Fix</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backend Implementation Guide */}
        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-[#D4AF37]" />
              Backend Service Implementation Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-black/50 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Tech Stack Empfehlung</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Option A: Node.js (TypeScript)</h4>
                  <div className="p-3 rounded bg-gray-900">
                    <p className="text-sm text-gray-300 mb-2">Vorteile:</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Gleiche Sprache wie Frontend (TypeScript)</li>
                      <li>• Große Blockchain-Bibliotheken (ethers.js, web3.js)</li>
                      <li>• Performance bei I/O-intensiven Tasks</li>
                      <li>• Einfache Integration mit Base44</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded bg-gray-900">
                    <p className="text-sm text-gray-300 mb-2">Stack:</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Framework: NestJS (Enterprise-Grade)</li>
                      <li>• ORM: Prisma</li>
                      <li>• Queue: Bull (Redis-based)</li>
                      <li>• Testing: Jest + Supertest</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Option B: Python</h4>
                  <div className="p-3 rounded bg-gray-900">
                    <p className="text-sm text-gray-300 mb-2">Vorteile:</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Beste ML/AI Bibliotheken (TensorFlow, PyTorch)</li>
                      <li>• Ideal für Trading Bot & Data Science</li>
                      <li>• Web3.py für Blockchain</li>
                      <li>• Große Developer Community</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded bg-gray-900">
                    <p className="text-sm text-gray-300 mb-2">Stack:</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Framework: FastAPI (Async, Type-Safe)</li>
                      <li>• ORM: SQLAlchemy</li>
                      <li>• Queue: Celery (Redis/RabbitMQ)</li>
                      <li>• Testing: Pytest</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Examples */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Code-Beispiele</h3>
              
              {/* Webhook Handler */}
              <div>
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#D4AF37]" />
                  1. Stripe Webhook Handler (Node.js)
                </h4>
                <div className="p-4 bg-black/50 rounded-lg border border-gray-800 font-mono text-xs text-gray-300 overflow-x-auto">
                  <pre>{`// backend/src/webhooks/stripe.controller.ts
import { Controller, Post, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { Base44Service } from '../services/base44.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(private base44Service: Base44Service) {}

  @Post()
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>
  ) {
    let event: Stripe.Event;

    try {
      // 1. Verify webhook signature (WICHTIG!)
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return { error: 'Invalid signature' };
    }

    // 2. Handle event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailed(failedPayment);
        break;

      default:
        console.log(\`Unhandled event type: \${event.type}\`);
    }

    return { received: true };
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const userId = paymentIntent.metadata.user_email;
    const amount = paymentIntent.amount / 100; // cents to EUT

    try {
      // 3. Update User Balance in Base44 Database
      await this.base44Service.updateUserBalance(userId, amount);

      // 4. Create Transaction Record
      await this.base44Service.createTransaction({
        user_email: userId,
        type: 'token_kauf',
        amount: amount,
        status: 'erfolgreich',
        description: \`EUT Kauf via Stripe (\${paymentIntent.id})\`
      });

      // 5. Send Confirmation Email
      await this.sendEmail(userId, 'payment_success', { amount });

    } catch (error) {
      console.error('Error processing payment:', error);
      // Alert admin via PagerDuty
    }
  }
}`}</pre>
                </div>
              </div>

              {/* Smart Contract Integration */}
              <div>
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#D4AF37]" />
                  2. Smart Contract Integration (ethers.js)
                </h4>
                <div className="p-4 bg-black/50 rounded-lg border border-gray-800 font-mono text-xs text-gray-300 overflow-x-auto">
                  <pre>{`// backend/src/services/blockchain.service.ts
import { ethers } from 'ethers';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlockchainService {
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private eutContract: ethers.Contract;
  private kycRegistryContract: ethers.Contract;

  constructor() {
    // 1. Connect to Ethereum Network
    this.provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    
    // 2. Load Platform Wallet (from MPC Custody or ENV)
    this.wallet = new ethers.Wallet(process.env.PLATFORM_PRIVATE_KEY, this.provider);

    // 3. Load Contract Instances
    this.eutContract = new ethers.Contract(
      process.env.EUT_TOKEN_ADDRESS,
      EUT_ABI,
      this.wallet
    );

    this.kycRegistryContract = new ethers.Contract(
      process.env.KYC_REGISTRY_ADDRESS,
      KYC_REGISTRY_ABI,
      this.wallet
    );
  }

  // Transfer EUT to User (after Fiat Purchase)
  async transferEUT(userAddress: string, amount: number) {
    const amountWei = ethers.parseUnits(amount.toString(), 18);

    try {
      const tx = await this.eutContract.transfer(userAddress, amountWei);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Transfer failed:', error);
      throw error;
    }
  }

  // Add User to KYC Whitelist (after KYC Verification)
  async addToKYCWhitelist(userAddress: string) {
    try {
      const tx = await this.kycRegistryContract.addToWhitelist(userAddress);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('KYC whitelist update failed:', error);
      throw error;
    }
  }

  // Purchase SPV Tokens (User initiated via Frontend)
  async purchaseSPVToken(
    spvContractAddress: string,
    userWalletAddress: string,
    eutAmount: number
  ) {
    const amountWei = ethers.parseUnits(eutAmount.toString(), 18);

    // 1. Check KYC Status
    const isWhitelisted = await this.kycRegistryContract.isWhitelisted(userWalletAddress);
    if (!isWhitelisted) {
      throw new Error('User not KYC verified');
    }

    // 2. User must approve EUT spending first (done in Frontend via MetaMask)
    // 3. Execute Purchase via SPV Contract
    const spvContract = new ethers.Contract(
      spvContractAddress,
      SPV_ABI,
      this.wallet
    );

    const tx = await spvContract.purchase(amountWei, userWalletAddress);
    await tx.wait();

    return tx.hash;
  }

  // Listen to Blockchain Events (runs in background)
  async listenToEvents() {
    // Listen to EUT Transfer Events
    this.eutContract.on('Transfer', async (from, to, amount, event) => {
      console.log(\`Transfer: \${from} → \${to}: \${ethers.formatUnits(amount, 18)} EUT\`);
      
      // Update Base44 Database
      await this.syncTransferToDatabase(from, to, amount, event.transactionHash);
    });

    // Listen to SPV Purchase Events
    // ... similar logic for SPV contracts
  }
}`}</pre>
                </div>
              </div>

              {/* AI Trading Bot */}
              <div>
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#D4AF37]" />
                  3. AI Trading Bot (Python/TensorFlow)
                </h4>
                <div className="p-4 bg-black/50 rounded-lg border border-gray-800 font-mono text-xs text-gray-300 overflow-x-auto">
                  <pre>{`# backend/ai_trading_bot/trading_agent.py
import tensorflow as tf
import numpy as np
from typing import List, Dict
import requests

class TradingAgent:
    def __init__(self, strategy: str, risk_params: Dict):
        self.strategy = strategy
        self.risk_params = risk_params
        self.model = self.load_model()  # Pre-trained RL Model

    def load_model(self):
        """Load pre-trained Reinforcement Learning model"""
        # For Conservative: Low-risk Q-Learning Model
        # For Aggressive: High-reward PPO Model
        model_path = f"models/{self.strategy}_model.h5"
        return tf.keras.models.load_model(model_path)

    async def analyze_market(self, spv_id: str) -> Dict:
        """Analyze current market conditions"""
        # 1. Fetch Market Data
        price_data = await self.fetch_price_data(spv_id)
        sentiment_data = await self.fetch_sentiment_data(spv_id)
        
        # 2. Calculate Technical Indicators
        rsi = self.calculate_rsi(price_data)
        macd = self.calculate_macd(price_data)
        volatility = self.calculate_volatility(price_data)

        # 3. Get AI Prediction
        state = np.array([rsi, macd, volatility, sentiment_data['score']])
        action_probs = self.model.predict(state.reshape(1, -1))

        # 4. Determine Action (buy/sell/hold)
        action = np.argmax(action_probs)  # 0=hold, 1=buy, 2=sell
        confidence = np.max(action_probs)

        return {
            'action': ['hold', 'buy', 'sell'][action],
            'confidence': float(confidence),
            'indicators': {
                'rsi': rsi,
                'macd': macd,
                'volatility': volatility,
                'sentiment': sentiment_data['score']
            }
        }

    async def execute_trade(self, user_email: str, spv_id: str, action: str, amount: float):
        """Execute trade and log to database"""
        if action == 'buy':
            # 1. Check Budget
            user_config = await self.get_user_config(user_email)
            if amount > user_config['budget']:
                return {'error': 'Insufficient budget'}

            # 2. Execute Buy Order (via Base44 API)
            result = await self.create_investment(user_email, spv_id, amount)

            # 3. Log Trade
            await self.log_trade({
                'user_email': user_email,
                'spv_id': spv_id,
                'trade_type': 'buy',
                'amount': amount,
                'strategy': self.strategy,
                'ai_confidence': result['confidence'],
                'status': 'open'
            })

        elif action == 'sell':
            # Similar logic for sell
            pass

    def calculate_rsi(self, prices: List[float], period: int = 14) -> float:
        """Calculate Relative Strength Index"""
        deltas = np.diff(prices)
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)
        
        avg_gain = np.mean(gains[-period:])
        avg_loss = np.mean(losses[-period:])
        
        rs = avg_gain / avg_loss if avg_loss != 0 else 100
        rsi = 100 - (100 / (1 + rs))
        return rsi

    async def optimize_parameters(self):
        """Self-optimization after N trades"""
        # 1. Fetch recent trade history
        trades = await self.get_recent_trades()
        
        # 2. Calculate performance metrics
        win_rate = len([t for t in trades if t['profit_loss'] > 0]) / len(trades)
        
        # 3. Adjust parameters based on performance
        if win_rate < 0.5:
            # Decrease position size
            self.risk_params['max_position_size_percentage'] *= 0.9
        else:
            # Increase position size
            self.risk_params['max_position_size_percentage'] *= 1.05

        # 4. Update in database
        await self.save_config_update()
`}</pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deployment Roadmap */}
        <Card className="border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/10 to-transparent">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#D4AF37]" />
              Production Deployment Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {[
                {
                  phase: 'Phase 1: Foundation',
                  duration: '2-3 Wochen',
                  status: 'done',
                  tasks: [
                    '✓ Frontend UI komplett (Base44)',
                    '✓ Database Schema (Entities)',
                    '✓ User Management & Auth',
                    '✓ SPV Präsentation & CRUD'
                  ]
                },
                {
                  phase: 'Phase 2: Backend Service Setup',
                  duration: '3-4 Wochen',
                  status: 'next',
                  tasks: [
                    'NestJS/FastAPI Backend aufsetzen',
                    'Payment Integration (Stripe + SEPA)',
                    'KYC Integration (Sumsub)',
                    'Webhook Handlers implementieren',
                    'Base44 API Connector'
                  ]
                },
                {
                  phase: 'Phase 3: Blockchain Integration',
                  duration: '4-6 Wochen',
                  status: 'future',
                  tasks: [
                    'Smart Contracts entwickeln (EUT, KYC, SPV)',
                    'Testnet Deployment (Sepolia)',
                    'Web3 Service im Backend',
                    'Event Listeners & Sync',
                    'Fireblocks MPC Setup'
                  ]
                },
                {
                  phase: 'Phase 4: AI Trading Bot',
                  duration: '4-6 Wochen',
                  status: 'future',
                  tasks: [
                    'RL Model Training (TensorFlow/PyTorch)',
                    'Market Data Ingestion',
                    'Strategy Engine',
                    'Backtesting System',
                    'Self-Optimization Logic'
                  ]
                },
                {
                  phase: 'Phase 5: Security & Audit',
                  duration: '6-8 Wochen',
                  status: 'future',
                  tasks: [
                    'Smart Contract Audit (CertiK/Hacken)',
                    'Penetration Testing',
                    'Security Monitoring Setup',
                    'Compliance Check (MiCAR/BaFin)',
                    'Bug Bounty Program'
                  ]
                },
                {
                  phase: 'Phase 6: Production Launch',
                  duration: '2-3 Wochen',
                  status: 'future',
                  tasks: [
                    'Mainnet Deployment (Ethereum/Polygon)',
                    'Production Infrastructure (AWS/GCP)',
                    'CI/CD Pipeline',
                    'Monitoring & Alerts',
                    'Launch Marketing'
                  ]
                }
              ].map((phase, idx) => (
                <div key={idx} className={`p-6 rounded-xl border-2 ${
                  phase.status === 'done' ? 'border-green-500/30 bg-green-500/10' :
                  phase.status === 'next' ? 'border-[#D4AF37]/30 bg-[#D4AF37]/10' :
                  'border-gray-700 bg-gray-900/50'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-white">{phase.phase}</h3>
                    <div className="flex items-center gap-3">
                      <Badge className={`${
                        phase.status === 'done' ? 'bg-green-500 text-white' :
                        phase.status === 'next' ? 'bg-[#D4AF37] text-black' :
                        'bg-gray-500 text-white'
                      } font-bold`}>
                        {phase.status === 'done' ? '✓ Fertig' : phase.status === 'next' ? '→ Aktuell' : 'Geplant'}
                      </Badge>
                      <span className="text-sm text-gray-400">{phase.duration}</span>
                    </div>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {phase.tasks.map((task, taskIdx) => (
                      <li key={taskIdx} className="flex items-start gap-2">
                        {phase.status === 'done' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-xl bg-black/50 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Geschätzte Gesamtkosten</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-white mb-2">Entwicklung:</p>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Backend Development: €30-50k</li>
                    <li>• Smart Contract Development: €40-60k</li>
                    <li>• AI Trading Bot: €30-50k</li>
                    <li>• Testing & QA: €20-30k</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-white mb-2">Sicherheit & Infrastruktur:</p>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Smart Contract Audit: €30-60k</li>
                    <li>• Penetration Testing: €10-20k</li>
                    <li>• Infrastructure (jährlich): €15-30k</li>
                    <li>• Compliance/Legal: €20-40k</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-2xl font-bold text-[#D4AF37]">
                  Gesamt: €195k - €340k
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  + Laufende Kosten: €5-10k/Monat (Server, APIs, Custody)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}