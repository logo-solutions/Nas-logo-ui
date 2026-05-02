# NAS-logo-UI — Product Specification

## Overview

Un **hub d'authentification unifié et mobile-first** qui agrège **Paperless-ngx** (documents) et **Immich** (photos), avec SSO Tailscale unique, search unifiée, et deep linking intelligent vers les UIs natives de chaque service.

**Philosophie:** Ne pas réinventer les roues. Garder les UIs natives matures (Immich, Paperless), mais les unifier sous un SSO unique + ajouter la couche métier (search, ACL, orchestration, audit).

**Tech Stack:**
- Frontend: Next.js (React) — Mobile-first, responsive
- Backend: Python FastAPI — Token manager, proxy auth, orchestration
- Search: Meilisearch — Index unifié (photos + documents)
- Workflow: n8n (OCR Whisper, conversions, archivage)
- Infrastructure: Tailscale VPN, authentification via headers Tailscale
- Token Storage: JWT + Redis session store

---

## 1. User Stories & Features

### 1.1 Authentification & Hub Centralisé

**US-1.1: SSO Tailscale unifié**
- En tant qu'utilisateur, je me connecte une seule fois via Tailscale
- Accès transparent à Immich, Paperless et NAS-logo UI
- Tokens auto-gérés par le backend (pas de login Immich/Paperless à chaque fois)
- Sessions persistantes sur mobile

**US-1.2: Dashboard d'accueil**
- Aperçu global: # docs, # photos, derniers ajouts
- Liens rapides vers Immich (photos), Paperless (documents)
- Shortcuts vers les workflows principaux
- Responsive mobile-first

---

### 1.2 Recherche & Découverte

**US-2.1: Recherche full-text unifiée**
- En tant qu'utilisateur, je cherche un document OU une photo par mots-clés depuis une seule barre
- Résultats mixtes (docs + photos) avec facettes (type, date, tags)
- Indexation asynchrone via Meilisearch (mise à jour auto depuis Immich/Paperless)
- Deep links vers le document dans Immich/Paperless (avec auto-login)

**US-2.2: Filtrage avancé**
- Filtrer par: type (doc/photo), date range, tags, source (Immich/Paperless)
- Sauvegarde des filtres favoris localement

---

### 1.3 Deep Linking & Navigation

**US-3.1: Navigation transparente vers UIs natives**
- Cliquer une photo → ouvre Immich (déjà logué)
- Cliquer un document → ouvre Paperless (déjà logué)
- Reste des tokens valides (refresh automatique)
- Back button retourne à NAS-logo

**US-3.2: iOS & Android support**
- UI responsive sur tous les appareils
- PWA optional (offline search, notifications)
- Boutons touch-friendly (minimal scrolling)

---

### 1.4 Gestion des Droits & Audit

**US-4.1: ACL centralisée**
- Gérer les accès par utilisateur ou groupe
- Permissions par service: Immich read-only, Paperless edit, etc.
- Audit trail unifiée: qui, quand, quoi (sur tous les services)

**US-4.2: Partage temporaire**
- Générer un lien partageable avec expiration
- Celui qui reçoit le lien peut voir doc/photo sans compte

---

### 1.5 Orchestration & Workflows

**US-5.1: Archivage progressif**
- Politique de rétention: archiver après N jours d'inactivité
- Destruction programmée (soft-delete pour audit)
- Exécuté par n8n (job asynchrone)

**US-5.2: OCR & Enrichissement**
- Paperless: OCR texte (natif)
- Immich: Whisper pour audio/vidéo (via n8n)
- Indexation auto dans Meilisearch après enrichissement

**US-5.3: Conversion & Backup**
- Backup vers Hetzner Storage Box (n8n job)
- Conversion formats on-demand (n8n)

---

### 1.6 Monitoring & Audit

**US-6.1: Logs d'accès centralisés**
- Qui a accédé à quoi, quand, depuis où (IP Tailscale)
- Query par utilisateur, date, service, action
- Compliance: exportable pour audit

**US-6.2: Monitoring global**
- Dashboard Grafana (via FastAPI metrics)
- Alertes ntfy en cas d'anomalie (accès non-autorisé, erreur storage)

---

## 2. MVP vs. Future

### Phase 1: MVP (Semaines 1-3)
- [ ] **SSO Tailscale**: Login unique, token manager FastAPI
- [ ] **Dashboard**: Accueil mobile-first avec stats globales + quick links
- [ ] **Search**: Recherche unifiée (Meilisearch) + deep links
- [ ] **Responsive UI**: Mobile + desktop (Tailwind)
- [ ] **Audit basique**: Logs d'accès (user, timestamp, action)
- [ ] **Auto-login**: Deep links avec tokens vers Immich/Paperless
- [ ] **Immich proxy**: FastAPI wrapper pour tokens
- [ ] **Paperless proxy**: FastAPI wrapper pour tokens

### Phase 2: Enhanced (Semaines 4-6)
- [ ] **Filtrage avancé**: Type, date range, tags
- [ ] **ACL granulaire**: Permissions par utilisateur
- [ ] **Partage temporaire**: Lien avec expiration
- [ ] **PWA**: Offline support + notifications
- [ ] **Orchestration**: n8n workflows (archivage, OCR, backup)
- [ ] **Meilisearch indexing**: Auto-sync depuis Immich/Paperless

### Phase 3: Advanced (Semaines 7+)
- [ ] **Archivage progressif**: Politiques de rétention
- [ ] **Conversion formats**: On-demand via n8n
- [ ] **Monitoring**: Dashboard Grafana + alertes ntfy
- [ ] **Partage collaboratif**: Groupes d'accès
- [ ] **Analytics**: Statistiques d'usage par utilisateur

---

## 3. User Flows

### 3.1 Login & Dashboard
```
User (mobile/desktop)
     → Accès NAS-logo UI via Tailscale URL
     → Authentifié via Tailscale headers (SSO unique)
     → FastAPI crée JWT token
     → Redirect vers Dashboard
     ├─ Stats globales (# docs, # photos, derniers ajouts)
     └─ Boutons quick-links: [Immich] [Paperless] [Search]
```

### 3.2 Search & Deep Link
```
User → Search bar (Cmd+K / Ctrl+K)
     → Tape "facture 2024"
     → Meilisearch retourne résultats (docs + photos)
     → Clique sur un document
     → FastAPI forward le token Tailscale → Paperless
     → Paperless auto-authentifié, affiche le document
     → User revient → token reste valide (no re-login)
```

### 3.3 Share Temporary Link
```
User → Clique "Share" sur une photo/doc
     → Génère lien partageable (ex: /share/token-xyz)
     → Définit expiration (7 jours)
     → Partage URL avec ami
     → Ami accède sans login (lire seul)
     → Lien expire → accès refusé
```

### 3.4 Archivage & Rétention
```
Admin → Settings → Retention Policy
      → "Archive docs > 1 year old"
      → n8n job s'exécute chaque nuit
      → Documents matching → déplacés en "Archive"
      → Audit log: quoi, quand, pourquoi
```

### 3.5 Mobile Experience (iOS/Android)
```
User sur iPhone
     → Ouvre URL NAS-logo
     → Login via Tailscale (one-time)
     → Dashboard responsive adapté petit écran
     → Tap search → résultats touch-friendly
     → Tap photo → ouvre Immich mobile (déjà logué)
     → Gestes natifs: swipe back, tap zoom
```

---

## 4. Information Architecture

### Main Navigation (Mobile-First)
```
┌─────────────────────────────────┐
│ ☰ [NAS-logo] [🔍] [⚙️]         │  (Header minimal)
├─────────────────────────────────┤
│                                 │
│  📊 Dashboard                   │  (Accueil principal)
│  ├─ 📸 Immich UI (link)         │
│  ├─ 📄 Paperless UI (link)      │
│  └─ Recent activity             │
│                                 │
├─────────────────────────────────┤
│  🔍 Search (full width)         │  (Search bar toujours visible)
│  [Type here...] [🔎]            │
│                                 │
├─────────────────────────────────┤
│  Results:                       │
│  📄 Facture Jan 2024 (via PL)   │  (Deep link to Paperless)
│  📸 Photo hiking.jpg (via Immich)  (Deep link to Immich)
│  📄 Invoice ABC (via PL)        │
│                                 │
├─────────────────────────────────┤
│  Bottom tabs:                   │
│  [🏠 Home] [🔍 Search] [🔒 ACL] │
│  [⚙️ Settings]                  │
└─────────────────────────────────┘
```

### Desktop Navigation
```
┌─────────────────────────────────────────────────────┐
│ [NAS-logo] [Search bar ______] [⚙️ Settings] [👤]  │
├────────────┬──────────────────────────────────────┤
│            │                                      │
│ 📊 Home    │  📊 Dashboard                        │
│ 🔍 Search  │  ├─ Stats globales                   │
│ 🔒 ACL     │  ├─ Immich UI (button)               │
│ ⚙️ Settings │  └─ Paperless UI (button)           │
│            │                                      │
│            │  📋 Search Results                   │
│            │  ├─ Facture Jan 2024 (Paperless)    │
│            │  ├─ Photo holiday.jpg (Immich)     │
│            │  └─ [More results...]               │
│            │                                      │
└────────────┴──────────────────────────────────────┘
```

### Detail Views (Minimal)
**Search Result Card:**
```
┌─────────────────────────┐
│ 📄 Facture ABC.pdf      │
│ Paperless · Jan 2, 2026 │
│ Tags: #comptabilité     │
│ [Open in Paperless →]   │  (Deep link with token)
└─────────────────────────┘
```

**Settings Page:**
```
┌────────────────────────────┐
│ ⚙️ Settings                │
├────────────────────────────┤
│ 👤 User: logo@tailscale    │
│ 🔑 [Logout]                │
│                            │
│ 🔒 Access Control          │
│   ├─ Manage users          │
│   └─ View audit logs       │
│                            │
│ 📋 Workflows               │
│   ├─ Retention policies    │
│   └─ Backup schedule       │
│                            │
│ ℹ️ About                   │
│   Version: 1.0.0           │
└────────────────────────────┘
```

---

## 5. API Contracts (FastAPI)

### 5.1 Authentication & Session
```python
# Login (auto via Tailscale headers)
GET /api/v1/auth/login
→ {
    "user": "logo@tailscale",
    "token": "jwt-token-xyz",
    "expires_in": 3600,
    "services": {
      "paperless": "http://100.113.214.55:8010",
      "immich": "http://100.113.214.55:2283"
    }
  }

# Logout
POST /api/v1/auth/logout

# Token refresh
POST /api/v1/auth/refresh
→ {"token": "new-jwt-xyz", "expires_in": 3600}
```

### 5.2 Search (Meilisearch)
```python
GET /api/v1/search?q=facture&type=document&limit=20
→ {
    "results": [
      {
        "id": "doc-123",
        "title": "Facture ABC",
        "type": "document",
        "source": "paperless",
        "url": "/api/v1/proxy/paperless/documents/123/",  # Deep link
        "snippet": "Facture pour...",
        "score": 0.95
      },
      {
        "id": "img-456",
        "title": "Photo hiking.jpg",
        "type": "photo",
        "source": "immich",
        "url": "/api/v1/proxy/immich/assets/456/",  # Deep link
        "score": 0.87
      }
    ],
    "total": 245
  }
```

### 5.3 Proxy & Deep Linking
```python
# Proxy request + inject JWT token
GET /api/v1/proxy/paperless/documents/{id}/
→ Forward to Paperless API avec token Tailscale

GET /api/v1/proxy/immich/assets/{id}/
→ Forward to Immich API avec token Tailscale
```

### 5.4 Sharing & ACL
```python
# Generate share link (expires in 7 days)
POST /api/v1/share
→ {
    "token": "share-token-xyz",
    "url": "https://nas.tailscale.com/share/share-token-xyz",
    "expires_at": "2026-05-09T15:30:00Z",
    "permission": "read"
  }

# Access share (no auth needed)
GET /share/{token}
→ Redirect to object (doc or photo)

# Audit logs
GET /api/v1/audit?user=logo&action=view&limit=100
→ [
    {"timestamp": "2026-05-02T10:30:00Z", "user": "logo", "action": "view", "object": "doc-123", "ip": "100.x.x.x"},
    ...
  ]
```

### 5.5 Admin
```python
# Get stats
GET /api/v1/stats
→ {"total_docs": 1234, "total_photos": 5678, "indexed": 6912}

# Trigger Meilisearch reindex
POST /api/v1/admin/reindex
→ {"status": "started", "eta_seconds": 120}
```

---

## 6. Technical Requirements

### Frontend (Next.js) — Mobile-First
- **CSS Framework**: Tailwind CSS (responsive, mobile-first)
- **State management**: Zustand (JWT tokens, user session)
- **UI Components**: shadcn/ui (built on Radix + Tailwind)
- **Search box**: Custom autocomplete (Meilisearch fetch)
- **HTTP client**: fetch + axios (with token headers)
- **PWA support**: next-pwa (optional: offline search)
- **Device detection**: mobile-detect.js (adaptive layouts)

### Backend (FastAPI) — Token Manager
- **HTTP client**: httpx (async, for proxying)
- **JWT handling**: python-jose + pydantic
- **Auth middleware**: Dependency injection for Tailscale headers
- **Session store**: Redis (JWT + refresh tokens)
- **Database**: SQLAlchemy + PostgreSQL (audit logs, share links)
- **Async tasks**: APScheduler (n8n orchestration, archivage)
- **Logging & audit**: structlog + PostgreSQL
- **OpenAPI**: Auto-generated Swagger UI

### Infrastructure
- **Database**: PostgreSQL (audit logs, ACL, share links)
- **Cache & Session**: Redis (JWT tokens, search cache)
- **Search index**: Meilisearch (unified index)
- **Workflow engine**: n8n (OCR, backup, archivage)
- **VCS**: Git (optional: document versioning)
- **Monitoring**: Prometheus + Grafana (optional: Phase 2+)
- **Alerts**: ntfy (optional: Phase 2+)

---

## 7. Data Model (Simplified)

```python
# Core entities (NAS-logo database only)

class SharedLink:
    id: str  # Unique token
    source: str  # "paperless" | "immich"
    source_id: str  # ID dans la source
    title: str  # Cached title
    created_by: str  # Tailscale user
    created_at: datetime
    expires_at: datetime
    permission: str  # "read" | "edit"
    
class AuditLog:
    id: str
    user: str  # Tailscale user
    action: str  # "view", "search", "share", "login", "logout"
    object_type: str  # "document", "photo", "share"
    object_id: str  # ID in source (doc-123 or photo-456)
    source: str  # "paperless" | "immich" | "nas-logo"
    timestamp: datetime
    ip_address: str  # Tailscale IP
    details: dict  # Extra info (search query, share token, etc.)
    
class AccessPolicy:
    id: str
    resource: str  # "paperless" | "immich" | "nas-logo"
    user: str  # Tailscale user
    permission: str  # "read", "write", "admin"
    created_at: datetime
    
class Session:
    user: str  # Tailscale user
    jwt_token: str
    refresh_token: str
    expires_at: datetime
    issued_at: datetime
```

**Note:** Paperless & Immich metadata restent dans leurs BDs respectives. NAS-logo stocke uniquement:
- Audit logs (compliance)
- Partages temporaires (share tokens)
- ACL centralisée (access policies)
- Sessions JWT (authentication)

---

## 8. Success Criteria (MVP)

- [ ] **SSO Tailscale**: Login unique, zero friction (no Immich/Paperless login needed)
- [ ] **Search unifiée**: Recherche docs + photos en < 300ms
- [ ] **Mobile-first UI**: Responsive sur iPhone/Android + desktop
- [ ] **Deep linking**: Cliquer un résultat → ouvre Immich/Paperless avec auto-login
- [ ] **Audit logs**: Tous les accès loggés (user, timestamp, IP, action)
- [ ] **Token management**: JWT + refresh tokens, auto-gérés par FastAPI
- [ ] **Deployment**: Docker Compose sur NAS
- [ ] **API OpenAPI**: Documentation auto-générée

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| JWT token expiration durant usage | Refresh token automatique en background |
| Immich/Paperless APIs instables | Retry logic + circuit breaker dans FastAPI |
| Meilisearch indexation lente (large datasets) | Batch indexing asynchrone, incrémental |
| Tailscale headers mal mappés | Vérifier via debugging; tester avec différents clients |
| Search cache diverge de sources | Invalidation cache après chaque update Immich/Paperless |

---

## 10. Out of Scope (Phase 1)

- Multiple Tailscale users collaborant (Phase 2) — Single user focus
- Mobile native apps — Web responsive only
- Real-time sync (WebSocket) — Polling OK
- Advanced ML (auto-tagging) — Manual tags OK
- Federated GED (multi-NAS) — Single NAS only
- Full GDPR compliance — Basic audit trails only
