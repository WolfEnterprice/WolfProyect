/**
 * Página de Proyectos
 */

'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Table from '@/components/tables/Table';
import TableRow from '@/components/tables/TableRow';
import TableCell from '@/components/tables/TableCell';
import Badge from '@/components/ui/Badge';
import ProyectoForm from '@/components/forms/ProyectoForm';
import { Proyecto } from '@/types';
import { formatDateShort } from '@/utils/format';
import { useProyectos, useCreateProyecto, useUpdateProyecto } from '@/hooks/useProyectos';

export default function ProyectosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState<Proyecto | null>(null);
  
  const { data: proyectos = [], isLoading: loading } = useProyectos();
  const createMutation = useCreateProyecto();
  const updateMutation = useUpdateProyecto();
  
  const handleCreateProyecto = useCallback(async (data: Omit<Proyecto, 'id'>) => {
    await createMutation.mutateAsync(data);
    setIsModalOpen(false);
  }, [createMutation]);
  
  const handleUpdateProyecto = useCallback(async (data: Omit<Proyecto, 'id'>) => {
    if (!editingProyecto) return;
    await updateMutation.mutateAsync({ id: editingProyecto.id, data });
    setIsModalOpen(false);
    setEditingProyecto(null);
  }, [editingProyecto, updateMutation]);
  
  function handleEdit(proyecto: Proyecto) {
    setEditingProyecto(proyecto);
    setIsModalOpen(true);
  }
  
  function handleNew() {
    setEditingProyecto(null);
    setIsModalOpen(true);
  }
  
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
  
  const headers = ['Nombre', 'Descripción', 'Fecha Inicio', 'Fecha Fin', 'Estado', 'Acciones'];
  
  return (
    <MainLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proyectos</h1>
          <p className="mt-2 text-gray-600">Gestión de proyectos empresariales</p>
        </div>
        <Button onClick={handleNew}>Nuevo Proyecto</Button>
      </div>
      
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando proyectos...</p>
          </div>
        ) : proyectos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay proyectos</p>
          </div>
        ) : (
          <Table headers={headers}>
            {proyectos.map((proyecto) => (
              <TableRow key={proyecto.id}>
                <TableCell>
                  <Link
                    href={`/proyectos/${proyecto.id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {proyecto.nombre}
                  </Link>
                </TableCell>
                <TableCell className="max-w-md truncate">{proyecto.descripcion}</TableCell>
                <TableCell>{formatDateShort(proyecto.fecha_inicio)}</TableCell>
                <TableCell>{proyecto.fecha_fin ? formatDateShort(proyecto.fecha_fin) : '-'}</TableCell>
                <TableCell>
                  <Badge variant={getEstadoBadgeVariant(proyecto.estado)}>
                    {proyecto.estado}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link href={`/proyectos/${proyecto.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalle
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(proyecto)}
                    >
                      Editar
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
          setEditingProyecto(null);
        }}
        title={editingProyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'}
      >
        <ProyectoForm
          proyecto={editingProyecto || undefined}
          onSubmit={editingProyecto ? handleUpdateProyecto : handleCreateProyecto}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingProyecto(null);
          }}
        />
      </Modal>
    </MainLayout>
  );
}

