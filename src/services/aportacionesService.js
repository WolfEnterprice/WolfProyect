import { supabase } from '../lib/supabase'

export const aportacionesService = {
  // Obtener todas las aportaciones del usuario
  async getAll(metaId = null) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    let query = supabase
      .from('aportaciones_ahorro')
      .select('*')
      .eq('user_id', user.id)
      .order('fecha', { ascending: false })

    if (metaId) {
      query = query.eq('meta_id', metaId)
    }

    const { data, error } = await query
    
    if (error) {
      // Si la tabla no existe, retornar array vacío
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return []
      }
      console.error('Error obteniendo aportaciones:', error)
      throw error
    }
    
    return data || []
  },

  // Crear una nueva aportación
  async create(aportacion) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { data, error } = await supabase
      .from('aportaciones_ahorro')
      .insert([{
        meta_id: aportacion.metaId || null,
        monto: parseInt(aportacion.monto, 10),
        fecha: aportacion.fecha || new Date().toISOString().split('T')[0],
        descripcion: aportacion.descripcion || 'Aportación manual',
        tipo: aportacion.tipo || 'manual', // 'manual', 'automatico', 'vueltos'
        user_id: user.id
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creando aportación:', error)
      throw error
    }
    
    return data
  },

  // Eliminar una aportación
  async delete(id) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { error } = await supabase
      .from('aportaciones_ahorro')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error eliminando aportación:', error)
      throw error
    }
  },

  // Obtener estadísticas de aportaciones
  async getEstadisticas() {
    const aportaciones = await this.getAll()
    
    const ahora = new Date()
    const mesActual = ahora.getMonth()
    const añoActual = ahora.getFullYear()
    
    // Aportaciones del mes actual
    const delMesActual = aportaciones.filter(ap => {
      const fecha = new Date(ap.fecha)
      return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual
    })
    
    // Aportaciones del mes anterior
    const mesAnterior = mesActual === 0 ? 11 : mesActual - 1
    const añoAnterior = mesActual === 0 ? añoActual - 1 : añoActual
    const delMesAnterior = aportaciones.filter(ap => {
      const fecha = new Date(ap.fecha)
      return fecha.getMonth() === mesAnterior && fecha.getFullYear() === añoAnterior
    })
    
    const totalMesActual = delMesActual.reduce((sum, ap) => sum + parseFloat(ap.monto || 0), 0)
    const totalMesAnterior = delMesAnterior.reduce((sum, ap) => sum + parseFloat(ap.monto || 0), 0)
    
    const variacion = totalMesAnterior > 0 
      ? ((totalMesActual - totalMesAnterior) / totalMesAnterior) * 100 
      : 0
    
    return {
      totalMesActual,
      totalMesAnterior,
      variacion,
      cantidadAportaciones: aportaciones.length,
      totalGeneral: aportaciones.reduce((sum, ap) => sum + parseFloat(ap.monto || 0), 0)
    }
  }
}

