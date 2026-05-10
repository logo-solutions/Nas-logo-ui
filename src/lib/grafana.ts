import { gatewayFetch } from './gateway'

const GRAFANA_URL = '/grafana'

export async function checkGrafanaHealth(): Promise<{ accessible: boolean; error?: string }> {
  try {
    const response = await gatewayFetch(`${GRAFANA_URL}/api/health`)
    if (!response.ok) {
      return { accessible: false, error: `HTTP ${response.status}` }
    }
    return { accessible: true }
  } catch (error) {
    return { accessible: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function checkGrafanaAuth(): Promise<{ accessible: boolean; error?: string }> {
  try {
    const response = await gatewayFetch(`${GRAFANA_URL}/api/user`)
    if (!response.ok) {
      return { accessible: false, error: `Auth failed: HTTP ${response.status}` }
    }
    return { accessible: true }
  } catch (error) {
    return { accessible: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export function getGrafanaUrl(): string {
  return 'http://100.113.214.55:3000'
}
