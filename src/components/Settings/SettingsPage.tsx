import { useState, useEffect } from 'react'
import { useAuth } from '../../store/auth'
import { checkHealth, type HealthStatus } from '../../lib/healthcheck'
import { indexDocuments, indexPhotos, setMeilisearchKey as initMeilisearchKey } from '../../lib/meilisearch'
import { getAllDocuments, setPaperlessToken as initPaperlessToken } from '../../lib/paperless'
import { getAllPhotos, setImmichApiKey as initImmichApiKey } from '../../lib/immich'

export default function SettingsPage() {
  const { immichApiKey, paperlessToken, meilisearchKey, setImmichApiKey, setPaperlessToken, setMeilisearchKey, clearAuth } = useAuth()
  const [immichKey, setImmichKey] = useState(immichApiKey)
  const [paperlessTokenInput, setPaperlessTokenInput] = useState(paperlessToken)
  const [meilisearchKeyInput, setMeilisearchKeyInput] = useState(meilisearchKey)
  const [showSuccess, setShowSuccess] = useState(false)
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [isCheckingHealth, setIsCheckingHealth] = useState(false)
  const [isIndexing, setIsIndexing] = useState(false)
  const [indexMessage, setIndexMessage] = useState('')

  useEffect(() => {
    const runHealthCheck = async () => {
      setIsCheckingHealth(true)
      try {
        const status = await checkHealth(immichApiKey, paperlessToken, meilisearchKey)
        setHealth(status)
      } catch (error) {
        console.error('Health check failed:', error)
      } finally {
        setIsCheckingHealth(false)
      }
    }
    runHealthCheck()
  }, [immichApiKey, paperlessToken, meilisearchKey])

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

  const handleIndexContent = async () => {
    if (!meilisearchKey || !immichApiKey || !paperlessToken) {
      setIndexMessage('Please configure all services first')
      return
    }

    setIsIndexing(true)
    setIndexMessage('Starting indexing...')

    try {
      // Initialize API clients with credentials
      initPaperlessToken(paperlessToken)
      initImmichApiKey(immichApiKey)
      initMeilisearchKey(meilisearchKey)

      setIndexMessage('Fetching documents...')
      const docs = await getAllDocuments()
      setIndexMessage(`Indexing ${docs.length} documents...`)
      await indexDocuments(docs)

      setIndexMessage('Fetching photos...')
      const photos = await getAllPhotos()
      setIndexMessage(`Indexing ${photos.length} photos...`)
      await indexPhotos(photos)

      setIndexMessage(`✓ Indexed ${docs.length + photos.length} items`)
      setTimeout(() => setIndexMessage(''), 3000)
    } catch (error) {
      setIndexMessage(
        `Error: ${error instanceof Error ? error.message : 'Failed to index'}`,
      )
    } finally {
      setIsIndexing(false)
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

        <div className="space-y-2">
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
          <div className="flex gap-2 items-center text-xs">
            <span className="text-gray-500 dark:text-gray-400">Get API key at:</span>
            <a
              href="http://100.113.214.55:2283/user/me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Immich Settings
            </a>
          </div>
          <a
            href="http://100.113.214.55:2283"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            📷 Open Immich
          </a>
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

        <div className="space-y-2">
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
          <div className="flex gap-2 items-center text-xs">
            <span className="text-gray-500 dark:text-gray-400">Get API token at:</span>
            <a
              href="http://100.113.214.55:8010/admin/authtoken/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Token Admin
            </a>
          </div>
          <a
            href="http://100.113.214.55:8010"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            📄 Open Paperless
          </a>
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
          <div className="space-y-2">
            <p className="text-xs text-green-600 dark:text-green-400">✓ Configured</p>
            <button
              onClick={handleIndexContent}
              disabled={isIndexing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isIndexing ? 'Indexing...' : '📑 Index All Content'}
            </button>
            {indexMessage && (
              <p className={`text-xs ${indexMessage.startsWith('✓') ? 'text-green-600 dark:text-green-400' : indexMessage.startsWith('Error') ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                {indexMessage}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Service Status */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Service Status</h3>
          {isCheckingHealth && <span className="text-xs text-gray-500">Checking...</span>}
        </div>

        <div className="space-y-3">
          {/* Immich */}
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900 dark:text-white">Immich</span>
              <span
                className={
                  !immichApiKey
                    ? 'text-gray-500 text-sm'
                    : health?.immich.accessible
                      ? 'text-green-600 dark:text-green-400 text-sm'
                      : 'text-red-600 dark:text-red-400 text-sm'
                }
              >
                {!immichApiKey
                  ? '○ Not configured'
                  : health?.immich.accessible
                    ? '✓ Connected'
                    : `✗ ${health?.immich.error || 'Unreachable'}`}
              </span>
            </div>
            {immichApiKey && !health?.immich.accessible && health?.immich.error && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {health.immich.error}
              </p>
            )}
          </div>

          {/* Paperless */}
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900 dark:text-white">Paperless-ngx</span>
              <span
                className={
                  !paperlessToken
                    ? 'text-gray-500 text-sm'
                    : health?.paperless.accessible
                      ? 'text-green-600 dark:text-green-400 text-sm'
                      : 'text-red-600 dark:text-red-400 text-sm'
                }
              >
                {!paperlessToken
                  ? '○ Not configured'
                  : health?.paperless.accessible
                    ? '✓ Connected'
                    : `✗ ${health?.paperless.error || 'Unreachable'}`}
              </span>
            </div>
            {paperlessToken && !health?.paperless.accessible && health?.paperless.error && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {health.paperless.error}
              </p>
            )}
          </div>

          {/* Meilisearch */}
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900 dark:text-white">Meilisearch</span>
              <span
                className={
                  !meilisearchKey
                    ? 'text-gray-500 text-sm'
                    : health?.meilisearch.accessible
                      ? 'text-green-600 dark:text-green-400 text-sm'
                      : 'text-red-600 dark:text-red-400 text-sm'
                }
              >
                {!meilisearchKey
                  ? '○ Not configured'
                  : health?.meilisearch.accessible
                    ? '✓ Connected'
                    : `✗ ${health?.meilisearch.error || 'Unreachable'}`}
              </span>
            </div>
            {meilisearchKey && !health?.meilisearch.accessible && health?.meilisearch.error && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {health.meilisearch.error}
              </p>
            )}
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
