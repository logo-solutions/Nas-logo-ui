# NAS-logo UI

A unified web dashboard for managing a personal NAS infrastructure running on Mac Mini with Immich, Paperless-ngx, Meilisearch, n8n, and Grafana.

## 🎯 Features

- 📷 **Photos** — Immich integration with gallery, pagination, metadata
- 📄 **Documents** — Paperless-ngx with search, filtering, organization
- 🔍 **Search** — Full-text search across all services (Meilisearch)
- 📊 **Monitoring** — System metrics dashboard with Grafana
- ⚙️ **Settings** — API credentials management with persistence
- 🌙 **Dark Mode** — Light/Dark/System theme support
- 📱 **Responsive** — Mobile-first design (2/3/4 column layouts)
- ♿ **Accessible** — WCAG 2.1 AA compliant components

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

## ⚙️ Configuration

### Add API Credentials

1. **Immich API Key**
   - Get from: http://100.113.214.55:2283/user/me
   - Add in Settings (⚙️)
   - Photos page will load once configured

2. **Paperless Token**
   - Get from: http://100.113.214.55:8010/admin/authtoken/
   - Add in Settings (⚙️)
   - Documents page will load once configured

### Environment Variables

Create `.env.local` if needed:
```env
VITE_IMMICH_URL=http://100.113.214.55:2283
VITE_PAPERLESS_URL=http://100.113.214.55:8010
VITE_MEILISEARCH_URL=http://100.113.214.55:7700
VITE_GRAFANA_URL=http://100.113.214.55:3000
```

## 📚 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + TypeScript |
| **Build** | Vite 8 |
| **Styling** | Tailwind CSS 3 |
| **State** | Zustand 5 + TanStack Query 5 |
| **API Client** | Fetch API |
| **Storage** | localStorage |

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx           # Service overview
│   ├── Photos/                 # Immich gallery
│   ├── Documents/              # Paperless list
│   ├── Search/                 # Meilisearch page
│   ├── Monitoring/             # Grafana integration
│   ├── Settings/               # API credentials
│   ├── Layout.tsx              # Main layout
│   ├── Sidebar.tsx             # Navigation
│   └── Header.tsx              # Top bar + theme
├── hooks/
│   ├── usePhotos.ts            # Photo queries
│   ├── useDocuments.ts         # Document queries
│   └── useSearch.ts            # Search queries
├── lib/
│   ├── immich.ts               # Immich API client
│   ├── paperless.ts            # Paperless API client
│   └── meilisearch.ts          # Search API client
├── store/
│   ├── auth.ts                 # API credentials (persistent)
│   ├── navigation.ts           # Current page state
│   └── theme.ts                # Theme preference (persistent)
├── styles/
│   └── globals.css             # Tailwind + base styles
└── main.tsx                    # React entry point
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Dashboard loads with service cards
- [ ] Sidebar navigation toggles and shows active state
- [ ] Theme switcher cycles through light/dark/system
- [ ] Settings page stores API credentials
- [ ] Photos page loads after Immich key is set
- [ ] Documents page loads after Paperless token is set
- [ ] Search filters results from multiple indexes
- [ ] Monitoring page shows Grafana link
- [ ] Dark mode applies throughout app
- [ ] Responsive layout works on mobile (320px, 768px, 1024px)

### Build Validation

```bash
npm run type-check    # TypeScript strict mode
npm run build         # Production bundle
npm run preview       # Test production build
```

## 📦 Production Build

```bash
npm run build
# → dist/ (440KB JS + 14KB CSS gzipped)
```

Deploy `dist/` folder to:
- Docker container on NAS
- Static hosting (Vercel, Netlify, etc)
- Serve from http://nas-logo-ui.local on Tailscale

## 🔧 Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run type-check` | TypeScript validation |

## 🌐 Service Endpoints

| Service | URL | Port | Purpose |
|---------|-----|------|---------|
| Immich | http://100.113.214.55:2283 | 2283 | Photos API |
| Paperless | http://100.113.214.55:8010 | 8010 | Documents API |
| Meilisearch | http://100.113.214.55:7700 | 7700 | Search API |
| n8n | http://100.113.214.55:5679 | 5679 | Workflows API |
| Grafana | http://100.113.214.55:3000 | 3000 | Monitoring |

All accessed via **Tailscale VPN** (no public ports).

## 📈 Performance

- **First Load**: ~2s (dev), <500ms (production)
- **Bundle Size**: 440KB JS (gzipped: 126KB)
- **CSS Size**: 14KB (gzipped: 3.4KB)
- **Lighthouse**: 90+ (performance, accessibility, best practices)

## 🤝 Contributing

This is a personal project. For improvements:
1. Create a feature branch
2. Make changes with TypeScript strict mode
3. Run `npm run type-check` before committing
4. Test in browser at http://localhost:5173

## 📄 License

MIT

## 🔗 Related Projects

- **NAS-logo** (Infrastructure): https://github.com/logo-solutions/NAS-logo
- **Immich** (Photos): https://immich.app
- **Paperless-ngx** (Documents): https://docs.paperless-ngx.com
- **Meilisearch** (Search): https://www.meilisearch.com
- **n8n** (Workflows): https://n8n.io
- **Grafana** (Monitoring): https://grafana.com
