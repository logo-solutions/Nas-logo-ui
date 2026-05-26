# Architecture NAS-logo-UI + ALO

Documentation complète de l'infrastructure, des services et des scripts d'exploitation.

## 🏗️ Architecture Générale

```
┌─────────────────────────────────────────────────────────────┐
│                     INTERNET / TAILSCALE                     │
└──────────────────────────┬──────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        │  https://nas.logo-solutions.fr    │  https://alo.logo-solutions.fr
        │  https://100.113.214.55:5173      │  https://100.113.214.55:8001
        │                                   │
        ├─────────────────┬─────────────────┤
        │                 │                 │
    ┌───▼────────────────────────────────────────┐
    │  CADDY REVERSE PROXY (Docker)              │
    │  nas-logo-caddy:443 (HTTPS)                │
    │  Port externe: 80, 443                     │
    └───┬────────────────┬───────────────────────┘
        │                │
        ├────────────────┼─────────────────────────────────┐
        │                │                                 │
        │                │                                 │
    ┌───▼───────┐    ┌───▼────────┐              ┌────────▼──────┐
    │  NAS UI   │    │ NAS API    │              │  ALO Frontend │
    │ Vite Dev  │    │ Gateway    │              │  React:8001   │
    │:5173      │    │ Node:8000  │              └────────┬──────┘
    │           │    │ (Docker)   │                       │
    └───────────┘    └────────────┘              ┌────────▼──────┐
                                                 │  ALO Backend  │
                                                 │ FastAPI:8000  │
                                                 │ (localhost)   │
                                                 └───────────────┘
```

## 🚀 Services et Ports

### 1. **Caddy Reverse Proxy** (Docker - NAS-logo-UI)
```
Container: nas-logo-caddy
Ports:
  - 80:80 (HTTP redirect)
  - 443:443 (HTTPS)
  - 443:443/udp (QUIC)

Fichiers:
  - Caddyfile: /Volumes/logousb/SSD/Projects/NAS-logo-UI/Caddyfile
  - Certificats: /Volumes/logousb/SSD/Projects/NAS-logo-UI/certs/
```

**Routes Caddy:**

| Domaine | Matcher | Destination | Port |
|---------|---------|-------------|------|
| `nas.logo-solutions.fr` | `/api/*` | gateway | 8000 |
| `nas.logo-solutions.fr` | `/` | Vite dev | 5173 |
| `alo.logo-solutions.fr` | `/api/*` | ALO backend | 8000 |
| `alo.logo-solutions.fr` | `/` | ALO frontend | 8001 |

### 2. **NAS-logo-UI** (Vite Dev Server)
```
Démarrage: npm run dev
Port: 5173
Protocole: HTTP (Caddy gère HTTPS)
Framework: React + TypeScript + Vite
Répertoire: /Volumes/logousb/SSD/Projects/NAS-logo-UI
```

### 3. **NAS Gateway API** (Docker - Node.js)
```
Container: nas-logo-gateway
Port: 8000
Environnement:
  - NODE_ENV=production
  - JWT_SECRET=nas-logo-dev-secret-key-change-in-prod
  - IMMICH_API_KEY=dg46m83TgQBP4r8pxPloTnagaNUl2wWcgmNlB7Wk
  - IMMICH_URL=http://100.113.214.55:2283
  - PAPERLESS_URL=http://100.113.214.55:8010
  - MEILISEARCH_URL=http://100.113.214.55:7700
  - N8N_URL=http://100.113.214.55:5679
  - GRAFANA_URL=http://100.113.214.55:3000

Dépend de: gateway/
```

### 4. **ALO Frontend** (React App)
```
Port: 8001 (localhost)
Framework: React (Create React App)
API: Utilise URLs relatives (/api)
Répertoire: /Volumes/logousb/SSD/Projects/alo/frontend
```

### 5. **ALO Backend** (FastAPI)
```
Port: 8000 (localhost)
Framework: FastAPI (Python)
Démarrage: dans /Volumes/logousb/SSD/Projects/alo/app
Endpoints clés:
  - GET /api/periods
  - POST /api/expenses
  - GET /api/reequilibrage/{periodId}
```

## 🛠️ Lancer les Services

### **Option 1: Développement (Recommandé)**

#### Étape 1: Lancer Caddy (Docker)
```bash
cd /Volumes/logousb/SSD/Projects/NAS-logo-UI
docker-compose up -d
# Vérifie: docker ps | grep caddy
```

#### Étape 2: Lancer Vite (NAS-logo-UI)
```bash
cd /Volumes/logousb/SSD/Projects/NAS-logo-UI
npm run dev
# Écoute sur http://localhost:5173/
```

#### Étape 3: Lancer ALO Frontend (optionnel - si en dev)
```bash
cd /Volumes/logousb/SSD/Projects/alo/frontend
npm start
# Écoute sur http://localhost:3000/
```

#### Étape 4: Lancer ALO Backend (FastAPI)
```bash
cd /Volumes/logousb/SSD/Projects/alo/app
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# Écoute sur http://localhost:8000/
```

### **Option 2: Production (Docker Compose complet)**
```bash
cd /Volumes/logousb/SSD/Projects/NAS-logo-UI
docker-compose up -d

# Ou rebuild avec changements:
docker-compose up -d --build
```

## 📡 Accès aux Services

### **URLs Locales**
```
NAS-logo-UI (Vite):
  http://localhost:5173/

NAS Gateway API:
  http://localhost:8000/api/

ALO Frontend (direct):
  http://localhost:8001/

ALO Backend API (direct):
  http://localhost:8000/api/periods
```

### **URLs via Caddy (HTTPS)**
```
NAS-logo-UI:
  https://nas.logo-solutions.fr/
  https://localhost (auto-redirect)

NAS API:
  https://nas.logo-solutions.fr/api/

ALO Frontend:
  https://alo.logo-solutions.fr/

ALO API:
  https://alo.logo-solutions.fr/api/periods
```

### **URLs via Tailscale VPN**
```
NAS-logo-UI:
  http://100.113.214.55:5173/

ALO Frontend:
  http://100.113.214.55:8001/

ALO Backend API:
  http://100.113.214.55:8000/api/periods
```

## 🔧 Configuration Caddy (Caddyfile)

### NAS-logo-UI Routes
```
nas.logo-solutions.fr {
    tls /etc/caddy/certs/nas-chain.crt /etc/caddy/certs/nas-leaf.key

    # API routes → Gateway:8000
    @api path /api /api/*
    handle @api {
        uri strip_prefix /api
        reverse_proxy nas-logo-gateway:8000
    }

    # Frontend routes → Vite:5173
    handle {
        reverse_proxy host.docker.internal:5173
    }
}
```

### ALO Routes
```
alo.logo-solutions.fr {
    tls /etc/caddy/certs/nas-chain.crt /etc/caddy/certs/nas-leaf.key

    # API routes → FastAPI:8000
    @api path /api /api/*
    handle @api {
        reverse_proxy host.docker.internal:8000
    }

    # Frontend routes → React:8001
    handle {
        reverse_proxy host.docker.internal:8001
    }
}
```

## 📊 Variables d'Environnement

### NAS-logo-UI (.env)
```
# À la racine du projet
VITE_API_URL=/api
```

### ALO Frontend (env détection dynamique)
```
# Dans api.ts - utilise URL relative /api
// Caddy redirige automatiquement vers le backend
```

### ALO Backend (.env recommandé)
```
DATABASE_URL=sqlite:///./test.db
DEBUG=false
LOG_LEVEL=INFO
```

### NAS Gateway (docker-compose.yml)
```yaml
environment:
  - NODE_ENV=production
  - JWT_SECRET=nas-logo-dev-secret-key-change-in-prod
  - IMMICH_API_KEY=dg46m83TgQBP4r8pxPloTnagaNUl2wWcgmNlB7Wk
  - IMMICH_URL=http://100.113.214.55:2283
  - PAPERLESS_URL=http://100.113.214.55:8010
  - MEILISEARCH_URL=http://100.113.214.55:7700
  - N8N_URL=http://100.113.214.55:5679
  - GRAFANA_URL=http://100.113.214.55:3000
```

## 🔐 Certificats SSL

**Emplacement:** `/Volumes/logousb/SSD/Projects/NAS-logo-UI/certs/`

**Fichiers:**
- `nas-chain.crt` - Certificat chain CA-signé
- `nas-leaf.key` - Clé privée

**Générer un nouveau certificat (auto-signé):**
```bash
cd /Volumes/logousb/SSD/Projects/NAS-logo-UI/certs

# Générer une clé privée
openssl genrsa -out nas-leaf.key 2048

# Générer un certificat auto-signé
openssl req -new -x509 -key nas-leaf.key -out nas-chain.crt -days 365 \
  -subj "/C=FR/ST=State/L=City/O=Organization/CN=nas.logo-solutions.fr"

# Vérifier
openssl x509 -in nas-chain.crt -text -noout
```

## 🐳 Docker Commands

### Gestion Caddy
```bash
# Démarrer tous les services
docker-compose up -d

# Afficher les logs
docker-compose logs -f nas-logo-caddy

# Redémarrer Caddy
docker restart nas-logo-caddy

# Recharger la configuration
docker exec nas-logo-caddy caddy reload --config /etc/caddy/Caddyfile

# Arrêter tous les services
docker-compose down

# Voir les conteneurs actifs
docker ps | grep nas-logo
```

### Logs
```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f nas-logo-caddy
docker-compose logs -f gateway
docker-compose logs -f ui
```

## 🚨 Dépannage

### Caddy ne démarre pas
```bash
# Vérifier la syntaxe du Caddyfile
docker run -v $(pwd)/Caddyfile:/etc/caddy/Caddyfile caddy caddy validate

# Vérifier les logs
docker logs nas-logo-caddy

# Redémarrer
docker restart nas-logo-caddy
```

### API retourne 404
```bash
# Vérifier que le backend est lancé
curl http://localhost:8000/

# Tester l'endpoint directement
curl http://localhost:8000/api/periods

# Vérifier via Caddy
curl -k https://alo.logo-solutions.fr/api/periods
```

### Certificat SSL invalide
```bash
# Ignore les erreurs SSL (dev seulement)
curl -k https://alo.logo-solutions.fr/

# Recharger Caddy après changement de certificat
docker restart nas-logo-caddy
```

### WebSocket échoue
```
Erreur: WebSocket connection to 'wss://...' failed

Solution:
1. Vérifier que WebSocket est configuré dans Caddy
2. Rajouter header: upgrade, connection
3. Redémarrer Caddy
```

## 📁 Structure des Répertoires

```
/Volumes/logousb/SSD/Projects/
├── NAS-logo-UI/                    (Orchestre tout)
│   ├── Caddyfile                   (Reverse proxy config)
│   ├── docker-compose.yml          (Services Docker)
│   ├── Dockerfile                  (Build NAS UI)
│   ├── certs/                      (Certificats SSL)
│   ├── src/                        (Code React)
│   ├── gateway/                    (API Gateway Node.js)
│   └── Docs/README.md              (Cette doc)
│
└── alo/                            (Projet ALO indépendant)
    ├── frontend/                   (React app - port 8001)
    │   └── src/services/api.ts     (Client API)
    │
    └── app/                        (FastAPI backend - port 8000)
        ├── main.py
        ├── requirements.txt
        └── .venv/
```

## 🔄 Flux des Requêtes

### Requête Frontend → API (via Caddy)

```
1. Frontend (https://alo.logo-solutions.fr) appelle /api/periods

2. Browser envoie:
   GET https://alo.logo-solutions.fr/api/periods

3. Caddy intercepte (Matcher: @api path /api /api/*)
   - Redirige vers host.docker.internal:8000
   - Préserve le chemin /api/periods (PAS de strip_prefix)

4. Backend reçoit:
   GET http://localhost:8000/api/periods

5. Backend répond avec les données JSON

6. Caddy renvoie au frontend HTTPS
```

### Requête Tailscale → API (bypass Caddy)

```
1. Client Tailscale appelle /api/periods

2. Direct:
   GET http://100.113.214.55:8000/api/periods

3. Backend répond directement
   (Pas de Caddy, pas d'HTTPS)
```

## 📝 Checklist Déploiement

- [ ] Certificats SSL générés et en place
- [ ] Variables d'environnement configurées
- [ ] Caddy démarre sans erreurs (`docker-compose up -d`)
- [ ] NAS-logo-UI accessible via https://nas.logo-solutions.fr
- [ ] ALO Frontend accessible via https://alo.logo-solutions.fr
- [ ] ALO API retourne données (`/api/periods`)
- [ ] Tailscale accès fonctionne (100.113.214.55)
- [ ] Logs vérifiés (`docker-compose logs`)
- [ ] HTTPS valide (accepte le certificat auto-signé)

## 📞 Support

Pour plus d'informations:
- Architecture: Voir le diagramme en haut
- Caddyfile: `/Volumes/logousb/SSD/Projects/NAS-logo-UI/Caddyfile`
- Docker: `docker-compose.yml`
- Code Frontend: `src/components/Dashboard.tsx` + ALO `/frontend/`
- Code Backend: ALO `/app/main.py`

---
*Documentation générée le 26 mai 2026*
