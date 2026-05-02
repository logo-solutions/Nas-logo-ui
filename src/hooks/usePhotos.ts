import { useQuery } from '@tanstack/react-query'
import { getPhotos } from '../lib/immich'

export function usePhotos(skip = 0, take = 50) {
  return useQuery({
    queryKey: ['photos', skip, take],
    queryFn: () => getPhotos(skip, take),
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
