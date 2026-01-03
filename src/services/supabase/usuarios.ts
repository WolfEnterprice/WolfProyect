/**
 * Servicio de usuarios usando Supabase
 */

import { supabase } from '@/lib/supabase';
import { Usuario } from '@/types';

export async function getUsuarios(): Promise<Usuario[]> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('activo', true)
    .order('nombre');

  if (error) {
    console.error('Error fetching usuarios:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getUsuario(id: number): Promise<Usuario> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching usuario:', error);
    throw new Error(error.message);
  }

  return data;
}

