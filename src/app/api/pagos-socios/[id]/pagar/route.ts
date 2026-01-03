/**
 * API Route mockeada para marcar pago como pagado
 */

import { NextResponse } from 'next/server';
import { PagoSocioDetallado } from '@/types';
import { mockPagos, mockProyectos, mockUsuarios } from '@/services/mockData';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const index = mockPagos.findIndex(p => p.id === id);
  
  if (index === -1) {
    return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });
  }
  
  mockPagos[index] = {
    ...mockPagos[index],
    estado: 'pagado',
    fecha_pago: new Date().toISOString(),
  };
  
  // Enriquecer con relaciones para la respuesta
  const pagoEnriquecido: PagoSocioDetallado = {
    ...mockPagos[index],
    proyecto: mockProyectos.find(p => p.id === mockPagos[index].proyecto_id),
    usuario: mockUsuarios.find(u => u.id === mockPagos[index].usuario_id),
  };
  
  return NextResponse.json(pagoEnriquecido);
}

