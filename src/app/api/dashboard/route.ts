/**
 * API Route mockeada para dashboard
 */

import { NextResponse } from 'next/server';
import { EstadisticasDashboard } from '@/types';

// Datos mockeados
const estadisticas: EstadisticasDashboard = {
  totalIngresos: 15000,
  totalEgresos: 8500,
  gananciaNeta: 6500,
  proyectosActivos: 2,
  pagosPendientes: 3,
  proximasFechas: [
    {
      fecha: '2024-03-15T00:00:00Z',
      descripcion: 'Vencimiento de pago - Proyecto Alpha',
      tipo: 'Pago',
    },
    {
      fecha: '2024-03-20T00:00:00Z',
      descripcion: 'Reunión de socios',
      tipo: 'Reunión',
    },
  ],
};

export async function GET() {
  return NextResponse.json(estadisticas);
}

