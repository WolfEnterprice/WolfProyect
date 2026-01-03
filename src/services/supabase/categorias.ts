/**
 * Servicio de categorías usando Supabase
 */

import { supabase } from '@/lib/supabase';
import { Categoria } from '@/types';

export async function getCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre');

  if (error) {
    console.error('Error fetching categorias:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getCategoriasByTipo(tipo: 'ingreso' | 'egreso'): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('tipo', tipo)
    .order('nombre');

  if (error) {
    console.error('Error fetching categorias by tipo:', error);
    throw new Error(error.message);
  }

  return data || [];
}

