import { useAuth } from '../store/auth'

export interface HealthStatus {
  immich: {
    configured: boolean
    accessible: boolean
    error?: string
  }
  paperless: {
    configured: boolean
    accessible: boolean
    error?: string
  }
  meilisearch: {
    configured: boolean
    accessible: boolean
    error?: string
  }
}

export async function checkHealth(): Promise<HealthStatus> {
  const { immichApiKey, paperlessToken, meilisearchKey } = useAuth()

  const status: HealthStatus = {
    immich: {
      configured: !!immichApiKey,
      accessible: false,
    },
    paperless: {
      configured: !!paperlessToken,
      accessible: false,
    },
    meilisearch: {
      configured: !!meilisearchKey,
      accessible: false,
    },
  }

  // Check Immich
  if (immichApiKey) {
    try {
      const res = await fetch(
        '/api/immich/server/version',
        {
          headers: { 'x-api-key': immichApiKey },
        },
      )
      status.immich.accessible = res.ok
      if (!res.ok) {
        status.immich.error = `HTTP ${res.status}`
      }
    } catch (e) {
      status.immich.accessible = false
      status.immich.error = e instanceof Error ? e.message : 'Unknown error'
    }
  }

  // Check Paperless
  if (paperlessToken) {
    try {
      const res = await fetch(
        '/api/paperless/documents/?page=1&page_size=1',
        {
          headers: { 'Authorization': `Token ${paperlessToken}` },
        },
      )
      status.paperless.accessible = res.ok
      if (!res.ok) {
        status.paperless.error = `HTTP ${res.status}`
      }
    } catch (e) {
      status.paperless.accessible = false
      status.paperless.error = e instanceof Error ? e.message : 'Unknown error'
    }
  }

  // Check Meilisearch
  if (meilisearchKey) {
    try {
      const res = await fetch('/api/meilisearch/health', {
        headers: { 'Authorization': `Bearer ${meilisearchKey}` },
      })
      status.meilisearch.accessible = res.ok
      if (!res.ok) {
        status.meilisearch.error = `HTTP ${res.status}`
      }
    } catch (e) {
      status.meilisearch.accessible = false
      status.meilisearch.error = e instanceof Error ? e.message : 'Unknown error'
    }
  }

  return status
}
