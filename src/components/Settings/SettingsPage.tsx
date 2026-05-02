import { useState } from 'react'
import { useAuth } from '../../store/auth'

export default function SettingsPage() {
  const { immichApiKey, paperlessToken, meilisearchKey, setImmichApiKey, setPaperlessToken, setMeilisearchKey, clearAuth } = useAuth()
  const [immichKey, setImmichKey] = useState(immichApiKey)
  const [paperlessTokenInput, setPaperlessTokenInput] = useState(paperlessToken)
  const [meilisearchKeyInput, setMeilisearchKeyInput] = useState(meilisearchKey)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSaveImmich = () => {
    if (immichKey.trim()) {
      setImmichApiKey(immichKey)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }
  }

  const handleSavePaperless = () => {
    if (paperlessTokenInput.trim()) {
      setPaperlessToken(paperlessTokenInput)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }
  }

  const handleSaveMeilisearch = () => {
    if (meilisearchKeyInput.trim()) {
      setMeilisearchKey(meilisearchKeyInput)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }
  }

  const handleClearAll = () => {
    if (confirm('Are you sure? This will clear all API credentials.')) {
      clearAuth()
      setImmichKey('')
      setPaperlessTokenInput('')
      setMeilisearchKeyInput('')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure API credentials for your services
        </p>
      </div>

      {showSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-700 dark:text-green-400">✓ Saved successfully</p>
        </div>
      )}

      {/* Immich Settings */}
      <div className="card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Immich</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Photos management</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            API Key
          </label>
          <input
            type="password"
            value={immichKey}
            onChange={(e) => setImmichKey(e.target.value)}
            placeholder="Enter your Immich API key"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Available at: http://100.113.214.55:2283/user/me
          </p>
        </div>

        <button
          onClick={handleSaveImmich}
          disabled={!immichKey.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Save Immich Credentials
        </button>

        {immichApiKey && (
          <p className="text-xs text-green-600 dark:text-green-400">✓ Configured</p>
        )}
      </div>

      {/* Paperless Settings */}
      <div className="card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Paperless-ngx</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Documents management</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            API Token
          </label>
          <input
            type="password"
            value={paperlessTokenInput}
            onChange={(e) => setPaperlessTokenInput(e.target.value)}
            placeholder="Enter your Paperless API token"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Available at: http://100.113.214.55:8010/admin/authtoken/
          </p>
        </div>

        <button
          onClick={handleSavePaperless}
          disabled={!paperlessTokenInput.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Save Paperless Credentials
        </button>

        {paperlessToken && (
          <p className="text-xs text-green-600 dark:text-green-400">✓ Configured</p>
        )}
      </div>

      {/* Meilisearch Settings */}
      <div className="card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meilisearch</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Full-text search</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Master Key
          </label>
          <input
            type="password"
            value={meilisearchKeyInput}
            onChange={(e) => setMeilisearchKeyInput(e.target.value)}
            placeholder="Enter your Meilisearch master key"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Get from: http://100.113.214.55:7700/
          </p>
        </div>

        <button
          onClick={handleSaveMeilisearch}
          disabled={!meilisearchKeyInput.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Save Meilisearch Credentials
        </button>

        {meilisearchKey && (
          <p className="text-xs text-green-600 dark:text-green-400">✓ Configured</p>
        )}
      </div>

      {/* Service Status */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Service Status</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded">
            <span>Immich</span>
            <span className={immichApiKey ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
              {immichApiKey ? '✓ Connected' : '○ Not configured'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded">
            <span>Paperless-ngx</span>
            <span className={paperlessToken ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
              {paperlessToken ? '✓ Connected' : '○ Not configured'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded">
            <span>Meilisearch</span>
            <span className={meilisearchKey ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
              {meilisearchKey ? '✓ Connected' : '○ Not configured'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded">
            <span>n8n</span>
            <span className="text-gray-500">○ Coming soon</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded">
            <span>Grafana</span>
            <span className="text-gray-500">○ Coming soon</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card space-y-4 border-red-200 dark:border-red-900">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>

        <button
          onClick={handleClearAll}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Clear All Credentials
        </button>
      </div>
    </div>
  )
}
