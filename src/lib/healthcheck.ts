export interface HealthStatus {
  immich?: { accessible: boolean }
  paperless?: { accessible: boolean }
  meilisearch?: { accessible: boolean }
  n8n?: { accessible: boolean }
  grafana?: { accessible: boolean }
  ntfy?: { accessible: boolean }
}

export async function checkHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch('/api/health')
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    return await res.json()
  } catch (e) {
    return {
      immich: { accessible: false },
      paperless: { accessible: false },
      meilisearch: { accessible: false },
      n8n: { accessible: false },
      grafana: { accessible: false },
      ntfy: { accessible: false },
    }
  }
}
