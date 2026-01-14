/**
 * Gráfico de Ganancia por Proyecto
 */

'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DatosGrafico } from '@/types';
import { formatCurrency } from '@/utils/format';

interface GananciaPorProyectoChartProps {
  data: DatosGrafico[];
}

export default function GananciaPorProyectoChart({ data }: GananciaPorProyectoChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p style={{ color: payload[0].color }}>
            Ganancia: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" fill="#06b6d4" name="Ganancia" />
      </BarChart>
    </ResponsiveContainer>
  );
}

