import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProyectos, getProyecto, createProyecto, updateProyecto, getRepartosProyecto } from '@/services/proyectos';
import { Proyecto, RepartoProyectoDetallado } from '@/types';

export function useProyectos() {
  return useQuery<Proyecto[]>({
    queryKey: ['proyectos'],
    queryFn: getProyectos,
    staleTime: 60 * 1000,
  });
}

export function useProyecto(id: number) {
  return useQuery<Proyecto>({
    queryKey: ['proyecto', id],
    queryFn: () => getProyecto(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useRepartosProyecto(proyectoId: number) {
  return useQuery<RepartoProyectoDetallado[]>({
    queryKey: ['repartos', proyectoId],
    queryFn: () => getRepartosProyecto(proyectoId),
    enabled: !!proyectoId,
    staleTime: 60 * 1000,
  });
}

export function useCreateProyecto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Proyecto, 'id'>) => createProyecto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateProyecto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Proyecto, 'id'> }) =>
      updateProyecto(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
      queryClient.invalidateQueries({ queryKey: ['proyecto', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

