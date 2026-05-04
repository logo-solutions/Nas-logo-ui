import { gatewayFetch } from './gateway'

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

const API_BASE = '/immich'

export async function getServerInfo(): Promise<ImmichServerInfo> {
  const res = await gatewayFetch(`${API_BASE}/server/version`)
  if (!res.ok) throw new Error('Failed to get server info')
  return res.json()
}

export async function getPhotos(
  skip = 0,
  take = 50,
  sortBy: 'newest' | 'oldest' = 'newest',
  startDate?: string,
  endDate?: string,
): Promise<ImmichPhoto[]> {
  try {
    const allAssets: ImmichPhoto[] = []
    let albumPage = 0
    const albumsPerPage = 100

    while (true) {
      const albumRes = await gatewayFetch(
        `${API_BASE}/albums?skip=${albumPage * albumsPerPage}&take=${albumsPerPage}`,
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

      for (const album of albums) {
        const assetRes = await gatewayFetch(`${API_BASE}/albums/${album.id}`)
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

    let filtered = allAssets
    if (startDate || endDate) {
      filtered = allAssets.filter((asset) => {
        const date = new Date(asset.fileCreatedAt)
        if (startDate && date < new Date(startDate)) return false
        if (endDate && date > new Date(endDate)) return false
        return true
      })
    }

    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.fileCreatedAt).getTime()
      const dateB = new Date(b.fileCreatedAt).getTime()
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB
    })

    return sorted.slice(skip, skip + take)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Network error fetching photos. Check if API gateway is accessible.`,
      )
    }
    throw error
  }
}

export async function getAlbums(): Promise<ImmichAlbum[]> {
  const res = await gatewayFetch(`${API_BASE}/albums`)
  if (!res.ok) throw new Error('Failed to fetch albums')
  return res.json()
}

export async function getAlbum(id: string): Promise<ImmichAlbum> {
  const res = await gatewayFetch(`${API_BASE}/albums/${id}`)
  if (!res.ok) throw new Error('Failed to fetch album')
  return res.json()
}

export function getPhotoThumbnailUrl(photoId: string, size = 'preview'): string {
  return `/api${API_BASE}/assets/${photoId}/thumbnail?size=${size}`
}

export async function login(email: string, password: string): Promise<{ accessToken: string }> {
  const res = await gatewayFetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Login failed')
  return res.json()
}

export async function getAllPhotos(): Promise<ImmichPhoto[]> {
  const allAssets: ImmichPhoto[] = []
  let albumPage = 0
  const albumsPerPage = 100

  while (true) {
    const albumRes = await gatewayFetch(
      `${API_BASE}/albums?skip=${albumPage * albumsPerPage}&take=${albumsPerPage}`,
    )
    if (!albumRes.ok) break

    const albums = await albumRes.json()
    if (!Array.isArray(albums) || albums.length === 0) break

    for (const album of albums) {
      const assetRes = await gatewayFetch(`${API_BASE}/albums/${album.id}`)
      if (assetRes.ok) {
        const albumData = await assetRes.json()
        const assets = albumData.assets || []
        allAssets.push(...assets)
      }
    }

    if (albums.length < albumsPerPage) break
    albumPage++
  }

  return allAssets
}

export interface GalleryShareResponse {
  shareToken: string
  galleryUrl: string
  expiresAt: string
}

export async function generateGalleryShare(
  albumId: string,
  expiresIn: string = '30d',
): Promise<GalleryShareResponse> {
  const res = await gatewayFetch('/gallery/share', {
    method: 'POST',
    body: JSON.stringify({ albumId, expiresIn }),
  })
  if (!res.ok) throw new Error('Failed to generate gallery share')
  return res.json()
}
