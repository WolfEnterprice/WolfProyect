import { supabase } from '../lib/supabase'

export const metasAhorroService = {
  // Obtener todas las metas de ahorro del usuario
  async getAll() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { data, error } = await supabase
      .from('metas_ahorro')
      .select('*')
      .eq('user_id', user.id)
      .order('fecha_limite', { ascending: true })
    
    if (error) {
      // Si la tabla no existe, retornar array vacío
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return []
      }
      console.error('Error obteniendo metas de ahorro:', error)
      throw error
    }
    
    return data || []
  },

  // Obtener una meta por ID
  async getById(id) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { data, error } = await supabase
      .from('metas_ahorro')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error) throw error
    return data
  },

  // Crear una nueva meta
  async create(meta) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { data, error } = await supabase
      .from('metas_ahorro')
      .insert([{
        nombre: meta.nombre,
        monto_objetivo: parseInt(meta.montoObjetivo, 10),
        fecha_limite: meta.fechaLimite,
        ahorro_acumulado: 0,
        user_id: user.id
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creando meta de ahorro:', error)
      throw error
    }
    
    return data
  },

  // Actualizar una meta
  async update(id, meta) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const updateData = {}
    if (meta.nombre !== undefined) updateData.nombre = meta.nombre
    if (meta.montoObjetivo !== undefined) updateData.monto_objetivo = parseInt(meta.montoObjetivo, 10)
    if (meta.fechaLimite !== undefined) updateData.fecha_limite = meta.fechaLimite

    const { data, error } = await supabase
      .from('metas_ahorro')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error actualizando meta de ahorro:', error)
      throw error
    }
    
    return data
  },

  // Eliminar una meta
  async delete(id) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { error } = await supabase
      .from('metas_ahorro')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error eliminando meta de ahorro:', error)
      throw error
    }
  },

  // Agregar ahorro a una meta específica
  async agregarAhorro(id, monto) {
    const meta = await this.getById(id)
    const nuevoAhorro = (meta.ahorro_acumulado || 0) + parseInt(monto, 10)
    
    const { data, error } = await supabase
      .from('metas_ahorro')
      .update({ ahorro_acumulado: nuevoAhorro })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error agregando ahorro a meta:', error)
      throw error
    }
    
    return data
  }
}

