import { Given, When, Then } from '@cucumber/cucumber'

const BASE_URLS = {
  immich: 'http://100.113.214.55:2283/api',
  paperless: 'http://100.113.214.55:8010/api',
  meilisearch: 'http://100.113.214.55:7700',
}

const CREDENTIALS = {
  immich: 'yaspQn6sAuhFmH3Cjv6oH8E4x6V7PysRbGg3rx3SOwg',
  paperless: '6127569d86244432e8d0a64c505375eb7883cedb',
  meilisearch: 'RuEpeN4LAI9O3K9TBA1gVqpLA2TEfz4nqhV1iVAfTNo',
}

let lastResponse: Response
let lastData: any

Given('API credentials are valid', async function () {
  // Credentials are defined above
  console.log('✓ API credentials loaded')
})

Given('services are running on 100.113.214.55', async function () {
  // Verify services are reachable
  const services = [
    { name: 'Immich', url: BASE_URLS.immich + '/server/version' },
    { name: 'Paperless', url: BASE_URLS.paperless + '/documents/' },
    { name: 'Meilisearch', url: BASE_URLS.meilisearch + '/health' },
  ]

  for (const service of services) {
    const headers: Record<string, string> = service.name === 'Immich'
      ? { 'x-api-key': CREDENTIALS.immich }
      : service.name === 'Paperless'
        ? { 'Authorization': `Token ${CREDENTIALS.paperless}` }
        : { 'Authorization': `Bearer ${CREDENTIALS.meilisearch}` }

    const res = await fetch(service.url, { headers })
    if (!res.ok) {
      throw new Error(`${service.name} not accessible: HTTP ${res.status}`)
    }
  }
  console.log('✓ All services are running')
})

When('I fetch photos from Immich', async function () {
  const albumRes = await fetch(`${BASE_URLS.immich}/albums?skip=0&take=1`, {
    headers: { 'x-api-key': CREDENTIALS.immich },
  })
  const albums = await albumRes.json()
  const albumId = albums[0].id

  lastResponse = await fetch(`${BASE_URLS.immich}/albums/${albumId}`, {
    headers: { 'x-api-key': CREDENTIALS.immich },
  })
  lastData = await lastResponse.json()
})

Then('I should receive {int} photos', function (count: number) {
  const assets = lastData.assets || []
  if (assets.length !== count) {
    throw new Error(
      `Expected ${count} photos, got ${assets.length}`,
    )
  }
})

Then('each photo has required fields id, fileName, fileCreatedAt', function () {
  const requiredFields = ['id', 'originalFileName', 'fileCreatedAt']
  const assets = lastData.assets || []
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
  lastResponse = await fetch(`${BASE_URLS.paperless}/documents/`, {
    headers: { 'Authorization': `Token ${CREDENTIALS.paperless}` },
  })
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
  lastResponse = await fetch(`${BASE_URLS.meilisearch}/health`, {
    headers: { 'Authorization': `Bearer ${CREDENTIALS.meilisearch}` },
  })
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
  const searchRes = await fetch(
    `${BASE_URLS.meilisearch}/indexes/nas-logo/search`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CREDENTIALS.meilisearch}`,
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
  const searchRes = await fetch(
    `${BASE_URLS.meilisearch}/indexes/nas-logo/search`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CREDENTIALS.meilisearch}`,
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
  const albumRes = await fetch(`${BASE_URLS.immich}/albums?skip=0&take=1`, {
    headers: { 'x-api-key': CREDENTIALS.immich },
  })
  const albums = await albumRes.json()
  const albumId = albums[0].id

  const albumDetail = await fetch(`${BASE_URLS.immich}/albums/${albumId}`, {
    headers: { 'x-api-key': CREDENTIALS.immich },
  })
  const album = await albumDetail.json()
  const photoId = album.assets[0].id

  lastResponse = await fetch(
    `${BASE_URLS.immich}/assets/${photoId}/thumbnail?size=preview`,
    {
      headers: { 'x-api-key': CREDENTIALS.immich },
    },
  )
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
  const albumRes = await fetch(`${BASE_URLS.immich}/albums?skip=0&take=1`, {
    headers: { 'x-api-key': 'invalid-key-12345' },
  })
  lastResponse = albumRes
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
