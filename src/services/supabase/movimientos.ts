/**
 * Servicio de movimientos usando Supabase
 */

import { supabase } from '@/lib/supabase';
import { MovimientoDetallado, FiltroMovimientos } from '@/types';
import { Database } from '@/lib/database.types';

export async function getMovimientos(filtros?: FiltroMovimientos): Promise<MovimientoDetallado[]> {
  let query = supabase
    .from('v_movimientos_detallados')
    .select('*')
    .order('fecha', { ascending: false });

  if (filtros) {
    if (filtros.fechaDesde) {
      query = query.gte('fecha', filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      query = query.lte('fecha', filtros.fechaHasta);
    }
    if (filtros.tipo) {
      query = query.eq('tipo', filtros.tipo);
    }
    if (filtros.proyecto_id) {
      query = query.eq('proyecto_id', filtros.proyecto_id);
    }
    if (filtros.estado) {
      query = query.eq('estado', filtros.estado);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching movimientos:', error);
    throw new Error(error.message);
  }

  // Mapear los datos de la vista al formato MovimientoDetallado
  type VistaMovimiento = Database['public']['Views']['v_movimientos_detallados']['Row'];
  return ((data as VistaMovimiento[] | null) || []).map((item) => ({
    id: item.id,
    tipo: item.tipo,
    monto: Number(item.monto),
    fecha: item.fecha,
    categoria_id: item.categoria_id!,
    proyecto_id: item.proyecto_id,
    descripcion: item.descripcion,
    creado_por: item.creado_por,
    estado: item.estado,
    categoria: item.categoria_id ? {
      id: item.categoria_id,
      nombre: item.categoria_nombre || '',
      tipo: item.categoria_tipo || item.tipo,
    } : undefined,
    proyecto: item.proyecto_id && item.proyecto_nombre ? {
      id: item.proyecto_id,
      nombre: item.proyecto_nombre,
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: null,
      estado: item.proyecto_estado || 'activo',
    } : undefined,
    creado_por_usuario: item.creado_por_nombre ? {
      id: item.creado_por,
      nombre: item.creado_por_nombre,
      email: item.creado_por_email || '',
      activo: true,
    } : undefined,
  }));
}

export async function getMovimiento(id: number): Promise<MovimientoDetallado> {
  const { data, error } = await supabase
    .from('v_movimientos_detallados')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching movimiento:', error);
    throw new Error(error?.message || 'Movimiento no encontrado');
  }

  type VistaMovimiento = Database['public']['Views']['v_movimientos_detallados']['Row'];
  const item = data as VistaMovimiento;

  return {
    id: item.id,
    tipo: item.tipo,
    monto: Number(item.monto),
    fecha: item.fecha,
    categoria_id: item.categoria_id!,
    proyecto_id: item.proyecto_id,
    descripcion: item.descripcion,
    creado_por: item.creado_por,
    estado: item.estado,
    categoria: item.categoria_id ? {
      id: item.categoria_id,
      nombre: item.categoria_nombre || '',
      tipo: item.categoria_tipo || item.tipo,
    } : undefined,
    proyecto: item.proyecto_id && item.proyecto_nombre ? {
      id: item.proyecto_id,
      nombre: item.proyecto_nombre,
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: null,
      estado: item.proyecto_estado || 'activo',
    } : undefined,
    creado_por_usuario: item.creado_por_nombre ? {
      id: item.creado_por,
      nombre: item.creado_por_nombre,
      email: item.creado_por_email || '',
      activo: true,
    } : undefined,
  };
}

export async function createMovimiento(data: Omit<MovimientoDetallado, 'id'>): Promise<MovimientoDetallado> {
  type MovimientoInsert = Database['public']['Tables']['movimientos']['Insert'];
  const insertData: MovimientoInsert = {
    tipo: data.tipo,
    monto: data.monto,
    fecha: data.fecha.split('T')[0], // Convertir ISO a DATE
    categoria_id: data.categoria_id,
    proyecto_id: data.proyecto_id ?? null,
    descripcion: data.descripcion,
    creado_por: data.creado_por,
    estado: data.estado,
  };
  
  const { data: newMovimiento, error } = await supabase
    .from('movimientos')
    .insert(insertData as any)
    .select()
    .single();

  if (error || !newMovimiento) {
    console.error('Error creating movimiento:', error);
    throw new Error(error?.message || 'Error al crear movimiento');
  }

  // Obtener el movimiento completo con relaciones
  type MovimientoRow = Database['public']['Tables']['movimientos']['Row'];
  const movimiento = newMovimiento as MovimientoRow;
  return getMovimiento(movimiento.id);
}

export async function updateMovimiento(id: number, data: Partial<MovimientoDetallado>): Promise<MovimientoDetallado> {
  type MovimientoUpdate = Database['public']['Tables']['movimientos']['Update'];
  const updateData: MovimientoUpdate = {};
  
  if (data.tipo) updateData.tipo = data.tipo;
  if (data.monto !== undefined) updateData.monto = data.monto;
  if (data.fecha) updateData.fecha = data.fecha.split('T')[0];
  if (data.categoria_id) updateData.categoria_id = data.categoria_id;
  if (data.proyecto_id !== undefined) updateData.proyecto_id = data.proyecto_id;
  if (data.descripcion) updateData.descripcion = data.descripcion;
  if (data.estado) updateData.estado = data.estado;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('movimientos')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating movimiento:', error);
    throw new Error(error.message);
  }

  return getMovimiento(id);
}

export async function deleteMovimiento(id: number): Promise<void> {
  const { error } = await supabase
    .from('movimientos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting movimiento:', error);
    throw new Error(error.message);
  }
}

