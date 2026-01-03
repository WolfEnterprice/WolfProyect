/**
 * Servicio de pagos usando Supabase
 */

import { supabase } from '@/lib/supabase';
import { PagoSocioDetallado } from '@/types';
import { Database } from '@/lib/database.types';

export async function getPagos(): Promise<PagoSocioDetallado[]> {
  const { data, error } = await supabase
    .from('v_pagos_detallados')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pagos:', error);
    throw new Error(error.message);
  }

  type VistaPago = Database['public']['Views']['v_pagos_detallados']['Row'];
  return ((data as VistaPago[] | null) || []).map(p => ({
    id: p.id,
    proyecto_id: p.proyecto_id,
    usuario_id: p.usuario_id,
    monto: Number(p.monto),
    estado: p.estado,
    fecha_pago: p.fecha_pago,
    proyecto: {
      id: p.proyecto_id,
      nombre: p.proyecto_nombre,
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: null,
      estado: 'activo',
    },
    usuario: {
      id: p.usuario_id,
      nombre: p.usuario_nombre,
      email: p.usuario_email,
      activo: true,
    },
  }));
}

export async function getPagosPendientes(): Promise<PagoSocioDetallado[]> {
  const { data, error } = await supabase
    .from('v_pagos_detallados')
    .select('*')
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pagos pendientes:', error);
    throw new Error(error.message);
  }

  type VistaPago = Database['public']['Views']['v_pagos_detallados']['Row'];
  return ((data as VistaPago[] | null) || []).map(p => ({
    id: p.id,
    proyecto_id: p.proyecto_id,
    usuario_id: p.usuario_id,
    monto: Number(p.monto),
    estado: p.estado,
    fecha_pago: p.fecha_pago,
    proyecto: {
      id: p.proyecto_id,
      nombre: p.proyecto_nombre,
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: null,
      estado: 'activo',
    },
    usuario: {
      id: p.usuario_id,
      nombre: p.usuario_nombre,
      email: p.usuario_email,
      activo: true,
    },
  }));
}

export async function getPago(id: number): Promise<PagoSocioDetallado> {
  const { data, error } = await supabase
    .from('v_pagos_detallados')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching pago:', error);
    throw new Error(error?.message || 'Pago no encontrado');
  }

  type VistaPago = Database['public']['Views']['v_pagos_detallados']['Row'];
  const p = data as VistaPago;

  return {
    id: p.id,
    proyecto_id: p.proyecto_id,
    usuario_id: p.usuario_id,
    monto: Number(p.monto),
    estado: p.estado,
    fecha_pago: p.fecha_pago,
    proyecto: {
      id: p.proyecto_id,
      nombre: p.proyecto_nombre,
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: null,
      estado: 'activo',
    },
    usuario: {
      id: p.usuario_id,
      nombre: p.usuario_nombre,
      email: p.usuario_email,
      activo: true,
    },
  };
}

export async function createPago(data: Omit<PagoSocioDetallado, 'id'>): Promise<PagoSocioDetallado> {
  type PagoInsert = Database['public']['Tables']['pagos_socios']['Insert'];
  const insertData: PagoInsert = {
    proyecto_id: data.proyecto_id,
    usuario_id: data.usuario_id,
    monto: data.monto,
    estado: data.estado,
    fecha_pago: data.fecha_pago ? data.fecha_pago.split('T')[0] : null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: newPago, error } = await (supabase as any)
    .from('pagos_socios')
    .insert(insertData)
    .select()
    .single();

  if (error || !newPago) {
    console.error('Error creating pago:', error);
    throw new Error(error?.message || 'Error al crear pago');
  }

  type PagoRow = Database['public']['Tables']['pagos_socios']['Row'];
  const pago = newPago as PagoRow;
  return getPago(pago.id);
}

export async function marcarPagoComoPagado(id: number): Promise<PagoSocioDetallado> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('pagos_socios')
    .update({
      estado: 'pagado',
      fecha_pago: new Date().toISOString().split('T')[0],
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating pago:', error);
    throw new Error(error.message);
  }

  return getPago(id);
}

