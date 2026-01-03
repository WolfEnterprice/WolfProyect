/**
 * Tipos e interfaces para el sistema de gestión financiera
 */

// Usuario
export interface Usuario {
  id: string | number; // UUID (string) cuando viene de Supabase Auth, number para compatibilidad
  nombre: string;
  email: string;
  activo: boolean;
}

// Proyecto
export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: 'activo' | 'completado' | 'cancelado';
}

// Categoría
export interface Categoria {
  id: number;
  nombre: string;
  tipo: 'ingreso' | 'egreso';
}

// Movimiento
export type TipoMovimiento = 'ingreso' | 'egreso';
export type EstadoMovimiento = 'pendiente' | 'pagado';

export interface Movimiento {
  id: number;
  tipo: TipoMovimiento;
  monto: number;
  fecha: string;
  categoria_id: number;
  proyecto_id: number | null;
  descripcion: string;
  creado_por: number;
  estado: EstadoMovimiento;
}

// Movimiento con relaciones expandidas
export interface MovimientoDetallado extends Movimiento {
  categoria?: Categoria;
  proyecto?: Proyecto;
  creado_por_usuario?: Usuario;
}

// Reparto de Proyecto
export interface RepartoProyecto {
  id: number;
  proyecto_id: number;
  usuario_id: number;
  porcentaje: number;
}

// Reparto con relación expandida
export interface RepartoProyectoDetallado extends RepartoProyecto {
  usuario?: Usuario;
  proyecto?: Proyecto;
}

// Pago entre Socios
export type EstadoPago = 'pendiente' | 'pagado';

export interface PagoSocio {
  id: number;
  proyecto_id: number;
  usuario_id: number;
  monto: number;
  estado: EstadoPago;
  fecha_pago: string | null;
}

// Pago con relaciones expandidas
export interface PagoSocioDetallado extends PagoSocio {
  proyecto?: Proyecto;
  usuario?: Usuario;
}

// Filtros comunes
export interface FiltroFecha {
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface FiltroMovimientos extends FiltroFecha {
  tipo?: TipoMovimiento;
  proyecto_id?: number;
  estado?: EstadoMovimiento;
}

// Estadísticas del Dashboard
export interface EstadisticasDashboard {
  totalIngresos: number;
  totalEgresos: number;
  gananciaNeta: number;
  proyectosActivos: number;
  pagosPendientes: number;
  proximasFechas: Array<{
    fecha: string;
    descripcion: string;
    tipo: string;
  }>;
}

// Datos para gráficos
export interface DatosGrafico {
  name: string;
  value: number;
  [key: string]: string | number;
}

