/**
 * API Route mockeada para proyectos
 */

import { NextResponse } from 'next/server';
import { Proyecto } from '@/types';
import { mockProyectos } from '@/services/mockData';

export async function GET() {
  return NextResponse.json(mockProyectos);
}

export async function POST(request: Request) {
  const data = await request.json();
  const nuevoProyecto: Proyecto = {
    id: Math.max(...mockProyectos.map(p => p.id), 0) + 1,
    ...data,
  };
  mockProyectos.push(nuevoProyecto);
  return NextResponse.json(nuevoProyecto, { status: 201 });
}

