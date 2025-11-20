export const mockIngresos = [
  { id: 1, fecha: '2024-01-05', descripcion: 'Pago trabajo parcial', categoria: 'Trabajo', monto: 800 },
  { id: 2, fecha: '2024-01-15', descripcion: 'Proyecto freelance', categoria: 'Trabajo', monto: 450 },
  { id: 3, fecha: '2024-01-20', descripcion: 'Trabajo extra', categoria: 'Trabajo', monto: 300 },
  { id: 4, fecha: '2024-02-05', descripcion: 'Pago trabajo parcial', categoria: 'Trabajo', monto: 800 },
  { id: 5, fecha: '2024-02-12', descripcion: 'Proyecto freelance', categoria: 'Trabajo', monto: 500 },
]

export const mockGastos = [
  { id: 1, fecha: '2024-01-01', descripcion: 'Arriendo', categoria: 'Hogar', monto: 450, metodoPago: 'Transferencia' },
  { id: 2, fecha: '2024-01-05', descripcion: 'Supermercado', categoria: 'Comida', monto: 180, metodoPago: 'Tarjeta' },
  { id: 3, fecha: '2024-01-08', descripcion: 'Consulta dental', categoria: 'Salud', monto: 120, metodoPago: 'Efectivo' },
  { id: 4, fecha: '2024-01-10', descripcion: 'Comida rápida', categoria: 'Gustos Personales', monto: 35, metodoPago: 'Tarjeta' },
  { id: 5, fecha: '2024-01-12', descripcion: 'Mercado del mes', categoria: 'Comida', monto: 220, metodoPago: 'Tarjeta' },
  { id: 6, fecha: '2024-01-15', descripcion: 'Tratamiento dental', categoria: 'Salud', monto: 250, metodoPago: 'Efectivo' },
  { id: 7, fecha: '2024-01-18', descripcion: 'Cine', categoria: 'Gustos Personales', monto: 25, metodoPago: 'Efectivo' },
  { id: 8, fecha: '2024-01-20', descripcion: 'Restaurante', categoria: 'Gustos Personales', monto: 45, metodoPago: 'Tarjeta' },
  { id: 9, fecha: '2024-02-01', descripcion: 'Arriendo', categoria: 'Hogar', monto: 450, metodoPago: 'Transferencia' },
  { id: 10, fecha: '2024-02-05', descripcion: 'Supermercado', categoria: 'Comida', monto: 195, metodoPago: 'Tarjeta' },
  { id: 11, fecha: '2024-02-08', descripcion: 'Control dental', categoria: 'Salud', monto: 80, metodoPago: 'Efectivo' },
  { id: 12, fecha: '2024-02-10', descripcion: 'Café y snacks', categoria: 'Gustos Personales', monto: 30, metodoPago: 'Efectivo' },
]

export const mockPresupuestos = [
  { categoria: 'Hogar (Arriendo)', presupuesto: 450, gastado: 900 },
  { categoria: 'Comida', presupuesto: 400, gastado: 595 },
  { categoria: 'Salud (Dental)', presupuesto: 350, gastado: 450 },
  { categoria: 'Gustos Personales', presupuesto: 200, gastado: 135 },
]

// Calcular totales reales
const totalIngresos = mockIngresos.reduce((sum, ing) => sum + ing.monto, 0)
const totalGastos = mockGastos.reduce((sum, gas) => sum + gas.monto, 0)
const balance = totalIngresos - totalGastos
const ahorroActual = Math.max(0, balance * 0.3) // 30% del balance como ahorro estimado
const ahorroMeta = 2000 // Meta realista de ahorro

export const mockStats = {
  totalIngresos,
  totalGastos,
  balance,
  ahorroMeta,
  ahorroActual: Math.min(ahorroActual, ahorroMeta),
}

