import { useState, useEffect } from 'react'
import { Edit2, Save, X, Loader2, Plus, Trash2 } from 'lucide-react'
import { presupuestosService } from '../services/presupuestosService'
import { useFormatCurrency } from '../hooks/useFormatCurrency'
import { convertirAMonedaBase, convertirMoneda } from '../services/conversionService'
import Modal from '../components/Modal'
import DeleteModal from '../components/DeleteModal'

const Presupuesto = () => {
  const { formatCurrency, moneda } = useFormatCurrency()
  const [presupuestos, setPresupuestos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingIndex, setEditingIndex] = useState(null)
  const [editData, setEditData] = useState({ presupuesto: '' })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPresupuesto, setSelectedPresupuesto] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    categoria: '',
    presupuesto: ''
  })

  const categorias = ['trabajo', 'casa', 'comida', 'personales', 'ahorros']

  useEffect(() => {
    loadPresupuestos()
  }, [])

  const loadPresupuestos = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await presupuestosService.getAll()
      
      // Calcular gastado para cada categoría
      const presupuestosConGastado = await Promise.all(
        data.map(async (presupuesto) => {
          const gastado = await presupuestosService.getGastadoPorCategoria(presupuesto.categoria)
          return { ...presupuesto, gastado }
        })
      )
      
      setPresupuestos(presupuestosConGastado)
    } catch (err) {
      setError(err.message)
      console.error('Error cargando presupuestos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setIsEditing(false)
    setFormData({ categoria: '', presupuesto: '' })
    setIsModalOpen(true)
  }

  const handleEdit = (index) => {
    setIsEditing(true)
    const presupuesto = presupuestos[index]
    setSelectedPresupuesto(presupuesto)
    // Convertir el monto de COP a la moneda seleccionada para mostrarlo
    const montoConvertido = convertirMoneda(parseFloat(presupuesto.presupuesto), moneda.codigo)
    setFormData({
      categoria: presupuesto.categoria,
      presupuesto: montoConvertido.toString()
    })
    setIsModalOpen(true)
  }

  const handleDelete = (presupuesto) => {
    setSelectedPresupuesto(presupuesto)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    try {
      setError(null)
      await presupuestosService.delete(selectedPresupuesto.id)
      await loadPresupuestos()
      setIsDeleteModalOpen(false)
      setSelectedPresupuesto(null)
    } catch (err) {
      setError(err.message)
      console.error('Error eliminando presupuesto:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      // Convertir el monto de la moneda seleccionada a COP antes de guardar
      const montoEnCOP = convertirAMonedaBase(parseFloat(formData.presupuesto), moneda.codigo)
      
      const formDataParaGuardar = {
        ...formData,
        presupuesto: Math.round(montoEnCOP).toString()
      }

      if (isEditing) {
        await presupuestosService.update(selectedPresupuesto.id, formDataParaGuardar)
      } else {
        await presupuestosService.upsert(formDataParaGuardar)
      }
      await loadPresupuestos()
      setIsModalOpen(false)
      setFormData({ categoria: '', presupuesto: '' })
      setSelectedPresupuesto(null)
    } catch (err) {
      setError(err.message)
      console.error('Error guardando presupuesto:', err)
    }
  }

  const handleQuickEdit = (index) => {
    setEditingIndex(index)
    // Convertir el monto de COP a la moneda seleccionada para mostrarlo
    const montoConvertido = convertirMoneda(parseFloat(presupuestos[index].presupuesto), moneda.codigo)
    setEditData({
      presupuesto: montoConvertido.toString()
    })
  }

  const handleQuickSave = async (index) => {
    try {
      setError(null)
      const presupuesto = presupuestos[index]
      // Convertir el monto de la moneda seleccionada a COP antes de guardar
      const montoEnCOP = convertirAMonedaBase(parseFloat(editData.presupuesto), moneda.codigo)
      
      await presupuestosService.update(presupuesto.id, {
        categoria: presupuesto.categoria,
        presupuesto: Math.round(montoEnCOP).toString()
      })
      await loadPresupuestos()
      setEditingIndex(null)
      setEditData({ presupuesto: '' })
    } catch (err) {
      setError(err.message)
      console.error('Error actualizando presupuesto:', err)
    }
  }

  const handleCancel = () => {
    setEditingIndex(null)
    setEditData({ presupuesto: '' })
  }

  const getProgressConfig = (percentage) => {
    if (percentage >= 90) {
      return {
        bg: 'bg-gradient-to-r from-orange-400 to-amber-500',
        text: 'text-orange-600',
        label: '¡Cuidado!'
      }
    }
    if (percentage >= 70) {
      return {
        bg: 'bg-gradient-to-r from-yellow-400 to-orange-400',
        text: 'text-yellow-600',
        label: 'Atención'
      }
    }
    return {
      bg: 'bg-gradient-to-r from-emerald-400 to-teal-500',
      text: 'text-emerald-600',
      label: 'Bien'
    }
  }

  // Obtener categorías disponibles (las que no tienen presupuesto)
  const categoriasDisponibles = categorias.filter(
    cat => !presupuestos.some(p => p.categoria === cat)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
            🎯 Presupuesto
          </h1>
          <p className="text-xs text-gray-500">Controla tus gastos por categoría</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1.5 rounded-lg hover:shadow-md transform hover:scale-105 transition-all duration-200 text-sm font-semibold"
        >
          <Plus size={16} />
          Crear Presupuesto
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          Error: {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="animate-spin text-purple-600" size={24} />
          <span className="ml-2 text-sm text-gray-600">Cargando presupuestos...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presupuestos.length === 0 ? (
            <div className="col-span-full text-center py-8 text-sm text-gray-500">
              No hay presupuestos configurados. Los presupuestos se crean automáticamente cuando agregas gastos.
            </div>
          ) : (
            presupuestos.map((presupuesto, index) => {
          const percentage = (presupuesto.gastado / presupuesto.presupuesto) * 100
          const remaining = presupuesto.presupuesto - presupuesto.gastado
          const progressConfig = getProgressConfig(percentage)

          const isEditing = editingIndex === index

          return (
            <div
              key={index}
              className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-50 to-pink-50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="text-lg">📁</span>
                    {presupuesto.categoria}
                  </h3>
                  <div className="flex gap-1">
                    {editingIndex !== index ? (
                      <>
                        <button
                          onClick={() => handleEdit(index)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Editar presupuesto"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(presupuesto)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar presupuesto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleQuickSave(index)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Guardar"
                        >
                          <Save size={14} />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          <X size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Presupuesto</span>
                      {editingIndex === index ? (
                        <input
                          type="number"
                          value={editData.presupuesto}
                          onChange={(e) => setEditData({ ...editData, presupuesto: e.target.value })}
                          className="w-24 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          min="0"
                          step="1"
                        />
                      ) : (
                        <span className="text-xs font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {formatCurrency(presupuesto.presupuesto)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gastado</span>
                      <span className="text-xs font-bold text-gray-700">
                        {formatCurrency(presupuesto.gastado || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Restante</span>
                      <span className={`text-xs font-extrabold ${
                        remaining < 0 ? 'text-orange-600' : 'text-emerald-600'
                      }`}>
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-600 uppercase">Progreso</span>
                      <span className={`text-xs font-bold ${progressConfig.text} flex items-center gap-1`}>
                        <span>{progressConfig.label}</span>
                        <span className="text-xs">{percentage.toFixed(0)}%</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ease-out shadow-md ${progressConfig.bg}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )
          })
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setFormData({ categoria: '', presupuesto: '' })
          setSelectedPresupuesto(null)
        }}
        title={isEditing ? 'Editar Presupuesto' : 'Crear Presupuesto'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              required
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              disabled={isEditing}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Selecciona una categoría</option>
              {isEditing ? (
                <option value={formData.categoria}>
                  {formData.categoria.charAt(0).toUpperCase() + formData.categoria.slice(1)}
                </option>
              ) : (
                categoriasDisponibles.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))
              )}
            </select>
            {!isEditing && categoriasDisponibles.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">Todas las categorías ya tienen presupuesto</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Presupuesto ({moneda.codigo})
            </label>
            <input
              type="number"
              required
              placeholder="0"
              step="1"
              min="0"
              value={formData.presupuesto}
              onChange={(e) => setFormData({ ...formData, presupuesto: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                setFormData({ categoria: '', presupuesto: '' })
                setSelectedPresupuesto(null)
              }}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-md transition-all font-semibold"
            >
              {isEditing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedPresupuesto(null)
        }}
        onConfirm={confirmDelete}
        title="Eliminar Presupuesto"
        message={`¿Estás seguro de que deseas eliminar el presupuesto de "${selectedPresupuesto?.categoria}"?`}
      />
    </div>
  )
}

export default Presupuesto

