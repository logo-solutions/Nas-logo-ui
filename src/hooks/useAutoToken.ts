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
        const response = await fetch('/auth/simple-token')
        if (!response.ok) throw new Error('Failed to get token')

        const data = await response.json()
        setGatewayToken(data.token)
        console.log('✅ Auto-token obtained')
      } catch (error) {
        console.error('❌ Failed to auto-obtain token:', error)
      }
    }

    fetchToken()
  }, [gatewayToken, setGatewayToken])
}
