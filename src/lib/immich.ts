// Immich API client
// Base: http://100.113.214.55:2283/api

export interface ImmichPhoto {
  id: string
  fileCreatedAt: string
  fileModifiedAt: string
  updatedAt: string
  fileName: string
  type: string
  mimeType: string
  hasMetadata: boolean
  exifInfo?: {
    make?: string
    model?: string
    exifImageWidth?: number
    exifImageHeight?: number
    lat?: number
    lng?: number
    dateTimeOriginal?: string
  }
  smartInfo?: {
    objects: string[]
    tags: string[]
  }
  isFavorite: boolean
  isArchived: boolean
  isOffline: boolean
  albumId?: string
  libraryId: string
  ownerId: string
}

export interface ImmichAlbum {
  id: string
  ownerId: string
  albumName: string
  description?: string
  createdAt: string
  updatedAt: string
  albumThumbnailAssetId?: string
  shared: boolean
  hasSharedLink: boolean
  assetCount: number
  assets?: ImmichPhoto[]
}

export interface ImmichServerInfo {
  version: string
}

const API_BASE = '/api/immich'
let API_KEY = ''

export function setImmichApiKey(key: string) {
  API_KEY = key
}

const headers = () => {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (API_KEY) {
    h['x-api-key'] = API_KEY
  }
  return h
}

export async function getServerInfo(): Promise<ImmichServerInfo> {
  const res = await fetch(`${API_BASE}/server/info`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error('Failed to get server info')
  return res.json()
}

export async function getPhotos(
  skip = 0,
  take = 50,
): Promise<ImmichPhoto[]> {
  if (!API_KEY) {
    throw new Error('Immich API key not configured')
  }

  try {
    // Get all albums (paginate if needed)
    const allAssets: ImmichPhoto[] = []
    let albumPage = 0
    const albumsPerPage = 100

    while (true) {
      const albumRes = await fetch(
        `${API_BASE}/albums?skip=${albumPage * albumsPerPage}&take=${albumsPerPage}`,
        {
          headers: headers(),
        },
      )
      if (!albumRes.ok) {
        throw new Error(
          `Failed to fetch albums: HTTP ${albumRes.status}`,
        )
      }

      const albums = await albumRes.json()
      if (!Array.isArray(albums) || albums.length === 0) {
        break
      }

      // Fetch assets from each album
      for (const album of albums) {
        const assetRes = await fetch(`${API_BASE}/albums/${album.id}`, {
          headers: headers(),
        })
        if (assetRes.ok) {
          const albumData = await assetRes.json()
          const assets = albumData.assets || []
          allAssets.push(...assets)
        }
      }

      if (albums.length < albumsPerPage) {
        break
      }
      albumPage++
    }

    // Apply pagination
    return allAssets.slice(skip, skip + take)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Network error fetching photos. Check if Immich is accessible at ${API_BASE}`,
      )
    }
    throw error
  }
}

export async function getAlbums(): Promise<ImmichAlbum[]> {
  const res = await fetch(`${API_BASE}/albums`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error('Failed to fetch albums')
  return res.json()
}

export async function getAlbum(id: string): Promise<ImmichAlbum> {
  const res = await fetch(`${API_BASE}/albums/${id}`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error('Failed to fetch album')
  return res.json()
}

export function getPhotoThumbnailUrl(photoId: string, size = 'preview'): string {
  return `${API_BASE}/assets/${photoId}/thumbnail?size=${size}&key=${API_KEY}`
}

export async function login(email: string, password: string): Promise<{ accessToken: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Login failed')
  const data = await res.json()
  localStorage.setItem('immich_api_key', data.accessToken)
  return data
}
