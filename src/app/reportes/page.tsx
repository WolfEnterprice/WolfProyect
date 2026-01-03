/**
 * Página de Reportes
 */

'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import IngresosVsEgresosChart from '@/components/charts/IngresosVsEgresosChart';
import GananciaPorProyectoChart from '@/components/charts/GananciaPorProyectoChart';
import { DatosGrafico, FiltroFecha } from '@/types';
import { getIngresosVsEgresos, getGananciaPorProyecto } from '@/services/reportes';

export default function ReportesPage() {
  const [filtros, setFiltros] = useState<FiltroFecha>({});
  const [ingresosVsEgresos, setIngresosVsEgresos] = useState<DatosGrafico[]>([]);
  const [gananciaPorProyecto, setGananciaPorProyecto] = useState<DatosGrafico[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadReportes();
  }, [filtros]);
  
  async function loadReportes() {
    try {
      setLoading(true);
      const [ingresosData, gananciaData] = await Promise.all([
        getIngresosVsEgresos(filtros),
        getGananciaPorProyecto(filtros),
      ]);
      setIngresosVsEgresos(ingresosData);
      setGananciaPorProyecto(gananciaData);
    } catch (err) {
      console.error('Error loading reportes:', err);
    } finally {
      setLoading(false);
    }
  }
  
  function handleLimpiarFiltros() {
    setFiltros({});
  }
  
  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
        <p className="mt-2 text-gray-600">Análisis financiero y estadísticas</p>
      </div>
      
      {/* Filtros */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Fecha desde"
            type="date"
            value={filtros.fechaDesde || ''}
            onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value || undefined }))}
          />
          <Input
            label="Fecha hasta"
            type="date"
            value={filtros.fechaHasta || ''}
            onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value || undefined }))}
          />
          <div className="flex items-end">
            <Button variant="outline" onClick={handleLimpiarFiltros}>
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Gráfico de Ingresos vs Egresos */}
      <Card title="Ingresos vs Egresos" className="mb-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        ) : ingresosVsEgresos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay datos para mostrar</p>
          </div>
        ) : (
          <IngresosVsEgresosChart data={ingresosVsEgresos} />
        )}
      </Card>
      
      {/* Gráfico de Ganancia por Proyecto */}
      <Card title="Ganancia por Proyecto">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        ) : gananciaPorProyecto.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay datos para mostrar</p>
          </div>
        ) : (
          <GananciaPorProyectoChart data={gananciaPorProyecto} />
        )}
      </Card>
    </MainLayout>
  );
}

