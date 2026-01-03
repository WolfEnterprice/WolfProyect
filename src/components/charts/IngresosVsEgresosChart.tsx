/**
 * Gráfico de Ingresos vs Egresos
 */

'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DatosGrafico } from '@/types';
import { formatCurrency } from '@/utils/format';

interface IngresosVsEgresosChartProps {
  data: DatosGrafico[];
}

export default function IngresosVsEgresosChart({ data }: IngresosVsEgresosChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
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
        <Legend />
        <Bar dataKey="ingresos" fill="#0ea5e9" name="Ingresos" />
        <Bar dataKey="egresos" fill="#ef4444" name="Egresos" />
      </BarChart>
    </ResponsiveContainer>
  );
}

