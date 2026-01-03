/**
 * Servicio de autenticación usando Supabase Auth
 */

import { supabase } from '@/lib/supabase';
import { Usuario } from '@/types';

/**
 * Login con email y password (opcional, para usuarios sin OAuth)
 */
export async function login(email: string, password: string): Promise<Usuario> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    throw new Error(error?.message || 'Error al iniciar sesión');
  }

  // Obtener el usuario de nuestra tabla usuarios
  return getUsuarioFromDb(data.user.id);
}

/**
 * Login con Google
 */
export async function loginWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Login con GitHub
 */
export async function loginWithGitHub(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Cerrar sesión
 */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Obtener usuario actual
 */
export async function getCurrentUser(): Promise<Usuario | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  return getUsuarioFromDb(user.id);
}

/**
 * Obtener sesión actual
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Helper: Obtener usuario de la tabla usuarios por ID de auth
 */
async function getUsuarioFromDb(userId: string): Promise<Usuario> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    // Si no existe en nuestra tabla, crear uno básico
    // (la función handle_new_user debería hacerlo, pero por si acaso)
    throw new Error('Usuario no encontrado en la base de datos');
  }

  // Type assertion para asegurar que data tiene los campos necesarios
  const usuarioData = data as {
    id: number;
    nombre: string;
    email: string;
    activo: boolean;
  };

  return {
    id: usuarioData.id,
    nombre: usuarioData.nombre,
    email: usuarioData.email,
    activo: usuarioData.activo,
  };
}

/**
 * Suscribirse a cambios de autenticación
 */
export function onAuthStateChange(callback: (user: Usuario | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      try {
        const usuario = await getUsuarioFromDb(session.user.id);
        callback(usuario);
      } catch (error) {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
}

