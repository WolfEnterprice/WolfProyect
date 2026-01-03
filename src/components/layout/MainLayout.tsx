/**
 * Layout principal de la aplicación
 */

'use client';

import React from 'react';
import Navbar from './Navbar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}

