import { useAuth } from '../store/auth'

export function gatewayFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = useAuth.getState().gatewayToken

  // Construire l'URL du gateway
  // Si accédé via HTTPS (domaine), utiliser HTTPS pour le gateway aussi
  // Si accédé via HTTP (localhost dev), utiliser HTTP sur port 8000
  const protocol = window.location.protocol
  const hostname = window.location.hostname

  let url: string
  if (protocol === 'https:' && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    // HTTPS via domaine - appeler gateway via Caddy HTTPS
    url = `${protocol}//${hostname}${path}`
  } else {
    // HTTP local ou localhost - appeler gateway directement sur port 8000
    url = `${protocol}//${hostname}:8000${path}`
  }

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}
