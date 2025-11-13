# EUT v1 – European Unity Trust MVP

The EUT platform delivers an end-to-end workflow for investors and administrators to manage European Unity Trust funds. This MVP pairs a Vite + React frontend with a secure Express/TypeScript API and a Postgres database. Core features include authentication, fund discovery, commitment management, transaction tracking, and an administrative interface for launching new funds.

## Architecture at a Glance

- **Frontend:** Vite, React 18, Tailwind CSS, shadcn/ui components, Zustand (auth store), custom wallet context + ethers.js for token interactions.
- **Backend API:** Node.js 20, Express, TypeScript, Zod validation, JWT auth, Swagger docs, Postgres (via `pg`).
- **Database:** Postgres schema aligned with Supabase (users, funds, commitments, transactions, wallets). Seeds include demo admin/investor accounts and the GREENWAVE fund.
- **Infrastructure:** Dockerfiles for API & web, Docker Compose for local orchestration, GitHub Actions CI (builds API + frontend).

## Quickstart

### Prerequisites

- Node.js 20+
- npm 10+
- Docker & Docker Compose (for containerized workflow)

### Local development (API + Web)

```bash
# install dependencies
npm install

# install API dependencies
cd api
npm install

# start API (port 8080)
npm run dev

# in a new terminal: start frontend (port 5173)
cd ..
npm run dev
```

The Vite dev server proxies requests to the API using the base URL configured in `.env` (`VITE_API_BASE_URL`).

### Local development with Docker (recommended)

```bash
cp .env.example .env
# populate JWT_SECRET and adjust database credentials if required
docker compose up -d --build
```

Services:

- Web: http://localhost:3000
- API health: http://localhost:8080/health
- API docs (Swagger): http://localhost:8080/docs
- Postgres: localhost:5432 (username/password/database: `eut`)

### Demo credentials

- **Admin:** `admin@eut.local` / `admin123`
- **Investor:** `investor@eut.local` / `invest123`

Both accounts are created by `db/seed.sql` during the first database boot.

## Environment configuration

`.env.example` documents the required variables:

| Variable | Description |
| --- | --- |
| `PORT` | API port (default 8080) |
| `DATABASE_URL` | Postgres connection string used by the API |
| `JWT_SECRET` | Secret for signing JWTs (use a long random string) |
| `CORS_ORIGIN` | Comma separated list of allowed origins for CORS |
| `SUPABASE_*` | Placeholders for future Supabase integration |
| `VITE_API_BASE_URL` | Base URL for frontend API calls |
| `VITE_CHAIN_ID` | Primary EVM chain ID for wallet connections |
| `VITE_CHAIN_NAME` / `VITE_CHAIN_SYMBOL` | Optional overrides for the primary chain |
| `VITE_ADDITIONAL_CHAINS` | Optional semicolon-separated list of additional chains (`<id>:<name>:<symbol>:<rpcUrl>`) |
| `VITE_RPC_URL` | HTTPS RPC endpoint used for read operations |
| `VITE_TOKEN_ADDRESS` | EUT utility token contract address |
| `VITE_TOKEN_SYMBOL` / `VITE_TOKEN_NAME` | Presentation metadata for the EUT token |
| `VITE_TOKEN_DECIMALS` | Utility token decimals (default 18) |
| `VITE_SWAP_POOL_ADDRESS` / `SWAP_POOL_ADDRESS` | Address of the on-chain swap pool contract |
| `VITE_SWAP_POOL_FEE_BPS` / `SWAP_POOL_FEE_BPS` | Fee in basis points applied to the EUT side of swaps |
| `VITE_SPV_TOKEN_IDENTIFIERS` | Comma separated list of SPV identifiers (e.g. `GREENFUND,BLUEFUND`) |
| `VITE_SPV_TOKEN_ADDRESS_<ID>` | Contract address of the SPV security token |
| `VITE_SPV_TOKEN_SYMBOL_<ID>` / `VITE_SPV_TOKEN_NAME_<ID>` | Presentation metadata for each SPV token |
| `VITE_SPV_TOKEN_DECIMALS_<ID>` | Decimals for each SPV token (defaults to 18 when omitted) |
| `VITE_SPV_TOKEN_RATE_<ID>` | Fixed-point (1e18) exchange rate relative to EUT used for price hints |
| `VITE_SPV_TOKEN_CHAIN_<ID>` | Optional chain ID override when the SPV token lives on another network |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect v2 project ID (leave empty to disable) |
| `SWAP_POOL_ADDRESS` | Backend-facing address of the swap pool contract |
| `SECURITY_TOKEN_WHITELIST_<ID>` | Optional comma separated list of wallet addresses allowed to trade the SPV token |

When onboarding a new SPV security token:

1. Pick a short identifier (letters/numbers) and add it to `VITE_SPV_TOKEN_IDENTIFIERS`.
2. Provide the address, symbol, display name, decimals, indicative exchange rate (scaled by 1e18), and optional chain ID via
   the `VITE_SPV_TOKEN_*_<ID>` variables.
3. Include the swap pool address in both `VITE_SWAP_POOL_ADDRESS` (frontend) and `SWAP_POOL_ADDRESS` (backend) so the UI and API
   operate on the same contract instance.
4. Append any additional networks referenced by the SPV token to `VITE_ADDITIONAL_CHAINS` so wallet users can switch easily.
5. (Optional) Maintain an allowlist of authorised wallets with `SECURITY_TOKEN_WHITELIST_<ID>`; addresses must be comma separated
   and will be enforced by the API swap endpoint.

> ℹ️ The DApp lazily loads `ethers`, WalletConnect, and Coinbase Wallet SDKs from a CDN at runtime. Ensure outbound HTTPS access is
> available in environments where wallet connectivity is required.

## API surface

All endpoints require a Bearer JWT unless otherwise noted. Detailed schemas are available via Swagger at `/docs`.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/signup` | Create investor user (email + password) |
| POST | `/auth/login` | Login and receive JWT |
| GET | `/auth/me` | Current user profile |
| GET | `/funds` | List funds |
| POST | `/funds` | Create fund (admin only) |
| GET | `/funds/:id` | Fund details |
| POST | `/commitments` | Reserve a commitment |
| GET | `/commitments/me` | List user commitments |
| PATCH | `/commitments/:id/confirm` | Confirm reserved commitment |
| PATCH | `/commitments/:id/cancel` | Cancel reserved commitment |
| GET | `/transactions/me` | List user transactions |
| GET | `/wallets/me` | List wallets |
| POST | `/wallets` | Register wallet metadata |
| GET | `/tokens` | List configured utility and security tokens |
| POST | `/swap` | Validate and stage a token swap transaction |
| GET | `/health` | Health probe |
| GET | `/docs` | Swagger UI |

## Directory structure

```
eut_v1/
├── api/                      # Express + TypeScript API
│   ├── src/config/           # Env & security configuration
│   ├── src/controllers/      # Route controllers
│   ├── src/docs/             # OpenAPI document
│   ├── src/middlewares/      # Auth + error handling
│   ├── src/routes/           # Express routers
│   └── src/services/         # Database services
├── db/                       # Database schema & seeds
├── docs/                     # Operations & deployment guides
├── contracts/                # Hardhat project (SwapPool.sol + tests)
├── src/                      # React frontend
│   ├── components/           # Layout, wallet connector, table, protected routes, ui
│   ├── contracts/            # On-chain ABI files
│   ├── hooks/                # Wallet + token hooks
│   ├── pages/                # Login, Dashboard, Funds, FundDetail, Swap, AdminFunds
│   ├── providers/            # Wallet provider configuration
│   ├── services/             # API client, token registry, and smart-contract helpers
│   ├── store/                # Zustand auth store
│   └── utils/                # Shared helpers (e.g., wallet formatting)
├── Dockerfile.api            # Production API image
├── Dockerfile.web            # Production web image
├── docker-compose.yml        # Dev orchestration (db + api + web)
└── .github/workflows/ci.yml  # CI pipeline
```

## Quality & CI

- `npm run build` validates the frontend build.
- `cd api && npm run build` compiles the TypeScript API.
- GitHub Actions (`.github/workflows/ci.yml`) mirrors these steps on every push/PR.
- Use the guides in `docs/OPERATIONS.md` and `docs/DEPLOY_HETZNER.md` for deeper operational procedures, deployments, backups, and troubleshooting.

## Roadmap / Next Steps

1. **Auth hardening:** Swap local JWT auth with Supabase Auth (see `docs/SUPABASE_INTEGRATION.md`).
2. **KYC/AML & compliance:** Integrate identity checks, risk workflows, and audit logging.
3. **Automation hooks:** Connect to n8n/Make for automated confirmations and investor notifications.
4. **Monitoring:** Add structured logging, metrics, and alerting.
5. **On-chain integration:** Extend commitments to interact with blockchain rails once business logic is ready.

For detailed runbooks, deployment walkthroughs, and troubleshooting steps, consult the documentation under `docs/`.
