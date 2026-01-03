/**
 * API Route mockeada para movimientos
 */

import { NextResponse } from 'next/server';
import { MovimientoDetallado } from '@/types';
import { mockMovimientos, mockCategorias, mockProyectos, mockUsuarios } from '@/services/mockData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fechaDesde = searchParams.get('fechaDesde');
  const fechaHasta = searchParams.get('fechaHasta');
  const tipo = searchParams.get('tipo');
  const proyecto_id = searchParams.get('proyecto_id');
  const estado = searchParams.get('estado');
  
  // Enriquecer movimientos con relaciones
  const movimientosEnriquecidos: MovimientoDetallado[] = mockMovimientos.map(m => ({
    ...m,
    categoria: mockCategorias.find(c => c.id === m.categoria_id),
    proyecto: m.proyecto_id ? mockProyectos.find(p => p.id === m.proyecto_id) : undefined,
    creado_por_usuario: mockUsuarios.find(u => u.id === m.creado_por),
  }));
  
  let filtered = [...movimientosEnriquecidos];
  
  if (fechaDesde) {
    filtered = filtered.filter(m => new Date(m.fecha) >= new Date(fechaDesde));
  }
  
  if (fechaHasta) {
    filtered = filtered.filter(m => new Date(m.fecha) <= new Date(fechaHasta));
  }
  
  if (tipo) {
    filtered = filtered.filter(m => m.tipo === tipo);
  }
  
  if (proyecto_id) {
    filtered = filtered.filter(m => m.proyecto_id === Number(proyecto_id));
  }
  
  if (estado) {
    filtered = filtered.filter(m => m.estado === estado);
  }
  
  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  const data = await request.json();
  const nuevoId = Math.max(...mockMovimientos.map(m => m.id), 0) + 1;
  const nuevoMovimiento: MovimientoDetallado = {
    id: nuevoId,
    ...data,
    categoria: mockCategorias.find(c => c.id === data.categoria_id),
    proyecto: data.proyecto_id ? mockProyectos.find(p => p.id === data.proyecto_id) : undefined,
    creado_por_usuario: mockUsuarios.find(u => u.id === data.creado_por),
  };
  mockMovimientos.push(nuevoMovimiento);
  return NextResponse.json(nuevoMovimiento, { status: 201 });
}

