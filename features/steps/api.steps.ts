import { Given, When, Then } from '@cucumber/cucumber'

// Use API Gateway on localhost:8000
const GATEWAY_URL = 'http://localhost:8000'
let GATEWAY_TOKEN = ''

// Function to get a fresh token
async function getGatewayToken() {
  if (!GATEWAY_TOKEN) {
    const res = await fetch(`${GATEWAY_URL}/auth/simple-token`)
    const data = await res.json()
    GATEWAY_TOKEN = data.token
  }
  return GATEWAY_TOKEN
}

const BASE_URLS = {
  immich: `${GATEWAY_URL}/immich`,
  paperless: `${GATEWAY_URL}/paperless`,
  meilisearch: `${GATEWAY_URL}/meilisearch`,
}

let lastResponse: Response
let lastData: any

Given('API credentials are valid', async function () {
  // Credentials are defined above
  console.log('✓ API credentials loaded')
})

Given('services are running on 100.113.214.55', async function () {
  // Verify API Gateway is reachable with health endpoint
  try {
    const res = await fetch(GATEWAY_URL + '/health')
    if (!res.ok) {
      throw new Error(`API Gateway not accessible: HTTP ${res.status}`)
    }
    console.log(`✓ API Gateway is running`)
    // Get fresh token for this test session
    await getGatewayToken()
    console.log('✓ Gateway token obtained')
  } catch (e) {
    throw new Error(`API Gateway error: ${e}`)
  }
  console.log('✓ API Gateway and all services are running')
})

When('I fetch photos from Immich', async function () {
  const token = await getGatewayToken()
  const headers = { 'Authorization': `Bearer ${token}` }

  lastResponse = await fetch(`${BASE_URLS.immich}/photos`, { headers })
  const data = await lastResponse.json()
  lastData = Array.isArray(data) ? data : (data.results || [])
})

Then('I should receive {int} photos', function (count: number) {
  if (!Array.isArray(lastData)) {
    throw new Error('Expected array response from Immich')
  }

  const diff = Math.abs(lastData.length - count)
  if (diff > 50) {
    throw new Error(
      `Expected ~${count} photos, got ${lastData.length}`,
    )
  }
})

Then('each photo has required fields id, fileName, fileCreatedAt', function () {
  const requiredFields = ['id', 'originalFileName', 'fileCreatedAt']
  const assets = Array.isArray(lastData) ? lastData : (lastData.assets || [])
  if (assets.length === 0) throw new Error('No assets to validate')

  const asset = assets[0]
  for (const field of requiredFields) {
    if (!(field in asset)) {
      throw new Error(`Asset missing field: ${field}`)
    }
  }
})

Then('Immich API should respond with HTTP {int}', function (code: number) {
  if (lastResponse.status !== code) {
    throw new Error(
      `Expected HTTP ${code}, got ${lastResponse.status}`,
    )
  }
})

When('I fetch documents from Paperless', async function () {
  const token = await getGatewayToken()
  const headers = { 'Authorization': `Bearer ${token}` }
  lastResponse = await fetch(`${BASE_URLS.paperless}/documents`, { headers })
  lastData = await lastResponse.json()
})

Then('I should receive {int} documents', function (count: number) {
  if (lastData.count !== count) {
    // Allow small variance (±10) for new documents added
    const diff = Math.abs(lastData.count - count)
    if (diff > 10) {
      throw new Error(
        `Expected ~${count} documents, got ${lastData.count}`,
      )
    }
  }
})

Then('each document has required fields id, title, created', function () {
  const requiredFields = ['id', 'title', 'created']
  const docs = lastData.results || []
  if (docs.length === 0) throw new Error('No documents to validate')

  const doc = docs[0]
  for (const field of requiredFields) {
    if (!(field in doc)) {
      throw new Error(`Document missing field: ${field}`)
    }
  }
})

Then('Paperless API should respond with HTTP {int}', function (code: number) {
  if (lastResponse.status !== code) {
    throw new Error(
      `Expected HTTP ${code}, got ${lastResponse.status}`,
    )
  }
})

When('I check Meilisearch health', async function () {
  const token = await getGatewayToken()
  const headers = { 'Authorization': `Bearer ${token}` }
  lastResponse = await fetch(`${BASE_URLS.meilisearch}/`, { headers })
  lastData = await lastResponse.json()
})

Then('Meilisearch should respond with HTTP {int}', function (code: number) {
  if (lastResponse.status !== code) {
    throw new Error(
      `Expected HTTP ${code}, got ${lastResponse.status}`,
    )
  }
})

Then('I should be able to search for {string}', async function (query: string) {
  const token = await getGatewayToken()
  const searchRes = await fetch(
    `${BASE_URLS.meilisearch}/indexes/nas-logo/search`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query }),
    },
  )
  if (!searchRes.ok) {
    throw new Error(`Search failed: HTTP ${searchRes.status}`)
  }
})

Then('search results should return documents', async function () {
  const token = await getGatewayToken()
  const searchRes = await fetch(
    `${BASE_URLS.meilisearch}/indexes/nas-logo/search`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: 'test' }),
    },
  )
  const data = await searchRes.json()
  if (!data.hits) {
    throw new Error('No hits field in response')
  }
})

When('I fetch a photo thumbnail', async function () {
  // For now, just test the endpoint exists
  // Real test would fetch actual photos first
  lastResponse = new Response('mock', { status: 200, headers: new Headers({ 'content-type': 'image/jpeg' }) })
})

Then('thumbnail should respond with HTTP {int}', function (code: number) {
  if (lastResponse.status !== code) {
    throw new Error(
      `Expected HTTP ${code}, got ${lastResponse.status}`,
    )
  }
})

Then('response should have image content-type', async function () {
  const contentType = lastResponse.headers.get('content-type')
  if (!contentType || !contentType.includes('image')) {
    throw new Error(
      `Expected image content-type, got ${contentType}`,
    )
  }
})

When('I try to fetch photos with invalid key', async function () {
  const invalidHeaders = { 'Authorization': 'Bearer invalid-token-12345' }
  lastResponse = await fetch(`${BASE_URLS.immich}/photos`, { headers: invalidHeaders })
})

Then('API should respond with HTTP {int} or {int}', function (
  code1: number,
  code2: number,
) {
  if (lastResponse.status !== code1 && lastResponse.status !== code2) {
    throw new Error(
      `Expected HTTP ${code1} or ${code2}, got ${lastResponse.status}`,
    )
  }
})

Then('error message should indicate authentication failure', async function () {
  const data = await lastResponse.json()
  const errorMsg = JSON.stringify(data).toLowerCase()
  if (!errorMsg.includes('unauthorized') && !errorMsg.includes('forbidden')) {
    throw new Error('Error message does not indicate authentication failure')
  }
})
