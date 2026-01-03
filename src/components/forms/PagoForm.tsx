/**
 * Formulario para crear pagos entre socios
 */

'use client';

import React, { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { PagoSocio, Proyecto, Usuario } from '@/types';
import { getProyectos } from '@/services/proyectos';
import { getUsuarios } from '@/services/usuarios';

interface PagoFormProps {
  pago?: PagoSocio;
  onSubmit: (data: Omit<PagoSocio, 'id'>) => Promise<void>;
  onCancel: () => void;
  proyectoId?: number;
}

export default function PagoForm({ pago, onSubmit, onCancel, proyectoId }: PagoFormProps) {
  const [formData, setFormData] = useState({
    proyecto_id: pago?.proyecto_id || proyectoId || 0,
    usuario_id: pago?.usuario_id || 0,
    monto: pago?.monto || 0,
    estado: (pago?.estado || 'pendiente') as 'pendiente' | 'pagado',
    fecha_pago: pago?.fecha_pago ? pago.fecha_pago.split('T')[0] : '',
  });
  
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    loadData();
  }, []);
  
  async function loadData() {
    try {
      const [proyectosData, usuariosData] = await Promise.all([
        getProyectos(),
        getUsuarios(),
      ]);
      setProyectos(proyectosData);
      setUsuarios(usuariosData);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await onSubmit({
        proyecto_id: formData.proyecto_id,
        usuario_id: formData.usuario_id,
        monto: Number(formData.monto),
        estado: formData.estado,
        fecha_pago: formData.fecha_pago ? new Date(formData.fecha_pago).toISOString() : null,
      });
    } catch (err: any) {
      setError(err.message || 'Error al guardar el pago');
    } finally {
      setLoading(false);
    }
  }
  
  const proyectoOptions = proyectos.map(p => ({
    value: p.id.toString(),
    label: p.nombre,
  }));
  
  const usuarioOptions = usuarios.map(u => ({
    value: u.id.toString(),
    label: u.nombre,
  }));
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      
      <Select
        label="Proyecto"
        value={formData.proyecto_id.toString()}
        onChange={(e) => setFormData(prev => ({ ...prev, proyecto_id: Number(e.target.value) }))}
        options={proyectoOptions}
        required
        disabled={!!proyectoId}
      />
      
      <Select
        label="Usuario"
        value={formData.usuario_id.toString()}
        onChange={(e) => setFormData(prev => ({ ...prev, usuario_id: Number(e.target.value) }))}
        options={usuarioOptions}
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
      
      {formData.estado === 'pagado' && (
        <Input
          label="Fecha de pago"
          type="date"
          value={formData.fecha_pago}
          onChange={(e) => setFormData(prev => ({ ...prev, fecha_pago: e.target.value }))}
          required={formData.estado === 'pagado'}
        />
      )}
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : pago ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}

