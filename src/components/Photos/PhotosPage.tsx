import { useState, useEffect } from 'react'
import { usePhotos } from '../../hooks/usePhotos'
import { useAuth } from '../../store/auth'
import { setImmichApiKey } from '../../lib/immich'
import PhotoGrid from './PhotoGrid'

export default function PhotosPage() {
  const [skip, setSkip] = useState(0)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const { immichApiKey } = useAuth()
  const { data: photos = [], isLoading, error } = usePhotos(skip, 50, sortBy, startDate, endDate)

  useEffect(() => {
    if (immichApiKey) {
      setImmichApiKey(immichApiKey)
    }
  }, [])

  const hasApiKey = !!immichApiKey
  const currentPage = Math.floor(skip / 50) + 1

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
          Page {currentPage} · Showing 50 photos per page · Sort: {sortBy === 'newest' ? '📅 Newest first' : '📅 Oldest first'}
        </p>
      </div>

      {/* Filters and Sorting */}
      <div className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'newest' | 'oldest')
                setSkip(0)
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">📅 Newest first</option>
              <option value="oldest">📅 Oldest first</option>
            </select>
          </div>

          {/* Date range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setSkip(0)
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setSkip(0)
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Clear filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setStartDate('')
                setEndDate('')
                setSkip(0)
              }}
              className="w-full px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Clear filters
            </button>
          </div>
        </div>
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
            Page {currentPage}
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
