/**
 * API Route mockeada para reporte de ingresos vs egresos
 */

import { NextResponse } from 'next/server';
import { DatosGrafico } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fechaDesde = searchParams.get('fechaDesde');
  const fechaHasta = searchParams.get('fechaHasta');
  
  // Datos mockeados - en producción esto calcularía desde la base de datos
  const data: DatosGrafico[] = [
    { name: 'Enero', value: 0, ingresos: 5000, egresos: 2500 },
    { name: 'Febrero', value: 0, ingresos: 6000, egresos: 3000 },
    { name: 'Marzo', value: 0, ingresos: 5500, egresos: 2800 },
    { name: 'Abril', value: 0, ingresos: 7000, egresos: 3200 },
  ];
  
  return NextResponse.json(data);
}

