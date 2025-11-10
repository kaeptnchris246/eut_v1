# Operations Guide – EUT v1

This document is the hands-on runbook for operating the EUT v1 platform in development and staging environments. It covers environment setup, command snippets, health checks, troubleshooting, and maintenance tasks.

---

## 1. Prerequisites

- Node.js 20+
- npm 10+
- Docker + Docker Compose plugin (for containerised workflow)
- psql client (optional, for database inspection)

Clone the repository and change into it:

```bash
git clone https://github.com/kaeptnchris246/eut_v1.git
cd eut_v1
```

Copy environment variables and provide values:

```bash
cp .env.example .env
# edit .env to set JWT_SECRET and, if needed, DATABASE_URL/CORS_ORIGIN
```

---

## 2. Local development without Docker

This mode gives the fastest feedback loop for frontend styling and API code changes.

### 2.1 Install dependencies

```bash
# frontend dependencies
npm install

# API dependencies
cd api
npm install
```

### 2.2 Start the API

```bash
cd api
npm run dev
```

- Runs Express + TypeScript via `tsx` (hot reload).
- Default port: **8080**.
- Health probe: `http://localhost:8080/health` (returns `{ "status": "ok" }`).
- Swagger docs: `http://localhost:8080/docs`.

Logs print to the terminal. Stop with `Ctrl+C`.

### 2.3 Start the frontend

In a second terminal:

```bash
cd eut_v1
npm run dev
```

- Vite dev server on **http://localhost:5173**.
- The frontend reads `VITE_API_BASE_URL` from `.env`. In dev it should be `http://localhost:8080`.
- Any API errors appear both in the browser console and terminal running the API.

To sign in, use the seeded accounts (see section 4).

---

## 3. Local development with Docker (API + Web + DB)

Docker Compose provides a production-like topology with Postgres.

```bash
cp .env.example .env
# update JWT_SECRET and optional values

docker compose up -d --build
```

Services:

| Service | Port | Notes |
| --- | --- | --- |
| `db` | 5432 | Postgres 16 with schema/seed auto-applied |
| `api` | 8080 | Express API (hot reload disabled; rebuild container for code changes) |
| `web` | 3000 | Nginx serving the Vite production build |

Check health:

```bash
curl http://localhost:8080/health
curl http://localhost:8080/docs    # HTML swagger page
```

Tail logs:

```bash
docker compose logs -f api
```

Stop and remove containers:

```bash
docker compose down
```

To rebuild after code changes:

```bash
docker compose up -d --build api web
```

Postgres data persists in the `dbdata` volume. Remove the volume to reset the database:

```bash
docker compose down -v
```

---

## 4. Demo accounts & auth flows

`db/seed.sql` provisions sample data:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@eut.local` | `admin123` |
| Investor | `investor@eut.local` | `invest123` |

The login page surfaces demo credentials for convenience. Tokens are stored in-memory (Zustand store) and cleared on logout/refresh.

The admin interface (`/admin/funds`) is only available to the admin role and exposes a form for creating new funds.

---

## 5. Database operations

### 5.1 Inspect data with psql

```bash
psql postgres://eut:eut@localhost:5432/eut

\dt                          -- list tables
select * from funds limit 5;  -- inspect seeded fund
```

### 5.2 Seed reset

If you need to reset the DB to a known state:

```bash
docker compose down -v
cp .env.example .env    # ensure credentials match docker-compose
docker compose up -d --build
```

Seeds are applied automatically by Postgres on first boot (`db/schema.sql` and `db/seed.sql`).

### 5.3 Manual migration placeholder

Future migrations can live under `db/migrations/`. For now, schema changes should update `schema.sql` and, if required, `seed.sql`.

---

## 6. Testing & quality checks

### 6.1 Frontend build

```bash
npm run build
```

### 6.2 API compilation

```bash
cd api
npm run build
```

These commands run automatically in CI (`.github/workflows/ci.yml`). Add additional lint/test steps here when they become available.

---

## 7. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `ECONNREFUSED` when frontend calls API | API not running or wrong `VITE_API_BASE_URL` | Start API (`npm run dev`), confirm `.env` value |
| 401 responses after login | JWT expired or missing | Re-login; check API logs for signature errors |
| Docker API container exits immediately | Missing `JWT_SECRET` or DB unreachable | Ensure `.env` has values; check `docker compose logs api` |
| Port conflicts (5173/8080/3000/5432) | Other processes using ports | Stop conflicting services or edit ports in `.env`/`docker-compose.yml` |
| `npm install`/`npm ci` returns HTTP 403 from the npm registry | Corporate proxy or sandbox blocking registry access | Configure npm proxy/registry auth, or run the install on a network with registry access and copy the resulting `node_modules`/lockfile |
| `npm ci` failure in Docker | Lock files missing | Run `npm install` (root + `api/`) locally to generate `package-lock.json`, commit them |

General debugging tips:

- API logs include stack traces via the error middleware (`api/src/middlewares/error.ts`).
- Frontend toasts display validation/API errors coming from `sonner`.
- Use browser dev tools network tab to inspect payloads.

---

## 8. Backup & restore

### 8.1 Manual backup

```bash
# With containers running
pg_dump postgres://eut:eut@localhost:5432/eut > backups/eut_$(date +%Y%m%d).sql
```

### 8.2 Restore

```bash
psql postgres://eut:eut@localhost:5432/eut < backups/eut_YYYYMMDD.sql
```

For production, schedule backups (cron, managed DB snapshots) and store them securely.

---

## 9. Operational tips

- Rotate `JWT_SECRET` periodically; tokens invalidated automatically.
- Keep `.env` out of version control; manage secrets via vaults/CI secrets in higher environments.
- When integrating Supabase Auth, follow `docs/SUPABASE_INTEGRATION.md` to disable password_hash writes from the API.
- Monitor container resource usage (`docker stats`) when running locally with Docker.

---

## 10. Support checklist before release

1. `npm run build` (frontend) – success ✅
2. `cd api && npm run build` – success ✅
3. `docker compose up -d --build` – all services healthy ✅
4. Manual smoke test: login as investor, create reservation, confirm, view dashboard ✅
5. Manual smoke test: login as admin, create new fund, verify listing ✅

Keep this guide close during onboarding and use it as a template for future operational runbooks.
