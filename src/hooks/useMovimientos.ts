import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMovimientos, createMovimiento, updateMovimiento, deleteMovimiento } from '@/services/movimientos';
import { MovimientoDetallado, FiltroMovimientos } from '@/types';

export function useMovimientos(filtros?: FiltroMovimientos) {
  return useQuery<MovimientoDetallado[]>({
    queryKey: ['movimientos', filtros],
    queryFn: () => getMovimientos(filtros),
    staleTime: 60 * 1000, // 1 minuto
  });
}

export function useCreateMovimiento() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<MovimientoDetallado, 'id'>) => createMovimiento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateMovimiento() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<MovimientoDetallado, 'id'> }) =>
      updateMovimiento(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteMovimiento() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => deleteMovimiento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

