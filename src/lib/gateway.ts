import { useAuth } from '../store/auth'

export function gatewayFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = useAuth.getState().gatewayToken
  return fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}
