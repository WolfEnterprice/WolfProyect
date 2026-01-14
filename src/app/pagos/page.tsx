/**
 * Página de Pagos entre Socios
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Table from '@/components/tables/Table';
import TableRow from '@/components/tables/TableRow';
import TableCell from '@/components/tables/TableCell';
import Badge from '@/components/ui/Badge';
import PagoForm from '@/components/forms/PagoForm';
import { PagoSocioDetallado } from '@/types';
import { formatCurrency, formatDateShort } from '@/utils/format';
import { usePagos, useCreatePago, useMarcarPagoComoPagado } from '@/hooks/usePagos';

export default function PagosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mostrarSoloPendientes, setMostrarSoloPendientes] = useState(false);
  
  const { data: pagos = [], isLoading: loading } = usePagos(mostrarSoloPendientes);
  const createMutation = useCreatePago();
  const marcarPagadoMutation = useMarcarPagoComoPagado();
  
  const handleCreatePago = useCallback(async (data: Omit<PagoSocioDetallado, 'id'>) => {
    await createMutation.mutateAsync(data);
    setIsModalOpen(false);
  }, [createMutation]);
  
  const handleMarcarComoPagado = useCallback(async (id: number) => {
    if (confirm('¿Marcar este pago como pagado?')) {
      await marcarPagadoMutation.mutateAsync(id);
    }
  }, [marcarPagadoMutation]);
  
  const pagosPendientesCount = useMemo(
    () => pagos.filter(p => p.estado === 'pendiente').length,
    [pagos]
  );
  
  function handleNew() {
    setIsModalOpen(true);
  }
  
  const headers = ['Proyecto', 'Usuario', 'Monto', 'Estado', 'Fecha de Pago', 'Acciones'];
  
  return (
    <MainLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pagos entre Socios</h1>
          <p className="mt-2 text-gray-600">Gestión de pagos entre socios por proyecto</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant={mostrarSoloPendientes ? 'primary' : 'outline'}
            onClick={() => setMostrarSoloPendientes(!mostrarSoloPendientes)}
          >
            {mostrarSoloPendientes ? 'Mostrar Todos' : 'Solo Pendientes'}
          </Button>
          <Button onClick={handleNew}>Nuevo Pago</Button>
        </div>
      </div>
      
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pagos Pendientes</p>
              <p className="mt-2 text-2xl font-bold text-lime-600">
                {pagosPendientesCount}
              </p>
            </div>
            <div className="p-3 bg-lime-100 rounded-full">
              <svg className="w-6 h-6 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Pagos</p>
              <p className="mt-2 text-2xl font-bold text-primary-600">
                {pagos.length}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Tabla */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando pagos...</p>
          </div>
        ) : pagos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay pagos</p>
          </div>
        ) : (
          <Table headers={headers}>
            {pagos.map((pago) => (
              <TableRow key={pago.id}>
                <TableCell>{pago.proyecto?.nombre || 'N/A'}</TableCell>
                <TableCell>{pago.usuario?.nombre || 'N/A'}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(pago.monto)}
                </TableCell>
                <TableCell>
                  <Badge variant={pago.estado === 'pagado' ? 'success' : 'warning'}>
                    {pago.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {pago.fecha_pago ? formatDateShort(pago.fecha_pago) : '-'}
                </TableCell>
                <TableCell>
                  {pago.estado === 'pendiente' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleMarcarComoPagado(pago.id)}
                      disabled={marcarPagadoMutation.isPending}
                    >
                      Marcar como Pagado
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>
      
      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo Pago"
      >
        <PagoForm
          onSubmit={handleCreatePago}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </MainLayout>
  );
}

