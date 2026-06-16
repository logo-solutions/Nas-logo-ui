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

## 🔑 Services Intégrés

Le NAS héberge ces services (accessibles via API gateway ou Tailscale):

| Service | Port | Purpose | Auth |
|---------|------|---------|------|
| **Immich** | 2283 | Photo management & backup | API Key (vault) |
| **Paperless** | 8010 | Document scanning & OCR | Token (vault) |
| **Meilisearch** | 7700 | Full-text search indexing | Master Key (vault) |
| **Grafana** | 3000 | Dashboards & monitoring | Admin credentials (vault) |
| **n8n** | 5679 | Workflow automation | API Key (vault) |
| **Prometheus** | 9090 | Metrics collection | None (localhost only) |
| **ntfy** | 8090 | Push notifications | None |

**Comment les utiliser dans NAS-logo-UI:**
1. Ajouter la clé API dans Settings panel
2. Frontend envoie les requêtes via `/api/*` (proxied par Caddy)
3. API Gateway (`nas-logo-gateway:8000`) authentifie et redirige vers le NAS

## 🔐 Token JWT Automatique

Le frontend obtient automatiquement un **JWT Token** depuis le gateway au chargement initial.

### Fonctionnement

**Au démarrage:**
1. Frontend appelle: `GET /auth/simple-token`
2. Gateway génère un JWT valide 365 jours
3. Token sauvegardé dans localStorage (`auth-storage-v2`)
4. Tous les services sont automatiquement accessibles

```typescript
// Hook: src/hooks/useAutoToken.ts
// S'exécute au chargement de Layout.tsx
// Génère un token s'il n'existe pas
```

### Properties & Configuration

**Environnement Gateway (docker-compose.yml):**
```yaml
gateway:
  environment:
    - JWT_SECRET=nas-logo-dev-secret-key-change-in-prod
    # Clé utilisée pour signer les tokens JWT
```

**localStorage (Frontend):**
```javascript
// Clé: auth-storage-v2
// Contient: { state: { gatewayToken: "eyJ...", isHydrated: true }, version: 0 }
```

### Mettre à Jour le Token

**Option 1: Automatique (Recommandé)**
```bash
# Vider le localStorage et recharger la page
# Le frontend générera automatiquement un nouveau token
```

**Option 2: Via Console Navigateur**
```javascript
// Ouvrir DevTools (F12) > Console
localStorage.removeItem('auth-storage-v2');
location.reload();
```

**Option 3: Via API directement**
```bash
curl http://localhost:8000/auth/simple-token | jq '.token'
# Copier le token dans Settings > Gateway Token (si formulaire existe)
```

**Option 4: Changer la clé JWT (production)**
```bash
# Éditer docker-compose.yml
gateway:
  environment:
    - JWT_SECRET=votre-clé-sécurisée-très-longue

# Redémarrer le gateway
docker-compose restart gateway

# Les anciens tokens deviennent invalides
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

## 🏗️ Infrastructure NAS (Guide d'Administration)

Pour plus d'informations sur l'administration complète du NAS, voir: `/Volumes/logousb/SSD/Projects/NAS-logo/docs/guide-administration.md`

### Architecture NAS
```
Mac Mini (Apple Silicon)
├── Colima (runtime Docker)
│   ├── immich_server        :2283  — serveur photos
│   ├── paperless            :8010  — GED documents
│   ├── grafana              :3000  — dashboards monitoring
│   ├── prometheus           :9090  — métriques
│   ├── cadvisor             :8080  — métriques Docker
│   ├── node_exporter        :9100  — métriques système
│   ├── ntfy                 :8090  — push notifications
│   ├── meilisearch          :7700  — moteur de recherche
│   └── n8n                  :5679  — workflows automation
│
├── SSD données chaudes → /Volumes/logousb/SSD/NAS-LOGO-VOLUME/
│   ├── immich/              — photos uploadées
│   ├── immich-db/           — données PostgreSQL
│   ├── paperless/           — documents
│   ├── meilisearch/         — index de recherche
│   └── monitoring/          — données Prometheus + Grafana
│
├── HDD données volumineuses → /Volumes/NAS-LOGO-DATA/ (5,5 To)
│   └── Archives et backups
│
└── Tailscale VPN → IP : 100.113.214.55
```

### Variables d'environnement Docker (SSH sur NAS)
```bash
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
export PATH="/opt/homebrew/bin:$PATH"
```

### SSH au serveur
```bash
ssh logo@100.113.214.55
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

### **URLs via Tailscale VPN** (depuis MacBook Air/ordinateur distant)

**Option 1: Via Caddy (HTTPS - Recommandé)**
```
https://100.113.214.55/
OU
https://nas.logo-solutions.fr/
```
- Token JWT génère automatiquement ✅
- Routes `/api/*` et `/auth/*` fonctionnent
- Certificat auto-signé (accepter l'avertissement SSL)

**Option 2: Frontend direct (HTTP)**
```
http://100.113.214.55:5173/
```
- Frontend seulement (pas Caddy)
- Token JWT génère automatiquement ✅

**Services sur NAS (via Tailscale):**
```
Immich:      http://100.113.214.55:2283/
Paperless:   http://100.113.214.55:8010/
Grafana:     http://100.113.214.55:3000/
ntfy:        http://100.113.214.55:8090/
Meilisearch: http://100.113.214.55:7700/
Prometheus:  http://100.113.214.55:9090/
```

### Frontend Settings & Gateway Token

**Settings Panel** (`⚙️` en haut à droite):

| Section | What | Auto? | Manual? |
|---------|------|-------|---------|
| **API Gateway** | JWT Token | ✅ Auto-generated | ❌ Non (lecture seule) |
| **Service Status** | Health check | ✅ Auto-verified | ✅ Refresh button |
| **Immich** | Connection status | ✅ Auto-detected | — |
| **Paperless** | Connection status | ✅ Auto-detected | — |
| **Meilisearch** | Connection status | ✅ Auto-detected | — |

**Statut "✓ Auto-connected":**
- Token JWT généré automatiquement ✅
- Pas besoin de le copier/coller
- Valide 365 jours (ou jusqu'à redémarrage gateway)

### Credentials & Vault

**⚠️ Toutes les clés API et mots de passe sont stockés dans le vault NAS:**

```bash
# Éditer le vault (demande le vault password)
ansible-vault edit /Volumes/logousb/SSD/Projects/NAS-logo/inventory/group_vars/all/vault.yml --vault-password-file ~/.nas-logo-vault-pass
```

**Clés essentielles pour NAS-logo-UI:**
- `vault_immich_api_key` — API key pour les requêtes Immich
- `vault_paperless_api_token` — Token pour les requêtes Paperless
- `vault_meilisearch_master_key` — Master key Meilisearch
- `vault_grafana_admin_password` — Admin password Grafana

Voir: `/Volumes/logousb/SSD/Projects/NAS-logo/docs/VAULT-PASSWORDS.md` pour la liste complète

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

### Clés API & Secrets

**Immich API Key**
- **Stockée dans:** Vault de nas-logo (voir `/Volumes/logousb/SSD/Projects/NAS-LOGO`)
- **Où la trouver:** http://100.113.214.55:2283/user/me (onglet "API Keys")
- **Où la configurer:** Settings panel dans l'app (pour que le frontend authentifie les requêtes)
- **Utilisée par:** 
  - `nas-logo-gateway` (node.js) — pour proxier les requêtes Immich
  - Frontend Settings panel — stockée localement dans le navigateur

**Autres clés (Paperless, n8n, etc.)**
- Voir le vault de nas-logo pour toutes les clés de service
- Configurer dans Settings panel du frontend

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

## 🐳 Colima Setup

Ce projet utilise **Colima** (container runtime compatible Docker sur macOS) au lieu de Docker Desktop.

### Démarrer Colima
```bash
# Vérifier le statut
colima status

# Si Colima n'est pas en cours d'exécution, démarrer:
colima start

# Afficher les informations
colima info
```

### Commandes Utiles
```bash
# Vérifier que Docker fonctionne (via Colima)
docker ps

# Voir les conteneurs Colima
docker ps -a

# Logs de Colima lui-même
colima logs

# Arrêter Colima (recommandé quand on ne dev pas)
colima stop

# Redémarrer Colima complètement
colima restart

# Supprimer Colima (attention: efface les volumes/images)
colima delete
```

### Dépannage Colima

**Problème: "Cannot connect to the Docker daemon"**
```bash
# Vérifier que Colima est actif
colima status

# Si arrêté, redémarrer
colima start

# Si problème persiste, redémarrer complètement
colima restart
```

**Vérifier que le socket Docker est accessible**
```bash
# Vérifier le socket
ls -la /var/run/docker.sock

# Si Colima ne trouve pas le socket:
colima start --force-config
```

**Voir les logs détaillés**
```bash
colima logs --follow
```

## 🚨 Dépannage

### Caddy ne démarre pas
```bash
# 1. Vérifier que Colima est en cours d'exécution
colima status
colima start  # Si nécessaire

# 2. Vérifier la syntaxe du Caddyfile
docker run -v $(pwd)/Caddyfile:/etc/caddy/Caddyfile caddy caddy validate

# 3. Vérifier les logs
docker logs nas-logo-caddy

# 4. Redémarrer
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

### Token JWT ne se génère pas
```
Symptôme: Settings affiche "No token", galerie vide

Solution:
1. Vérifier que le gateway fonctionne:
   curl http://localhost:8000/health
   # Doit répondre: {"status":"ok",...}

2. Tester l'endpoint token manuellement:
   curl http://localhost:8000/auth/simple-token | jq '.token'
   # Doit retourner un JWT valide

3. Vérifier les logs du gateway:
   docker logs nas-logo-gateway | tail -20
   # Chercher les erreurs au démarrage

4. Forcer la régénération:
   # Console navigateur (F12):
   localStorage.removeItem('auth-storage-v2'); location.reload();

5. Si toujours bloqué:
   docker-compose restart gateway
   npm run dev  # Redémarrer frontend
```

### Erreur "CORS" sur les requêtes
```
Erreur: Access to XMLHttpRequest blocked by CORS

Solution:
1. Vérifier que Caddy fonctionne (reverse proxy HTTPS)
2. Vérifier que le gateway a CORS enabled:
   gateway/server.js ligne 15: app.use(cors())
3. Si développement local:
   - Frontend: http://localhost:5173
   - Gateway: http://localhost:8000
   - Doivent être sur le même réseau (CORS non requis en localhost)
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
