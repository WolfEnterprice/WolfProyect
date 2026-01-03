import { supabase } from '../lib/supabase'

export const ingresosService = {
  // Obtener todos los ingresos (RLS filtra automáticamente por usuario)
  async getAll() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { data, error } = await supabase
      .from('ingresos')
      .select('*')
      .eq('user_id', user.id) // Filtrar explícitamente por usuario
      .order('fecha', { ascending: false })
    
    if (error) {
      console.error('Error obteniendo ingresos:', error)
      throw error
    }
    
    // Retornar array vacío si no hay datos (usuario nuevo)
    return data || []
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
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { data, error } = await supabase
      .from('ingresos')
      .insert([{
        fecha: ingreso.fecha,
        descripcion: ingreso.descripcion,
        categoria: ingreso.categoria,
        monto: parseInt(ingreso.monto, 10),
        user_id: user.id // user_id se establecerá automáticamente por el trigger, pero lo incluimos por seguridad
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
        monto: parseInt(ingreso.monto, 10)
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

