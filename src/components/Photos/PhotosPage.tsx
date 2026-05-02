import { useState } from 'react'
import { usePhotos } from '../../hooks/usePhotos'
import PhotoGrid from './PhotoGrid'

export default function PhotosPage() {
  const [skip, setSkip] = useState(0)
  const { data: photos = [], isLoading, error } = usePhotos(skip, 50)
  const hasApiKey = !!localStorage.getItem('immich_api_key')

  if (!hasApiKey) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Please configure Immich API key in settings
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          Error loading photos: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Photos</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {photos.length} photos
        </p>
      </div>

      <PhotoGrid photos={photos} isLoading={isLoading} />

      {photos.length > 0 && (
        <div className="flex justify-between items-center">
          <button
            onClick={() => setSkip(Math.max(0, skip - 50))}
            disabled={skip === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {Math.floor(skip / 50) + 1}
          </span>
          <button
            onClick={() => setSkip(skip + 50)}
            disabled={photos.length < 50}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
