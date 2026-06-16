import { useEffect } from 'react'
import { useAuth } from '../store/auth'

export function useAutoToken() {
  const { gatewayToken, setGatewayToken } = useAuth()

  useEffect(() => {
    // Si un token est déjà présent, ne rien faire
    if (gatewayToken) return

    // Obtenir un token automatiquement
    const fetchToken = async () => {
      try {
        // Construire l'URL absolue pour éviter les problèmes de CORS/redirects
        const protocol = window.location.protocol
        const host = window.location.host
        const baseUrl = `${protocol}//${host}`

        // Pour les URLs relatives, utiliser /auth/simple-token directement
        // Pour HTTPS via IP, Caddy se charge du routage
        const tokenUrl = '/auth/simple-token'

        const response = await fetch(tokenUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          console.warn(`⚠️  Token fetch failed: ${response.status}`)
          return
        }

        const data = await response.json()
        if (data.token) {
          setGatewayToken(data.token)
          console.log('✅ Auto-token obtained:', data.token.substring(0, 30) + '...')
        }
      } catch (error) {
        console.error('❌ Failed to auto-obtain token:', error)
        // Continue silencieusement - l'app fonctionnera sans token
      }
    }

    fetchToken()
  }, [gatewayToken, setGatewayToken])
}
