import { useQuery } from '@tanstack/react-query'
import { getPhotos } from '../lib/immich'

export function usePhotos(
  skip = 0,
  take = 50,
  sortBy: 'newest' | 'oldest' = 'newest',
  startDate?: string,
  endDate?: string,
) {
  return useQuery({
    queryKey: ['photos', skip, take, sortBy, startDate, endDate],
    queryFn: () => getPhotos(skip, take, sortBy, startDate, endDate),
    enabled: !!localStorage.getItem('immich_api_key'),
  })
}

export function usePhotoSearch(query: string) {
  return useQuery({
    queryKey: ['photos', 'search', query],
    queryFn: async () => {
      // TODO: Implement actual search when API supports it
      return []
    },
    enabled: !!query && !!localStorage.getItem('immich_api_key'),
  })
}
