import { useQuery } from '@tanstack/react-query';
import { getEstadisticasDashboard } from '@/services/dashboard';
import { EstadisticasDashboard } from '@/types';

export function useDashboard() {
  return useQuery<EstadisticasDashboard>({
    queryKey: ['dashboard'],
    queryFn: getEstadisticasDashboard,
    staleTime: 30 * 1000, // 30 segundos para dashboard
  });
}

