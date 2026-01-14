import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import QueryProvider from '@/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'Wolf - Gestión Financiera',
  description: 'Sistema de gestión financiera empresarial',
  icons: {
    icon: '/icons/icono.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
