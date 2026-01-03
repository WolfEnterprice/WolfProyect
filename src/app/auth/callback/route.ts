/**
 * Ruta de callback para OAuth de Supabase
 * Maneja la redirección después de autenticarse con Google/GitHub
 * Supabase maneja automáticamente el intercambio de código por sesión
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get('next') || '/';

  // Supabase ya procesó el código automáticamente
  // Solo redirigimos al dashboard
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

