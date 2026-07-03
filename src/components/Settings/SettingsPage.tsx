import { useState, useEffect } from 'react'
import { useAuth } from '../../store/auth'
import { checkHealth, type HealthStatus } from '../../lib/healthcheck'

export default function SettingsPage() {
  const { gatewayToken } = useAuth()
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [isCheckingHealth, setIsCheckingHealth] = useState(false)

  useEffect(() => {
    const runHealthCheck = async () => {
      setIsCheckingHealth(true)
      try {
        const status = await checkHealth()
        setHealth(status)
      } catch (error) {
        console.error('Health check failed:', error)
      } finally {
        setIsCheckingHealth(false)
      }
    }
    runHealthCheck()
  }, [gatewayToken])


  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">
          API Gateway auto-connected
        </p>
      </div>

      {/* Gateway Token Status */}
      <div className="card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Gateway</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Centralized authentication for all services</p>
        </div>

        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-900 dark:text-white font-medium">Gateway Token</span>
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">
              ✓ Auto-connected
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Token automatically obtained from gateway on startup
          </p>
        </div>
      </div>

      {/* Service Status */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Service Status</h3>
          {isCheckingHealth && <span className="text-xs text-gray-500">Checking...</span>}
        </div>

        <div className="space-y-3">
          {['immich', 'paperless', 'meilisearch', 'n8n', 'grafana', 'ntfy'].map((service) => (
            <div key={service} className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white capitalize">{service}</span>
                <span
                  className={
                    health?.[service as keyof HealthStatus]?.accessible
                      ? 'text-green-600 dark:text-green-400 text-sm'
                      : 'text-red-600 dark:text-red-400 text-sm'
                  }
                >
                  {health?.[service as keyof HealthStatus]?.accessible ? '✓ Connected' : '✗ Unreachable'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
