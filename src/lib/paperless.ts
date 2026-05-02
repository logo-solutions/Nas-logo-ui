// Paperless-ngx API client
// Base: http://100.113.214.55:8010/api/

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

const API_BASE = 'http://100.113.214.55:8010/api'
const API_TOKEN = localStorage.getItem('paperless_token') || ''

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Token ${API_TOKEN}`,
})

export async function getDocuments(
  page = 1,
  pageSize = 50,
): Promise<PaperlessListResponse<PaperlessDocument>> {
  const res = await fetch(`${API_BASE}/documents/?page=${page}&page_size=${pageSize}`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error('Failed to fetch documents')
  return res.json()
}

export async function getDocument(id: number): Promise<PaperlessDocument> {
  const res = await fetch(`${API_BASE}/documents/${id}/`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error('Failed to fetch document')
  return res.json()
}

export async function getCorrespondents(): Promise<PaperlessListResponse<PaperlessCorrespondent>> {
  const res = await fetch(`${API_BASE}/correspondents/`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error('Failed to fetch correspondents')
  return res.json()
}

export async function getTags(): Promise<PaperlessListResponse<PaperlessTag>> {
  const res = await fetch(`${API_BASE}/tags/`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error('Failed to fetch tags')
  return res.json()
}

export async function getDocumentTypes(): Promise<PaperlessListResponse<PaperlessDocumentType>> {
  const res = await fetch(`${API_BASE}/document_types/`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error('Failed to fetch document types')
  return res.json()
}

export async function searchDocuments(query: string): Promise<PaperlessListResponse<PaperlessDocument>> {
  const res = await fetch(`${API_BASE}/documents/?search=${encodeURIComponent(query)}`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error('Failed to search documents')
  return res.json()
}

export async function uploadDocument(file: File, title?: string): Promise<PaperlessDocument> {
  const formData = new FormData()
  formData.append('document', file)
  if (title) formData.append('title', title)

  const res = await fetch(`${API_BASE}/documents/post_document/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${API_TOKEN}`,
    },
    body: formData,
  })
  if (!res.ok) throw new Error('Failed to upload document')
  return res.json()
}
