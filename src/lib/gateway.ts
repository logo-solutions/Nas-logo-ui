import { useAuth } from '../store/auth'

export function gatewayFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = useAuth.getState().gatewayToken

  // Détecter le gateway correctement
  let baseUrl = ''

  if (path.startsWith('http')) {
    // URL complète
    baseUrl = ''
  } else if (path.startsWith('/auth')) {
    // /auth/* appelle le gateway directement
    baseUrl = `http://${window.location.hostname}:8000`
  } else if (path.startsWith('/api')) {
    // /api/* appelle le gateway via proxy
    baseUrl = ''
  } else {
    baseUrl = ''
  }

  const url = baseUrl ? `${baseUrl}${path}` : path

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}
