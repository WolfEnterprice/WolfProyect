import { useState, useEffect } from 'react'
import { Target, Sparkles, TrendingUp, TrendingDown, Plus, Edit2, Loader2, Trash2, Calendar, DollarSign, PiggyBank, BarChart3, Clock, AlertCircle } from 'lucide-react'
import { metasAhorroService } from '../services/metasAhorroService'
// import { aportacionesService } from '../services/aportacionesService'
import { ingresosService } from '../services/ingresosService'
import { gastosService } from '../services/gastosService'
import { useFormatCurrency } from '../hooks/useFormatCurrency'
import { convertirAMonedaBase, convertirMoneda } from '../services/conversionService'
import Modal from '../components/Modal'
import Alert from '../components/Alert'
import DeleteModal from '../components/DeleteModal'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const Ahorro = () => {
  const { formatCurrency, formatNumber } = useFormatCurrency()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Metas de ahorro
  const [metas, setMetas] = useState([])
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false)
  const [isEditMetaModalOpen, setIsEditMetaModalOpen] = useState(false)
  const [selectedMeta, setSelectedMeta] = useState(null)
  const [formMeta, setFormMeta] = useState({ nombre: '', montoObjetivo: '', fechaLimite: '' })
  
  // Modal para agregar ahorro a una meta
  const [isAgregarAhorroModalOpen, setIsAgregarAhorroModalOpen] = useState(false)
  const [metaSeleccionadaParaAhorro, setMetaSeleccionadaParaAhorro] = useState(null)
  const [montoAgregar, setMontoAgregar] = useState('')
  
  // Capacidad de ahorro (50/30/20)
  const [ingresosMensuales, setIngresosMensuales] = useState(0)
  const [gastosMensuales, setGastosMensuales] = useState(0)
  const [capacidadAhorro, setCapacidadAhorro] = useState({ sugerido: 0, necesidades: 0, deseos: 0 })
  
  // Estadísticas
  const [estadisticas, setEstadisticas] = useState({ totalMesActual: 0, variacion: 0 })
  const [graficoData, setGraficoData] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [metasData, ingresosData, gastosData] = await Promise.all([
        metasAhorroService.getAll().catch((err) => {
          console.warn('Error cargando metas (tabla puede no existir):', err)
          return []
        }),
        ingresosService.getAll().catch(() => []),
        gastosService.getAll().catch(() => [])
      ])

      setMetas(metasData)
      // setAportaciones([]) // Deshabilitado por ahora
      
      // Calcular ingresos mensuales (promedio del último mes)
      const ahora = new Date()
      const mesActual = ahora.getMonth()
      const añoActual = ahora.getFullYear()
      
      const ingresosDelMes = ingresosData.filter(ing => {
        const fecha = new Date(ing.fecha)
        return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual
      })
      
      const totalIngresosMes = ingresosDelMes.reduce((sum, ing) => sum + parseFloat(ing.monto || 0), 0)
      setIngresosMensuales(totalIngresosMes)
      
      // Calcular gastos mensuales
      const gastosDelMes = gastosData.filter(gasto => {
        const fecha = new Date(gasto.fecha)
        return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual
      })
      
      const totalGastosMes = gastosDelMes.reduce((sum, gasto) => sum + parseFloat(gasto.monto || 0), 0)
      setGastosMensuales(totalGastosMes)
      
      // Calcular capacidad de ahorro (regla 50/30/20)
      const ahorroSugerido = totalIngresosMes * 0.20 // 20%
      const necesidades = totalIngresosMes * 0.50 // 50%
      const deseos = totalIngresosMes * 0.30 // 30%
      
      setCapacidadAhorro({
        sugerido: ahorroSugerido,
        necesidades,
        deseos
      })
      
      // Calcular estadísticas (simplificado sin aportaciones)
      const totalAhorro = metasData.reduce((sum, meta) => sum + (meta.ahorro_acumulado || 0), 0)
      setEstadisticas({
        totalMesActual: totalAhorro,
        variacion: 0
      })
      
      // Gráfico simplificado (basado en metas)
      const mesesGrafico = []
      for (let i = 5; i >= 0; i--) {
        const fecha = new Date()
        fecha.setMonth(fecha.getMonth() - i)
        const nombreMes = fecha.toLocaleDateString('es-CO', { month: 'short' })
        
        mesesGrafico.push({
          mes: nombreMes,
          total: 0 // Sin aportaciones, no hay datos históricos
        })
      }
      setGraficoData(mesesGrafico)
      
    } catch (err) {
      setError(err.message)
      console.error('Error cargando datos:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calcular aporte mensual necesario para una meta
  const calcularAporteMensual = (meta) => {
    const ahora = new Date()
    const fechaLimite = new Date(meta.fecha_limite)
    const mesesRestantes = Math.max(1, Math.ceil((fechaLimite - ahora) / (1000 * 60 * 60 * 24 * 30)))
    const faltante = meta.monto_objetivo - (meta.ahorro_acumulado || 0)
    return faltante > 0 ? faltante / mesesRestantes : 0
  }

  // Crear nueva meta
  const handleCreateMeta = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      const montoEnCOP = convertirAMonedaBase(parseFloat(formMeta.montoObjetivo), 'COP')
      
      await metasAhorroService.create({
        nombre: formMeta.nombre,
        montoObjetivo: Math.round(montoEnCOP),
        fechaLimite: formMeta.fechaLimite
      })
      
      await loadData()
      setIsMetaModalOpen(false)
      setFormMeta({ nombre: '', montoObjetivo: '', fechaLimite: '' })
    } catch (err) {
      setError(err.message)
      console.error('Error creando meta:', err)
    }
  }

  // Editar meta
  const handleEditMeta = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      const montoEnCOP = convertirAMonedaBase(parseFloat(formMeta.montoObjetivo), 'COP')
      
      await metasAhorroService.update(selectedMeta.id, {
        nombre: formMeta.nombre,
        montoObjetivo: Math.round(montoEnCOP),
        fechaLimite: formMeta.fechaLimite
      })
      
      await loadData()
      setIsEditMetaModalOpen(false)
      setSelectedMeta(null)
      setFormMeta({ nombre: '', montoObjetivo: '', fechaLimite: '' })
    } catch (err) {
      setError(err.message)
      console.error('Error actualizando meta:', err)
    }
  }

  // Eliminar meta
  const handleDeleteMeta = async () => {
    try {
      await metasAhorroService.delete(selectedMeta.id)
      await loadData()
      setSelectedMeta(null)
    } catch (err) {
      setError(err.message)
      console.error('Error eliminando meta:', err)
    }
  }

  // Abrir modal para agregar ahorro
  const abrirModalAgregarAhorro = (meta) => {
    setMetaSeleccionadaParaAhorro(meta)
    setMontoAgregar('')
    setIsAgregarAhorroModalOpen(true)
  }

  // Agregar ahorro directamente a una meta
  const handleAddAhorroAMeta = async (e) => {
    e.preventDefault()
    if (!metaSeleccionadaParaAhorro || !montoAgregar || parseFloat(montoAgregar) <= 0) {
      setError('Ingresa un monto válido')
      return
    }
    
    try {
      setError(null)
      const montoEnCOP = convertirAMonedaBase(parseFloat(montoAgregar), 'COP')
      await metasAhorroService.agregarAhorro(metaSeleccionadaParaAhorro.id, Math.round(montoEnCOP))
      await loadData()
      setIsAgregarAhorroModalOpen(false)
      setMetaSeleccionadaParaAhorro(null)
      setMontoAgregar('')
    } catch (err) {
      setError(err.message)
      console.error('Error agregando ahorro a meta:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-amber-600" size={24} />
        <span className="ml-2 text-sm text-gray-600">Cargando ahorro...</span>
      </div>
    )
  }

  const totalAhorroAcumulado = metas.reduce((sum, meta) => sum + (meta.ahorro_acumulado || 0), 0)
  
  // Verificar si las tablas existen (si hay errores específicos de tablas no encontradas)
  const tablasNoExisten = error && (
    error.includes('Could not find the table') || 
    error.includes('metas_ahorro') || 
    error.includes('aportaciones_ahorro')
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent mb-1">
            🐷 Ahorro
          </h1>
          <p className="text-xs text-gray-500">Gestiona tus metas y construye tu futuro financiero</p>
        </div>
        <button
          onClick={() => {
            setFormMeta({ nombre: '', montoObjetivo: '', fechaLimite: '' })
            setIsMetaModalOpen(true)
          }}
          className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1.5 rounded-lg hover:shadow-md transform hover:scale-105 transition-all duration-200 text-sm font-semibold"
        >
          <Plus size={16} />
          Nueva Meta
        </button>
      </div>

      {tablasNoExisten && (
        <Alert
          type="warning"
          title="Tablas no encontradas"
          message={
            <>
              La tabla de metas de ahorro no existe en Supabase. Por favor ejecuta el SQL del archivo{' '}
              <code className="bg-gray-100 px-1 rounded">supabase-metas-ahorro-setup.md</code> en el SQL Editor de Supabase.
              <br />
              <span className="text-xs text-gray-600 mt-1 block">
                Esto creará la tabla necesaria: <code>metas_ahorro</code>
              </span>
            </>
          }
        />
      )}

      {error && !tablasNoExisten && (
        <Alert
          type="error"
          title="Error"
          message={error}
        />
      )}

      {/* SECCIÓN 1: METAS DE AHORRO (El "Para Qué") */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200">
        <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Target size={18} className="text-amber-600" />
          Metas de Ahorro
        </h2>
        
        {metas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <PiggyBank size={48} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No tienes metas de ahorro aún</p>
            <p className="text-xs text-gray-400 mt-1">Crea tu primera meta para empezar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metas.map((meta) => {
              const progreso = meta.monto_objetivo > 0 
                ? ((meta.ahorro_acumulado || 0) / meta.monto_objetivo) * 100 
                : 0
              const aporteMensual = calcularAporteMensual(meta)
              const fechaLimite = new Date(meta.fecha_limite)
              const ahora = new Date()
              const diasRestantes = Math.ceil((fechaLimite - ahora) / (1000 * 60 * 60 * 24))
              
              return (
                <div key={meta.id} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-1">{meta.nombre}</h3>
                      <p className="text-xs text-gray-600">
                        {formatCurrency(meta.ahorro_acumulado || 0)} de {formatCurrency(meta.monto_objetivo)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedMeta(meta)
                          const montoConvertido = convertirMoneda(meta.monto_objetivo, 'COP', 'COP')
                          setFormMeta({
                            nombre: meta.nombre,
                            montoObjetivo: montoConvertido.toString(),
                            fechaLimite: meta.fecha_limite
                          })
                          setIsEditMetaModalOpen(true)
                        }}
                        className="p-1.5 text-amber-600 hover:bg-amber-100 rounded transition-colors"
                        title="Editar meta"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setSelectedMeta(meta)}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Eliminar meta"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="w-full bg-amber-100 rounded-full h-3 mb-2">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                        style={{ width: `${Math.min(progreso, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-700">{progreso.toFixed(1)}%</span>
                      <span className="text-gray-600">
                        {diasRestantes > 0 ? `${diasRestantes} días restantes` : 'Plazo vencido'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-2 text-xs text-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Plazo: {fechaLimite.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <DollarSign size={12} />
                        Aporte mensual sugerido:
                      </span>
                      <span className="font-bold text-amber-700">{formatCurrency(aporteMensual)}</span>
                    </div>
                  </div>
                  
                  {/* Botón para agregar ahorro directamente */}
                  <div className="mt-3">
                    <button
                      onClick={() => abrirModalAgregarAhorro(meta)}
                      className="w-full px-3 py-2 text-xs bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-md transition-all font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14} />
                      Agregar Ahorro
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* SECCIÓN 2: CAPACIDAD DE AHORRO (El "Cuánto Puedo") - Regla 50/30/20 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200">
        <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-600" />
          Capacidad de Ahorro (Regla 50/30/20)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-700 uppercase">Ingresos Mensuales</span>
              <DollarSign size={16} className="text-blue-600" />
            </div>
            <p className="text-lg font-bold text-blue-900">{formatCurrency(ingresosMensuales)}</p>
          </div>
          
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-700 uppercase">Ahorro Sugerido (20%)</span>
              <Target size={16} className="text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-emerald-900">{formatCurrency(capacidadAhorro.sugerido)}</p>
            <p className="text-xs text-emerald-700 mt-1">
              {ingresosMensuales > 0 
                ? `Tu objetivo mensual de ahorro es ${formatCurrency(capacidadAhorro.sugerido)}`
                : 'Ingresa tus ingresos para calcular'}
            </p>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-700 uppercase">Gastos del Mes</span>
              <TrendingDown size={16} className="text-amber-600" />
            </div>
            <p className="text-lg font-bold text-amber-900">{formatCurrency(gastosMensuales)}</p>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Necesidades (50%):</span>
                <span className="font-semibold">{formatCurrency(capacidadAhorro.necesidades)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deseos (30%):</span>
                <span className="font-semibold">{formatCurrency(capacidadAhorro.deseos)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {gastosMensuales > capacidadAhorro.necesidades + capacidadAhorro.deseos && (
          <Alert
            type="warning"
            compact={true}
            message="Estás gastando más del 80% de tus ingresos. Considera reducir gastos para aumentar tu capacidad de ahorro."
            className="mt-4"
          />
        )}
      </div>

      {/* SECCIÓN 3: AHORRO ACUMULADO Y RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow-md p-4 border border-emerald-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Sparkles size={18} className="text-emerald-600" />
              Ahorro Acumulado Total
            </h3>
          </div>
          <p className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            {formatCurrency(totalAhorroAcumulado)}
          </p>
          <p className="text-xs text-gray-600">
            Distribuido en {metas.length} {metas.length === 1 ? 'meta' : 'metas'}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              Ahorro del Mes Actual
            </h3>
          </div>
          <p className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            {formatCurrency(estadisticas.totalMesActual)}
          </p>
          <div className="flex items-center gap-2 text-xs">
            {estadisticas.variacion > 0 ? (
              <span className="text-emerald-600 font-semibold">↑ {estadisticas.variacion.toFixed(1)}% vs mes anterior</span>
            ) : estadisticas.variacion < 0 ? (
              <span className="text-red-600 font-semibold">↓ {Math.abs(estadisticas.variacion).toFixed(1)}% vs mes anterior</span>
            ) : (
              <span className="text-gray-600">Sin cambios</span>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: RESUMEN DE METAS */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200">
        <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-purple-600" />
          Resumen de Metas
        </h2>
        
        {metas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target size={48} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No tienes metas de ahorro aún</p>
            <p className="text-xs text-gray-400 mt-1">Crea tu primera meta para empezar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {metas.map((meta) => {
              const progreso = meta.monto_objetivo > 0 
                ? ((meta.ahorro_acumulado || 0) / meta.monto_objetivo) * 100 
                : 0
              return (
                <div key={meta.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-gray-800">{meta.nombre}</span>
                    <span className="text-xs font-bold text-amber-700">{progreso.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                      style={{ width: `${Math.min(progreso, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{formatCurrency(meta.ahorro_acumulado || 0)}</span>
                    <span>de {formatCurrency(meta.monto_objetivo)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modales */}
      <Modal
        isOpen={isMetaModalOpen}
        onClose={() => {
          setIsMetaModalOpen(false)
          setFormMeta({ nombre: '', montoObjetivo: '', fechaLimite: '' })
        }}
        title="Nueva Meta de Ahorro"
      >
        <form onSubmit={handleCreateMeta} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre de la Meta</label>
            <input
              type="text"
              required
              value={formMeta.nombre}
              onChange={(e) => setFormMeta({ ...formMeta, nombre: e.target.value })}
              placeholder="Ej: Vacaciones 2026, Apartamento..."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Monto Objetivo</label>
            <input
              type="number"
              required
              min="1"
              step="1"
              value={formMeta.montoObjetivo}
              onChange={(e) => setFormMeta({ ...formMeta, montoObjetivo: e.target.value })}
              placeholder="0"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Límite</label>
            <input
              type="date"
              required
              value={formMeta.fechaLimite}
              onChange={(e) => setFormMeta({ ...formMeta, fechaLimite: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          {formMeta.montoObjetivo && formMeta.fechaLimite && (
            <Alert
              type="info"
              compact={true}
              message={
                <>
                  <span className="font-semibold">Aporte mensual sugerido:</span>{' '}
                  {formatCurrency(calcularAporteMensual({
                    monto_objetivo: convertirAMonedaBase(parseFloat(formMeta.montoObjetivo), 'COP'),
                    fecha_limite: formMeta.fechaLimite,
                    ahorro_acumulado: 0
                  }))}
                </>
              }
            />
          )}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsMetaModalOpen(false)}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:shadow-md transition-all font-semibold"
            >
              Crear Meta
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditMetaModalOpen}
        onClose={() => {
          setIsEditMetaModalOpen(false)
          setSelectedMeta(null)
          setFormMeta({ nombre: '', montoObjetivo: '', fechaLimite: '' })
        }}
        title="Editar Meta de Ahorro"
      >
        <form onSubmit={handleEditMeta} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre de la Meta</label>
            <input
              type="text"
              required
              value={formMeta.nombre}
              onChange={(e) => setFormMeta({ ...formMeta, nombre: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Monto Objetivo</label>
            <input
              type="number"
              required
              min="1"
              step="1"
              value={formMeta.montoObjetivo}
              onChange={(e) => setFormMeta({ ...formMeta, montoObjetivo: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Límite</label>
            <input
              type="date"
              required
              value={formMeta.fechaLimite}
              onChange={(e) => setFormMeta({ ...formMeta, fechaLimite: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditMetaModalOpen(false)}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:shadow-md transition-all font-semibold"
            >
              Actualizar Meta
            </button>
          </div>
        </form>
      </Modal>


      {/* Modal para Agregar Ahorro a una Meta */}
      <Modal
        isOpen={isAgregarAhorroModalOpen}
        onClose={() => {
          setIsAgregarAhorroModalOpen(false)
          setMetaSeleccionadaParaAhorro(null)
          setMontoAgregar('')
        }}
        title={`Agregar Ahorro a "${metaSeleccionadaParaAhorro?.nombre || ''}"`}
      >
        <form onSubmit={handleAddAhorroAMeta} className="space-y-4">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-700 uppercase">Meta Actual</span>
              <Target size={16} className="text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-emerald-900 mb-1">
              {formatCurrency(metaSeleccionadaParaAhorro?.ahorro_acumulado || 0)}
            </p>
            <p className="text-xs text-emerald-700">
              de {formatCurrency(metaSeleccionadaParaAhorro?.monto_objetivo || 0)}
            </p>
            <div className="mt-3 w-full bg-emerald-100 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
                style={{ 
                  width: `${Math.min(
                    ((metaSeleccionadaParaAhorro?.ahorro_acumulado || 0) / (metaSeleccionadaParaAhorro?.monto_objetivo || 1)) * 100,
                    100
                  )}%` 
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Monto a Agregar
            </label>
            <input
              type="number"
              required
              min="1"
              step="1"
              value={montoAgregar}
              onChange={(e) => setMontoAgregar(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {montoAgregar && parseFloat(montoAgregar) > 0 && metaSeleccionadaParaAhorro && (
            <Alert
              type="info"
              compact={true}
              message={
                <>
                  <span className="font-semibold">Nuevo total:</span>{' '}
                  {formatCurrency(
                    (metaSeleccionadaParaAhorro.ahorro_acumulado || 0) + 
                    convertirAMonedaBase(parseFloat(montoAgregar), 'COP')
                  )}
                  <br />
                  <span className="font-semibold">Progreso:</span>{' '}
                  {(
                    ((metaSeleccionadaParaAhorro.ahorro_acumulado || 0) + 
                     convertirAMonedaBase(parseFloat(montoAgregar), 'COP')) / 
                    metaSeleccionadaParaAhorro.monto_objetivo * 100
                  ).toFixed(1)}%
                </>
              }
            />
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAgregarAhorroModalOpen(false)
                setMetaSeleccionadaParaAhorro(null)
                setMontoAgregar('')
              }}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-md transition-all font-semibold flex items-center justify-center gap-1.5"
            >
              <Plus size={16} />
              Agregar Ahorro
            </button>
          </div>
        </form>
      </Modal>

      <DeleteModal
        isOpen={!!selectedMeta}
        onClose={() => setSelectedMeta(null)}
        onConfirm={handleDeleteMeta}
        title="Eliminar Meta"
        message={`¿Estás seguro de que quieres eliminar la meta "${selectedMeta?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}

export default Ahorro
