/**
 * API Route mockeada para repartos de proyecto
 */

import { NextResponse } from 'next/server';
import { RepartoProyectoDetallado } from '@/types';
import { mockUsuarios, mockProyectos } from '@/services/mockData';

// Datos mockeados de repartos
let mockRepartos: Omit<RepartoProyectoDetallado, 'usuario' | 'proyecto'>[] = [
  {
    id: 1,
    proyecto_id: 1,
    usuario_id: 1,
    porcentaje: 50,
  },
  {
    id: 2,
    proyecto_id: 1,
    usuario_id: 2,
    porcentaje: 50,
  },
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const proyectoId = Number(params.id);
  const proyectoRepartos = mockRepartos
    .filter(r => r.proyecto_id === proyectoId)
    .map(r => ({
      ...r,
      usuario: mockUsuarios.find(u => u.id === r.usuario_id),
      proyecto: mockProyectos.find(p => p.id === r.proyecto_id),
    }));
  return NextResponse.json(proyectoRepartos);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  const nuevoId = Math.max(...mockRepartos.map(r => r.id), 0) + 1;
  const nuevoReparto = {
    id: nuevoId,
    ...data,
  };
  mockRepartos.push(nuevoReparto);
  
  const repartoEnriquecido: RepartoProyectoDetallado = {
    ...nuevoReparto,
    usuario: mockUsuarios.find(u => u.id === nuevoReparto.usuario_id),
    proyecto: mockProyectos.find(p => p.id === nuevoReparto.proyecto_id),
  };
  
  return NextResponse.json(repartoEnriquecido, { status: 201 });
}

