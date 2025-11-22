import { supabase } from '../lib/supabase'

export const categoriasService = {
  // Obtener todas las categorías del usuario actual
  async getAll(tipo = null) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    let query = supabase
      .from('categorias')
      .select('*')
      .eq('user_id', user.id) // Filtrar por usuario autenticado
      .order('nombre', { ascending: true }) // Ordenar por nombre

    if (tipo) {
      query = query.eq('tipo', tipo) // Filtrar por tipo si se especifica
    }

    const { data, error } = await query

    if (error) {
      console.error('Error obteniendo categorías:', error)
      throw error
    }

    // Retornar datos tal cual (nombre ya está en el campo correcto)
    return data || []
  },

  // Obtener categorías de ingresos
  async getIngresos() {
    return await this.getAll('ingreso')
  },

  // Obtener categorías de gastos
  async getGastos() {
    return await this.getAll('gasto')
  },

  // Obtener una categoría por ID
  async getById(id) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id) // Solo del usuario autenticado
      .single()

    if (error) {
      console.error('Error obteniendo categoría:', error)
      throw error
    }

    return data
  },

  // Crear una nueva categoría
  async create(categoria) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    // Estructura según la tabla real: nombre, tipo, user_id, color
    // El campo 'categoria' es un timestamp (se crea automáticamente con now())
    const categoriaData = {
      nombre: categoria.nombre, // Nombre de la categoría
      tipo: categoria.tipo, // 'ingreso' o 'gasto'
      user_id: user.id // Siempre asociado al usuario autenticado
    }

    // Agregar campos opcionales si existen
    if (categoria.color) {
      categoriaData.color = categoria.color
    }
    if (categoria.icono) {
      categoriaData.icono = categoria.icono
    }

    const { data, error } = await supabase
      .from('categorias')
      .insert([categoriaData])
      .select()
      .single()

    if (error) {
      console.error('Error creando categoría:', error)
      throw error
    }

    return data
  },

  // Actualizar una categoría
  async update(id, categoria) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const updateData = {}
    
    // Actualizar solo los campos que se proporcionan
    if (categoria.nombre !== undefined) {
      updateData.nombre = categoria.nombre
    }
    if (categoria.tipo !== undefined) {
      updateData.tipo = categoria.tipo
    }
    if (categoria.color !== undefined) {
      updateData.color = categoria.color
    }
    if (categoria.icono !== undefined) {
      updateData.icono = categoria.icono
    }

    const { data, error } = await supabase
      .from('categorias')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Solo puede actualizar sus propias categorías
      .select()
      .single()

    if (error) {
      console.error('Error actualizando categoría:', error)
      throw error
    }

    return data
  },

  // Eliminar una categoría
  async delete(id) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Solo puede eliminar sus propias categorías

    if (error) {
      console.error('Error eliminando categoría:', error)
      throw error
    }
  },

  // Función deshabilitada: Ya no se crean categorías por defecto automáticamente
  // Solo se muestran las categorías que están en la base de datos
  /*
  async crearCategoriasPorDefecto() {
    const categoriasPorDefecto = [
      // Categorías de ingresos
      { nombre: 'Trabajo', tipo: 'ingreso', color: '#10b981' },
      { nombre: 'Casa', tipo: 'ingreso', color: '#3b82f6' },
      { nombre: 'Otros', tipo: 'ingreso', color: '#6b7280' },
      
      // Categorías de gastos
      { nombre: 'Casa', tipo: 'gasto', color: '#3b82f6' },
      { nombre: 'Comida', tipo: 'gasto', color: '#f59e0b' },
      { nombre: 'Personales', tipo: 'gasto', color: '#ec4899' },
      { nombre: 'Ahorros', tipo: 'gasto', color: '#8b5cf6' },
      { nombre: 'Trabajo', tipo: 'gasto', color: '#10b981' },
    ]

    try {
      // Obtener categorías existentes del usuario
      const existentes = await this.getAll()
      const nombresExistentes = new Set(
        existentes.map(c => `${c.nombre}-${c.tipo}`)
      )

      // Crear solo las que no existen
      const categoriasACrear = categoriasPorDefecto.filter(
        cat => !nombresExistentes.has(`${cat.nombre}-${cat.tipo}`)
      )

      if (categoriasACrear.length > 0) {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          throw new Error('Usuario no autenticado')
        }

        const { data, error } = await supabase
          .from('categorias')
          .insert(
            categoriasACrear.map(cat => ({
              nombre: cat.nombre,
              tipo: cat.tipo,
              color: cat.color,
              user_id: user.id // Cada categoría pertenece al usuario
            }))
          )
          .select()

        if (error) {
          console.error('Error creando categorías por defecto:', error)
          throw error
        }

        return data || []
      }

      return []
    } catch (error) {
      console.error('Error en crearCategoriasPorDefecto:', error)
      throw error
    }
  }
  */
}

