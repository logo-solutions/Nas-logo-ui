import { useQuery } from '@tanstack/react-query'
import { getPhotos } from '../lib/immich'
import { useAuth } from '../store/auth'

export function usePhotos(
  skip = 0,
  take = 50,
  sortBy: 'newest' | 'oldest' = 'newest',
  startDate?: string,
  endDate?: string,
) {
  const { gatewayToken } = useAuth()
  return useQuery({
    queryKey: ['photos', skip, take, sortBy, startDate, endDate],
    queryFn: () => getPhotos(skip, take, sortBy, startDate, endDate),
    enabled: !!gatewayToken,
  })
}

export function usePhotoSearch(query: string) {
  const { gatewayToken } = useAuth()
  return useQuery({
    queryKey: ['photos', 'search', query],
    queryFn: async () => {
      // TODO: Implement actual search when API supports it
      return []
    },
    enabled: !!query && !!gatewayToken,
  })
}
