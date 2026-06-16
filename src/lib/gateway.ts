import { useAuth } from '../store/auth'

export function gatewayFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = useAuth.getState().gatewayToken

  // Appeler le gateway directement sur le port 8000
  // Bypass Caddy pour éviter les problèmes de routing
  const baseUrl = `http://${window.location.hostname}:8000`
  const url = `${baseUrl}${path}`

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}
