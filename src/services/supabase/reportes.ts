/**
 * Servicio de reportes usando Supabase
 */

import { supabase } from '@/lib/supabase';
import { DatosGrafico, FiltroFecha } from '@/types';
import { Database } from '@/lib/database.types';

export async function getIngresosVsEgresos(filtros?: FiltroFecha): Promise<DatosGrafico[]> {
  let queryIngresos = supabase
    .from('movimientos')
    .select('monto, fecha')
    .eq('tipo', 'ingreso')
    .eq('estado', 'pagado');

  let queryEgresos = supabase
    .from('movimientos')
    .select('monto, fecha')
    .eq('tipo', 'egreso')
    .eq('estado', 'pagado');

  if (filtros?.fechaDesde) {
    queryIngresos = queryIngresos.gte('fecha', filtros.fechaDesde);
    queryEgresos = queryEgresos.gte('fecha', filtros.fechaDesde);
  }
  if (filtros?.fechaHasta) {
    queryIngresos = queryIngresos.lte('fecha', filtros.fechaHasta);
    queryEgresos = queryEgresos.lte('fecha', filtros.fechaHasta);
  }

  const { data: ingresosData } = await queryIngresos;
  const { data: egresosData } = await queryEgresos;

  // Agrupar por mes
  const meses: { [key: string]: { ingresos: number; egresos: number } } = {};

  type MovimientoData = { monto: number; fecha: string };
  (ingresosData as MovimientoData[] | null)?.forEach(m => {
    const fecha = new Date(m.fecha);
    const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    if (!meses[mesKey]) meses[mesKey] = { ingresos: 0, egresos: 0 };
    meses[mesKey].ingresos += Number(m.monto);
  });

  (egresosData as MovimientoData[] | null)?.forEach(m => {
    const fecha = new Date(m.fecha);
    const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    if (!meses[mesKey]) meses[mesKey] = { ingresos: 0, egresos: 0 };
    meses[mesKey].egresos += Number(m.monto);
  });

  const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  return Object.entries(meses).map(([key, valores]) => {
    const [anio, mes] = key.split('-');
    return {
      name: `${mesesNombres[parseInt(mes) - 1]} ${anio}`,
      ingresos: valores.ingresos,
      egresos: valores.egresos,
      value: valores.ingresos - valores.egresos,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getGananciaPorProyecto(filtros?: FiltroFecha): Promise<DatosGrafico[]> {
  let query = supabase
    .from('v_proyectos_resumen')
    .select('nombre, ganancia_neta');

  if (filtros?.fechaDesde || filtros?.fechaHasta) {
    // Si hay filtros de fecha, necesitamos calcular desde movimientos
    let movimientosQuery = supabase
      .from('movimientos')
      .select('proyecto_id, tipo, monto, fecha')
      .eq('estado', 'pagado');

    if (filtros.fechaDesde) {
      movimientosQuery = movimientosQuery.gte('fecha', filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      movimientosQuery = movimientosQuery.lte('fecha', filtros.fechaHasta);
    }

    const { data: movimientos } = await movimientosQuery;
    const { data: proyectos } = await supabase.from('proyectos').select('id, nombre');

    const gananciasPorProyecto: { [key: number]: { nombre: string; ganancia: number } } = {};

    type ProyectoData = { id: number; nombre: string };
    (proyectos as ProyectoData[] | null)?.forEach(p => {
      gananciasPorProyecto[p.id] = { nombre: p.nombre, ganancia: 0 };
    });

    type MovimientoData = { proyecto_id: number | null; tipo: string; monto: number };
    (movimientos as MovimientoData[] | null)?.forEach(m => {
      if (m.proyecto_id && gananciasPorProyecto[m.proyecto_id]) {
        const monto = Number(m.monto);
        gananciasPorProyecto[m.proyecto_id].ganancia += m.tipo === 'ingreso' ? monto : -monto;
      }
    });

    return Object.values(gananciasPorProyecto)
      .filter(p => p.ganancia !== 0)
      .map(p => ({
        name: p.nombre,
        value: p.ganancia,
      }))
      .sort((a, b) => b.value - a.value);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching ganancia por proyecto:', error);
    throw new Error(error.message);
  }

  type VistaProyectoResumen = Database['public']['Views']['v_proyectos_resumen']['Row'];
  return ((data as VistaProyectoResumen[] | null) || [])
    .filter(p => Number(p.ganancia_neta) !== 0)
    .map(p => ({
      name: p.nombre,
      value: Number(p.ganancia_neta),
    }))
    .sort((a, b) => b.value - a.value);
}

