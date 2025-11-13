# Deploying EUT v1 on a Hetzner VPS

This guide covers provisioning, deploying, and maintaining the EUT platform on a Hetzner virtual server (Ubuntu 22.04+). Adapt as required for other providers.

---

## 1. Server preparation

1. Provision a Hetzner VPS (2 vCPU / 4 GB RAM recommended for MVP).
2. SSH into the server as `root` (or a sudo-enabled user).
3. Install Docker and Docker Compose plugin:

   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose-plugin
   sudo systemctl enable --now docker
   sudo usermod -aG docker $USER
   newgrp docker
   ```

4. (Optional) Harden SSH (disable password auth, configure firewalls). For Hetzner, enable the cloud firewall or use `ufw`:

   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

---

## 2. Fetch project & configure environment

```bash
cd /opt
sudo git clone https://github.com/kaeptnchris246/eut_v1.git
sudo chown -R $USER:$USER eut_v1
cd eut_v1
```

Copy environment variables and populate secrets:

```bash
cp .env.example .env
nano .env
```

Set:

- `JWT_SECRET` – long random string (use `openssl rand -hex 48`).
- `DATABASE_URL` – keep default if using compose-provisioned Postgres.
- `CORS_ORIGIN` – include your production domain (`https://app.example.com`).
- `VITE_API_BASE_URL` – e.g. `https://api.example.com` if using a reverse proxy.
- `VITE_CHAIN_ID` / `VITE_CHAIN_NAME` / `VITE_CHAIN_SYMBOL` – chain metadata for wallet connections (e.g. Sepolia testnet).
- `VITE_RPC_URL` – HTTPS RPC endpoint for chain reads (Infura/Alchemy/custom node).
- `VITE_TOKEN_ADDRESS` – deployed ERC-20 (or ERC-1400) contract address.
- `VITE_WALLETCONNECT_PROJECT_ID` – project ID to enable WalletConnect (leave blank to disable QR modal).

Wallet integrations (ethers, WalletConnect, Coinbase Wallet SDK) are loaded from CDN modules at runtime; confirm that the server
can reach public HTTPS endpoints if wallet functionality is required in production.

For production, keep `.env` readable by deployment user only: `chmod 600 .env`.

---

## 3. Launch the stack

```bash
docker compose up -d --build
```

Verify services:

```bash
docker compose ps
curl http://localhost:8080/health
```

At this stage, the web UI is reachable on port 3000, API on 8080. Use a reverse proxy to expose ports 80/443.

---

## 4. Reverse proxy + TLS (Caddy example)

1. Install Caddy:

   ```bash
   sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo tee /usr/share/keyrings/caddy-stable-archive-keyring.gpg >/dev/null
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo apt-get update
   sudo apt-get install -y caddy
   ```

2. Configure `/etc/caddy/Caddyfile`:

   ```caddy
   app.example.com {
     reverse_proxy 127.0.0.1:3000
   }

   api.example.com {
     reverse_proxy 127.0.0.1:8080
   }
   ```

   Caddy will automatically issue Let’s Encrypt certificates.

3. Reload Caddy:

   ```bash
   sudo systemctl reload caddy
   ```

Update DNS records to point `app.example.com` and `api.example.com` to the VPS IP.

---

## 5. Ongoing operations

### 5.1 Logs & monitoring

```bash
docker compose logs -f api
```

Consider aggregating logs with Loki/Promtail or forwarding to an external service. Implement uptime checks (Hetzner monitoring, Better Uptime, etc.).

### 5.2 Upgrades / deployments

```bash
cd /opt/eut_v1
git pull origin main
docker compose up -d --build
```

For zero(ish)-downtime, rebuild services individually:

```bash
docker compose up -d --build api
# after API healthy
docker compose up -d --build web
```

### 5.3 Backups

Schedule Postgres backups via cron:

```bash
0 2 * * * pg_dump postgres://eut:eut@localhost:5432/eut > /opt/backups/eut_$(date +\%F).sql
```

Rotate backup files and store off-site (Hetzner Storage Box, S3, etc.). Test restore procedures regularly.

### 5.4 Security hygiene

- Keep Ubuntu patched (`sudo apt-get update && sudo apt-get upgrade -y`).
- Rotate `JWT_SECRET` and database credentials when rotating staff.
- Restrict inbound traffic (firewall) to 80/443/22.
- Enable fail2ban if exposing SSH.

---

## 6. Disaster recovery

1. Retrieve latest SQL backup.
2. Provision replacement server (follow sections 1–4).
3. Restore database:

   ```bash
   psql postgres://eut:eut@localhost:5432/eut < /opt/backups/eut_latest.sql
   ```

4. Redeploy containers (`docker compose up -d --build`).
5. Update DNS TTLs for faster failover where possible.

---

## 7. Post-deployment validation checklist

- [ ] API `/health` returns `200`.
- [ ] Swagger available at `/docs`.
- [ ] Frontend accessible via HTTPS domain.
- [ ] Admin login works; can create a fund.
- [ ] Investor login works; can reserve + confirm commitment.
- [ ] Backups scheduled and tested.
- [ ] Monitoring/alerts configured (basic ping + log review).

Once all checks pass, hand over to product stakeholders for UAT.
