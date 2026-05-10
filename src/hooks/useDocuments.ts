import { useQuery } from '@tanstack/react-query'
import { getDocuments, getCorrespondents, getTags, searchDocuments } from '../lib/paperless'
import { useAuth } from '../store/auth'

export function useDocuments(page = 1, searchQuery?: string) {
  const { gatewayToken } = useAuth()
  return useQuery({
    queryKey: ['documents', page, searchQuery],
    queryFn: () => searchQuery ? searchDocuments(searchQuery) : getDocuments(page, 50),
    enabled: !!gatewayToken,
  })
}

export function useCorrespondents() {
  const { gatewayToken } = useAuth()
  return useQuery({
    queryKey: ['correspondents'],
    queryFn: getCorrespondents,
    enabled: !!gatewayToken,
  })
}

export function useTags() {
  const { gatewayToken } = useAuth()
  return useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
    enabled: !!gatewayToken,
  })
}
