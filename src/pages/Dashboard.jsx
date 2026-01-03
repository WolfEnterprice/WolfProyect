import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, ArrowUpRight, Target, Sparkles, Loader2 } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import StatCard from '../components/StatCard'
import Alert from '../components/Alert'
import { ingresosService } from '../services/ingresosService'
import { gastosService } from '../services/gastosService'
import { ahorroService } from '../services/ahorroService'
import { useFormatCurrency } from '../hooks/useFormatCurrency'

const Dashboard = () => {
  const { formatCurrency } = useFormatCurrency()
  const [stats, setStats] = useState({
    totalIngresos: 0,
    totalGastos: 0,
    balance: 0,
    ahorroActual: 0,
    ahorroMeta: 2000
  })
  const [gastosPorCategoria, setGastosPorCategoria] = useState([])
  const [historialData, setHistorialData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Colores para el gráfico de pie
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4']

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [ingresos, gastos, ahorro] = await Promise.all([
        ingresosService.getAll().catch(() => []), // Si falla, usar array vacío
        gastosService.getAll().catch(() => []),   // Si falla, usar array vacío
        ahorroService.get().catch(() => ({ ahorroActual: 0, ahorroMeta: 2000 })) // Si falla, usar valores por defecto
      ])

      const totalIngresos = ingresos.reduce((sum, ing) => sum + parseFloat(ing.monto || 0), 0)
      const totalGastos = gastos.reduce((sum, gas) => sum + parseFloat(gas.monto || 0), 0)
      const balance = totalIngresos - totalGastos

          // Manejar tanto camelCase como snake_case
          const ahorroActual = ahorro.ahorroActual || ahorro["ahorroActual"] || 0
          const ahorroMeta = ahorro.ahorroMeta || ahorro["ahorroMeta"] || 2000
          
          setStats({
            totalIngresos,
            totalGastos,
            balance,
            ahorroActual,
            ahorroMeta
          })

      // Procesar gastos por categoría
      const gastosPorCat = {}
      gastos.forEach(gasto => {
        const categoria = gasto.categoría || gasto.categoria || 'Otros'
        const monto = parseFloat(gasto.monto || 0)
        gastosPorCat[categoria] = (gastosPorCat[categoria] || 0) + monto
      })

      const gastosData = Object.entries(gastosPorCat).map(([name, value], index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: value,
        color: COLORS[index % COLORS.length]
      }))

      setGastosPorCategoria(gastosData)

      // Procesar historial de ingresos y gastos por fecha
      const historial = {}
      
      ingresos.forEach(ingreso => {
        const fecha = ingreso.fecha
        if (!historial[fecha]) {
          historial[fecha] = { fecha, ingresos: 0, gastos: 0 }
        }
        historial[fecha].ingresos += parseFloat(ingreso.monto || 0)
      })

      gastos.forEach(gasto => {
        const fecha = gasto.fecha
        if (!historial[fecha]) {
          historial[fecha] = { fecha, ingresos: 0, gastos: 0 }
        }
        historial[fecha].gastos += parseFloat(gasto.monto || 0)
      })

      // Convertir a array y ordenar por fecha
      const historialArray = Object.values(historial)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .map(item => ({
          ...item,
          fecha: new Date(item.fecha).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })
        }))

      // Limitar a los últimos 30 días o últimos 10 registros
      setHistorialData(historialArray.slice(-10))
    } catch (err) {
      setError(err.message)
      console.error('Error cargando estadísticas:', err)
    } finally {
      setLoading(false)
    }
  }

  const progressPercentage = stats.ahorroMeta > 0 ? (stats.ahorroActual / stats.ahorroMeta) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-gray-600" size={24} />
        <span className="ml-2 text-sm text-gray-600">Cargando estadísticas...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-1">
            ¡Bienvenido de vuelta! 👋
          </h1>
          <p className="text-xs text-gray-500">Aquí está el resumen de tus finanzas</p>
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          title="Error"
          message={error}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Ingresos"
          value={stats.totalIngresos}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Total Gastos"
          value={stats.totalGastos}
          icon={ArrowUpRight}
          color="orange"
        />
        <StatCard
          title="Balance Disponible"
          value={stats.balance}
          icon={DollarSign}
          color="blue"
        />
        <div className="group relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 border border-amber-100 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-200/30 to-transparent rounded-bl-full"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wide">Progreso de Ahorro</h3>
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 shadow-md transform group-hover:scale-110 transition-transform duration-300">
                <Target size={18} className="text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {progressPercentage.toFixed(1)}%
                </span>
                <Sparkles className="text-amber-500" size={16} />
              </div>
              <div className="w-full bg-amber-100 rounded-full h-3 shadow-inner overflow-hidden">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 transition-all duration-500 ease-out shadow-md relative overflow-hidden"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs font-semibold text-amber-700">
                  Ahorrado: <span className="text-amber-900">{formatCurrency(stats.ahorroActual)}</span>
                </p>
                <p className="text-xs font-semibold text-amber-700">
                  Meta: <span className="text-amber-900">{formatCurrency(stats.ahorroMeta)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300 border border-gray-200">
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            Gastos por Categoría
          </h2>
          <div className="h-64">
            {gastosPorCategoria.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gastosPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {gastosPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => value}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="text-blue-500" size={18} />
                  </div>
                  <p className="text-xs text-gray-400 font-medium">No hay gastos registrados</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300 border border-gray-200">
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
            Historial de Ingresos y Gastos
          </h2>
          <div className="h-64">
            {historialData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="fecha" 
                    stroke="#6b7280"
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '11px' }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
                      return value.toString()
                    }}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="ingresos" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Ingresos"
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gastos" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Gastos"
                    dot={{ fill: '#f59e0b', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="text-emerald-500" size={18} />
                  </div>
                  <p className="text-xs text-gray-400 font-medium">No hay datos de historial</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

