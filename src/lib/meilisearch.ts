import { gatewayFetch } from './gateway'

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

const API_BASE = '/meilisearch'

export async function searchAll(query: string): Promise<MeilisearchSearchResult> {
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
  const url = `${API_BASE}/indexes/${index}/search`
  try {
    const res = await gatewayFetch(url, {
      method: 'POST',
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
        `Network error searching ${index}. Check if API gateway is accessible.`,
      )
    }
    throw error
  }
}

export async function indexDocuments(documents: any[]): Promise<void> {
  const formattedDocs = documents.map((doc) => ({
    id: doc.id,
    type: 'document',
    title: doc.title || doc.filename || '',
    content: doc.content || doc.title || '',
    fileName: doc.filename || '',
    created: doc.created,
    document_type: doc.document_type,
    correspondent: doc.correspondent?.name || '',
    tags: doc.tags?.map((t: any) => t.name || '').join(' ') || '',
  }))

  try {
    const res = await gatewayFetch(`${API_BASE}/indexes/documents/documents`, {
      method: 'POST',
      body: JSON.stringify(formattedDocs),
    })

    if (!res.ok) {
      const errorData = await res.text()
      console.warn(`Failed to index documents: HTTP ${res.status}. ${errorData.slice(0, 100)}`)
    }
  } catch (error) {
    console.warn('Error indexing documents:', error)
  }
}

export async function indexPhotos(photos: any[]): Promise<void> {
  const formattedPhotos = photos.map((photo) => ({
    id: photo.id,
    type: 'photo',
    title: photo.fileName || '',
    content: `${photo.fileName} ${photo.smartInfo?.tags?.join(' ') || ''} ${photo.smartInfo?.objects?.join(' ') || ''}`,
    fileName: photo.fileName || '',
    fileCreatedAt: photo.fileCreatedAt,
    exif: photo.exifInfo ? JSON.stringify(photo.exifInfo) : '',
  }))

  try {
    const res = await gatewayFetch(`${API_BASE}/indexes/photos/documents`, {
      method: 'POST',
      body: JSON.stringify(formattedPhotos),
    })

    if (!res.ok) {
      const errorData = await res.text()
      console.warn(`Failed to index photos: HTTP ${res.status}. ${errorData.slice(0, 100)}`)
    }
  } catch (error) {
    console.warn('Error indexing photos:', error)
  }
}

export async function getStats(): Promise<{ indexes: Record<string, any> }> {
  const res = await gatewayFetch(`${API_BASE}/stats`)
  if (!res.ok) throw new Error('Failed to get stats')
  return res.json()
}
