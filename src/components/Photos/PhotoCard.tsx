import { useState, useEffect } from 'react'
import { getPhotoThumbnailUrl, type ImmichPhoto } from '../../lib/immich'
import { useAuth } from '../../store/auth'

interface PhotoCardProps {
  photo: ImmichPhoto
  onClick?: (photo: ImmichPhoto) => void
}

export default function PhotoCard({ photo, onClick }: PhotoCardProps) {
  const { immichApiKey } = useAuth()
  const [imageUrl, setImageUrl] = useState<string>('')
  const [imageError, setImageError] = useState(false)
  const date = new Date(photo.fileCreatedAt).toLocaleDateString()

  useEffect(() => {
    const loadImage = async () => {
      try {
        const res = await fetch(getPhotoThumbnailUrl(photo.id, 'preview'), {
          headers: { 'x-api-key': immichApiKey },
        })
        if (res.ok) {
          const blob = await res.blob()
          setImageUrl(URL.createObjectURL(blob))
        } else {
          setImageError(true)
        }
      } catch (error) {
        setImageError(true)
      }
    }

    if (immichApiKey) {
      loadImage()
    }
  }, [immichApiKey, photo.id])

  return (
    <button
      onClick={() => onClick?.(photo)}
      className="group relative aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 hover:shadow-lg transition-all duration-300"
      aria-label={`Photo from ${date}`}
    >
      {!imageError && imageUrl ? (
        <img
          src={imageUrl}
          alt={photo.fileName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          ✕
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="font-semibold">{date}</p>
        {photo.exifInfo?.model && (
          <p className="text-gray-200 truncate">{photo.exifInfo.model}</p>
        )}
      </div>

      {photo.isFavorite && (
        <div className="absolute top-2 right-2">
          <span className="text-xl">❤️</span>
        </div>
      )}

      {photo.isArchived && (
        <div className="absolute top-2 left-2">
          <span className="text-xs bg-gray-900/50 text-white px-2 py-1 rounded">
            Archived
          </span>
        </div>
      )}
    </button>
  )
}
