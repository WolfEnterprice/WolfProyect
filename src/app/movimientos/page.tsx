/**
 * Página de Movimientos
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Table from '@/components/tables/Table';
import TableRow from '@/components/tables/TableRow';
import TableCell from '@/components/tables/TableCell';
import Badge from '@/components/ui/Badge';
import MovimientoForm from '@/components/forms/MovimientoForm';
import { MovimientoDetallado, FiltroMovimientos } from '@/types';
import { formatCurrency, formatDateShort } from '@/utils/format';
import { useAuth } from '@/contexts/AuthContext';
import { useMovimientos, useCreateMovimiento, useUpdateMovimiento, useDeleteMovimiento } from '@/hooks/useMovimientos';
import { useProyectos } from '@/hooks/useProyectos';

export default function MovimientosPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovimiento, setEditingMovimiento] = useState<MovimientoDetallado | null>(null);
  const [filtros, setFiltros] = useState<FiltroMovimientos>({});
  
  const { data: movimientos = [], isLoading: loadingMovimientos } = useMovimientos(filtros);
  const { data: proyectos = [], isLoading: loadingProyectos } = useProyectos();
  const createMutation = useCreateMovimiento();
  const updateMutation = useUpdateMovimiento();
  const deleteMutation = useDeleteMovimiento();
  
  const loading = loadingMovimientos || loadingProyectos;
  
  const handleCreateMovimiento = useCallback(async (data: Omit<MovimientoDetallado, 'id'>) => {
    await createMutation.mutateAsync(data);
    setIsModalOpen(false);
  }, [createMutation]);
  
  const handleUpdateMovimiento = useCallback(async (data: Omit<MovimientoDetallado, 'id'>) => {
    if (!editingMovimiento) return;
    await updateMutation.mutateAsync({ id: editingMovimiento.id, data });
    setIsModalOpen(false);
    setEditingMovimiento(null);
  }, [editingMovimiento, updateMutation]);
  
  const handleDelete = useCallback(async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este movimiento?')) {
      await deleteMutation.mutateAsync(id);
    }
  }, [deleteMutation]);
  
  // Para filtros de fecha, usar debounce; para selects, actualizar inmediatamente
  const handleFiltroChange = useCallback((updates: Partial<FiltroMovimientos>) => {
    setFiltros(prev => ({ ...prev, ...updates }));
  }, []);
  
  function handleEdit(movimiento: MovimientoDetallado) {
    setEditingMovimiento(movimiento);
    setIsModalOpen(true);
  }
  
  function handleNew() {
    setEditingMovimiento(null);
    setIsModalOpen(true);
  }
  
  const proyectoOptions = useMemo(() => [
    { value: '', label: 'Todos los proyectos' },
    ...proyectos.map(p => ({ value: p.id.toString(), label: p.nombre })),
  ], [proyectos]);
  
  const headers = ['Fecha', 'Tipo', 'Monto', 'Categoría', 'Proyecto', 'Descripción', 'Estado', 'Creado por', 'Acciones'];
  
  return (
    <MainLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Movimientos</h1>
          <p className="mt-2 text-gray-600">Gestión de ingresos y egresos</p>
        </div>
        <Button onClick={handleNew}>Nuevo Movimiento</Button>
      </div>
      
      {/* Filtros */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Fecha desde"
            type="date"
            value={filtros.fechaDesde || ''}
            onChange={(e) => handleFiltroChange({ fechaDesde: e.target.value || undefined })}
          />
          <Input
            label="Fecha hasta"
            type="date"
            value={filtros.fechaHasta || ''}
            onChange={(e) => handleFiltroChange({ fechaHasta: e.target.value || undefined })}
          />
          <Select
            label="Tipo"
            value={filtros.tipo || ''}
            onChange={(e) => handleFiltroChange({ tipo: e.target.value as 'ingreso' | 'egreso' || undefined })}
            options={[
              { value: '', label: 'Todos' },
              { value: 'ingreso', label: 'Ingreso' },
              { value: 'egreso', label: 'Egreso' },
            ]}
          />
          <Select
            label="Proyecto"
            value={filtros.proyecto_id?.toString() || ''}
            onChange={(e) => handleFiltroChange({ proyecto_id: e.target.value ? Number(e.target.value) : undefined })}
            options={proyectoOptions}
          />
          <Select
            label="Estado"
            value={filtros.estado || ''}
            onChange={(e) => handleFiltroChange({ estado: e.target.value as 'pendiente' | 'pagado' || undefined })}
            options={[
              { value: '', label: 'Todos' },
              { value: 'pendiente', label: 'Pendiente' },
              { value: 'pagado', label: 'Pagado' },
            ]}
          />
        </div>
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltros({})}
          >
            Limpiar Filtros
          </Button>
        </div>
      </Card>
      
      {/* Tabla */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando movimientos...</p>
          </div>
        ) : movimientos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay movimientos</p>
          </div>
        ) : (
          <Table headers={headers}>
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
                <TableCell>{movimiento.proyecto?.nombre || '-'}</TableCell>
                <TableCell className="max-w-xs truncate">{movimiento.descripcion}</TableCell>
                <TableCell>
                  <Badge variant={movimiento.estado === 'pagado' ? 'success' : 'warning'}>
                    {movimiento.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                  </Badge>
                </TableCell>
                <TableCell>{movimiento.creado_por_usuario?.nombre || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(movimiento)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(movimiento.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>
      
      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMovimiento(null);
        }}
        title={editingMovimiento ? 'Editar Movimiento' : 'Nuevo Movimiento'}
      >
        <MovimientoForm
          movimiento={editingMovimiento || undefined}
          onSubmit={editingMovimiento ? handleUpdateMovimiento : handleCreateMovimiento}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingMovimiento(null);
          }}
          usuarioId={typeof user?.id === 'number' ? user.id : Number(user?.id) || 0}
        />
      </Modal>
    </MainLayout>
  );
}

