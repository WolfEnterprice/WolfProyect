/**
 * Componente de navegación principal
 */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/movimientos', label: 'Movimientos' },
    { href: '/proyectos', label: 'Proyectos' },
    { href: '/pagos', label: 'Pagos' },
    { href: '/reportes', label: 'Reportes' },
  ];

  function handleLogout() {
    logout();
    router.push('/login');
  }
  
  return (
    <nav className="bg-white shadow-md border-b border-primary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center gap-2">
              <img src="/icons/icono.png" alt="Wolf" className="h-8 w-8" />
              <h1 className="text-xl font-bold text-black">Wolf</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-primary-500 text-primary-700'
                        : 'border-transparent text-gray-500 hover:border-primary-300 hover:text-primary-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Usuario y logout */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user.nombre}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

