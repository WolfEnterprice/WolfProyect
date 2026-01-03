/**
 * API Route mockeada para movimiento individual
 */

import { NextResponse } from 'next/server';
import { MovimientoDetallado } from '@/types';
import { mockMovimientos, mockCategorias, mockProyectos, mockUsuarios } from '@/services/mockData';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const movimiento = mockMovimientos.find(m => m.id === id);
  
  if (!movimiento) {
    return NextResponse.json({ error: 'Movimiento no encontrado' }, { status: 404 });
  }
  
  // Enriquecer con relaciones
  const movimientoEnriquecido: MovimientoDetallado = {
    ...movimiento,
    categoria: mockCategorias.find(c => c.id === movimiento.categoria_id),
    proyecto: movimiento.proyecto_id ? mockProyectos.find(p => p.id === movimiento.proyecto_id) : undefined,
    creado_por_usuario: mockUsuarios.find(u => u.id === movimiento.creado_por),
  };
  
  return NextResponse.json(movimientoEnriquecido);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const data = await request.json();
  
  const index = mockMovimientos.findIndex(m => m.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Movimiento no encontrado' }, { status: 404 });
  }
  
  const movimientoActualizado = {
    ...mockMovimientos[index],
    ...data,
  };
  
  mockMovimientos[index] = movimientoActualizado;
  
  // Enriquecer con relaciones para la respuesta
  const movimientoEnriquecido: MovimientoDetallado = {
    ...movimientoActualizado,
    categoria: mockCategorias.find(c => c.id === movimientoActualizado.categoria_id),
    proyecto: movimientoActualizado.proyecto_id ? mockProyectos.find(p => p.id === movimientoActualizado.proyecto_id) : undefined,
    creado_por_usuario: mockUsuarios.find(u => u.id === movimientoActualizado.creado_por),
  };
  
  return NextResponse.json(movimientoEnriquecido);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const index = mockMovimientos.findIndex(m => m.id === id);
  
  if (index === -1) {
    return NextResponse.json({ error: 'Movimiento no encontrado' }, { status: 404 });
  }
  
  mockMovimientos.splice(index, 1);
  return NextResponse.json({ success: true });
}

