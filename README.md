# NAS-logo UI

A unified web dashboard for managing a personal NAS infrastructure running on Mac Mini with multiple services (Immich, Paperless-ngx, n8n, Meilisearch, Grafana, etc.).

## Features

- 📷 **Photos** — Integration with Immich for personal photo storage
- 📄 **Documents** — Integration with Paperless-ngx for document management
- 🔍 **Search** — Full-text search via Meilisearch
- ⚙️ **Workflows** — Automation with n8n
- 📊 **Monitoring** — System metrics via Grafana
- 🌙 **Dark Mode** — Full dark mode support
- ♿ **Accessible** — WCAG 2.1 AA compliant
- 📱 **Responsive** — Mobile-first design

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **State**: Zustand + TanStack Query
- **Testing**: Vitest + React Testing Library

## Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Lint
npm run lint
```

## Environment

The UI connects to services on a Tailscale VPN network:
- Immich: `http://100.113.214.55:2283/api`
- Paperless-ngx: `http://100.113.214.55:8010/api`
- n8n: `http://100.113.214.55:5679/api/v1`
- Meilisearch: `http://100.113.214.55:7700`

## Project Structure

```
src/
├── components/       # React components
├── lib/             # Utilities and API clients
├── store/           # Zustand stores
├── styles/          # Global styles
└── types/           # TypeScript types
```

## License

MIT
