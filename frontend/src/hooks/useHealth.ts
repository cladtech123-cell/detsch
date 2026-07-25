import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/services';

/**
 * Polls the backend health endpoint. Used by the dashboard to show whether
 * the API is reachable.
 */
export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: apiService.health,
    refetchInterval: 30_000,
    retry: 1,
  });
}
