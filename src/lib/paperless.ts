import { gatewayFetch } from './gateway'

export interface PaperlessDocument {
  id: number
  title: string
  content: string
  created: string
  added: string
  modified: string
  document_type?: number
  correspondent?: number
  tags: number[]
  storage_path?: number
  notes: string
  archive_serial_number?: string
  original_file_name?: string
}

export interface PaperlessCorrespondent {
  id: number
  name: string
  slug: string
  match?: string
  is_insensitive?: boolean
}

export interface PaperlessTag {
  id: number
  name: string
  slug: string
  color?: string
  match?: string
  is_insensitive?: boolean
}

export interface PaperlessDocumentType {
  id: number
  name: string
  slug: string
  match?: string
  is_insensitive?: boolean
}

export interface PaperlessListResponse<T> {
  count: number
  next?: string
  previous?: string
  results: T[]
}

const API_BASE = '/paperless'

export async function getDocuments(
  page = 1,
  pageSize = 50,
): Promise<PaperlessListResponse<PaperlessDocument>> {
  const url = `${API_BASE}/documents/?page=${page}&page_size=${pageSize}`
  try {
    const res = await gatewayFetch(url)
    if (!res.ok) {
      const errorData = await res.text()
      throw new Error(
        `HTTP ${res.status}: ${res.statusText}. ${errorData.slice(0, 100)}`,
      )
    }
    return res.json()
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Network error fetching documents. Check if API gateway is accessible.`,
      )
    }
    throw error
  }
}

export async function getDocument(id: number): Promise<PaperlessDocument> {
  const res = await gatewayFetch(`${API_BASE}/documents/${id}/`)
  if (!res.ok) throw new Error('Failed to fetch document')
  return res.json()
}

export async function getCorrespondents(): Promise<PaperlessListResponse<PaperlessCorrespondent>> {
  const res = await gatewayFetch(`${API_BASE}/correspondents/`)
  if (!res.ok) throw new Error('Failed to fetch correspondents')
  return res.json()
}

export async function getTags(): Promise<PaperlessListResponse<PaperlessTag>> {
  const res = await gatewayFetch(`${API_BASE}/tags/`)
  if (!res.ok) throw new Error('Failed to fetch tags')
  return res.json()
}

export async function getDocumentTypes(): Promise<PaperlessListResponse<PaperlessDocumentType>> {
  const res = await gatewayFetch(`${API_BASE}/document_types/`)
  if (!res.ok) throw new Error('Failed to fetch document types')
  return res.json()
}

export async function searchDocuments(query: string): Promise<PaperlessListResponse<PaperlessDocument>> {
  const res = await gatewayFetch(
    `${API_BASE}/documents/?search=${encodeURIComponent(query)}`,
  )
  if (!res.ok) throw new Error('Failed to search documents')
  return res.json()
}

export async function uploadDocument(file: File, title?: string): Promise<PaperlessDocument> {
  const formData = new FormData()
  formData.append('document', file)
  if (title) formData.append('title', title)

  const res = await gatewayFetch(`${API_BASE}/documents/post_document/`, {
    method: 'POST',
    headers: {},
    body: formData,
  })
  if (!res.ok) throw new Error('Failed to upload document')
  return res.json()
}

export async function getAllDocuments(): Promise<PaperlessDocument[]> {
  const allDocs: PaperlessDocument[] = []
  let page = 1
  const pageSize = 100

  while (true) {
    const res = await gatewayFetch(
      `${API_BASE}/documents/?page=${page}&page_size=${pageSize}`,
    )
    if (!res.ok) break

    const data: PaperlessListResponse<PaperlessDocument> = await res.json()
    allDocs.push(...data.results)

    if (!data.next) break
    page++
  }

  return allDocs
}
