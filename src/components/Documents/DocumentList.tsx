import { PaperlessDocument } from '../../lib/paperless'

interface DocumentListProps {
  documents: PaperlessDocument[]
  isLoading?: boolean
}

export default function DocumentList({ documents, isLoading }: DocumentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No documents found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => {
        const created = new Date(doc.created).toLocaleDateString()
        return (
          <button
            key={doc.id}
            className="w-full text-left p-4 card hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                  {doc.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                  {doc.content}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                  <span>📅 {created}</span>
                  {doc.tags.length > 0 && (
                    <span>🏷️ {doc.tags.length} tags</span>
                  )}
                </div>
              </div>
              <div className="text-2xl ml-4">📄</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
