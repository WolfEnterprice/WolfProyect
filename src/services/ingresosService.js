import { supabase } from '../lib/supabase'

export const ingresosService = {
  // Obtener todos los ingresos
  async getAll() {
    const { data, error } = await supabase
      .from('ingresos')
      .select('*')
      .order('fecha', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Obtener un ingreso por ID
  async getById(id) {
    const { data, error } = await supabase
      .from('ingresos')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Crear un nuevo ingreso
  async create(ingreso) {
    const { data, error } = await supabase
      .from('ingresos')
      .insert([{
        fecha: ingreso.fecha,
        descripcion: ingreso.descripcion,
        categoria: ingreso.categoria,
        monto: parseFloat(ingreso.monto)
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Actualizar un ingreso
  async update(id, ingreso) {
    const { data, error } = await supabase
      .from('ingresos')
      .update({
        fecha: ingreso.fecha,
        descripcion: ingreso.descripcion,
        categoria: ingreso.categoria,
        monto: parseFloat(ingreso.monto)
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Eliminar un ingreso
  async delete(id) {
    const { error } = await supabase
      .from('ingresos')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

