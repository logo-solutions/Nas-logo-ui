import { useAuth } from '../store/auth'

export function gatewayFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = useAuth.getState().gatewayToken

  // Construire l'URL du gateway
  const protocol = window.location.protocol
  const host = window.location.hostname
  const url = `${protocol}//${host}:8000${path}`

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}
