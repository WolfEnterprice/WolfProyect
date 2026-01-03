/**
 * API Route mockeada para usuarios
 */

import { NextResponse } from 'next/server';
import { mockUsuarios } from '@/services/mockData';

export async function GET() {
  return NextResponse.json(mockUsuarios.filter(u => u.activo));
}

