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

const API_BASE = 'http://100.113.214.55:2283/api'
const API_KEY = localStorage.getItem('immich_api_key') || ''

const headers = () => ({
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
})

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
  const res = await fetch(`${API_BASE}/search/photos?skip=${skip}&take=${take}`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error('Failed to fetch photos')
  return res.json()
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
