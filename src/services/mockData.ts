/**
 * Datos mockeados compartidos para desarrollo
 * En producción, estos datos vendrían de una base de datos
 */

import { Proyecto, Movimiento, PagoSocio, Categoria, Usuario } from '@/types';

export const mockUsuarios: Usuario[] = [
  { id: 1, nombre: 'Socio 1', email: 'socio1@example.com', activo: true },
  { id: 2, nombre: 'Socio 2', email: 'socio2@example.com', activo: true },
];

export const mockCategorias: Categoria[] = [
  { id: 1, nombre: 'Ventas', tipo: 'ingreso' },
  { id: 2, nombre: 'Servicios', tipo: 'ingreso' },
  { id: 3, nombre: 'Inversiones', tipo: 'ingreso' },
  { id: 4, nombre: 'Salarios', tipo: 'egreso' },
  { id: 5, nombre: 'Materiales', tipo: 'egreso' },
  { id: 6, nombre: 'Servicios', tipo: 'egreso' },
  { id: 7, nombre: 'Marketing', tipo: 'egreso' },
  { id: 8, nombre: 'Gastos generales', tipo: 'egreso' },
];

export let mockProyectos: Proyecto[] = [
  {
    id: 1,
    nombre: 'Proyecto Alpha',
    descripcion: 'Desarrollo de aplicación web',
    fecha_inicio: '2024-01-01T00:00:00Z',
    fecha_fin: null,
    estado: 'activo',
  },
  {
    id: 2,
    nombre: 'Proyecto Beta',
    descripcion: 'Marketing digital',
    fecha_inicio: '2024-02-01T00:00:00Z',
    fecha_fin: '2024-06-01T00:00:00Z',
    estado: 'completado',
  },
];

// Movimientos sin relaciones (se enriquecen en las rutas API)
export let mockMovimientos: Movimiento[] = [
  {
    id: 1,
    tipo: 'ingreso',
    monto: 5000,
    fecha: '2024-01-15T00:00:00Z',
    categoria_id: 1,
    proyecto_id: 1,
    descripcion: 'Venta de producto A',
    creado_por: 1,
    estado: 'pagado',
  },
  {
    id: 2,
    tipo: 'egreso',
    monto: 1500,
    fecha: '2024-01-20T00:00:00Z',
    categoria_id: 4,
    proyecto_id: 1,
    descripcion: 'Pago de salarios',
    creado_por: 2,
    estado: 'pagado',
  },
];

// Pagos sin relaciones (se enriquecen en las rutas API)
export let mockPagos: PagoSocio[] = [
  {
    id: 1,
    proyecto_id: 1,
    usuario_id: 1,
    monto: 1750,
    estado: 'pendiente',
    fecha_pago: null,
  },
];

