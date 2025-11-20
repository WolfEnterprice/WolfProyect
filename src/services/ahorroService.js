import { supabase } from '../lib/supabase'

export const ahorroService = {
  // Obtener el estado del ahorro (primera fila)
  async get() {
    const { data, error } = await supabase
      .from('ahorro')
      .select('*')
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }
    
    // Si no existe, crear uno por defecto
    if (!data) {
      return await this.create({ ahorro_actual: 0, ahorro_meta: 2000 })
    }
    
    return data
  },

  // Crear estado de ahorro inicial
  async create(ahorro) {
    const { data, error } = await supabase
      .from('ahorro')
      .insert([{
        ahorroActual: parseFloat(ahorro.ahorroActual || 0),
        ahorroMeta: parseFloat(ahorro.ahorroMeta || 2000)
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
      parseFloat(current.ahorroActual || 0) + parseFloat(monto),
      parseFloat(current.ahorroMeta || 2000)
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
      .update({ ahorroMeta: parseFloat(meta) })
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
        ahorroActual: parseFloat(ahorro.ahorroActual),
        ahorroMeta: parseFloat(ahorro.ahorroMeta)
      })
      .eq('id', current.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

