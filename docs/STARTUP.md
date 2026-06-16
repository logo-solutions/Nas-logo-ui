# NAS-Logo-UI Startup Guide (Production-Ready)

Une solution orchestrée pour lancer l'écosystème complet en développement ou production.

## Table of Contents

- [Quick Start](#quick-start)
- [Setup (First Time)](#setup-first-time)
- [Startup Commands](#startup-commands)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

## Quick Start

```bash
# First time setup
./scripts/setup.sh

# Edit .env with your actual secrets
nano .env

# Start everything
make startup

# View logs
make logs

# Health check
make health
```

**Access points:**
- Frontend (dev): http://localhost:5173
- Frontend (HTTPS): https://nas.logo-solutions.fr
- Gateway API: http://localhost:8000
- UI container: http://localhost:8088

## Setup (First Time)

### 1. Run Setup Script

```bash
chmod +x ./scripts/setup.sh
./scripts/setup.sh
```

This will:
- ✅ Check Node.js, npm, Docker
- ✅ Create `.env` from `.env.example`
- ✅ Install npm dependencies
- ✅ Build Docker images
- ✅ Start Colima if needed

### 2. Configure Environment

Edit `.env` with your actual values:

```bash
nano .env
```

**Critical production settings:**
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`
- `IMMICH_API_KEY` - Get from Immich admin panel
- `NODE_ENV` - Set to `production` for prod, `development` for dev
- Service URLs - Update to your NAS infrastructure IPs

### 3. Start Services

```bash
make startup
```

## Startup Commands

### Core Commands

| Command | What it does |
|---------|-------------|
| `make startup` | Start everything (Colima, Docker, npm dev server) |
| `make dev` | Start only npm dev server (containers must be running) |
| `make build` | Build production Docker images |
| `make status` | Show status of all services |
| `make logs` | Stream logs from Docker containers |
| `make health` | Health check all services |
| `make shutdown` | Stop all services (Colima keeps running) |
| `make clean` | Full cleanup (stop, remove volumes, delete dist) |
| `make restart` | Restart everything |
| `make help` | Show help message |

### What Each Service Does

#### Colima
- Docker runtime container orchestration
- Starts automatically with `make startup`
- Stop manually: `colima stop`

#### Caddy (Port 80/443)
- Reverse proxy (HTTPS termination)
- Routes `/auth*`, `/api*`, `/immich*` to gateway
- Routes `/` to UI container
- Serves static files

#### Gateway (Port 8000)
- Node.js API gateway
- JWT token validation
- Proxies to Immich, Paperless, Meilisearch, etc.
- Health endpoint: `http://localhost:8000/health`

#### UI (Port 8080/8088)
- Production React build in container
- Also available via http://localhost:8088
- Not used in dev (npm dev runs on 5173)

#### npm dev server (Port 5173)
- Vite hot module reload
- TypeScript checking
- Only in development mode

## Environment Configuration

### .env Structure

```bash
# Deployment mode
NODE_ENV=production

# API Gateway JWT secret (MUST change for production!)
JWT_SECRET=change-this-to-a-secure-random-string

# Service credentials and URLs
IMMICH_API_KEY=your-immich-api-key
IMMICH_URL=http://100.113.214.55:2283

# Other services
PAPERLESS_URL=http://100.113.214.55:8010
MEILISEARCH_URL=http://100.113.214.55:7700
N8N_URL=http://100.113.214.55:5679
GRAFANA_URL=http://100.113.214.55:3000
NTFY_URL=http://100.113.214.55:80

# Caddy TLS certificates
CADDY_CERT_CRT=/etc/caddy/certs/nas-chain.crt
CADDY_CERT_KEY=/etc/caddy/certs/nas-leaf.key
PRIMARY_DOMAIN=nas.logo-solutions.fr

# Frontend URLs
VITE_API_BASE_URL=/api
VITE_GATEWAY_URL=http://localhost:8000

# Colima resources
COLIMA_MEMORY=8
COLIMA_CPU=4
COLIMA_DISK=100
```

### Generating JWT_SECRET for Production

```bash
# Generate a secure random secret
openssl rand -base64 32

# Or with Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Or with Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Docker Compose Services

### Service Dependencies & Health Checks

```
Caddy ← UI ← Gateway
 ↑                ↓
 └─── depends on service_healthy
```

Health checks ensure:
- Gateway must be healthy before UI starts
- UI must be healthy before Caddy starts
- Automatic restart on failure

### Checking Service Health

```bash
# All services
make health

# Individual services
docker ps --filter "name=nas-logo" --format "table {{.Names}}\t{{.State}}\t{{.Status}}"

# View logs for specific service
docker logs -f nas-logo-gateway
docker logs -f nas-logo-ui
docker logs -f nas-logo-caddy
```

## Development Workflow

### Standard Development Loop

```bash
# Terminal 1 - Start everything once
make startup

# Terminal 2 - Edit code (auto-reload via Vite HMR)
# Changes in src/ auto-reload at http://localhost:5173

# Terminal 3 - Monitor logs
make logs

# Monitor health
watch make health
```

### Adding a New Service Route

1. **Backend**: Add route in `gateway/server.js`
2. **Caddy**: Add handler in `Caddyfile`
3. **Frontend**: Add API call using `gatewayFetch()`
4. **Docker**: Rebuild with `docker-compose up -d --build`

## Production Deployment

### Pre-Deployment Checklist

```bash
# ✅ Run setup with production settings
./scripts/setup.sh

# ✅ Generate secure JWT_SECRET
openssl rand -base64 32

# ✅ Verify all service URLs point to production
cat .env | grep URL

# ✅ Test build locally
npm run build

# ✅ Run health checks
make health

# ✅ Check logs for errors
make logs
```

### Deploy to Production

```bash
# Build production images
make build

# Start with production .env
NODE_ENV=production make startup

# Verify all services are healthy
make health

# Monitor logs
make logs
```

### Environment Variables for Production

- Set `NODE_ENV=production` (enables optimizations, disables dev tools)
- Use strong `JWT_SECRET` (minimum 32 characters)
- Update all service URLs to production IPs
- Configure TLS certificates path correctly
- Enable monitoring/alerting (Grafana, Ntfy)

## Troubleshooting

### Services won't start

```bash
# Check if Colima is running
colima status

# Check Docker status
docker ps

# View detailed logs
docker-compose logs -f

# Rebuild everything
make clean
make startup
```

### Port conflicts

```bash
# Check which services are using ports
lsof -i :80
lsof -i :443
lsof -i :5173
lsof -i :8000

# Kill process using port (e.g., port 5173)
kill -9 $(lsof -t -i :5173)
```

### JWT token errors (401 Unauthorized)

```bash
# Verify JWT_SECRET matches in all services
grep JWT_SECRET .env
docker exec nas-logo-gateway env | grep JWT_SECRET

# Regenerate token
curl http://localhost:8000/auth/simple-token

# Check health
make health
```

### HTTPS/TLS certificate errors

```bash
# Verify certificates exist
ls -la ./certs/

# Check Caddy admin API
curl -s http://localhost:2019/api/ | jq .

# Reload Caddy config
docker exec nas-logo-caddy caddy reload --config /etc/caddy/Caddyfile
```

### Cache issues in browser

```bash
# Clear browser cache
# DevTools → Application → Storage → Clear site data

# Or restart from scratch
make shutdown
make startup
```

### Memory/CPU issues

```bash
# Check Colima resource allocation
colima status

# Increase resources
colima delete
colima start --memory 16 --cpu 8

# Check Docker resource usage
docker stats
```

## Monitoring

### Real-Time Health Dashboard

```bash
# Terminal window showing live status
watch -n 5 'make status && echo && make health'
```

### Service Logs

```bash
# All services
make logs

# Specific service
docker logs -f nas-logo-gateway
docker logs -f nas-logo-ui
docker logs -f nas-logo-caddy
```

### Gateway API Health

```bash
# Get full health report
curl http://localhost:8000/health | jq .

# Get all service statuses
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/health/services | jq .
```

## Clean Up & Maintenance

### Stop Everything

```bash
make shutdown
```

### Full Reset

```bash
make clean
./scripts/setup.sh
make startup
```

### Remove Docker Images

```bash
docker-compose down --rmi all
```

### Free Disk Space

```bash
docker system prune -a
docker volume prune
```

## Performance Tuning

### Increase Colima Resources

```bash
colima stop
colima delete
colima start --memory 16 --cpu 8 --disk 200
```

### Enable Docker Buildkit

```bash
export DOCKER_BUILDKIT=1
docker-compose build --progress=plain
```

### Parallel Container Startup

```bash
# Docker Compose uses depends_on with service_healthy
# Services start in parallel after health checks pass
docker-compose up -d
```

---

**For more details:**
- [NAS-Logo-UI README](../README.md)
- [Architecture Docs](./README.md)
- [Gateway API Docs](../gateway/README.md)
