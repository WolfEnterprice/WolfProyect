/**
 * Constantes del sistema
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const ESTADOS_PROYECTO = ['activo', 'completado', 'cancelado'] as const;

export const ESTADOS_MOVIMIENTO = ['pendiente', 'pagado'] as const;

export const TIPOS_MOVIMIENTO = ['ingreso', 'egreso'] as const;

export const ESTADOS_PAGO = ['pendiente', 'pagado'] as const;

