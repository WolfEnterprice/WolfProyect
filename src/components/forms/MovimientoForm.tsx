/**
 * Formulario para crear/editar movimientos
 */

'use client';

import React, { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { Movimiento, Categoria, Proyecto } from '@/types';
import { getCategorias, getCategoriasByTipo } from '@/services/categorias';
import { getProyectos } from '@/services/proyectos';

interface MovimientoFormProps {
  movimiento?: Movimiento;
  onSubmit: (data: Omit<Movimiento, 'id'>) => Promise<void>;
  onCancel: () => void;
  usuarioId: number;
}

export default function MovimientoForm({
  movimiento,
  onSubmit,
  onCancel,
  usuarioId,
}: MovimientoFormProps) {
  const [formData, setFormData] = useState({
    tipo: (movimiento?.tipo || 'ingreso') as 'ingreso' | 'egreso',
    monto: movimiento?.monto || 0,
    fecha: movimiento?.fecha ? movimiento.fecha.split('T')[0] : new Date().toISOString().split('T')[0],
    categoria_id: movimiento?.categoria_id || 0,
    proyecto_id: movimiento?.proyecto_id?.toString() || '',
    descripcion: movimiento?.descripcion || '',
    estado: (movimiento?.estado || 'pendiente') as 'pendiente' | 'pagado',
  });
  
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    // Cargar categorías según el tipo seleccionado
    loadCategorias();
  }, [formData.tipo]);
  
  async function loadData() {
    try {
      const [proyectosData] = await Promise.all([
        getProyectos(),
      ]);
      setProyectos(proyectosData);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }
  
  async function loadCategorias() {
    try {
      const categoriasData = await getCategoriasByTipo(formData.tipo);
      setCategorias(categoriasData);
      
      // Si no hay categoría seleccionada o la categoría actual no es del tipo correcto, seleccionar la primera
      if (categoriasData.length > 0 && (!formData.categoria_id || !categoriasData.find(c => c.id === formData.categoria_id))) {
        setFormData(prev => ({ ...prev, categoria_id: categoriasData[0].id }));
      }
    } catch (err) {
      console.error('Error loading categorias:', err);
    }
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!usuarioId || usuarioId === 0) {
      setError('Error: No se pudo identificar al usuario');
      setLoading(false);
      return;
    }
    
    try {
      await onSubmit({
        tipo: formData.tipo,
        monto: Number(formData.monto),
        fecha: new Date(formData.fecha).toISOString(),
        categoria_id: formData.categoria_id,
        proyecto_id: formData.proyecto_id ? Number(formData.proyecto_id) : null,
        descripcion: formData.descripcion,
        creado_por: usuarioId,
        estado: formData.estado,
      });
    } catch (err: any) {
      setError(err.message || 'Error al guardar el movimiento');
    } finally {
      setLoading(false);
    }
  }
  
  const proyectoOptions = [
    { value: '', label: 'Sin proyecto' },
    ...proyectos.map(p => ({ value: p.id.toString(), label: p.nombre })),
  ];
  
  const categoriaOptions = categorias.map(c => ({
    value: c.id.toString(),
    label: c.nombre,
  }));
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Tipo"
          value={formData.tipo}
          onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'ingreso' | 'egreso' }))}
          options={[
            { value: 'ingreso', label: 'Ingreso' },
            { value: 'egreso', label: 'Egreso' },
          ]}
          required
        />
        
        <Input
          label="Monto"
          type="number"
          step="0.01"
          min="0"
          value={formData.monto}
          onChange={(e) => setFormData(prev => ({ ...prev, monto: Number(e.target.value) }))}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Fecha"
          type="date"
          value={formData.fecha}
          onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
          required
        />
        
        <Select
          label="Estado"
          value={formData.estado}
          onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as 'pendiente' | 'pagado' }))}
          options={[
            { value: 'pendiente', label: 'Pendiente' },
            { value: 'pagado', label: 'Pagado' },
          ]}
          required
        />
      </div>
      
      <Select
        label="Categoría"
        value={formData.categoria_id.toString()}
        onChange={(e) => setFormData(prev => ({ ...prev, categoria_id: Number(e.target.value) }))}
        options={categoriaOptions}
        required
      />
      
      <Select
        label="Proyecto (opcional)"
        value={formData.proyecto_id}
        onChange={(e) => setFormData(prev => ({ ...prev, proyecto_id: e.target.value }))}
        options={proyectoOptions}
      />
      
      <Textarea
        label="Descripción"
        value={formData.descripcion}
        onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
        rows={3}
        required
      />
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : movimiento ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}

