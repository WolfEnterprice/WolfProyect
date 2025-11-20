import { supabase } from '../lib/supabase'
import { presupuestosService } from './presupuestosService'

export const gastosService = {
  // Obtener todos los gastos
  async getAll() {
    const { data, error } = await supabase
      .from('gastos')
      .select('*')
      .order('fecha', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Obtener un gasto por ID
  async getById(id) {
    const { data, error } = await supabase
      .from('gastos')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Crear un nuevo gasto
  async create(gasto) {
    const { data, error } = await supabase
      .from('gastos')
      .insert([{
        fecha: gasto.fecha,
        descripción: gasto.descripcion,
        categoría: gasto.categoria,
        monto: parseFloat(gasto.monto),
        metodoPago: gasto.metodoPago
      }])
      .select()
      .single()
    
    if (error) throw error
    
    // Crear presupuesto automáticamente si no existe para esta categoría
    try {
      await presupuestosService.ensurePresupuesto(gasto.categoria, 0)
    } catch (err) {
      console.warn('No se pudo crear presupuesto automáticamente:', err)
    }
    
    return data
  },

  // Actualizar un gasto
  async update(id, gasto) {
    const { data, error } = await supabase
      .from('gastos')
      .update({
        fecha: gasto.fecha,
        descripción: gasto.descripcion,
        categoría: gasto.categoria,
        monto: parseFloat(gasto.monto),
        metodoPago: gasto.metodoPago
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Eliminar un gasto
  async delete(id) {
    const { error } = await supabase
      .from('gastos')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

