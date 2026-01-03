/**
 * Contexto de autenticación usando Supabase Auth
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '@/types';
import { 
  login as loginService, 
  loginWithGoogle, 
  loginWithGitHub,
  logout as logoutService,
  getCurrentUser,
  onAuthStateChange
} from '@/services/auth';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Verificar usuario actual
    async function initialize() {
      try {
        const currentUser = await getCurrentUser();
        if (mounted) {
          setUser(currentUser);
          setLoading(false);
        }
      } catch (error) {
        // Si no hay usuario, está bien - el usuario no está autenticado
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    }

    initialize();

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = onAuthStateChange((user) => {
      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const userData = await loginService(email, password);
    setUser(userData);
  };

  const handleLoginWithGoogle = async () => {
    await loginWithGoogle();
    // El usuario será actualizado por el listener de auth state change
  };

  const handleLoginWithGitHub = async () => {
    await loginWithGitHub();
    // El usuario será actualizado por el listener de auth state change
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    loginWithGoogle: handleLoginWithGoogle,
    loginWithGitHub: handleLoginWithGitHub,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

