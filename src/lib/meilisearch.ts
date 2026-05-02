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

const API_BASE = 'http://100.113.214.55:7700'

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
  const res = await fetch(`${API_BASE}/indexes/${index}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: query,
      limit,
      offset,
    }),
  })

  if (!res.ok) {
    throw new Error(`Search failed: ${res.statusText}`)
  }

  return res.json()
}

export async function getStats(): Promise<{ indexes: Record<string, any> }> {
  const res = await fetch(`${API_BASE}/stats`)
  if (!res.ok) throw new Error('Failed to get stats')
  return res.json()
}
