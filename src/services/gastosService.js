import { supabase } from '../lib/supabase'
import { presupuestosService } from './presupuestosService'

export const gastosService = {
  // Obtener todos los gastos (RLS filtra automáticamente por usuario)
  async getAll() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { data, error } = await supabase
      .from('gastos')
      .select('*')
      .eq('user_id', user.id) // Filtrar explícitamente por usuario
      .order('fecha', { ascending: false })
    
    if (error) {
      console.error('Error obteniendo gastos:', error)
      throw error
    }
    
    // Retornar array vacío si no hay datos (usuario nuevo)
    return data || []
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
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { data, error } = await supabase
      .from('gastos')
      .insert([{
        fecha: gasto.fecha,
        descripción: gasto.descripcion,
        categoría: gasto.categoria,
        monto: parseInt(gasto.monto, 10),
        metodoPago: gasto.metodoPago,
        user_id: user.id // user_id se establecerá automáticamente por el trigger, pero lo incluimos por seguridad
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
        monto: parseInt(gasto.monto, 10),
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

