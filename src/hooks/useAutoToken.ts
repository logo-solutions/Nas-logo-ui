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
        const protocol = window.location.protocol
        const hostname = window.location.hostname

        // Déterminer l'URL du token endpoint
        let tokenUrl: string
        if (protocol === 'https:' && hostname !== 'localhost' && hostname !== '127.0.0.1') {
          // HTTPS via domaine - utiliser Caddy proxy
          tokenUrl = `/auth/simple-token`
        } else {
          // HTTP local - appeler gateway directement sur port 8000
          tokenUrl = `${protocol}//${hostname}:8000/auth/simple-token`
        }

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
