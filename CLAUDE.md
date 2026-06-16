# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NAS-logo-UI is a unified web dashboard for a personal NAS infrastructure. It integrates with Immich (photos), Paperless-ngx (documents), Meilisearch (search), n8n (workflows), and Grafana (monitoring).

**Infrastructure:** Mac Mini (Apple Silicon) running macOS with Colima for container runtime and Caddy as reverse proxy.

## Architecture

The system runs as a Docker Compose stack with separate frontend and backend services:

```
Browser → Caddy (HTTPS) → Services
├── /api/* → nas-logo-gateway (Node.js, port 8000)
├── / → Vite dev server (port 5173)
└── External services (Immich, Paperless, Meilisearch, n8n, Grafana)
```

**Services:**
- **Caddy** (nas-logo-caddy): Reverse proxy on ports 80/443 (HTTPS)
- **NAS-logo-UI** (React/Vite): Frontend served from port 5173, proxied by Caddy
- **NAS Gateway** (nas-logo-gateway): Node.js API gateway on port 8000, proxies external services
- **External services:** All accessed via Tailscale VPN (100.113.214.55)

**Key files:**
- `Caddyfile`: Reverse proxy routes and HTTPS configuration
- `docker-compose.yml`: Container definitions and port mappings
- `src/`: React components organized by feature (Photos, Documents, Search, Monitoring, Settings)
- `gateway/`: Node.js API gateway that proxies requests to external services
- `certs/`: SSL certificates for HTTPS (auto-signed with local CA)

## Getting Started

### Prerequisites
- Colima running: `colima status` (should show "colima is running")
- Node.js 18+ and npm installed

### Development (Recommended)

**Terminal 1 — Start Docker services:**
```bash
docker-compose up -d
# Starts Caddy (reverse proxy) and gateway (API)
# Check: docker ps | grep nas-logo
```

**Terminal 2 — Start frontend dev server:**
```bash
npm install  # First time only
npm run dev
# Runs on http://localhost:5173
```

Then access via HTTPS:
- **https://nas.logo-solutions.fr** (via Caddy)
- Or directly: **http://localhost:5173** (no HTTPS)

### Production Build
```bash
npm run build       # Create dist/
npm run preview     # Test production build locally
docker-compose up -d --build  # Rebuild and restart containers
```

## Key Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Production bundle to dist/ |
| `npm run preview` | Preview production build |
| `npm run type-check` | TypeScript validation |
| `docker-compose up -d` | Start Caddy & Gateway |
| `docker-compose down` | Stop all containers |
| `docker-compose logs -f` | Stream all container logs |
| `docker logs -f nas-logo-caddy` | View Caddy logs |
| `docker logs -f gateway` | View API gateway logs |

## Service Endpoints

### Local Development
- **UI (Vite):** http://localhost:5173
- **Gateway API:** http://localhost:8000
- **Caddy (HTTPS):** https://nas.logo-solutions.fr (requires certificate trust)

### Via Tailscale VPN
- **UI:** http://100.113.214.55:5173
- **Gateway API:** http://100.113.214.55:8000

### External Services (on NAS)
- **Immich:** http://100.113.214.55:2283
- **Paperless:** http://100.113.214.55:8010
- **Meilisearch:** http://100.113.214.55:7700
- **n8n:** http://100.113.214.55:5679
- **Grafana:** http://100.113.214.55:3000

## Technology Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State:** Zustand + TanStack Query
- **API Gateway:** Node.js Express
- **Reverse Proxy:** Caddy
- **Container Runtime:** Colima (Docker-compatible)

## Testing

### Manual Checklist (from README.md)
- Dashboard loads with service cards
- Sidebar navigation and active state
- Theme switcher (light/dark/system)
- Settings page stores API credentials
- Photos page loads after Immich key is set
- Documents page loads after Paperless token is set
- Search filters work
- Monitoring page shows Grafana link
- Dark mode applies throughout
- Responsive layout (320px, 768px, 1024px)

## Important Notes

### Colima & Docker
This project uses **Colima** (not Docker Desktop). Commands work identically; Colima manages the Docker socket.

### SSL Certificates
- Located in `certs/` directory
- Auto-signed with local CA
- Browser will show security warning (expected, add exception)
- Caddy reloads on certificate changes

### API Configuration
Users must add API credentials in the UI Settings panel:
1. **Immich:** Get key from http://100.113.214.55:2283/user/me
2. **Paperless:** Get token from http://100.113.214.55:8010/admin/authtoken/

### Caddy Configuration
Routes are defined in `Caddyfile`:
- `/api/*` → `nas-logo-gateway:8000` (API requests)
- `/` → Vite dev server (frontend)

Reload Caddy after config changes: `docker exec nas-logo-caddy caddy reload --config /etc/caddy/Caddyfile`

## Architecture References

- Full infrastructure diagram: See `docs/README.md`
- Service flows and debugging: See `docs/README.md`
- Project structure: See `README.md`
