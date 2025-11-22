import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, TrendingDown, DollarSign, Loader2, ChevronRight } from 'lucide-react'
import { ingresosService } from '../services/ingresosService'
import { gastosService } from '../services/gastosService'
import { useFormatCurrency } from '../hooks/useFormatCurrency'
import Alert from '../components/Alert'

const Historial = () => {
  const { formatCurrency } = useFormatCurrency()
  const [historialMensual, setHistorialMensual] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mesSeleccionado, setMesSeleccionado] = useState(null)

  useEffect(() => {
    loadHistorial()
  }, [])

  const loadHistorial = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [ingresos, gastos] = await Promise.all([
        ingresosService.getAll(),
        gastosService.getAll()
      ])

      // Agrupar por mes y año
      const mesesMap = {}

      // Procesar ingresos
      ingresos.forEach(ingreso => {
        const fecha = new Date(ingreso.fecha)
        const mesAno = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
        const nombreMes = fecha.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
        
        if (!mesesMap[mesAno]) {
          mesesMap[mesAno] = {
            mesAno,
            nombreMes: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
            fecha: fecha,
            ingresos: 0,
            gastos: 0,
            detallesIngresos: [],
            detallesGastos: []
          }
        }
        
        mesesMap[mesAno].ingresos += parseFloat(ingreso.monto || 0)
        mesesMap[mesAno].detallesIngresos.push(ingreso)
      })

      // Procesar gastos
      gastos.forEach(gasto => {
        const fecha = new Date(gasto.fecha)
        const mesAno = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
        const nombreMes = fecha.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
        
        if (!mesesMap[mesAno]) {
          mesesMap[mesAno] = {
            mesAno,
            nombreMes: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
            fecha: fecha,
            ingresos: 0,
            gastos: 0,
            detallesIngresos: [],
            detallesGastos: []
          }
        }
        
        mesesMap[mesAno].gastos += parseFloat(gasto.monto || 0)
        mesesMap[mesAno].detallesGastos.push(gasto)
      })

      // Convertir a array y ordenar por fecha (más reciente primero)
      const historialArray = Object.values(mesesMap)
        .sort((a, b) => new Date(b.mesAno) - new Date(a.mesAno))
        .map(mes => ({
          ...mes,
          balance: mes.ingresos - mes.gastos
        }))

      setHistorialMensual(historialArray)
    } catch (err) {
      setError(err.message)
      console.error('Error cargando historial:', err)
    } finally {
      setLoading(false)
    }
  }

  const getMesActual = () => {
    const ahora = new Date()
    return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`
  }

  const mesesAnteriores = historialMensual.filter(mes => mes.mesAno !== getMesActual())

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-gray-600" size={24} />
        <span className="ml-2 text-sm text-gray-600">Cargando historial...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-1">
            📅 Historial Mensual
          </h1>
          <p className="text-xs text-gray-500">Resumen de tus finanzas por mes</p>
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          title="Error"
          message={error}
        />
      )}

      {mesesAnteriores.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-8 text-center border border-gray-200">
          <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600 font-medium">No hay meses anteriores registrados</p>
          <p className="text-sm text-gray-400 mt-1">El historial se generará automáticamente cuando tengas datos de meses pasados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mesesAnteriores.map((mes) => (
            <div
              key={mes.mesAno}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300 border border-gray-200 cursor-pointer"
              onClick={() => setMesSeleccionado(mesSeleccionado === mes.mesAno ? null : mes.mesAno)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100">
                    <Calendar className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{mes.nombreMes}</h3>
                    <p className="text-xs text-gray-500">Mes cerrado</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Balance</p>
                    <p className={`font-bold ${mes.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(mes.balance)}
                    </p>
                  </div>
                  <ChevronRight 
                    className={`text-gray-400 transition-transform ${mesSeleccionado === mes.mesAno ? 'rotate-90' : ''}`} 
                    size={20} 
                  />
                </div>
              </div>

              {mesSeleccionado === mes.mesAno && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="text-green-600" size={18} />
                        <p className="text-xs font-semibold text-green-700 uppercase">Total Ingresos</p>
                      </div>
                      <p className="text-lg font-bold text-green-800">{formatCurrency(mes.ingresos)}</p>
                      <p className="text-xs text-green-600 mt-1">{mes.detallesIngresos.length} registro(s)</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-100">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="text-orange-600" size={18} />
                        <p className="text-xs font-semibold text-orange-700 uppercase">Total Gastos</p>
                      </div>
                      <p className="text-lg font-bold text-orange-800">{formatCurrency(mes.gastos)}</p>
                      <p className="text-xs text-orange-600 mt-1">{mes.detallesGastos.length} registro(s)</p>
                    </div>

                    <div className={`rounded-lg p-3 border ${
                      mes.balance >= 0 
                        ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100' 
                        : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-100'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className={mes.balance >= 0 ? 'text-blue-600' : 'text-red-600'} size={18} />
                        <p className={`text-xs font-semibold uppercase ${
                          mes.balance >= 0 ? 'text-blue-700' : 'text-red-700'
                        }`}>Balance Final</p>
                      </div>
                      <p className={`text-lg font-bold ${
                        mes.balance >= 0 ? 'text-blue-800' : 'text-red-800'
                      }`}>
                        {formatCurrency(mes.balance)}
                      </p>
                      <p className={`text-xs mt-1 ${
                        mes.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {mes.balance >= 0 ? 'Superávit' : 'Déficit'}
                      </p>
                    </div>
                  </div>

                  {mes.detallesIngresos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-2">Ingresos del mes</h4>
                      <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                          {mes.detallesIngresos.map((ingreso, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm bg-white rounded p-2">
                              <div>
                                <p className="font-medium text-gray-800">{ingreso.descripcion}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(ingreso.fecha).toLocaleDateString('es-CO')} • {ingreso.categoria}
                                </p>
                              </div>
                              <p className="font-bold text-green-600">{formatCurrency(ingreso.monto)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {mes.detallesGastos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-2">Gastos del mes</h4>
                      <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                          {mes.detallesGastos.map((gasto, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm bg-white rounded p-2">
                              <div>
                                <p className="font-medium text-gray-800">{gasto.descripción || gasto.descripcion}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(gasto.fecha).toLocaleDateString('es-CO')} • {gasto.categoría || gasto.categoria}
                                </p>
                              </div>
                              <p className="font-bold text-orange-600">{formatCurrency(gasto.monto)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Historial

