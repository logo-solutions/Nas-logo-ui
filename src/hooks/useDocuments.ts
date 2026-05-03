import { useQuery } from '@tanstack/react-query'
import { getDocuments, getCorrespondents, getTags, searchDocuments } from '../lib/paperless'

export function useDocuments(page = 1, searchQuery?: string) {
  return useQuery({
    queryKey: ['documents', page, searchQuery],
    queryFn: () => searchQuery ? searchDocuments(searchQuery) : getDocuments(page, 50),
    enabled: !!localStorage.getItem('paperless_token'),
  })
}

export function useCorrespondents() {
  return useQuery({
    queryKey: ['correspondents'],
    queryFn: getCorrespondents,
    enabled: !!localStorage.getItem('paperless_token'),
  })
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
    enabled: !!localStorage.getItem('paperless_token'),
  })
}
