import { useState, useEffect } from 'react'
import { Plus, Eye, Trash2, Edit, Loader2 } from 'lucide-react'
import Modal from '../components/Modal'
import DeleteModal from '../components/DeleteModal'
import DetailModal from '../components/DetailModal'
import { gastosService } from '../services/gastosService'
import { useFormatCurrency } from '../hooks/useFormatCurrency'
import { convertirAMonedaBase, convertirMoneda } from '../services/conversionService'

const Gastos = () => {
  const { formatCurrency, moneda } = useFormatCurrency()
  const [gastos, setGastos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedGasto, setSelectedGasto] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fecha: '',
    descripcion: '',
    categoria: 'casa',
    monto: '',
    metodoPago: 'Efectivo'
  })

  const handleAdd = () => {
    setIsEditing(false)
    setFormData({ fecha: '', descripcion: '', categoria: 'casa', monto: '', metodoPago: 'Efectivo' })
    setIsModalOpen(true)
  }

  const handleEdit = (gasto) => {
    setIsEditing(true)
    setSelectedGasto(gasto)
    // Convertir el monto de COP a la moneda seleccionada para mostrarlo
    const montoConvertido = convertirMoneda(parseFloat(gasto.monto), moneda.codigo)
    setFormData({
      fecha: gasto.fecha,
      descripcion: gasto.descripción || gasto.descripcion,
      categoria: gasto.categoría || gasto.categoria,
      monto: montoConvertido.toString(),
      metodoPago: gasto.metodoPago || gasto.metodo_pago
    })
    setIsModalOpen(true)
  }

  const handleDelete = (gasto) => {
    setSelectedGasto(gasto)
    setIsDeleteModalOpen(true)
  }

  useEffect(() => {
    loadGastos()
  }, [])

  const loadGastos = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await gastosService.getAll()
      // Mapear nombres de columnas de BD a formato del componente
      const mappedData = data.map(g => ({
        ...g,
        descripcion: g.descripción || g.descripcion,
        categoria: g.categoría || g.categoria,
        metodoPago: g.metodoPago || g.metodo_pago
      }))
      setGastos(mappedData)
    } catch (err) {
      setError(err.message)
      console.error('Error cargando gastos:', err)
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = async () => {
    try {
      await gastosService.delete(selectedGasto.id)
      await loadGastos()
      setIsDeleteModalOpen(false)
      setSelectedGasto(null)
    } catch (err) {
      setError(err.message)
      console.error('Error eliminando gasto:', err)
    }
  }

  const handleView = (gasto) => {
    setSelectedGasto(gasto)
    setIsDetailModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      // Convertir el monto de la moneda seleccionada a COP antes de guardar
      const montoEnCOP = convertirAMonedaBase(parseFloat(formData.monto), moneda.codigo)
      
      const formDataParaGuardar = {
        ...formData,
        monto: Math.round(montoEnCOP).toString() // Redondear a entero
      }

      if (isEditing) {
        await gastosService.update(selectedGasto.id, formDataParaGuardar)
      } else {
        await gastosService.create(formDataParaGuardar)
      }
      await loadGastos()
      setIsModalOpen(false)
      setFormData({ fecha: '', descripcion: '', categoria: 'casa', monto: '', metodoPago: 'Efectivo' })
      setSelectedGasto(null)
    } catch (err) {
      setError(err.message)
      console.error('Error guardando gasto:', err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            📊 Gastos
          </h1>
          <p className="text-xs text-gray-500">Monitorea tus gastos de manera inteligente</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-lg hover:shadow-md transform hover:scale-105 transition-all duration-200 text-sm font-semibold"
        >
          <Plus size={16} />
          Añadir
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          Error: {error}
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="animate-spin text-blue-600" size={24} />
            <span className="ml-2 text-sm text-gray-600">Cargando gastos...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Fecha</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Descripción</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Categoría</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Monto</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Método</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {gastos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-3 py-8 text-center text-sm text-gray-500">
                      No hay gastos registrados. ¡Agrega tu primer gasto!
                    </td>
                  </tr>
                ) : (
                  gastos.map((gasto) => (
                <tr key={gasto.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200">
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-700">{gasto.fecha}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-800">{gasto.descripcion}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full border border-blue-200">
                      {gasto.categoria}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-extrabold text-gray-700">
                    {formatCurrency(gasto.monto)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-600">{gasto.metodoPago}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(gasto)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Ver detalles"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleEdit(gasto)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(gasto)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setFormData({ fecha: '', descripcion: '', categoria: 'casa', monto: '', metodoPago: 'Efectivo' })
          setSelectedGasto(null)
        }}
        title={isEditing ? 'Editar Gasto' : 'Añadir Gasto'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              required
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
            <input
              type="text"
              required
              placeholder="Ingrese descripción"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="trabajo">Trabajo</option>
              <option value="casa">Casa</option>
              <option value="comida">Comida</option>
              <option value="personales">Personales</option>
              <option value="ahorros">Ahorros</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Monto ({moneda.codigo})</label>
            <input
              type="number"
              required
              placeholder="0"
              step="1"
              min="0"
              value={formData.monto}
              onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Método de pago</label>
            <select
              value={formData.metodoPago}
              onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Efectivo</option>
              <option>Tarjeta</option>
              <option>Transferencia</option>
              <option>Otro</option>
            </select>
          </div>
          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                setFormData({ fecha: '', descripcion: '', categoria: 'casa', monto: '', metodoPago: 'Efectivo' })
                setSelectedGasto(null)
              }}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-md transition-all font-semibold"
            >
              {isEditing ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedGasto(null)
        }}
        onConfirm={confirmDelete}
        title="Eliminar Gasto"
        message={`¿Estás seguro de que deseas eliminar el gasto "${selectedGasto?.descripcion}"?`}
      />

      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedGasto(null)
        }}
        item={selectedGasto}
        type="gasto"
      />
    </div>
  )
}

export default Gastos

