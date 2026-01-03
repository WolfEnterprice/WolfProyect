/**
 * API Route mockeada para categorías
 */

import { NextResponse } from 'next/server';
import { mockCategorias } from '@/services/mockData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo');
  
  if (tipo) {
    return NextResponse.json(mockCategorias.filter(c => c.tipo === tipo));
  }
  
  return NextResponse.json(mockCategorias);
}

