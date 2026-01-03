/**
 * API Route mockeada para reporte de ganancia por proyecto
 */

import { NextResponse } from 'next/server';
import { DatosGrafico } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fechaDesde = searchParams.get('fechaDesde');
  const fechaHasta = searchParams.get('fechaHasta');
  
  // Datos mockeados - en producción esto calcularía desde la base de datos
  const data: DatosGrafico[] = [
    { name: 'Proyecto Alpha', value: 3500 },
    { name: 'Proyecto Beta', value: 2800 },
    { name: 'Proyecto Gamma', value: 1200 },
  ];
  
  return NextResponse.json(data);
}

