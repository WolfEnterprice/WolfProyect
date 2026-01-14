import { useQuery } from '@tanstack/react-query';
import { getIngresosVsEgresos, getGananciaPorProyecto } from '@/services/reportes';
import { DatosGrafico, FiltroFecha } from '@/types';

export function useIngresosVsEgresos(filtros?: FiltroFecha) {
  return useQuery<DatosGrafico[]>({
    queryKey: ['reportes', 'ingresos-vs-egresos', filtros],
    queryFn: () => getIngresosVsEgresos(filtros),
    staleTime: 2 * 60 * 1000, // 2 minutos para reportes
  });
}

export function useGananciaPorProyecto(filtros?: FiltroFecha) {
  return useQuery<DatosGrafico[]>({
    queryKey: ['reportes', 'ganancia-por-proyecto', filtros],
    queryFn: () => getGananciaPorProyecto(filtros),
    staleTime: 2 * 60 * 1000,
  });
}

