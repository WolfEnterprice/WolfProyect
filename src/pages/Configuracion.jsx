import { useState, useEffect } from 'react'
import { Settings, User, Bell, Palette, LogOut, Tag, Plus, Edit2, Trash2, Loader2, Mail, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { usePreferencias } from '../contexts/PreferenciasContext'
import { useNavigate } from 'react-router-dom'
import { categoriasService } from '../services/categoriasService'
import Modal from '../components/Modal'
import DeleteModal from '../components/DeleteModal'
import Alert from '../components/Alert'

const Configuracion = () => {
  const { user, signOut, updatePassword, updateEmail } = useAuth()
  const { moneda, monedasDisponibles, cambiarMoneda, temaColor, cambiarTemaColor } = usePreferencias()
  const navigate = useNavigate()
  const [categoriasIngresos, setCategoriasIngresos] = useState([])
  const [categoriasGastos, setCategoriasGastos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [tipoCategoria, setTipoCategoria] = useState('ingreso') // 'ingreso' o 'gasto'
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'ingreso',
    color: '#3b82f6'
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [emailData, setEmailData] = useState({
    newEmail: '',
    confirmEmail: ''
  })

  useEffect(() => {
    loadCategorias()
  }, [])

  const loadCategorias = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Cargar solo las categorías que están en la base de datos
      const [ingresos, gastos] = await Promise.all([
        categoriasService.getIngresos(),
        categoriasService.getGastos()
      ])
      
      setCategoriasIngresos(ingresos)
      setCategoriasGastos(gastos)
    } catch (err) {
      setError(err.message)
      console.error('Error cargando categorías:', err)
      // Si hay error, mostrar arrays vacíos
      setCategoriasIngresos([])
      setCategoriasGastos([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      setSuccessMessage(null)

      // Validaciones
      if (!passwordData.newPassword || !passwordData.confirmPassword) {
        throw new Error('Todos los campos son obligatorios')
      }

      if (passwordData.newPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres')
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }

      await updatePassword(passwordData.newPassword)
      setSuccessMessage('Contraseña actualizada correctamente')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setIsPasswordModalOpen(false)
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err.message)
      console.error('Error cambiando contraseña:', err)
    }
  }

  const handleChangeEmail = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      setSuccessMessage(null)

      // Validaciones
      if (!emailData.newEmail || !emailData.confirmEmail) {
        throw new Error('Todos los campos son obligatorios')
      }

      if (emailData.newEmail !== emailData.confirmEmail) {
        throw new Error('Los correos no coinciden')
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(emailData.newEmail)) {
        throw new Error('El formato del correo electrónico no es válido')
      }

      if (emailData.newEmail === user?.email) {
        throw new Error('El nuevo correo debe ser diferente al actual')
      }

      await updateEmail(emailData.newEmail)
      setSuccessMessage('Correo electrónico actualizado. Por favor, verifica tu nuevo correo.')
      setEmailData({ newEmail: '', confirmEmail: '' })
      setIsEmailModalOpen(false)
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err) {
      setError(err.message)
      console.error('Error cambiando correo:', err)
    }
  }

  const handleAddCategoria = (tipo) => {
    setIsEditing(false)
    setTipoCategoria(tipo)
    setFormData({ nombre: '', tipo, color: '#3b82f6' })
    setSelectedCategoria(null)
    setIsModalOpen(true)
  }

  const handleEditCategoria = (categoria) => {
    setIsEditing(true)
    setSelectedCategoria(categoria)
    setTipoCategoria(categoria.tipo)
    setFormData({
      nombre: categoria.nombre,
      tipo: categoria.tipo,
      color: categoria.color || '#3b82f6'
    })
    setIsModalOpen(true)
  }

  const handleDeleteCategoria = (categoria) => {
    setSelectedCategoria(categoria)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    try {
      setError(null)
      await categoriasService.delete(selectedCategoria.id)
      await loadCategorias()
      setIsDeleteModalOpen(false)
      setSelectedCategoria(null)
    } catch (err) {
      setError(err.message)
      console.error('Error eliminando categoría:', err)
    }
  }

  const handleSubmitCategoria = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      
      if (isEditing) {
        await categoriasService.update(selectedCategoria.id, formData)
      } else {
        await categoriasService.create(formData)
      }
      
      await loadCategorias()
      setIsModalOpen(false)
      setFormData({ nombre: '', tipo: 'ingreso', color: '#3b82f6' })
      setSelectedCategoria(null)
    } catch (err) {
      setError(err.message)
      console.error('Error guardando categoría:', err)
    }
  }

  // Colores predefinidos para categorías
  const coloresDisponibles = [
    { nombre: 'Azul', valor: '#3b82f6' },
    { nombre: 'Verde', valor: '#10b981' },
    { nombre: 'Naranja', valor: '#f59e0b' },
    { nombre: 'Rosa', valor: '#ec4899' },
    { nombre: 'Púrpura', valor: '#8b5cf6' },
    { nombre: 'Rojo', valor: '#ef4444' },
    { nombre: 'Cian', valor: '#06b6d4' },
    { nombre: 'Gris', valor: '#6b7280' },
  ]

  // Solo mostrar categorías de la base de datos (sin categorías por defecto)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-1">
          ⚙️ Configuración
        </h1>
        <p className="text-xs text-gray-500">Administra tu cuenta y preferencias</p>
      </div>

      {error && (
        <Alert
          type="error"
          title="Error"
          message={error}
        />
      )}

      {successMessage && (
        <Alert
          type="success"
          title="Éxito"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* Información del Usuario */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200">
        <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <User size={18} className="text-blue-600" />
          Información de la Cuenta
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-800 border border-gray-200">
                {user?.email || 'No disponible'}
              </div>
              <button
                onClick={() => setIsEmailModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-xs font-semibold border border-blue-200"
              >
                <Mail size={14} />
                Cambiar
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors text-xs font-semibold border border-gray-200"
            >
              <Lock size={14} />
              Cambiar Contraseña
            </button>
          </div>
        </div>
      </div>

      {/* Gestión de Categorías */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Tag size={18} className="text-purple-600" />
            Mis Categorías
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="animate-spin text-purple-600" size={20} />
            <span className="ml-2 text-xs text-gray-600">Cargando categorías...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Categorías de Ingresos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Categorías de Ingresos</h3>
                <button
                  onClick={() => handleAddCategoria('ingreso')}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-semibold"
                >
                  <Plus size={14} />
                  Agregar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categoriasIngresos.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No tienes categorías de ingresos. Crea una nueva.</p>
                ) : (
                  categoriasIngresos.map((cat) => (
                  <div
                    key={cat.id || cat.nombre}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium group"
                    style={{
                      backgroundColor: cat.color ? `${cat.color}15` : '#e0e7ff',
                      border: `1px solid ${cat.color || '#6366f1'}`,
                      color: cat.color || '#6366f1'
                    }}
                  >
                    <span className="flex-1">{cat.nombre}</span>
                    {cat.id ? (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditCategoria(cat)
                          }}
                          className="p-1 hover:bg-white/70 rounded transition-colors text-current"
                          title="Editar categoría"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteCategoria(cat)
                          }}
                          className="p-1 hover:bg-red-100 rounded transition-colors text-red-600"
                          title="Eliminar categoría"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">Por defecto</span>
                    )}
                  </div>
                  ))
                )}
              </div>
            </div>

            {/* Categorías de Gastos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Categorías de Gastos</h3>
                <button
                  onClick={() => handleAddCategoria('gasto')}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors font-semibold"
                >
                  <Plus size={14} />
                  Agregar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categoriasGastos.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No tienes categorías de gastos. Crea una nueva.</p>
                ) : (
                  categoriasGastos.map((cat) => (
                  <div
                    key={cat.id || cat.nombre}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium group"
                    style={{
                      backgroundColor: cat.color ? `${cat.color}15` : '#fee2e2',
                      border: `1px solid ${cat.color || '#ef4444'}`,
                      color: cat.color || '#ef4444'
                    }}
                  >
                    <span className="flex-1">{cat.nombre}</span>
                    {cat.id ? (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditCategoria(cat)
                          }}
                          className="p-1 hover:bg-white/70 rounded transition-colors text-current"
                          title="Editar categoría"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteCategoria(cat)
                          }}
                          className="p-1 hover:bg-red-100 rounded transition-colors text-red-600"
                          title="Eliminar categoría"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">Por defecto</span>
                    )}
                  </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preferencias */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200">
        <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Palette size={18} className="text-purple-600" />
          Preferencias
        </h2>
        <div className="space-y-4">
          {/* Selector de Moneda */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Moneda
            </label>
            <select
              value={moneda.codigo}
              onChange={(e) => {
                const monedaSeleccionada = monedasDisponibles.find(m => m.codigo === e.target.value)
                if (monedaSeleccionada) {
                  cambiarMoneda(monedaSeleccionada)
                  setSuccessMessage(`Moneda cambiada a ${monedaSeleccionada.nombre}`)
                  setTimeout(() => setSuccessMessage(null), 3000)
                }
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {monedasDisponibles.map((m) => (
                <option key={m.codigo} value={m.codigo}>
                  {m.nombre} ({m.codigo})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Actualmente: {moneda.nombre} ({moneda.codigo})
            </p>
            <Alert
              type="info"
              compact={true}
              message={`Todos los valores se convertirán automáticamente de COP (moneda base) a ${moneda.nombre}. Los valores se muestran convertidos pero se guardan en COP en la base de datos.`}
              className="mt-2"
            />
          </div>

          {/* Selector de Color del Tema */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Color del Tema
            </label>
            <div className="space-y-3">
              {/* Colores predefinidos */}
              <div>
                <p className="text-xs text-gray-600 mb-2">Colores predefinidos:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { nombre: 'Azul', valor: '#3b82f6' },
                    { nombre: 'Verde', valor: '#10b981' },
                    { nombre: 'Púrpura', valor: '#8b5cf6' },
                    { nombre: 'Rosa', valor: '#ec4899' },
                    { nombre: 'Naranja', valor: '#f59e0b' },
                    { nombre: 'Rojo', valor: '#ef4444' },
                    { nombre: 'Cian', valor: '#06b6d4' },
                    { nombre: 'Amarillo', valor: '#eab308' },
                  ].map((color) => (
                    <button
                      key={color.valor}
                      type="button"
                      onClick={() => {
                        cambiarTemaColor(color.valor)
                        setSuccessMessage(`Tema cambiado a ${color.nombre}`)
                        setTimeout(() => setSuccessMessage(null), 3000)
                      }}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        temaColor === color.valor
                          ? 'border-gray-800 scale-110 shadow-lg ring-2 ring-offset-2 ring-gray-300'
                          : 'border-gray-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.valor }}
                      title={color.nombre}
                    />
                  ))}
                </div>
              </div>
              
              {/* Selector de color personalizado */}
              <div>
                <p className="text-xs text-gray-600 mb-2">Color personalizado:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={temaColor}
                    onChange={(e) => {
                      cambiarTemaColor(e.target.value)
                      setSuccessMessage('Color del tema actualizado')
                      setTimeout(() => setSuccessMessage(null), 3000)
                    }}
                    className="w-16 h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={temaColor}
                    onChange={(e) => {
                      if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                        cambiarTemaColor(e.target.value)
                        setSuccessMessage('Color del tema actualizado')
                        setTimeout(() => setSuccessMessage(null), 3000)
                      }
                    }}
                    placeholder="#3b82f6"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 El color elegido se aplicará a botones, enlaces y elementos destacados de la aplicación.
            </p>
          </div>
        </div>
      </div>


      {/* Acciones */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200">
        <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Settings size={18} className="text-orange-600" />
          Acciones
        </h2>
        <div className="space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-semibold border border-red-200"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Información de la Aplicación */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
        <h3 className="text-sm font-bold text-gray-800 mb-2">Acerca de</h3>
        <p className="text-xs text-gray-600 mb-2">
          Gestor de Finanzas - Versión 1.0.0
        </p>
        <p className="text-xs text-gray-500">
          Aplicación para gestionar tus finanzas personales de manera sencilla y eficiente.
        </p>
      </div>

      {/* Modal para Crear/Editar Categoría */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setFormData({ nombre: '', tipo: 'ingreso', color: '#3b82f6' })
          setSelectedCategoria(null)
        }}
        title={isEditing ? 'Editar Categoría' : 'Crear Categoría'}
      >
        <form onSubmit={handleSubmitCategoria} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tipo de Categoría
            </label>
            <select
              required
              value={formData.tipo}
              onChange={(e) => {
                setFormData({ ...formData, tipo: e.target.value })
                setTipoCategoria(e.target.value)
              }}
              disabled={isEditing}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nombre de la Categoría
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Transporte, Renta, etc."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {coloresDisponibles.map((color) => (
                <button
                  key={color.valor}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.valor })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color.valor
                      ? 'border-gray-800 scale-110 shadow-lg'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.valor }}
                  title={color.nombre}
                />
              ))}
            </div>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="mt-2 w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
            />
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                setFormData({ nombre: '', tipo: 'ingreso', color: '#3b82f6' })
                setSelectedCategoria(null)
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

      {/* Modal de Confirmación de Eliminación */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedCategoria(null)
        }}
        onConfirm={confirmDelete}
        title="Eliminar Categoría"
        message={
          selectedCategoria ? (
            <>
              <p className="mb-2">¿Estás seguro de que deseas eliminar la categoría <strong>"{selectedCategoria.nombre}"</strong>?</p>
              <p className="text-sm text-gray-600 mt-2">
                ⚠️ <strong>Nota:</strong> Si tienes ingresos o gastos con esta categoría, seguirán existiendo, pero no podrás crear nuevos registros con esta categoría hasta que la vuelvas a crear.
              </p>
            </>
          ) : (
            '¿Estás seguro de que deseas eliminar esta categoría?'
          )
        }
      />

      {/* Modal para Cambiar Contraseña */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false)
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
          setError(null)
        }}
        title="Cambiar Contraseña"
      >
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nueva Contraseña
            </label>
            <input
              type="password"
              required
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              required
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="Repite la nueva contraseña"
              minLength={6}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Alert
            type="info"
            compact={true}
            message="La contraseña debe tener al menos 6 caracteres."
          />
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsPasswordModalOpen(false)
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                setError(null)
              }}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-md transition-all font-semibold"
            >
              Actualizar Contraseña
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal para Cambiar Correo Electrónico */}
      <Modal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false)
          setEmailData({ newEmail: '', confirmEmail: '' })
          setError(null)
        }}
        title="Cambiar Correo Electrónico"
      >
        <form onSubmit={handleChangeEmail} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Correo Actual
            </label>
            <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-200">
              {user?.email || 'No disponible'}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nuevo Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={emailData.newEmail}
              onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
              placeholder="nuevo@correo.com"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Confirmar Nuevo Correo
            </label>
            <input
              type="email"
              required
              value={emailData.confirmEmail}
              onChange={(e) => setEmailData({ ...emailData, confirmEmail: e.target.value })}
              placeholder="nuevo@correo.com"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Alert
            type="warning"
            compact={true}
            message="Después de cambiar tu correo, recibirás un email de verificación en tu nueva dirección. Debes verificar el nuevo correo para completar el cambio."
          />
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsEmailModalOpen(false)
                setEmailData({ newEmail: '', confirmEmail: '' })
                setError(null)
              }}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-md transition-all font-semibold"
            >
              Actualizar Correo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Configuracion

