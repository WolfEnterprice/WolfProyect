import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Send, Bot, DollarSign, Loader2, Sparkles, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ingresosService } from '../services/ingresosService'
import { gastosService } from '../services/gastosService'
import { presupuestosService } from '../services/presupuestosService'
import { ahorroService } from '../services/ahorroService'
import { getUsuarioContexto, enviarMensajeIA, generarTipsAutomaticos } from '../services/geminiService'
import DeleteModal from './DeleteModal'

const AsistenteIA = ({ isOpen, onClose }) => {
  const [mensajes, setMensajes] = useState([])
  const [mensajeActual, setMensajeActual] = useState('')
  const [loading, setLoading] = useState(false)
  const [cargandoContexto, setCargandoContexto] = useState(true)
  const [contexto, setContexto] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const mensajesEndRef = useRef(null)
  const { user } = useAuth()

  useEffect(() => {
    if (isOpen && !contexto) {
      cargarContexto()
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  const cargarContexto = async (mostrarBienvenida = true) => {
    try {
      setCargandoContexto(true)
      
      // Cargar datos financieros en paralelo
      let ingresos = []
      let gastos = []
      let presupuestosData = []
      let ahorro = { ahorroActual: 0, ahorroMeta: 2000 }

      try {
        [ingresos, gastos, presupuestosData, ahorro] = await Promise.all([
          ingresosService.getAll().catch(() => []),
          gastosService.getAll().catch(() => []),
          presupuestosService.getAll().catch(() => []),
          ahorroService.get().catch(() => ({ ahorroActual: 0, ahorroMeta: 2000 }))
        ])
      } catch (error) {
        console.warn('Error cargando algunos datos financieros, usando valores por defecto:', error)
      }

      // Calcular gastado para cada presupuesto
      let presupuestos = []
      try {
        presupuestos = await Promise.all(
          presupuestosData.map(async (presupuesto) => {
            try {
              const gastado = await presupuestosService.getGastadoPorCategoria(presupuesto.categoria)
              return { ...presupuesto, gastado }
            } catch (error) {
              console.warn(`Error calculando gastado para ${presupuesto.categoria}:`, error)
              return { ...presupuesto, gastado: 0 }
            }
          })
        )
      } catch (error) {
        console.warn('Error calculando presupuestos, usando valores por defecto:', error)
        presupuestos = presupuestosData.map(p => ({ ...p, gastado: 0 }))
      }

      try {
        const contextoUsuario = await getUsuarioContexto(ingresos, gastos, presupuestos, ahorro)
        setContexto(contextoUsuario)
      } catch (error) {
        console.warn('Error generando contexto, usando contexto básico:', error)
        // Crear contexto básico en caso de error
        setContexto({
          totalIngresos: 0,
          totalGastos: 0,
          balance: 0,
          gastosPorCategoria: {},
          presupuestos: [],
          ahorro: { actual: 0, meta: 2000, porcentaje: 0 },
          cantidadIngresos: 0,
          cantidadGastos: 0
        })
      }

      // Agregar mensaje de bienvenida si se solicita
      if (mostrarBienvenida) {
        agregarMensaje({
          tipo: 'bot',
          texto: '¡Hola! 👋 Soy FinBot, tu asistente financiero personal. Estoy aquí para ayudarte con cualquier pregunta sobre tus finanzas.\n\nPuedes preguntarme sobre:\n• Cómo mejorar tus ahorros\n• Análisis de tus gastos\n• Consejos para cumplir tus presupuestos\n• Estrategias financieras\n• Y mucho más...\n\n¿En qué te gustaría que te ayude hoy?',
          timestamp: new Date()
        })
      }
    } catch (error) {
      console.error('Error crítico cargando contexto:', error)
      // Incluso si hay error, intentar mostrar mensaje de bienvenida
      if (mostrarBienvenida) {
        agregarMensaje({
          tipo: 'bot',
          texto: '⚠️ Hubo un problema cargando tu información financiera, pero puedo ayudarte igualmente. ¿En qué te gustaría que te ayude?',
          timestamp: new Date()
        })
      }
    } finally {
      setCargandoContexto(false)
    }
  }

  const agregarMensaje = (mensaje) => {
    setMensajes(prev => [...prev, mensaje])
  }

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const enviarMensaje = async () => {
    if (!mensajeActual.trim() || loading || !contexto) return

    const mensajeUsuario = mensajeActual.trim()
    setMensajeActual('')

    // Crear objeto del mensaje del usuario antes de agregarlo al estado
    const mensajeUsuarioObj = {
      tipo: 'usuario',
      texto: mensajeUsuario,
      timestamp: new Date()
    }

    // Agregar mensaje del usuario al estado
    agregarMensaje(mensajeUsuarioObj)

    setLoading(true)

    try {
      // Crear historial actualizado incluyendo el mensaje que acabamos de agregar
      // Esto asegura que la IA tenga el contexto completo de la conversación
      const historialActualizado = [...mensajes, mensajeUsuarioObj]
      const historialReciente = historialActualizado.slice(-10)
      const respuesta = await enviarMensajeIA(mensajeUsuario, contexto, historialReciente)
      
      if (respuesta.success) {
        agregarMensaje({
          tipo: 'bot',
          texto: respuesta.mensaje,
          timestamp: new Date()
        })
      } else {
        // Si hay un error, mostrar el mensaje de error con instrucciones
        agregarMensaje({
          tipo: 'bot',
          texto: respuesta.mensaje,
          timestamp: new Date()
        })
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error)
      let mensajeError = 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.'
      
      if (error.message.includes('API Key') || error.message.includes('VITE_GEMINI_API_KEY')) {
        mensajeError = '⚠️ API Key de Gemini no configurada.\n\nPara configurarla:\n1. Crea un archivo .env en la raíz del proyecto\n2. Agrega: VITE_GEMINI_API_KEY=tu_api_key_aqui\n3. Obtén tu API key en: https://aistudio.google.com/apikey\n4. Reinicia el servidor de desarrollo'
      } else if (error.message.includes('no está disponible') || error.message.includes('404')) {
        mensajeError = '⚠️ El modelo de IA no está disponible con tu API key.\n\nVerifica que:\n1. Tu API key sea válida\n2. Tengas acceso a Gemini API en Google AI Studio\n3. La API key tenga permisos para usar los modelos'
      }
      
      agregarMensaje({
        tipo: 'bot',
        texto: mensajeError,
        timestamp: new Date()
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  const borrarChat = () => {
    setIsDeleteModalOpen(true)
  }

  const confirmarBorrarChat = async () => {
    // Cerrar el modal primero
    setIsDeleteModalOpen(false)
    
    // Limpiar mensajes del estado (solo en memoria)
    setMensajes([])
    setMensajeActual('')
    setLoading(false)
    
    // Limpiar contexto para que se recargue
    setContexto(null)
    
    // Recargar contexto y mostrar nuevo mensaje de bienvenida
    await cargarContexto(true)
  }

  if (!isOpen && !isDeleteModalOpen) return null

  return (
    <>
      {/* Modal de confirmación para borrar chat - Renderizado usando Portal en el body */}
      {isDeleteModalOpen && createPortal(
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmarBorrarChat}
          title="Borrar Conversación"
          message="¿Estás seguro de que quieres borrar toda la conversación? Esto eliminará todos los mensajes y reiniciará el chat."
          confirmButtonText="Borrar Todo"
        />,
        document.body
      )}

      {/* Chat Container - Solo se muestra si isOpen es true */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end pointer-events-none lg:items-center lg:justify-center">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-wolf-dark/50 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />

          {/* Chat Container */}
          <div className="relative w-full h-full max-w-md max-h-[90vh] bg-white rounded-t-2xl lg:rounded-2xl shadow-2xl flex flex-col pointer-events-auto lg:h-[80vh] lg:max-h-[600px] animate-in slide-in-from-bottom lg:slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-500 via-teal-500 to-lime-500 text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">FinBot</h3>
                  <p className="text-xs text-white/80">Tu asistente financiero</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {mensajes.length > 0 && !cargandoContexto && (
                  <button
                    onClick={borrarChat}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    title="Borrar conversación"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {cargandoContexto ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-primary-600" size={24} />
              <span className="ml-2 text-sm text-gray-600">Cargando tu información...</span>
            </div>
          ) : mensajes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <Sparkles className="mx-auto mb-2 text-primary-500" size={32} />
              <p>¡Hola! ¿En qué puedo ayudarte con tus finanzas?</p>
            </div>
          ) : (
            mensajes.map((mensaje, index) => (
              <div
                key={index}
                className={`flex ${mensaje.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    mensaje.tipo === 'usuario'
                      ? 'bg-gradient-to-r from-primary-500 via-teal-500 to-lime-500 text-white'
                      : 'bg-white text-gray-800 shadow-md border border-gray-200'
                  }`}
                >
                  {mensaje.tipo === 'bot' && (
                    <div className="flex items-center gap-2 mb-1">
                      <Bot size={14} className="text-primary-500" />
                      <span className="text-xs font-semibold text-primary-600">FinBot</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{mensaje.texto}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(mensaje.timestamp).toLocaleTimeString('es-CO', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl p-3 shadow-md border border-gray-200">
                <Loader2 className="animate-spin text-primary-600" size={16} />
              </div>
            </div>
            )}
            <div ref={mensajesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
          {/* Sugerencias de preguntas rápidas */}
          {mensajes.length > 0 && mensajes.length <= 2 && !loading && contexto && (
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                onClick={() => setMensajeActual('¿Cómo puedo ahorrar más dinero?')}
                className="px-3 py-1.5 text-xs bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-full border border-primary-200 transition-colors"
              >
                💰 ¿Cómo ahorrar más?
              </button>
              <button
                onClick={() => setMensajeActual('¿En qué categoría gasto más?')}
                className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full border border-blue-200 transition-colors"
              >
                📊 ¿Dónde gasto más?
              </button>
              <button
                onClick={() => setMensajeActual('Dame consejos para mejorar mis finanzas')}
                className="px-3 py-1.5 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded-full border border-green-200 transition-colors"
              >
                💡 Consejos financieros
              </button>
            </div>
          )}
          
          <div className="flex items-end gap-2">
            <textarea
              value={mensajeActual}
              onChange={(e) => setMensajeActual(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu pregunta o mensaje..."
              disabled={loading || cargandoContexto || !contexto}
              className="flex-1 min-h-[40px] max-h-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={1}
            />
            <button
              onClick={enviarMensaje}
              disabled={!mensajeActual.trim() || loading || cargandoContexto || !contexto}
              className="p-2 bg-gradient-to-r from-primary-500 via-teal-500 to-lime-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
            {!contexto && (
              <p className="text-xs text-gray-500 mt-2">
                💡 Cargando tu información financiera...
              </p>
            )}
          </div>
        </div>
        </div>
      )}
    </>
  )
}

export default AsistenteIA

