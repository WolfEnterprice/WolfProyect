/**
 * Servicio de proyectos usando Supabase
 */

import { supabase } from '@/lib/supabase';
import { Proyecto, RepartoProyectoDetallado } from '@/types';
import { Database } from '@/lib/database.types';

export async function getProyectos(): Promise<Proyecto[]> {
  const { data, error } = await supabase
    .from('proyectos')
    .select('*')
    .order('fecha_inicio', { ascending: false });

  if (error) {
    console.error('Error fetching proyectos:', error);
    throw new Error(error.message);
  }

  type ProyectoRow = Database['public']['Tables']['proyectos']['Row'];
  return ((data as ProyectoRow[] | null) || []).map(p => ({
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion || '',
    fecha_inicio: p.fecha_inicio,
    fecha_fin: p.fecha_fin,
    estado: p.estado,
  }));
}

export async function getProyecto(id: number): Promise<Proyecto> {
  const { data, error } = await supabase
    .from('proyectos')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching proyecto:', error);
    throw new Error(error?.message || 'Proyecto no encontrado');
  }

  type ProyectoRow = Database['public']['Tables']['proyectos']['Row'];
  const p = data as ProyectoRow;
  return {
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion || '',
    fecha_inicio: p.fecha_inicio,
    fecha_fin: p.fecha_fin,
    estado: p.estado,
  };
}

export async function createProyecto(data: Omit<Proyecto, 'id'>): Promise<Proyecto> {
  type ProyectoInsert = Database['public']['Tables']['proyectos']['Insert'];
  const insertData: ProyectoInsert = {
    nombre: data.nombre,
    descripcion: data.descripcion,
    fecha_inicio: data.fecha_inicio.split('T')[0],
    fecha_fin: data.fecha_fin ? data.fecha_fin.split('T')[0] : null,
    estado: data.estado,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: newProyecto, error } = await (supabase as any)
    .from('proyectos')
    .insert(insertData)
    .select()
    .single();

  if (error || !newProyecto) {
    console.error('Error creating proyecto:', error);
    throw new Error(error?.message || 'Error al crear proyecto');
  }

  return getProyecto(newProyecto.id);
}

export async function updateProyecto(id: number, data: Partial<Proyecto>): Promise<Proyecto> {
  type ProyectoUpdate = Database['public']['Tables']['proyectos']['Update'];
  const updateData: ProyectoUpdate = {};
  
  if (data.nombre) updateData.nombre = data.nombre;
  if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
  if (data.fecha_inicio) updateData.fecha_inicio = data.fecha_inicio.split('T')[0];
  if (data.fecha_fin !== undefined) updateData.fecha_fin = data.fecha_fin ? data.fecha_fin.split('T')[0] : null;
  if (data.estado) updateData.estado = data.estado;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('proyectos')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating proyecto:', error);
    throw new Error(error.message);
  }

  return getProyecto(id);
}

export async function getRepartosProyecto(proyectoId: number): Promise<RepartoProyectoDetallado[]> {
  const { data, error } = await supabase
    .from('v_repartos_detallados')
    .select('*')
    .eq('proyecto_id', proyectoId);

  if (error) {
    console.error('Error fetching repartos:', error);
    throw new Error(error.message);
  }

  type VistaReparto = Database['public']['Views']['v_repartos_detallados']['Row'];
  return ((data as VistaReparto[] | null) || []).map(r => ({
    id: r.id,
    proyecto_id: r.proyecto_id,
    usuario_id: r.usuario_id,
    porcentaje: Number(r.porcentaje),
    usuario: {
      id: r.usuario_id,
      nombre: r.usuario_nombre,
      email: r.usuario_email,
      activo: true,
    },
    proyecto: {
      id: r.proyecto_id,
      nombre: r.proyecto_nombre,
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: null,
      estado: 'activo',
    },
  }));
}

export async function saveRepartoProyecto(data: Omit<RepartoProyectoDetallado, 'id'>): Promise<RepartoProyectoDetallado> {
  type RepartoInsert = Database['public']['Tables']['repartos_proyecto']['Insert'];
  const insertData: RepartoInsert = {
    proyecto_id: data.proyecto_id,
    usuario_id: data.usuario_id,
    porcentaje: data.porcentaje,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: newReparto, error } = await (supabase as any)
    .from('repartos_proyecto')
    .insert(insertData)
    .select()
    .single();

  if (error || !newReparto) {
    console.error('Error creating reparto:', error);
    throw new Error(error?.message || 'Error al crear reparto');
  }

  type RepartoRow = Database['public']['Tables']['repartos_proyecto']['Row'];
  const reparto = newReparto as RepartoRow;

  // Obtener repartos actualizados
  const repartos = await getRepartosProyecto(data.proyecto_id);
  return repartos.find(r => r.id === reparto.id)!;
}

