/**
 * API Route mockeada para pago individual
 */

import { NextResponse } from 'next/server';
import { PagoSocioDetallado } from '@/types';
import { mockPagos, mockProyectos, mockUsuarios } from '@/services/mockData';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const pago = mockPagos.find(p => p.id === id);
  
  if (!pago) {
    return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });
  }
  
  // Enriquecer con relaciones
  const pagoEnriquecido: PagoSocioDetallado = {
    ...pago,
    proyecto: mockProyectos.find(p => p.id === pago.proyecto_id),
    usuario: mockUsuarios.find(u => u.id === pago.usuario_id),
  };
  
  return NextResponse.json(pagoEnriquecido);
}

