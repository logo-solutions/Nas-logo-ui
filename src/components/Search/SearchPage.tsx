import { useState } from 'react'
import { useSearch } from '../../hooks/useSearch'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const { data: results, isLoading, error } = useSearch(query)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Search</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Full-text search across all your documents and photos
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search photos, documents... (min 3 chars)"
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Results */}
      {query.length < 3 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Enter at least 3 characters to start searching
          </p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">
            Search failed: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      ) : !results || results.hits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No results found for "{query}"
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Found {results.estimatedTotalHits} results
          </p>

          <div className="space-y-3">
            {results.hits.map((hit: any, index: number) => (
              <button
                key={`${hit.id}-${index}`}
                className="w-full text-left p-4 card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {hit.title || hit.fileName || 'Untitled'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                      {hit.content || hit.description || ''}
                    </p>
                    {(hit.created || hit.fileCreatedAt) && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        📅 {new Date(hit.created || hit.fileCreatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-2xl ml-4">
                    {hit.type === 'document' || hit.fileName?.endsWith('.pdf')
                      ? '📄'
                      : '📷'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
