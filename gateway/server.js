import express from 'express'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import httpProxy from 'http-proxy'

const app = express()
const PORT = process.env.PORT || 8000
const JWT_SECRET = process.env.JWT_SECRET || 'nas-logo-dev-secret-key-change-in-prod'

app.use(cors())
app.use(express.json())

// Service endpoints - default to NAS infrastructure
const IMMICH_URL = process.env.IMMICH_URL || 'http://100.113.214.55:2283'
const PAPERLESS_URL = process.env.PAPERLESS_URL || 'http://100.113.214.55:8010'
const MEILISEARCH_URL = process.env.MEILISEARCH_URL || 'http://100.113.214.55:7700'
const N8N_URL = process.env.N8N_URL || 'http://100.113.214.55:5679'
const GRAFANA_URL = process.env.GRAFANA_URL || 'http://100.113.214.55:3000'
const NTFY_URL = process.env.NTFY_URL || 'http://100.113.214.55:80'

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token', details: error.message })
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      immich: IMMICH_URL,
      paperless: PAPERLESS_URL,
      meilisearch: MEILISEARCH_URL,
      n8n: N8N_URL,
      grafana: GRAFANA_URL,
      ntfy: NTFY_URL,
    },
  })
})

// Generate token endpoint
app.post('/auth/token', (req, res) => {
  const token = jwt.sign(
    {
      iss: 'nas-logo-gateway',
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  res.json({ token, expiresIn: '24h' })
})

// Simple token endpoint (no auth required)
app.get('/auth/simple-token', (req, res) => {
  const token = jwt.sign(
    {
      iss: 'nas-logo-gateway',
      type: 'simple',
    },
    JWT_SECRET,
    { expiresIn: '365d' }
  )

  res.json({
    token,
    expiresIn: '365d',
    note: 'Store this token in your UI settings'
  })
})

// Create proxy for each service
function createServiceProxy(target, shouldRewritePath = false) {
  return (req, res) => {
    const proxy = httpProxy.createProxyServer({ changeOrigin: true })

    // Rewrite path for Immich: /immich/foo → /api/foo
    if (shouldRewritePath) {
      const originalPath = req.url
      req.url = '/api' + originalPath
    }

    proxy.on('error', (err) => {
      res.status(503).json({ error: 'Service unavailable', details: err.message })
    })
    proxy.web(req, res, { target })
  }
}

// Proxy middleware for authenticated requests
// /immich/* → IMMICH_URL/api/*
app.use('/immich', verifyToken, createServiceProxy(IMMICH_URL, true))
app.use('/paperless', verifyToken, createServiceProxy(PAPERLESS_URL))
app.use('/meilisearch', verifyToken, createServiceProxy(MEILISEARCH_URL))
app.use('/n8n', verifyToken, createServiceProxy(N8N_URL))
app.use('/grafana', verifyToken, createServiceProxy(GRAFANA_URL))
app.use('/ntfy', verifyToken, createServiceProxy(NTFY_URL))

// Health check for each service
app.get('/health/services', verifyToken, async (req, res) => {
  const services = {
    immich: { url: IMMICH_URL, accessible: false },
    paperless: { url: PAPERLESS_URL, accessible: false },
    meilisearch: { url: MEILISEARCH_URL, accessible: false },
    n8n: { url: N8N_URL, accessible: false },
    grafana: { url: GRAFANA_URL, accessible: false },
    ntfy: { url: NTFY_URL, accessible: false },
  }

  // Check each service
  for (const [name, service] of Object.entries(services)) {
    try {
      const response = await fetch(`${service.url}/health`, { timeout: 2000 })
      service.accessible = response.ok
    } catch (error) {
      service.accessible = false
      service.error = error.message
    }
  }

  res.json(services)
})

app.listen(PORT, () => {
  console.log(`🚀 NAS-logo API Gateway running on port ${PORT}`)
  console.log(`📌 Get token: http://localhost:${PORT}/auth/simple-token`)
  console.log(`🔍 Health check: http://localhost:${PORT}/health`)
})
