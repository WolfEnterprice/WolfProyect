/**
 * Formulario para crear/editar proyectos
 */

'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { Proyecto } from '@/types';
import { formatDateForInput } from '@/utils/format';

interface ProyectoFormProps {
  proyecto?: Proyecto;
  onSubmit: (data: Omit<Proyecto, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export default function ProyectoForm({ proyecto, onSubmit, onCancel }: ProyectoFormProps) {
  const [formData, setFormData] = useState({
    nombre: proyecto?.nombre || '',
    descripcion: proyecto?.descripcion || '',
    fecha_inicio: proyecto?.fecha_inicio ? formatDateForInput(proyecto.fecha_inicio) : formatDateForInput(new Date()),
    fecha_fin: proyecto?.fecha_fin ? formatDateForInput(proyecto.fecha_fin) : '',
    estado: (proyecto?.estado || 'activo') as 'activo' | 'completado' | 'cancelado',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await onSubmit({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        fecha_inicio: new Date(formData.fecha_inicio).toISOString(),
        fecha_fin: formData.fecha_fin ? new Date(formData.fecha_fin).toISOString() : null,
        estado: formData.estado,
      });
    } catch (err: any) {
      setError(err.message || 'Error al guardar el proyecto');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      
      <Input
        label="Nombre"
        value={formData.nombre}
        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
        required
      />
      
      <Textarea
        label="Descripción"
        value={formData.descripcion}
        onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
        rows={4}
        required
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Fecha de inicio"
          type="date"
          value={formData.fecha_inicio}
          onChange={(e) => setFormData(prev => ({ ...prev, fecha_inicio: e.target.value }))}
          required
        />
        
        <Input
          label="Fecha de fin (opcional)"
          type="date"
          value={formData.fecha_fin}
          onChange={(e) => setFormData(prev => ({ ...prev, fecha_fin: e.target.value }))}
        />
      </div>
      
      <Select
        label="Estado"
        value={formData.estado}
        onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as 'activo' | 'completado' | 'cancelado' }))}
        options={[
          { value: 'activo', label: 'Activo' },
          { value: 'completado', label: 'Completado' },
          { value: 'cancelado', label: 'Cancelado' },
        ]}
        required
      />
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : proyecto ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}

