import { useState } from 'react'
import { useDocuments, useCorrespondents } from '../../hooks/useDocuments'
import DocumentList from './DocumentList'

export default function DocumentsPage() {
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const { data: documentsData, isLoading, error } = useDocuments(page)
  const { data: correspondentsData } = useCorrespondents()

  const hasToken = !!localStorage.getItem('paperless_token')
  const documents = documentsData?.results || []
  const totalCount = documentsData?.count || 0

  if (!hasToken) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Please configure Paperless API token in settings
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          Error loading documents: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }

  const maxPages = Math.ceil(totalCount / 50)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {totalCount} documents total
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Search
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
          All
        </button>
        {correspondentsData?.results.slice(0, 5).map((correspondent) => (
          <button
            key={correspondent.id}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
          >
            {correspondent.name}
          </button>
        ))}
      </div>

      {/* Document List */}
      <DocumentList documents={documents} isLoading={isLoading} />

      {/* Pagination */}
      {maxPages > 1 && (
        <div className="flex justify-between items-center">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {maxPages}
          </span>
          <button
            onClick={() => setPage(Math.min(maxPages, page + 1))}
            disabled={page === maxPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
