// Meilisearch API client
// Base: http://100.113.214.55:7700

export interface MeilisearchDocument {
  id: string | number
  [key: string]: any
}

export interface MeilisearchSearchResult<T = any> {
  hits: T[]
  query: string
  processingTimeMs: number
  limit: number
  offset: number
  estimatedTotalHits: number
}

const API_BASE = 'http://localhost:7700'
let MASTER_KEY = ''

export function setMeilisearchKey(key: string) {
  MASTER_KEY = key
}

export async function searchAll(query: string): Promise<MeilisearchSearchResult> {
  // Search across all indexed documents (photos, documents, etc)
  // Returns unified results from all indexes
  const indexes = ['photos', 'documents']
  const allResults: MeilisearchSearchResult['hits'] = []

  for (const index of indexes) {
    try {
      const results = await searchIndex(index, query)
      allResults.push(...results.hits)
    } catch (error) {
      console.warn(`Failed to search ${index}:`, error)
    }
  }

  return {
    hits: allResults,
    query,
    processingTimeMs: 0,
    limit: 50,
    offset: 0,
    estimatedTotalHits: allResults.length,
  }
}

export async function searchIndex(
  index: string,
  query: string,
  limit = 50,
  offset = 0,
): Promise<MeilisearchSearchResult> {
  if (!MASTER_KEY) {
    throw new Error('Meilisearch master key not configured')
  }

  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  headers['Authorization'] = `Bearer ${MASTER_KEY}`

  const url = `${API_BASE}/indexes/${index}/search`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        q: query,
        limit,
        offset,
      }),
    })

    if (!res.ok) {
      const errorData = await res.text()
      throw new Error(
        `HTTP ${res.status}: ${res.statusText}. ${errorData.slice(0, 100)}`,
      )
    }

    return res.json()
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Network error searching ${index}. Check if Meilisearch is accessible at ${API_BASE}`,
      )
    }
    throw error
  }
}

export async function getStats(): Promise<{ indexes: Record<string, any> }> {
  const headers: HeadersInit = {}
  if (MASTER_KEY) {
    headers['Authorization'] = `Bearer ${MASTER_KEY}`
  }

  const res = await fetch(`${API_BASE}/stats`, { headers })
  if (!res.ok) throw new Error('Failed to get stats')
  return res.json()
}
