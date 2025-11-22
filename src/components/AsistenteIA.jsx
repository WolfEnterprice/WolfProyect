import { useState, useEffect, useRef } from 'react'
import { X, Send, Bot, DollarSign, Loader2, Sparkles, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ingresosService } from '../services/ingresosService'
import { gastosService } from '../services/gastosService'
import { presupuestosService } from '../services/presupuestosService'
import { ahorroService } from '../services/ahorroService'
import { getUsuarioContexto, enviarMensajeIA, generarTipsAutomaticos } from '../services/geminiService'
import { chatService } from '../services/chatService'
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
    if (isOpen) {
      if (!contexto) {
        cargarContexto()
      } else {
        // Si ya hay contexto, solo cargar el historial guardado
        cargarHistorial()
      }
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  const cargarContexto = async (mostrarBienvenida = true) => {
    try {
      setCargandoContexto(true)
      
      // Cargar historial guardado primero
      await cargarHistorial()
      
      const [ingresos, gastos, presupuestosData, ahorro] = await Promise.all([
        ingresosService.getAll(),
        gastosService.getAll(),
        presupuestosService.getAll(),
        ahorroService.get()
      ])

      // Calcular gastado para cada presupuesto
      const presupuestos = await Promise.all(
        presupuestosData.map(async (presupuesto) => {
          const gastado = await presupuestosService.getGastadoPorCategoria(presupuesto.categoria)
          return { ...presupuesto, gastado }
        })
      )

      const contextoUsuario = await getUsuarioContexto(ingresos, gastos, presupuestos, ahorro)
      setContexto(contextoUsuario)

      // Solo agregar mensaje de bienvenida si no hay historial guardado
      const mensajesGuardados = await chatService.getAll()
      const tieneHistorial = mensajesGuardados && mensajesGuardados.length > 0
      
      if (mostrarBienvenida && !tieneHistorial) {
        await agregarMensaje({
          tipo: 'bot',
          texto: '¡Hola! 👋 Soy FinBot, tu asistente financiero personal. Estoy aquí para ayudarte con cualquier pregunta sobre tus finanzas.\n\nPuedes preguntarme sobre:\n• Cómo mejorar tus ahorros\n• Análisis de tus gastos\n• Consejos para cumplir tus presupuestos\n• Estrategias financieras\n• Y mucho más...\n\n¿En qué te gustaría que te ayude hoy?',
          timestamp: new Date()
        })
      }
    } catch (error) {
      console.error('Error cargando contexto:', error)
      let mensajeError = 'Lo siento, hubo un error al cargar tu información financiera. Por favor intenta de nuevo.'
      
      if (error.message && error.message.includes('API Key')) {
        mensajeError = '⚠️ API Key de Gemini no configurada.\n\nPara configurarla:\n1. Crea un archivo .env en la raíz del proyecto\n2. Agrega: VITE_GEMINI_API_KEY=tu_api_key_aqui\n3. Obtén tu API key en: https://aistudio.google.com/apikey\n4. Reinicia el servidor de desarrollo\n\nMientras tanto, puedes usar la aplicación normalmente, pero el asistente IA no estará disponible.'
      }
      
      await agregarMensaje({
        tipo: 'bot',
        texto: mensajeError,
        timestamp: new Date()
      })
    } finally {
      setCargandoContexto(false)
    }
  }

  const agregarMensaje = async (mensaje) => {
    setMensajes(prev => [...prev, mensaje])
    
    // Guardar mensaje en la base de datos (solo si hay usuario autenticado)
    if (user) {
      try {
        await chatService.create({
          tipo: mensaje.tipo,
          texto: mensaje.texto
        })
      } catch (error) {
        // Si falla, solo loguear el error pero no interrumpir la UI
        console.warn('No se pudo guardar el mensaje en la BD:', error)
      }
    }
  }

  const cargarHistorial = async () => {
    if (!user) return
    
    try {
      const mensajesGuardados = await chatService.getAll()
      
      if (mensajesGuardados && mensajesGuardados.length > 0) {
        // Convertir mensajes de la BD al formato del componente
        const mensajesFormateados = mensajesGuardados.map(msg => ({
          tipo: msg.tipo,
          texto: msg.texto,
          timestamp: new Date(msg.created_at)
        }))
        
        setMensajes(mensajesFormateados)
      }
    } catch (error) {
      console.warn('No se pudo cargar el historial del chat:', error)
      // Si falla, continuar sin historial (chat nuevo)
    }
  }

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const enviarMensaje = async () => {
    if (!mensajeActual.trim() || loading || !contexto) return

    const mensajeUsuario = mensajeActual.trim()
    setMensajeActual('')

    // Agregar mensaje del usuario
    await agregarMensaje({
      tipo: 'usuario',
      texto: mensajeUsuario,
      timestamp: new Date()
    })

    setLoading(true)

    try {
      // Pasar el historial de conversación (últimos 10 mensajes para mantener contexto)
      const historialReciente = mensajes.slice(-10)
      const respuesta = await enviarMensajeIA(mensajeUsuario, contexto, historialReciente)
      
      if (respuesta.success) {
        await agregarMensaje({
          tipo: 'bot',
          texto: respuesta.mensaje,
          timestamp: new Date()
        })
      } else {
        // Si hay un error, mostrar el mensaje de error con instrucciones
        await agregarMensaje({
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
      
      await agregarMensaje({
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
    try {
      // Borrar mensajes de la base de datos
      if (user) {
        await chatService.deleteAll()
      }
    } catch (error) {
      console.warn('No se pudo borrar el historial de la BD:', error)
    }
    
    // Limpiar mensajes del estado
    setMensajes([])
    setMensajeActual('')
    setLoading(false)
    
    // Recargar contexto y mostrar nuevo mensaje de bienvenida
    await cargarContexto(true)
    setIsDeleteModalOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end pointer-events-none lg:items-center lg:justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />

      {/* Chat Container */}
      <div className="relative w-full h-full max-w-md max-h-[90vh] bg-white rounded-t-2xl lg:rounded-2xl shadow-2xl flex flex-col pointer-events-auto lg:h-[80vh] lg:max-h-[600px] animate-in slide-in-from-bottom lg:slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-2xl">
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
              <Loader2 className="animate-spin text-purple-600" size={24} />
              <span className="ml-2 text-sm text-gray-600">Cargando tu información...</span>
            </div>
          ) : mensajes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <Sparkles className="mx-auto mb-2 text-purple-500" size={32} />
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
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                      : 'bg-white text-gray-800 shadow-md border border-gray-200'
                  }`}
                >
                  {mensaje.tipo === 'bot' && (
                    <div className="flex items-center gap-2 mb-1">
                      <Bot size={14} className="text-purple-500" />
                      <span className="text-xs font-semibold text-purple-600">FinBot</span>
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
                <Loader2 className="animate-spin text-purple-600" size={16} />
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
                className="px-3 py-1.5 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full border border-purple-200 transition-colors"
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
              className="flex-1 min-h-[40px] max-h-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={1}
            />
            <button
              onClick={enviarMensaje}
              disabled={!mensajeActual.trim() || loading || cargandoContexto || !contexto}
              className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
  )
}

export default AsistenteIA

