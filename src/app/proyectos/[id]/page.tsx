/**
 * Página de detalle de proyecto
 */

'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table from '@/components/tables/Table';
import TableRow from '@/components/tables/TableRow';
import TableCell from '@/components/tables/TableCell';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDateShort } from '@/utils/format';
import { useProyecto, useRepartosProyecto } from '@/hooks/useProyectos';
import { useMovimientos } from '@/hooks/useMovimientos';

export default function ProyectoDetailPage() {
  const params = useParams();
  const proyectoId = Number(params.id);
  
  const { data: proyecto, isLoading: loadingProyecto } = useProyecto(proyectoId);
  const { data: movimientos = [], isLoading: loadingMovimientos } = useMovimientos({ proyecto_id: proyectoId });
  const { data: repartos = [], isLoading: loadingRepartos } = useRepartosProyecto(proyectoId);
  
  const loading = loadingProyecto || loadingMovimientos || loadingRepartos;
  
  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando proyecto...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (!proyecto) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-red-500">Proyecto no encontrado</p>
        </div>
      </MainLayout>
    );
  }
  
  // Calcular estadísticas del proyecto con useMemo para optimización
  const { ingresos, egresos, ganancia } = useMemo(() => {
    const ingresosTotal = movimientos
      .filter(m => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + m.monto, 0);
    
    const egresosTotal = movimientos
      .filter(m => m.tipo === 'egreso')
      .reduce((sum, m) => sum + m.monto, 0);
    
    return {
      ingresos: ingresosTotal,
      egresos: egresosTotal,
      ganancia: ingresosTotal - egresosTotal,
    };
  }, [movimientos]);
  
  function getEstadoBadgeVariant(estado: string) {
    switch (estado) {
      case 'activo':
        return 'success';
      case 'completado':
        return 'info';
      case 'cancelado':
        return 'danger';
      default:
        return 'default';
    }
  }
  
  return (
    <MainLayout>
      <div className="mb-8">
        <Button variant="outline" onClick={() => window.history.back()}>
          ← Volver
        </Button>
      </div>
      
      {/* Información del proyecto */}
      <Card className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{proyecto.nombre}</h1>
            <Badge variant={getEstadoBadgeVariant(proyecto.estado)} className="mt-2">
              {proyecto.estado}
            </Badge>
          </div>
        </div>
        <p className="text-gray-600 mb-4">{proyecto.descripcion}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Fecha de inicio:</span>
            <span className="ml-2 font-medium">{formatDateShort(proyecto.fecha_inicio)}</span>
          </div>
          {proyecto.fecha_fin && (
            <div>
              <span className="text-gray-500">Fecha de fin:</span>
              <span className="ml-2 font-medium">{formatDateShort(proyecto.fecha_fin)}</span>
            </div>
          )}
        </div>
      </Card>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <p className="text-sm font-medium text-gray-500">Ingresos</p>
          <p className="mt-2 text-2xl font-bold text-teal-600">
            {formatCurrency(ingresos)}
          </p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Egresos</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {formatCurrency(egresos)}
          </p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Ganancia</p>
          <p className={`mt-2 text-2xl font-bold ${ganancia >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
            {formatCurrency(ganancia)}
          </p>
        </Card>
      </div>
      
      {/* Repartos */}
      {repartos.length > 0 && (
        <Card title="Reparto por Socios" className="mb-6">
          <Table headers={['Socio', 'Porcentaje', 'Ganancia Estimada']}>
            {repartos.map((reparto) => {
              const gananciaSocio = (ganancia * reparto.porcentaje) / 100;
              return (
                <TableRow key={reparto.id}>
                  <TableCell>{reparto.usuario?.nombre || 'N/A'}</TableCell>
                  <TableCell>{reparto.porcentaje}%</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(gananciaSocio)}
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        </Card>
      )}
      
      {/* Movimientos */}
      <Card title="Movimientos del Proyecto">
        {movimientos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay movimientos asociados</p>
          </div>
        ) : (
          <Table headers={['Fecha', 'Tipo', 'Monto', 'Categoría', 'Descripción', 'Estado']}>
            {movimientos.map((movimiento) => (
              <TableRow key={movimiento.id}>
                <TableCell>{formatDateShort(movimiento.fecha)}</TableCell>
                <TableCell>
                  <Badge variant={movimiento.tipo === 'ingreso' ? 'success' : 'danger'}>
                    {movimiento.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                  </Badge>
                </TableCell>
                <TableCell className={movimiento.tipo === 'ingreso' ? 'text-teal-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {movimiento.tipo === 'ingreso' ? '+' : '-'}
                  {formatCurrency(movimiento.monto)}
                </TableCell>
                <TableCell>{movimiento.categoria?.nombre || 'N/A'}</TableCell>
                <TableCell className="max-w-xs truncate">{movimiento.descripcion}</TableCell>
                <TableCell>
                  <Badge variant={movimiento.estado === 'pagado' ? 'success' : 'warning'}>
                    {movimiento.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>
    </MainLayout>
  );
}

