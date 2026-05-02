import { useQuery } from '@tanstack/react-query'
import { getDocuments, getCorrespondents, getTags } from '../lib/paperless'

export function useDocuments(page = 1) {
  return useQuery({
    queryKey: ['documents', page],
    queryFn: () => getDocuments(page, 50),
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
