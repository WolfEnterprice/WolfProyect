/**
 * API Route mockeada para obtener usuario actual
 * En producción, esto verificaría el token JWT
 */

import { NextResponse } from 'next/server';
import { mockUsuarios } from '@/services/mockData';

export async function GET(request: Request) {
  // En producción, extraerías el token del header Authorization
  // const token = request.headers.get('authorization')?.replace('Bearer ', '');
  // const decoded = jwt.verify(token, JWT_SECRET);
  // const usuario = await findUserById(decoded.userId);

  // Por ahora, devolvemos el primer usuario como mock
  // En producción esto vendría del token
  const usuario = mockUsuarios[0];

  if (!usuario) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  return NextResponse.json(usuario);
}

