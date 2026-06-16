import { useAuth } from '../store/auth'

export function gatewayFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = useAuth.getState().gatewayToken

  // Construire l'URL en fonction du contexte
  let url: string

  if (path.startsWith('http')) {
    url = path
  } else {
    // Utiliser une URL relative - Caddy/serveur se charge du routage
    // En local: Caddy → gateway sur port 8000
    // En production: Caddy reverse proxy → gateway
    url = path
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
