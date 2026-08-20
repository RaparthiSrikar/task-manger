import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Weather } from '@/types';

export function useWeather(location?: string) {
  return useQuery({
    queryKey: ['weather', location],
    queryFn: async () => {
      const { data } = await apiClient.get<Weather | null>('/weather', { params: { location } });
      return data;
    },
    enabled: Boolean(location),
    staleTime: 10 * 60 * 1000, // matches the backend's own cache window
    retry: 0,
  });
}
