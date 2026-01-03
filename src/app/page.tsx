/**
 * Página principal - Dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import { EstadisticasDashboard } from '@/types';
import { getEstadisticasDashboard } from '@/services/dashboard';
import { formatCurrency, formatDate } from '@/utils/format';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [estadisticas, setEstadisticas] = useState<EstadisticasDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Solo cargar datos cuando el usuario esté autenticado
    if (!authLoading && user) {
      loadEstadisticas();
    }
  }, [authLoading, user]);
  
  async function loadEstadisticas() {
    try {
      setLoading(true);
      const data = await getEstadisticasDashboard();
      setEstadisticas(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  }
  
  // Mostrar loading mientras se verifica la autenticación o se cargan los datos
  if (authLoading || loading) {
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
  
  const gananciaColor = estadisticas.gananciaNeta >= 0 ? 'text-green-600' : 'text-red-600';
  
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
              <p className="mt-2 text-2xl font-bold text-green-600">
                {formatCurrency(estadisticas.totalIngresos)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                {formatCurrency(estadisticas.totalEgresos)}
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
                {formatCurrency(estadisticas.gananciaNeta)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                {estadisticas.proyectosActivos}
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
              <p className="text-4xl font-bold text-orange-600">
                {estadisticas.pagosPendientes}
              </p>
              <p className="mt-2 text-gray-600">Pagos pendientes entre socios</p>
            </div>
          </div>
        </Card>
        
        <Card title="Próximas Fechas Importantes">
          <div className="space-y-4">
            {estadisticas.proximasFechas.length > 0 ? (
              estadisticas.proximasFechas.map((fecha, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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


