/**
 * API Route mockeada para login
 */

import { NextResponse } from 'next/server';
import { mockUsuarios } from '@/services/mockData';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Validación mockeada - en producción esto verificará contra una base de datos
  // Para el mock, aceptamos cualquier password si el email existe
  const usuario = mockUsuarios.find(u => u.email === email);

  if (!usuario) {
    return NextResponse.json(
      { error: 'Credenciales inválidas' },
      { status: 401 }
    );
  }

  // En producción, aquí verificarías el password con bcrypt o similar
  // if (!await bcrypt.compare(password, usuario.password_hash)) {
  //   return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  // }

  // No devolver el password en la respuesta
  const { ...userWithoutPassword } = usuario;

  return NextResponse.json(userWithoutPassword);
}

