import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPagos, getPagosPendientes, createPago, marcarPagoComoPagado } from '@/services/pagos';
import { PagoSocioDetallado } from '@/types';

export function usePagos(mostrarSoloPendientes = false) {
  return useQuery<PagoSocioDetallado[]>({
    queryKey: ['pagos', mostrarSoloPendientes],
    queryFn: () => mostrarSoloPendientes ? getPagosPendientes() : getPagos(),
    staleTime: 60 * 1000,
  });
}

export function useCreatePago() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<PagoSocioDetallado, 'id'>) => createPago(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useMarcarPagoComoPagado() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => marcarPagoComoPagado(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

