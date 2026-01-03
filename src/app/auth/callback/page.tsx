/**
 * Página del cliente para procesar el callback de OAuth
 * Supabase procesa automáticamente el token del hash fragment
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    let checkSessionTimeout: NodeJS.Timeout | null = null;

    async function initialize() {
      // Verificar si hay un error en los query params o hash
      let errorParam = searchParams.get('error');
      let errorDescription = searchParams.get('error_description');
      
      // Verificar también en el hash fragment
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        errorParam = errorParam || hashParams.get('error');
        errorDescription = errorDescription || hashParams.get('error_description');
      }

      // Si hay un error de OAuth, mostrar el error
      if (errorParam) {
        const errorMessage = errorDescription || errorParam;
        setError(errorMessage);
        setIsProcessing(false);
        setTimeout(() => router.push(`/login?error=${encodeURIComponent(errorMessage)}`), 3000);
        return;
      }

      // Verificar inmediatamente si ya hay una sesión (Supabase puede haber procesado el hash automáticamente)
      const { data: { session: initialSession }, error: initialError } = await supabase.auth.getSession();
      
      if (initialSession) {
        console.log('Sesión encontrada inmediatamente');
        setIsProcessing(false);
        
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', window.location.pathname);
        }

        const next = searchParams.get('next') || '/';
        router.push(next);
        return;
      }

      if (initialError) {
        console.error('Error inicial obteniendo sesión:', initialError);
      }

      // Configurar un listener para detectar cuando Supabase procesa el token del hash
      // Este es el método recomendado para manejar callbacks de OAuth
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change event:', event);
        console.log('Session:', session ? 'Activa' : 'No activa');

        if (event === 'SIGNED_IN' && session) {
          console.log('Usuario autenticado correctamente');
          setIsProcessing(false);
          
          // Limpiar el hash de la URL para seguridad
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.pathname);
          }

          // Redirigir al dashboard
          const next = searchParams.get('next') || '/';
          router.push(next);
        } else if (event === 'SIGNED_OUT') {
          console.log('Usuario no autenticado');
          setIsProcessing(false);
          setError('No se pudo establecer la sesión. Por favor intenta de nuevo.');
          setTimeout(() => router.push('/login'), 3000);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Si el token se refrescó y hay sesión, también es válido
          console.log('Token refrescado, sesión activa');
          setIsProcessing(false);
          
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.pathname);
          }

          const next = searchParams.get('next') || '/';
          router.push(next);
        }
      });

      subscription = authSubscription;

      // También verificar la sesión directamente después de un delay
      // Esto es un fallback en caso de que el evento no se dispare
      checkSessionTimeout = setTimeout(async () => {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error obteniendo sesión:', sessionError);
          setIsProcessing(false);
          setError('Error al verificar la sesión: ' + sessionError.message);
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        if (session) {
          console.log('Sesión encontrada directamente (fallback)');
          setIsProcessing(false);
          
          // Limpiar el hash de la URL
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.pathname);
          }

          // Redirigir al dashboard
          const next = searchParams.get('next') || '/';
          router.push(next);
        } else {
          // Si no hay sesión después de esperar, verificar si hay un código para PKCE
          const code = searchParams.get('code');
          
          if (code) {
            console.log('Intentando intercambiar código por sesión (PKCE flow)...');
            try {
              const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
              
              if (exchangeError) {
                console.error('Error intercambiando código por sesión:', exchangeError);
                setIsProcessing(false);
                setError(exchangeError.message);
                setTimeout(() => router.push(`/login?error=${encodeURIComponent(exchangeError.message)}`), 3000);
                return;
              }
              
              // Verificar nuevamente después del intercambio
              const { data: { session: newSession } } = await supabase.auth.getSession();
              if (newSession) {
                setIsProcessing(false);
                const next = searchParams.get('next') || '/';
                router.push(next);
              } else {
                setIsProcessing(false);
                setError('No se pudo establecer la sesión después del intercambio.');
                setTimeout(() => router.push('/login'), 3000);
              }
            } catch (err: any) {
              console.error('Error en intercambio:', err);
              setIsProcessing(false);
              setError(err.message || 'Error al procesar la autenticación');
              setTimeout(() => router.push('/login'), 3000);
            }
          } else {
            // No hay código ni sesión después de esperar
            setIsProcessing(false);
            setError('No se pudo completar la autenticación. Por favor intenta de nuevo.');
            setTimeout(() => router.push('/login'), 3000);
          }
        }
      }, 2000); // Esperar 2 segundos antes de verificar directamente
    }

    initialize();

    // Cleanup
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      if (checkSessionTimeout) {
        clearTimeout(checkSessionTimeout);
      }
    };
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error de autenticación</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Procesando autenticación...</h2>
        <p className="text-gray-600">Por favor espera mientras completamos tu inicio de sesión.</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Cargando...</h2>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
