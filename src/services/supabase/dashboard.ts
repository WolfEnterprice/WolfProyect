/**
 * Servicio de dashboard usando Supabase
 */

import { supabase } from '@/lib/supabase';
import { EstadisticasDashboard } from '@/types';

export async function getEstadisticasDashboard(): Promise<EstadisticasDashboard> {
  // Obtener total ingresos
  const { data: ingresos } = await supabase
    .from('movimientos')
    .select('monto')
    .eq('tipo', 'ingreso')
    .eq('estado', 'pagado');

  // Obtener total egresos
  const { data: egresos } = await supabase
    .from('movimientos')
    .select('monto')
    .eq('tipo', 'egreso')
    .eq('estado', 'pagado');

  // Obtener proyectos activos
  const { count: proyectosActivos } = await supabase
    .from('proyectos')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'activo');

  // Obtener pagos pendientes
  const { count: pagosPendientes } = await supabase
    .from('pagos_socios')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'pendiente');

  // Calcular totales
  const totalIngresos = (ingresos as { monto: number }[] | null)?.reduce((sum, m) => sum + Number(m.monto), 0) || 0;
  const totalEgresos = (egresos as { monto: number }[] | null)?.reduce((sum, m) => sum + Number(m.monto), 0) || 0;
  const gananciaNeta = totalIngresos - totalEgresos;

  // Obtener próximas fechas (proyectos que terminan pronto)
  const { data: proyectosProximos } = await supabase
    .from('proyectos')
    .select('fecha_fin, nombre')
    .not('fecha_fin', 'is', null)
    .gte('fecha_fin', new Date().toISOString().split('T')[0])
    .order('fecha_fin', { ascending: true })
    .limit(5);

  const proximasFechas = ((proyectosProximos as { fecha_fin: string; nombre: string }[] | null) || []).map(p => ({
    fecha: p.fecha_fin!,
    descripcion: `Vencimiento: ${p.nombre}`,
    tipo: 'Proyecto',
  }));

  return {
    totalIngresos,
    totalEgresos,
    gananciaNeta,
    proyectosActivos: proyectosActivos || 0,
    pagosPendientes: pagosPendientes || 0,
    proximasFechas,
  };
}

