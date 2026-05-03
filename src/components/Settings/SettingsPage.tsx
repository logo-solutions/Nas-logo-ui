import { useState, useEffect } from 'react'
import { useAuth } from '../../store/auth'
import { checkHealth, type HealthStatus } from '../../lib/healthcheck'

export default function SettingsPage() {
  const { gatewayToken, setGatewayToken } = useAuth()
  const [tokenInput, setTokenInput] = useState(gatewayToken)
  const [showSuccess, setShowSuccess] = useState(false)
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

  const handleSaveToken = () => {
    if (tokenInput.trim()) {
      setGatewayToken(tokenInput)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }
  }


  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure API Gateway access
        </p>
      </div>

      {showSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-700 dark:text-green-400">✓ Saved successfully</p>
        </div>
      )}

      {/* Gateway Token Settings */}
      <div className="card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Gateway Token</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Centralized authentication for all services</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Gateway Token
          </label>
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Enter your API Gateway token"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Get from your NAS-logo API Gateway at http://100.113.214.55:8000
          </p>
        </div>

        <button
          onClick={handleSaveToken}
          disabled={!tokenInput.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Save Gateway Token
        </button>

        {gatewayToken && (
          <p className="text-xs text-green-600 dark:text-green-400">✓ Configured</p>
        )}
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
