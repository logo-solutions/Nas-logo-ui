const API_BASE = '/api/n8n/api/v1'
let API_KEY = ''

export function setN8nApiKey(key: string) {
  API_KEY = key
}

export interface N8nTag {
  name: string
}

export interface N8nWorkflow {
  id: string
  name: string
  active: boolean
  updatedAt: string
  tags?: N8nTag[]
}

export interface N8nExecution {
  id: string
  finished: boolean
  mode: string
  startedAt: string
  stoppedAt?: string
  workflowId: string
}

export interface N8nListResponse<T> {
  data: T[]
  nextCursor?: string
}

function headers() {
  if (!API_KEY) throw new Error('n8n API key not configured')
  return {
    'X-N8N-API-KEY': API_KEY,
    'Content-Type': 'application/json',
  }
}

export async function getWorkflows(): Promise<N8nWorkflow[]> {
  try {
    const response = await fetch(`${API_BASE}/workflows`, {
      headers: headers(),
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const data = (await response.json()) as N8nListResponse<N8nWorkflow>
    return data.data || []
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('n8n connection failed')
    }
    throw error
  }
}

export async function activateWorkflow(id: string): Promise<N8nWorkflow> {
  try {
    const response = await fetch(`${API_BASE}/workflows/${id}/activate`, {
      method: 'PATCH',
      headers: headers(),
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return (await response.json()) as N8nWorkflow
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('n8n connection failed')
    }
    throw error
  }
}

export async function deactivateWorkflow(id: string): Promise<N8nWorkflow> {
  try {
    const response = await fetch(`${API_BASE}/workflows/${id}/deactivate`, {
      method: 'PATCH',
      headers: headers(),
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return (await response.json()) as N8nWorkflow
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('n8n connection failed')
    }
    throw error
  }
}

export async function executeWorkflow(id: string): Promise<N8nExecution> {
  try {
    const response = await fetch(`${API_BASE}/workflows/${id}/run`, {
      method: 'POST',
      headers: headers(),
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return (await response.json()) as N8nExecution
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('n8n connection failed')
    }
    throw error
  }
}

export async function getExecutions(limit = 10): Promise<N8nExecution[]> {
  try {
    const response = await fetch(`${API_BASE}/executions?limit=${limit}`, {
      headers: headers(),
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const data = (await response.json()) as N8nListResponse<N8nExecution>
    return data.data || []
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('n8n connection failed')
    }
    throw error
  }
}
