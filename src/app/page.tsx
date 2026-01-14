/**
 * Página principal - Dashboard
 */

'use client';

import { useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/utils/format';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardPage() {
  const { loading: authLoading } = useAuth();
  const { data: estadisticas, isLoading, error: queryError } = useDashboard();
  
  const error = queryError instanceof Error ? queryError.message : '';
  
  // Mostrar loading mientras se verifica la autenticación o se cargan los datos
  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-500">Cargando estadísticas...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (error || !estadisticas) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-red-500">Error: {error || 'No se pudieron cargar las estadísticas'}</p>
        </div>
      </MainLayout>
    );
  }
  
  const gananciaColor = useMemo(
    () => estadisticas?.gananciaNeta >= 0 ? 'text-teal-600' : 'text-red-600',
    [estadisticas?.gananciaNeta]
  );
  
  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Resumen financiero general</p>
      </div>
      
      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Ingresos</p>
              <p className="mt-2 text-2xl font-bold text-teal-600">
                {formatCurrency(estadisticas?.totalIngresos || 0)}
              </p>
            </div>
            <div className="p-3 bg-teal-100 rounded-full">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Egresos</p>
              <p className="mt-2 text-2xl font-bold text-red-600">
                {formatCurrency(estadisticas?.totalEgresos || 0)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Ganancia Neta</p>
              <p className={`mt-2 text-2xl font-bold ${gananciaColor}`}>
                {formatCurrency(estadisticas?.gananciaNeta || 0)}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Proyectos Activos</p>
              <p className="mt-2 text-2xl font-bold text-primary-600">
                {estadisticas?.proyectosActivos || 0}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Pagos pendientes y próximas fechas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Pagos Pendientes">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-lime-600">
                {estadisticas?.pagosPendientes || 0}
              </p>
              <p className="mt-2 text-gray-600">Pagos pendientes entre socios</p>
            </div>
          </div>
        </Card>
        
        <Card title="Próximas Fechas Importantes">
          <div className="space-y-4">
            {estadisticas?.proximasFechas && estadisticas.proximasFechas.length > 0 ? (
              estadisticas.proximasFechas.map((fecha, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-100">
                  <div>
                    <p className="font-medium text-gray-900">{fecha.descripcion}</p>
                    <p className="text-sm text-gray-500">{fecha.tipo}</p>
                  </div>
                  <p className="text-sm font-medium text-primary-600">
                    {formatDate(fecha.fecha)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay fechas próximas</p>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}


