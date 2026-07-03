import { useQuery } from '@tanstack/react-query'
import { searchAll, searchIndex } from '../lib/meilisearch'

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchAll(query),
    enabled: !!query && query.length > 2,
  })
}

export function useSearchIndex(index: string, query: string) {
  return useQuery({
    queryKey: ['search', index, query],
    queryFn: () => searchIndex(index, query),
    enabled: !!query && query.length > 2,
  })
}
