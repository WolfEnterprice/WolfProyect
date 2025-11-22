import { supabase } from '../lib/supabase'

export const ahorroService = {
  // Obtener el estado del ahorro (del usuario actual)
  async get() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { data, error } = await supabase
      .from('ahorro')
      .select('*')
      .eq('user_id', user.id) // Filtrar por usuario
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }
    
    // Si no existe, crear uno por defecto
    if (!data) {
      return await this.create({ ahorroActual: 0, ahorroMeta: 2000 })
    }
    
    return data
  },

  // Crear estado de ahorro inicial
  async create(ahorro) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { data, error } = await supabase
      .from('ahorro')
      .insert([{
        ahorroActual: parseInt(ahorro.ahorroActual || 0, 10),
        ahorroMeta: parseInt(ahorro.ahorroMeta || 2000, 10),
        user_id: user.id // user_id se establecerá automáticamente por el trigger, pero lo incluimos por seguridad
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Actualizar el ahorro actual
  async updateAhorroActual(monto) {
    const current = await this.get()
    const nuevoAhorro = Math.min(
      parseInt(current.ahorroActual || 0, 10) + parseInt(monto, 10),
      parseInt(current.ahorroMeta || 2000, 10)
    )
    
    const { data, error } = await supabase
      .from('ahorro')
      .update({ ahorroActual: nuevoAhorro })
      .eq('id', current.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Actualizar la meta de ahorro
  async updateAhorroMeta(meta) {
    const current = await this.get()
    
    const { data, error } = await supabase
      .from('ahorro')
      .update({ ahorroMeta: parseInt(meta, 10) })
      .eq('id', current.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Actualizar ambos valores
  async update(ahorro) {
    const current = await this.get()
    
    const { data, error } = await supabase
      .from('ahorro')
      .update({
        ahorroActual: parseInt(ahorro.ahorroActual, 10),
        ahorroMeta: parseInt(ahorro.ahorroMeta, 10)
      })
      .eq('id', current.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

