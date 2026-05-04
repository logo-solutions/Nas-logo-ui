import { useState, useEffect } from 'react'
import { getAlbums, type ImmichAlbum } from '../../lib/immich'
import { useAuth } from '../../store/auth'
import { useNavigation } from '../../store/navigation'

interface GalleryShare {
  shareToken: string
  galleryUrl: string
  expiresAt: string
}

export default function GalleryGeneratorPage() {
  const { gatewayToken, isHydrated } = useAuth()
  const [albums, setAlbums] = useState<ImmichAlbum[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setCurrentPage } = useNavigation()
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [shares, setShares] = useState<Map<string, GalleryShare>>(new Map())
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (!isHydrated) {
      setLoading(true)
      return
    }
    if (gatewayToken) {
      loadAlbums()
    } else {
      setLoading(false)
    }
  }, [isHydrated, gatewayToken])

  const loadAlbums = async () => {
    try {
      setLoading(true)
      if (!gatewayToken) {
        setError('Please login first')
        setLoading(false)
        return
      }
      const data = await getAlbums()
      setAlbums(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load albums')
    } finally {
      setLoading(false)
    }
  }

  const generateShareLink = async (albumId: string) => {
    try {
      setGenerating(true)
      const response = await fetch('/api/gallery/share', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${gatewayToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          albumId,
          expiresIn: '30d',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate share link')
      }

      const data = await response.json()
      shares.set(albumId, {
        shareToken: data.shareToken,
        galleryUrl: `${window.location.origin}/api${data.galleryUrl}`,
        expiresAt: data.expiresAt,
      })
      setShares(new Map(shares))
      setSelectedAlbum(albumId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate share link')
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = (url: string, albumId: string) => {
    navigator.clipboard.writeText(url)
    setCopied(albumId)
    setTimeout(() => setCopied(null), 2000)
  }

  const downloadGallery = async (galleryUrl: string, albumName: string) => {
    try {
      const response = await fetch(galleryUrl)
      if (!response.ok) throw new Error('Failed to fetch gallery')
      const html = await response.text()
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${albumName}.html`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download gallery')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gallery Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create shareable web galleries from your Immich albums
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-400">{error}</p>
          {!gatewayToken && (
            <button
              onClick={() => setCurrentPage('settings')}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
            >
              Configure Token in Settings
            </button>
          )}
        </div>
      )}

      {!isHydrated ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Initializing...</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading albums...</p>
        </div>
      ) : albums.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">No albums found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {albums.map((album) => {
            const share = shares.get(album.id)
            const expiresDate = share ? new Date(share.expiresAt) : null

            return (
              <div
                key={album.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {album.albumName}
                    </h3>
                    {album.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {album.description}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      📸 {album.assetCount} photos
                    </p>

                    {share && (
                      <div className="mt-4 space-y-3">
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            Share URL (expires {expiresDate?.toLocaleDateString()}):
                          </p>
                          <div className="flex gap-2">
                            <code className="flex-1 text-xs bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                              {share.galleryUrl}
                            </code>
                            <button
                              onClick={() => copyToClipboard(share.galleryUrl, album.id)}
                              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded font-medium transition-colors whitespace-nowrap"
                            >
                              {copied === album.id ? '✓ Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              downloadGallery(share.galleryUrl, album.albumName)
                            }
                            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors text-sm"
                          >
                            📥 Download HTML
                          </button>
                          <button
                            onClick={() =>
                              window.open(share.galleryUrl, '_blank')
                            }
                            className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium transition-colors text-sm"
                          >
                            👁️ Preview
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {!share && (
                    <button
                      onClick={() => generateShareLink(album.id)}
                      disabled={generating}
                      className="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded font-medium transition-colors whitespace-nowrap"
                    >
                      {generating && selectedAlbum === album.id
                        ? 'Generating...'
                        : 'Generate Gallery'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
