import { useState, useEffect } from 'react'
import { Target, Sparkles, TrendingUp, Plus, Edit2, Loader2 } from 'lucide-react'
import { ahorroService } from '../services/ahorroService'
import { useFormatCurrency } from '../hooks/useFormatCurrency'
import { convertirAMonedaBase, convertirMoneda } from '../services/conversionService'
import Modal from '../components/Modal'
import Alert from '../components/Alert'

const Ahorro = () => {
  const { formatCurrency, moneda } = useFormatCurrency()
  const [ahorroActual, setAhorroActual] = useState(0)
  const [ahorroMeta, setAhorroMeta] = useState(2000)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditMetaModalOpen, setIsEditMetaModalOpen] = useState(false)
  const [montoAgregar, setMontoAgregar] = useState('')
  const [nuevaMeta, setNuevaMeta] = useState('')

  useEffect(() => {
    loadAhorro()
  }, [moneda.codigo]) // Recargar cuando cambie la moneda

  const loadAhorro = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ahorroService.get()
      // Manejar tanto camelCase como snake_case
      const actual = data.ahorroActual || data["ahorroActual"] || 0
      const meta = data.ahorroMeta || data["ahorroMeta"] || 2000
      // Los valores vienen en COP, se mostrarán convertidos automáticamente por formatCurrency
      setAhorroActual(actual)
      setAhorroMeta(meta)
      // Convertir la meta a la moneda seleccionada para mostrarla en el formulario
      const metaConvertida = convertirMoneda(meta, moneda.codigo)
      setNuevaMeta(metaConvertida.toString())
    } catch (err) {
      setError(err.message)
      console.error('Error cargando ahorro:', err)
    } finally {
      setLoading(false)
    }
  }

  const progressPercentage = ahorroMeta > 0 ? (ahorroActual / ahorroMeta) * 100 : 0
  const remaining = ahorroMeta - ahorroActual

  const handleAddAhorro = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      const monto = parseFloat(montoAgregar)
      if (monto > 0) {
        // Convertir el monto de la moneda seleccionada a COP antes de guardar
        const montoEnCOP = convertirAMonedaBase(monto, moneda.codigo)
        await ahorroService.updateAhorroActual(Math.round(montoEnCOP))
        await loadAhorro()
        setMontoAgregar('')
        setIsAddModalOpen(false)
      }
    } catch (err) {
      setError(err.message)
      console.error('Error agregando ahorro:', err)
    }
  }

  const handleEditMeta = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      const meta = parseFloat(nuevaMeta)
      if (meta > 0) {
        // Convertir el monto de la moneda seleccionada a COP antes de guardar
        const metaEnCOP = convertirAMonedaBase(meta, moneda.codigo)
        await ahorroService.updateAhorroMeta(Math.round(metaEnCOP))
        await loadAhorro()
        setIsEditMetaModalOpen(false)
      }
    } catch (err) {
      setError(err.message)
      console.error('Error actualizando meta:', err)
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent mb-1">
            🐷 Ahorro
          </h1>
          <p className="text-xs text-gray-500">Cada peso cuenta, ¡sigue así!</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1.5 rounded-lg hover:shadow-md transform hover:scale-105 transition-all duration-200 text-sm font-semibold"
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>

      {error && (
        <Alert
          type="error"
          title="Error"
          message={error}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300 border border-gray-200">
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
            Progreso de Ahorro
          </h2>
          <div className="h-48 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-lg flex items-center justify-center border-2 border-dashed border-amber-200">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                <TrendingUp className="text-amber-600" size={24} />
              </div>
              <p className="text-xs text-gray-400 font-medium">Gráfico de progreso de ahorro</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-xl shadow-md p-4 border border-amber-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-bl-full"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-md">
                <Target size={18} className="text-white" />
              </div>
              <h2 className="text-base font-bold text-gray-800">Resumen</h2>
            </div>

            <div className="space-y-3">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-amber-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Meta de ahorro</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {formatCurrency(ahorroMeta)}
                    </span>
                    <button
                      onClick={() => setIsEditMetaModalOpen(true)}
                      className="p-1 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                      title="Editar meta"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-emerald-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Monto ahorrado</span>
                  <span className="text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-1">
                    <Sparkles size={12} className="text-emerald-500" />
                    {formatCurrency(ahorroActual)}
                  </span>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Restante</span>
                  <span className="text-xs font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {formatCurrency(remaining)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-amber-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">% Completado</span>
                  <span className="text-lg font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {progressPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-amber-100 rounded-full h-3 shadow-inner overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 transition-all duration-500 ease-out shadow-md relative overflow-hidden"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                <p className="text-xs text-amber-700 font-semibold mt-1.5 text-center">
                  {progressPercentage >= 100 ? '🎉 ¡Meta alcanzada!' : '¡Sigue así, vas muy bien!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setMontoAgregar('')
        }}
        title="Agregar al Ahorro"
      >
        <form onSubmit={handleAddAhorro} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Monto a agregar ({moneda.codigo})
            </label>
            <input
              type="number"
              required
              placeholder="0"
              step="1"
              min="1"
              value={montoAgregar}
              onChange={(e) => setMontoAgregar(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <Alert
            type="info"
            compact={true}
            message={
              <>
                <span className="font-semibold">Ahorro actual:</span> {formatCurrency(ahorroActual)}
                {montoAgregar && parseFloat(montoAgregar) > 0 && (
                  <>
                    <br />
                    <span className="font-semibold">Nuevo total:</span> {formatCurrency(Math.min(ahorroActual + parseFloat(montoAgregar), ahorroMeta))}
                  </>
                )}
              </>
            }
          />
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false)
                setMontoAgregar('')
              }}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:shadow-md transition-all font-semibold"
            >
              Agregar
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditMetaModalOpen}
        onClose={() => {
          setIsEditMetaModalOpen(false)
          setNuevaMeta(ahorroMeta.toString())
        }}
        title="Editar Meta de Ahorro"
      >
        <form onSubmit={handleEditMeta} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nueva meta ({moneda.codigo})
            </label>
            <input
              type="number"
              required
              placeholder="0"
              step="1"
              min="1"
              value={nuevaMeta}
              onChange={(e) => setNuevaMeta(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <Alert
            type="info"
            compact={true}
            message={
              <>
                <span className="font-semibold">Meta actual:</span> {formatCurrency(ahorroMeta)}
                <br />
                <span className="font-semibold">Ahorro actual:</span> {formatCurrency(ahorroActual)}
                {nuevaMeta && parseFloat(nuevaMeta) > 0 && (
                  <>
                    <br />
                    <span className="font-semibold">Nuevo progreso:</span> {((ahorroActual / parseFloat(nuevaMeta)) * 100).toFixed(1)}%
                  </>
                )}
              </>
            }
          />
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsEditMetaModalOpen(false)
                setNuevaMeta(ahorroMeta.toString())
              }}
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
    </div>
  )
}

export default Ahorro

