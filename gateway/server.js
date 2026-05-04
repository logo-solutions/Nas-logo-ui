import express from 'express'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import httpProxy from 'http-proxy'
import crypto from 'crypto'

const app = express()
const PORT = process.env.PORT || 8000
const JWT_SECRET = process.env.JWT_SECRET || 'nas-logo-dev-secret-key-change-in-prod'
const IMMICH_API_KEY = process.env.IMMICH_API_KEY || ''

// Store for gallery share tokens (in-memory, add DB for production)
const galleryTokens = new Map()

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
      // Add Immich API key to headers
      req.headers['x-api-key'] = IMMICH_API_KEY
      delete req.headers.authorization
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

// Generate gallery share token
app.post('/gallery/share', verifyToken, (req, res) => {
  const { albumId, expiresIn = '30d' } = req.body

  if (!albumId) {
    return res.status(400).json({ error: 'albumId is required' })
  }

  const shareToken = crypto.randomBytes(16).toString('hex')
  const expiresAt = new Date(Date.now() + parseDuration(expiresIn))

  galleryTokens.set(shareToken, {
    albumId,
    createdAt: new Date(),
    expiresAt,
  })

  res.json({
    shareToken,
    expiresAt,
    galleryUrl: `/gallery/${shareToken}`,
  })
})

// Get gallery HTML (public endpoint, no auth required)
app.get('/gallery/:shareToken', async (req, res) => {
  const { shareToken } = req.params
  const tokenData = galleryTokens.get(shareToken)

  if (!tokenData) {
    return res.status(404).json({ error: 'Gallery not found' })
  }

  if (new Date() > tokenData.expiresAt) {
    galleryTokens.delete(shareToken)
    return res.status(410).json({ error: 'Gallery share link has expired' })
  }

  try {
    // Fetch album data from Immich using API key
    const albumRes = await fetch(`${IMMICH_URL}/api/albums/${tokenData.albumId}`, {
      headers: { 'x-api-key': IMMICH_API_KEY },
    })

    if (!albumRes.ok) {
      return res.status(404).json({ error: 'Album not found' })
    }

    const album = await albumRes.json()
    const html = generateGalleryHTML(album, shareToken)

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate gallery', details: error.message })
  }
})

// Get gallery asset (proxy image with authentication)
app.get('/gallery/:shareToken/asset/:assetId', async (req, res) => {
  const { shareToken, assetId } = req.params
  const size = req.query.size || 'preview'

  const tokenData = galleryTokens.get(shareToken)

  if (!tokenData) {
    return res.status(404).json({ error: 'Gallery not found' })
  }

  if (new Date() > tokenData.expiresAt) {
    galleryTokens.delete(shareToken)
    return res.status(410).json({ error: 'Gallery share link has expired' })
  }

  try {
    const assetRes = await fetch(
      `${IMMICH_URL}/api/assets/${assetId}/${size === 'preview' ? 'thumbnail' : 'original'}?size=${size}`,
      { headers: { 'x-api-key': IMMICH_API_KEY } }
    )

    if (!assetRes.ok) {
      return res.status(assetRes.status).json({ error: 'Asset not found' })
    }

    res.setHeader('Content-Type', assetRes.headers.get('content-type'))
    res.setHeader('Cache-Control', 'public, max-age=31536000')
    res.send(Buffer.from(await assetRes.arrayBuffer()))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch asset', details: error.message })
  }
})

// Helper to parse duration strings (e.g., '30d', '24h')
function parseDuration(duration) {
  const units = {
    d: 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    m: 60 * 1000,
    s: 1000,
  }

  const match = duration.match(/^(\d+)([dhms])$/)
  if (!match) throw new Error('Invalid duration format')

  const [, value, unit] = match
  return parseInt(value) * units[unit]
}

// Generate standalone HTML gallery
function generateGalleryHTML(album, shareToken) {
  const assets = album.assets || []
  const images = assets.map((asset) => ({
    id: asset.id,
    fileName: asset.fileName,
    date: new Date(asset.fileCreatedAt).toLocaleDateString(),
    thumbnailUrl: `/api/gallery/${shareToken}/asset/${asset.id}?size=preview`,
    fullUrl: `/api/gallery/${shareToken}/asset/${asset.id}?size=original`,
  }))

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(album.albumName)} - Gallery</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f5f5f5;
      color: #333;
      line-height: 1.6;
    }

    .header {
      background: white;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .header p {
      color: #666;
      font-size: 0.95rem;
    }

    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      padding: 0 2rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .gallery-item {
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .gallery-item:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .gallery-item-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
      color: white;
      padding: 1rem 0.5rem 0.5rem;
      font-size: 0.85rem;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .gallery-item:hover .gallery-item-info {
      opacity: 1;
    }

    /* Lightbox */
    .lightbox {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.9);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }

    .lightbox.active {
      display: flex;
    }

    .lightbox-content {
      position: relative;
      width: 90%;
      height: 90%;
      max-width: 900px;
      max-height: 800px;
    }

    .lightbox-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .lightbox-close {
      position: absolute;
      top: -2.5rem;
      right: 0;
      background: none;
      border: none;
      color: white;
      font-size: 2rem;
      cursor: pointer;
      padding: 0;
      width: 2rem;
      height: 2rem;
    }

    .lightbox-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: white;
      font-size: 2rem;
      cursor: pointer;
      padding: 1rem;
      z-index: 1001;
    }

    .lightbox-prev {
      left: 0;
    }

    .lightbox-next {
      right: 0;
    }

    .lightbox-counter {
      position: absolute;
      bottom: -2.5rem;
      left: 50%;
      transform: translateX(-50%);
      color: white;
      font-size: 0.9rem;
    }

    .lightbox-download {
      position: absolute;
      bottom: -3.5rem;
      right: 0;
      background: #4CAF50;
      border: none;
      color: white;
      padding: 0.5rem 1rem;
      cursor: pointer;
      border-radius: 4px;
      font-size: 0.9rem;
      transition: background 0.2s;
    }

    .lightbox-download:hover {
      background: #45a049;
    }

    /* Controls */
    .controls {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      display: flex;
      gap: 0.5rem;
      flex-direction: column;
    }

    .btn {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 4px;
      background: #007bff;
      color: white;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.2s;
    }

    .btn:hover {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    @media (max-width: 768px) {
      .header {
        padding: 1rem;
      }

      .header h1 {
        font-size: 1.5rem;
      }

      .gallery {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        padding: 0 1rem 1rem;
        gap: 0.75rem;
      }

      .controls {
        bottom: 1rem;
        right: 1rem;
        flex-direction: row;
        gap: 0.25rem;
      }

      .btn {
        padding: 0.5rem 0.75rem;
        font-size: 0.8rem;
      }

      .lightbox-nav {
        padding: 0.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(album.albumName)}</h1>
    ${album.description ? `<p>${escapeHtml(album.description)}</p>` : ''}
    <p style="margin-top: 0.5rem; color: #999; font-size: 0.85rem;">${images.length} photos</p>
  </div>

  <div class="gallery">
    ${images.map((img, idx) => `
      <div class="gallery-item" data-index="${idx}">
        <img src="${img.thumbnailUrl}" alt="${escapeHtml(img.fileName)}" loading="lazy">
        <div class="gallery-item-info">
          <div>${escapeHtml(img.fileName)}</div>
          <div>${img.date}</div>
        </div>
      </div>
    `).join('')}
  </div>

  <!-- Lightbox -->
  <div class="lightbox" id="lightbox">
    <button class="lightbox-close" onclick="closeLightbox()">×</button>
    <div class="lightbox-content">
      <img class="lightbox-image" id="lightboxImage" src="" alt="">
      <button class="lightbox-nav lightbox-prev" onclick="prevImage()">❮</button>
      <button class="lightbox-nav lightbox-next" onclick="nextImage()">❯</button>
      <div class="lightbox-counter">
        <span id="lightboxCounter">1 / 1</span>
      </div>
      <button class="lightbox-download" onclick="downloadCurrentImage()">📥 Download</button>
    </div>
  </div>

  <!-- Controls -->
  <div class="controls">
    <button class="btn" onclick="downloadHTML()">📥 Download HTML</button>
    <button class="btn" onclick="downloadAllImages()">🖼️ Download All Images</button>
    <button class="btn btn-secondary" onclick="copyLink()">🔗 Copy Link</button>
  </div>

  <script>
    const images = ${JSON.stringify(images)};
    let currentIndex = 0;

    // Gallery click to open lightbox
    document.querySelectorAll('.gallery-item').forEach((item, idx) => {
      item.addEventListener('click', () => {
        currentIndex = idx;
        openLightbox(idx);
      });
    });

    function openLightbox(index) {
      currentIndex = index;
      updateLightbox();
      document.getElementById('lightbox').classList.add('active');
    }

    function closeLightbox() {
      document.getElementById('lightbox').classList.remove('active');
    }

    function nextImage() {
      currentIndex = (currentIndex + 1) % images.length;
      updateLightbox();
    }

    function prevImage() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateLightbox();
    }

    function updateLightbox() {
      const img = images[currentIndex];
      document.getElementById('lightboxImage').src = img.fullUrl;
      document.getElementById('lightboxCounter').textContent = (currentIndex + 1) + ' / ' + images.length;
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('lightbox').classList.contains('active')) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') closeLightbox();
    });

    function downloadHTML() {
      const element = document.documentElement.outerHTML;
      const blob = new Blob([element], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '${escapeHtml(album.albumName)}.html';
      a.click();
      URL.revokeObjectURL(url);
    }

    function copyLink() {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
      });
    }

    function downloadCurrentImage() {
      const img = images[currentIndex];
      const a = document.createElement('a');
      a.href = img.fullUrl;
      a.download = img.fileName || 'image';
      a.click();
    }

    function downloadAllImages() {
      if (images.length === 0) {
        alert('No images to download');
        return;
      }

      if (images.length > 50) {
        const confirmed = confirm('Download ' + images.length + ' images? This may take a while.');
        if (!confirmed) return;
      }

      let downloaded = 0;
      const total = images.length;

      images.forEach((img, idx) => {
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = img.fullUrl;
          a.download = img.fileName || ('image-' + idx);
          a.click();
          downloaded++;
          if (downloaded === total) {
            alert('Downloaded ' + total + ' images');
          }
        }, idx * 300);
      });
    }
  </script>
</body>
</html>`
}

function escapeHtml(text) {
  if (!text) return ''
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

app.listen(PORT, () => {
  console.log(`🚀 NAS-logo API Gateway running on port ${PORT}`)
  console.log(`📌 Get token: http://localhost:${PORT}/auth/simple-token`)
  console.log(`🔍 Health check: http://localhost:${PORT}/health`)
})
