import { supabase } from '../lib/supabase'

export const chatService = {
  // Obtener todos los mensajes del chat del usuario actual
  async getAll() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { data, error } = await supabase
      .from('chat_mensajes')
      .select('*')
      .eq('user_id', user.id) // Filtrar por usuario
      .order('created_at', { ascending: true }) // Ordenar por fecha de creación
    
    if (error) {
      console.error('Error obteniendo mensajes del chat:', error)
      // Si la tabla no existe, retornar array vacío
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return []
      }
      throw error
    }
    
    // Retornar array vacío si no hay datos
    return data || []
  },

  // Guardar un mensaje en el chat
  async create(mensaje) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { data, error } = await supabase
      .from('chat_mensajes')
      .insert([{
        tipo: mensaje.tipo, // 'usuario' o 'bot'
        texto: mensaje.texto,
        user_id: user.id
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error guardando mensaje del chat:', error)
      // Si la tabla no existe, no lanzar error (solo log)
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.warn('Tabla chat_mensajes no existe. Los mensajes no se guardarán.')
        return null
      }
      throw error
    }
    
    return data
  },

  // Eliminar todos los mensajes del chat del usuario actual
  async deleteAll() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { error } = await supabase
      .from('chat_mensajes')
      .delete()
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error eliminando mensajes del chat:', error)
      // Si la tabla no existe, no lanzar error
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.warn('Tabla chat_mensajes no existe.')
        return
      }
      throw error
    }
  }
}

