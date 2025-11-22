import { useState, useEffect } from 'react'
import { Plus, Eye, Trash2, Edit, Loader2 } from 'lucide-react'
import Modal from '../components/Modal'
import DeleteModal from '../components/DeleteModal'
import DetailModal from '../components/DetailModal'
import Alert from '../components/Alert'
import { ingresosService } from '../services/ingresosService'
import { useFormatCurrency } from '../hooks/useFormatCurrency'
import { convertirAMonedaBase, convertirMoneda } from '../services/conversionService'

const Ingresos = () => {
  const { formatCurrency, moneda } = useFormatCurrency()
  const [ingresos, setIngresos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedIngreso, setSelectedIngreso] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fecha: '',
    descripcion: '',
    categoria: 'trabajo',
    monto: ''
  })

  const handleAdd = () => {
    setIsEditing(false)
    setFormData({ fecha: '', descripcion: '', categoria: 'trabajo', monto: '' })
    setIsModalOpen(true)
  }

  const handleEdit = (ingreso) => {
    setIsEditing(true)
    setSelectedIngreso(ingreso)
    // Convertir el monto de COP a la moneda seleccionada para mostrarlo
    const montoConvertido = convertirMoneda(parseFloat(ingreso.monto), moneda.codigo)
    setFormData({
      fecha: ingreso.fecha,
      descripcion: ingreso.descripcion,
      categoria: ingreso.categoria,
      monto: montoConvertido.toString()
    })
    setIsModalOpen(true)
  }

  const handleDelete = (ingreso) => {
    setSelectedIngreso(ingreso)
    setIsDeleteModalOpen(true)
  }

  useEffect(() => {
    loadIngresos()
  }, [])

  const loadIngresos = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ingresosService.getAll()
      // Mapear nombres de columnas para compatibilidad
      const mappedData = data.map(i => ({
        ...i,
        descripcion: i.descripcion || i.descripción,
        categoria: i.categoria || i.categoría
      }))
      setIngresos(mappedData)
    } catch (err) {
      setError(err.message)
      console.error('Error cargando ingresos:', err)
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = async () => {
    try {
      await ingresosService.delete(selectedIngreso.id)
      await loadIngresos()
      setIsDeleteModalOpen(false)
      setSelectedIngreso(null)
    } catch (err) {
      setError(err.message)
      console.error('Error eliminando ingreso:', err)
    }
  }

  const handleView = (ingreso) => {
    setSelectedIngreso(ingreso)
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
        await ingresosService.update(selectedIngreso.id, formDataParaGuardar)
      } else {
        await ingresosService.create(formDataParaGuardar)
      }
      await loadIngresos()
      setIsModalOpen(false)
      setFormData({ fecha: '', descripcion: '', categoria: 'trabajo', monto: '' })
      setSelectedIngreso(null)
    } catch (err) {
      setError(err.message)
      console.error('Error guardando ingreso:', err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">
            💵 Ingresos
          </h1>
          <p className="text-xs text-gray-500">Gestiona tus ingresos y mantén el control</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 rounded-lg hover:shadow-md transform hover:scale-105 transition-all duration-200 text-sm font-semibold"
        >
          <Plus size={16} />
          Añadir
        </button>
      </div>

      {error && (
        <Alert
          type="error"
          title="Error"
          message={error}
        />
      )}

      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="animate-spin text-emerald-600" size={24} />
            <span className="ml-2 text-sm text-gray-600">Cargando ingresos...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Fecha</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Descripción</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Categoría</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Monto</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {ingresos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-3 py-8 text-center text-sm text-gray-500">
                      No hay ingresos registrados. ¡Agrega tu primer ingreso!
                    </td>
                  </tr>
                ) : (
                  ingresos.map((ingreso) => (
                <tr key={ingreso.id} className="hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 transition-all duration-200">
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-700">{ingreso.fecha}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-800">{ingreso.descripcion || ingreso.descripción}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full border border-emerald-200">
                      {ingreso.categoria || ingreso.categoría}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    +{formatCurrency(ingreso.monto)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(ingreso)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Ver detalles"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleEdit(ingreso)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(ingreso)}
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
          setFormData({ fecha: '', descripcion: '', categoria: 'trabajo', monto: '' })
          setSelectedIngreso(null)
        }}
        title={isEditing ? 'Editar Ingreso' : 'Añadir Ingreso'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              required
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                setFormData({ fecha: '', descripcion: '', categoria: 'trabajo', monto: '' })
                setSelectedIngreso(null)
              }}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-md transition-all font-semibold"
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
          setSelectedIngreso(null)
        }}
        onConfirm={confirmDelete}
        title="Eliminar Ingreso"
        message={`¿Estás seguro de que deseas eliminar el ingreso "${selectedIngreso?.descripcion}"?`}
      />

      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedIngreso(null)
        }}
        item={selectedIngreso}
        type="ingreso"
      />
    </div>
  )
}

export default Ingresos

