/**
 * API Route mockeada para pagos entre socios
 */

import { NextResponse } from 'next/server';
import { PagoSocioDetallado } from '@/types';
import { mockPagos, mockProyectos, mockUsuarios } from '@/services/mockData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const estado = searchParams.get('estado');
  
  // Enriquecer pagos con relaciones
  const pagosEnriquecidos = mockPagos.map(p => ({
    ...p,
    proyecto: mockProyectos.find(proj => proj.id === p.proyecto_id),
    usuario: mockUsuarios.find(u => u.id === p.usuario_id),
  }));
  
  let filtered = [...pagosEnriquecidos];
  
  if (estado) {
    filtered = filtered.filter(p => p.estado === estado);
  }
  
  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  const data = await request.json();
  const nuevoId = Math.max(...mockPagos.map(p => p.id), 0) + 1;
  const nuevoPago: PagoSocioDetallado = {
    id: nuevoId,
    ...data,
    proyecto: mockProyectos.find(p => p.id === data.proyecto_id),
    usuario: mockUsuarios.find(u => u.id === data.usuario_id),
  };
  mockPagos.push(nuevoPago);
  return NextResponse.json(nuevoPago, { status: 201 });
}

