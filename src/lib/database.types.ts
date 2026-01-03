/**
 * Tipos de la base de datos de Supabase
 * Estos tipos se generan automáticamente desde Supabase
 * Por ahora los definimos manualmente basados en nuestro schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: number
          nombre: string
          email: string
          activo: boolean
          password_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          nombre: string
          email: string
          activo?: boolean
          password_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          nombre?: string
          email?: string
          activo?: boolean
          password_hash?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categorias: {
        Row: {
          id: number
          nombre: string
          tipo: 'ingreso' | 'egreso'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          nombre: string
          tipo: 'ingreso' | 'egreso'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          nombre?: string
          tipo?: 'ingreso' | 'egreso'
          created_at?: string
          updated_at?: string
        }
      }
      proyectos: {
        Row: {
          id: number
          nombre: string
          descripcion: string | null
          fecha_inicio: string
          fecha_fin: string | null
          estado: 'activo' | 'completado' | 'cancelado'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          nombre: string
          descripcion?: string | null
          fecha_inicio: string
          fecha_fin?: string | null
          estado?: 'activo' | 'completado' | 'cancelado'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          nombre?: string
          descripcion?: string | null
          fecha_inicio?: string
          fecha_fin?: string | null
          estado?: 'activo' | 'completado' | 'cancelado'
          created_at?: string
          updated_at?: string
        }
      }
      movimientos: {
        Row: {
          id: number
          tipo: 'ingreso' | 'egreso'
          monto: number
          fecha: string
          categoria_id: number
          proyecto_id: number | null
          descripcion: string
          creado_por: number
          estado: 'pendiente' | 'pagado'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          tipo: 'ingreso' | 'egreso'
          monto: number
          fecha: string
          categoria_id: number
          proyecto_id?: number | null
          descripcion: string
          creado_por: number
          estado?: 'pendiente' | 'pagado'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          tipo?: 'ingreso' | 'egreso'
          monto?: number
          fecha?: string
          categoria_id?: number
          proyecto_id?: number | null
          descripcion?: string
          creado_por?: number
          estado?: 'pendiente' | 'pagado'
          created_at?: string
          updated_at?: string
        }
      }
      repartos_proyecto: {
        Row: {
          id: number
          proyecto_id: number
          usuario_id: number
          porcentaje: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          proyecto_id: number
          usuario_id: number
          porcentaje: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          proyecto_id?: number
          usuario_id?: number
          porcentaje?: number
          created_at?: string
          updated_at?: string
        }
      }
      pagos_socios: {
        Row: {
          id: number
          proyecto_id: number
          usuario_id: number
          monto: number
          estado: 'pendiente' | 'pagado'
          fecha_pago: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          proyecto_id: number
          usuario_id: number
          monto: number
          estado?: 'pendiente' | 'pagado'
          fecha_pago?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          proyecto_id?: number
          usuario_id?: number
          monto?: number
          estado?: 'pendiente' | 'pagado'
          fecha_pago?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      v_movimientos_detallados: {
        Row: {
          id: number
          tipo: 'ingreso' | 'egreso'
          monto: number
          fecha: string
          descripcion: string
          estado: 'pendiente' | 'pagado'
          proyecto_id: number | null
          creado_por: number
          categoria_id: number | null
          categoria_nombre: string | null
          categoria_tipo: 'ingreso' | 'egreso' | null
          proyecto_nombre: string | null
          proyecto_estado: 'activo' | 'completado' | 'cancelado' | null
          creado_por_nombre: string | null
          creado_por_email: string | null
          created_at: string
          updated_at: string
        }
      }
      v_proyectos_resumen: {
        Row: {
          id: number
          nombre: string
          descripcion: string | null
          fecha_inicio: string
          fecha_fin: string | null
          estado: 'activo' | 'completado' | 'cancelado'
          total_ingresos: number
          total_egresos: number
          ganancia_neta: number
        }
      }
      v_repartos_detallados: {
        Row: {
          id: number
          proyecto_id: number
          usuario_id: number
          porcentaje: number
          proyecto_nombre: string
          usuario_nombre: string
          usuario_email: string
          created_at: string
          updated_at: string
        }
      }
      v_pagos_detallados: {
        Row: {
          id: number
          proyecto_id: number
          usuario_id: number
          monto: number
          estado: 'pendiente' | 'pagado'
          fecha_pago: string | null
          proyecto_nombre: string
          usuario_nombre: string
          usuario_email: string
          created_at: string
          updated_at: string
        }
      }
    }
  }
}

