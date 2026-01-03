/**
 * Página de Movimientos
 */

'use client';

import { useState, useEffect } from 'react';
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
import { getMovimientos, createMovimiento, updateMovimiento, deleteMovimiento } from '@/services/movimientos';
import { getProyectos } from '@/services/proyectos';
import { formatCurrency, formatDateShort } from '@/utils/format';
import { Proyecto } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function MovimientosPage() {
  const { user } = useAuth();
  const [movimientos, setMovimientos] = useState<MovimientoDetallado[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovimiento, setEditingMovimiento] = useState<MovimientoDetallado | null>(null);
  const [filtros, setFiltros] = useState<FiltroMovimientos>({});
  
  useEffect(() => {
    loadData();
  }, [filtros]);
  
  async function loadData() {
    try {
      setLoading(true);
      const [movimientosData, proyectosData] = await Promise.all([
        getMovimientos(filtros),
        getProyectos(),
      ]);
      setMovimientos(movimientosData);
      setProyectos(proyectosData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleCreateMovimiento(data: Omit<MovimientoDetallado, 'id'>) {
    await createMovimiento(data);
    setIsModalOpen(false);
    loadData();
  }
  
  async function handleUpdateMovimiento(data: Omit<MovimientoDetallado, 'id'>) {
    if (!editingMovimiento) return;
    await updateMovimiento(editingMovimiento.id, data);
    setIsModalOpen(false);
    setEditingMovimiento(null);
    loadData();
  }
  
  async function handleDelete(id: number) {
    if (confirm('¿Estás seguro de eliminar este movimiento?')) {
      await deleteMovimiento(id);
      loadData();
    }
  }
  
  function handleEdit(movimiento: MovimientoDetallado) {
    setEditingMovimiento(movimiento);
    setIsModalOpen(true);
  }
  
  function handleNew() {
    setEditingMovimiento(null);
    setIsModalOpen(true);
  }
  
  const proyectoOptions = [
    { value: '', label: 'Todos los proyectos' },
    ...proyectos.map(p => ({ value: p.id.toString(), label: p.nombre })),
  ];
  
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
            onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value || undefined }))}
          />
          <Input
            label="Fecha hasta"
            type="date"
            value={filtros.fechaHasta || ''}
            onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value || undefined }))}
          />
          <Select
            label="Tipo"
            value={filtros.tipo || ''}
            onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value as 'ingreso' | 'egreso' || undefined }))}
            options={[
              { value: '', label: 'Todos' },
              { value: 'ingreso', label: 'Ingreso' },
              { value: 'egreso', label: 'Egreso' },
            ]}
          />
          <Select
            label="Proyecto"
            value={filtros.proyecto_id?.toString() || ''}
            onChange={(e) => setFiltros(prev => ({ ...prev, proyecto_id: e.target.value ? Number(e.target.value) : undefined }))}
            options={proyectoOptions}
          />
          <Select
            label="Estado"
            value={filtros.estado || ''}
            onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value as 'pendiente' | 'pagado' || undefined }))}
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
                <TableCell className={movimiento.tipo === 'ingreso' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
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

