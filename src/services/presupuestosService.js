import { supabase } from '../lib/supabase'

export const presupuestosService = {
  // Obtener todos los presupuestos
  async getAll() {
    const { data, error } = await supabase
      .from('presupuestos')
      .select('*')
      .order('categoria', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Obtener un presupuesto por categoría
  async getByCategoria(categoria) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { data, error } = await supabase
      .from('presupuestos')
      .select('*')
      .eq('categoria', categoria)
      .eq('user_id', user.id) // Filtrar por usuario
      .maybeSingle()
    
    if (error) throw error
    return data
  },

  // Crear o actualizar un presupuesto
  async upsert(presupuesto) {
    // Primero verificar si existe
    const existing = await this.getByCategoria(presupuesto.categoria)
    
    if (existing) {
      // Si existe, actualizar
      return await this.update(existing.id, presupuesto)
    } else {
      // Si no existe, crear
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      const { data, error } = await supabase
        .from('presupuestos')
        .insert({
          categoria: presupuesto.categoria,
          presupuesto: parseInt(presupuesto.presupuesto, 10) || 0,
          user_id: user.id // user_id se establecerá automáticamente por el trigger, pero lo incluimos por seguridad
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },

  // Actualizar un presupuesto
  async update(id, presupuesto) {
    const updateData = {}
    
    // Solo actualizar los campos que se proporcionan
    if (presupuesto.categoria !== undefined) {
      updateData.categoria = presupuesto.categoria
    }
    if (presupuesto.presupuesto !== undefined) {
      updateData.presupuesto = parseInt(presupuesto.presupuesto, 10) || 0
    }
    
    const { data, error } = await supabase
      .from('presupuestos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Eliminar un presupuesto
  async delete(id) {
    const { error } = await supabase
      .from('presupuestos')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Calcular gastado por categoría (suma de gastos)
  async getGastadoPorCategoria(categoria) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { data, error } = await supabase
      .from('gastos')
      .select('monto')
      .eq('categoría', categoria) // La tabla gastos usa 'categoría' con tilde
      .eq('user_id', user.id) // Filtrar por usuario
    
    if (error) throw error
    
    const total = data.reduce((sum, gasto) => sum + parseInt(gasto.monto || 0, 10), 0)
    return total
  },

  // Crear presupuesto automáticamente si no existe
  async ensurePresupuesto(categoria, presupuestoInicial = 0) {
    try {
      const existing = await this.getByCategoria(categoria)
      
      if (!existing) {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          throw new Error('Usuario no autenticado')
        }

        const { data, error } = await supabase
          .from('presupuestos')
          .insert({
            categoria,
            presupuesto: parseInt(presupuestoInicial, 10) || 0,
            user_id: user.id // user_id se establecerá automáticamente por el trigger, pero lo incluimos por seguridad
          })
          .select()
          .single()
        
        if (error) throw error
        return data
      }
      
      return existing
    } catch (err) {
      // Si hay error, intentar crear de todas formas
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      const { data, error } = await supabase
        .from('presupuestos')
        .insert({
          categoria,
          presupuesto: parseInt(presupuestoInicial, 10) || 0,
          user_id: user.id // user_id se establecerá automáticamente por el trigger, pero lo incluimos por seguridad
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  }
}

