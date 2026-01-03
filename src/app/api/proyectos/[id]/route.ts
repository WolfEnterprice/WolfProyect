/**
 * API Route mockeada para proyecto individual
 */

import { NextResponse } from 'next/server';
import { mockProyectos } from '@/services/mockData';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const proyecto = mockProyectos.find(p => p.id === id);
  
  if (!proyecto) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }
  
  return NextResponse.json(proyecto);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const data = await request.json();
  
  const index = mockProyectos.findIndex(p => p.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }
  
  mockProyectos[index] = { ...mockProyectos[index], ...data };
  return NextResponse.json(mockProyectos[index]);
}

