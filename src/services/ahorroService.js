import { supabase } from '../lib/supabase'

export const ahorroService = {
  // Obtener el estado del ahorro (del usuario actual)
  async get() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    // Usar nombres de columnas correctos (con comillas para camelCase)
    const { data, error } = await supabase
      .from('ahorro')
      .select('id, "ahorroActual", "ahorroMeta", user_id')
      .eq('user_id', user.id) // Filtrar por usuario
      .maybeSingle() // Usar maybeSingle para evitar error si no existe
    
    if (error) {
      console.error('Error obteniendo ahorro:', error)
      // Si la tabla no existe o hay error de RLS, devolver valores por defecto
      if (error.code === 'PGRST116' || error.code === 'PGRST205' || error.message.includes('permission') || error.message.includes('406') || error.message.includes('Could not find the table')) {
        console.log('Tabla ahorro no existe o usuario nuevo, devolviendo valores por defecto')
        return {
          id: null,
          ahorroActual: 0,
          ahorroMeta: 2000,
          user_id: user.id
        }
      }
      throw error
    }
    
    // Si no existe, devolver valores por defecto sin crear automáticamente
    if (!data) {
      console.log('Usuario nuevo sin datos de ahorro, devolviendo valores por defecto')
      return {
        id: null,
        ahorroActual: 0,
        ahorroMeta: 2000,
        user_id: user.id
      }
    }
    
    return data
  },

  // Crear estado de ahorro inicial (solo si no existe)
  async create(ahorro) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    // Verificar si ya existe un ahorro para este usuario
    const { data: existing } = await supabase
      .from('ahorro')
      .select('id, "ahorroActual", "ahorroMeta"')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing && existing.id) {
      // Si ya existe, actualizarlo en lugar de crear uno nuevo
      return await this.update({
        ahorroActual: ahorro.ahorroActual || existing.ahorroActual || 0,
        ahorroMeta: ahorro.ahorroMeta || existing.ahorroMeta || 2000
      })
    }

    // Usar nombres de columnas correctos con comillas
    const { data, error } = await supabase
      .from('ahorro')
      .insert([{
        "ahorroActual": parseInt(ahorro.ahorroActual || 0, 10),
        "ahorroMeta": parseInt(ahorro.ahorroMeta || 2000, 10),
        user_id: user.id
      }])
      .select('id, "ahorroActual", "ahorroMeta", user_id')
      .single()
    
    if (error) {
      // Si es un error de conflicto (ya existe), intentar obtener el existente
      if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('409')) {
        console.log('Registro de ahorro ya existe, obteniendo datos existentes')
        return await this.get()
      }
      console.error('Error creando ahorro:', error)
      throw error
    }
    return data
  },

  // Actualizar el ahorro actual
  async updateAhorroActual(monto) {
    let current = await this.get()
    
    // Si no tiene id, crear el registro primero
    if (!current.id) {
      current = await this.create({
        ahorroActual: current.ahorroActual || 0,
        ahorroMeta: current.ahorroMeta || 2000
      })
    }
    
    const nuevoAhorro = Math.min(
      parseInt(current.ahorroActual || current["ahorroActual"] || 0, 10) + parseInt(monto, 10),
      parseInt(current.ahorroMeta || current["ahorroMeta"] || 2000, 10)
    )
    
    const { data, error } = await supabase
      .from('ahorro')
      .update({ "ahorroActual": nuevoAhorro })
      .eq('id', current.id)
      .select('id, "ahorroActual", "ahorroMeta", user_id')
      .single()
    
    if (error) {
      console.error('Error actualizando ahorro actual:', error)
      throw error
    }
    return data
  },

  // Actualizar la meta de ahorro
  async updateAhorroMeta(meta) {
    let current = await this.get()
    
    // Si no tiene id, crear el registro primero
    if (!current.id) {
      current = await this.create({
        ahorroActual: current.ahorroActual || 0,
        ahorroMeta: current.ahorroMeta || 2000
      })
    }
    
    const { data, error } = await supabase
      .from('ahorro')
      .update({ "ahorroMeta": parseInt(meta, 10) })
      .eq('id', current.id)
      .select('id, "ahorroActual", "ahorroMeta", user_id')
      .single()
    
    if (error) {
      console.error('Error actualizando meta de ahorro:', error)
      throw error
    }
    return data
  },

  // Actualizar ambos valores
  async update(ahorro) {
    let current = await this.get()
    
    // Si no tiene id, crear el registro primero
    if (!current.id) {
      return await this.create({
        ahorroActual: ahorro.ahorroActual || 0,
        ahorroMeta: ahorro.ahorroMeta || 2000
      })
    }
    
    const { data, error } = await supabase
      .from('ahorro')
      .update({
        "ahorroActual": parseInt(ahorro.ahorroActual || 0, 10),
        "ahorroMeta": parseInt(ahorro.ahorroMeta || 2000, 10)
      })
      .eq('id', current.id)
      .select('id, "ahorroActual", "ahorroMeta", user_id')
      .single()
    
    if (error) {
      console.error('Error actualizando ahorro:', error)
      throw error
    }
    return data
  }
}

