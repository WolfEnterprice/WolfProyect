import { GoogleGenerativeAI } from '@google/generative-ai'

// API Key de Gemini desde variables de entorno
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// Verificar que la API key esté configurada
if (!GEMINI_API_KEY || GEMINI_API_KEY === 'tu_api_key_aqui' || GEMINI_API_KEY === 'TU_API_KEY_AQUI') {
  console.warn('⚠️ VITE_GEMINI_API_KEY no está configurada en el archivo .env')
}

// Inicializar Gemini
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null

// Función para obtener el modelo (sin prueba previa, más eficiente)
const getModel = (modeloNombre = 'gemini-1.5-flash') => {
  if (!genAI) {
    throw new Error('API Key de Gemini no configurada. Agrega VITE_GEMINI_API_KEY en tu archivo .env')
  }
  
  return genAI.getGenerativeModel({ model: modeloNombre })
}

/**
 * Obtener resumen financiero del usuario para contexto
 */
export const getUsuarioContexto = async (ingresos, gastos, presupuestos, ahorro) => {
  const totalIngresos = ingresos.reduce((sum, ing) => sum + parseInt(ing.monto || 0, 10), 0)
  const totalGastos = gastos.reduce((sum, gas) => sum + parseInt(gas.monto || 0, 10), 0)
  const balance = totalIngresos - totalGastos

  // Gastos por categoría
  const gastosPorCategoria = {}
  gastos.forEach(gasto => {
    const categoria = gasto.categoría || gasto.categoria || 'Otros'
    const monto = parseInt(gasto.monto || 0, 10)
    gastosPorCategoria[categoria] = (gastosPorCategoria[categoria] || 0) + monto
  })

  // Presupuestos vs gastado
  const presupuestosInfo = presupuestos.map(p => ({
    categoria: p.categoria,
    presupuesto: p.presupuesto,
    gastado: p.gastado || 0,
    porcentaje: p.presupuesto > 0 ? ((p.gastado || 0) / p.presupuesto) * 100 : 0
  }))

  return {
    totalIngresos,
    totalGastos,
    balance,
    gastosPorCategoria,
    presupuestos: presupuestosInfo,
    ahorro: {
      actual: ahorro.ahorroActual || ahorro["ahorroActual"] || 0,
      meta: ahorro.ahorroMeta || ahorro["ahorroMeta"] || 0,
      porcentaje: (ahorro.ahorroMeta || ahorro["ahorroMeta"] || 0) > 0 
        ? ((ahorro.ahorroActual || ahorro["ahorroActual"] || 0) / (ahorro.ahorroMeta || ahorro["ahorroMeta"] || 1)) * 100 
        : 0
    },
    cantidadIngresos: ingresos.length,
    cantidadGastos: gastos.length
  }
}

/**
 * Generar prompt con contexto del usuario
 */
const generarPromptConContexto = (contexto, mensajeUsuario) => {
  const fechaActual = new Date().toLocaleDateString('es-CO', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return `Eres un asistente financiero experto y amigable llamado "FinBot". Tu objetivo es ayudar a las personas a mejorar su educación financiera y tomar mejores decisiones económicas.

CONTEXTO FINANCIERO ACTUAL DEL USUARIO (${fechaActual}):

📊 RESUMEN GENERAL:
- Total Ingresos: COP $${contexto.totalIngresos.toLocaleString('es-CO')}
- Total Gastos: COP $${contexto.totalGastos.toLocaleString('es-CO')}
- Balance Disponible: COP $${contexto.balance.toLocaleString('es-CO')} ${contexto.balance >= 0 ? '✅' : '⚠️'}

💰 GASTOS POR CATEGORÍA:
${Object.entries(contexto.gastosPorCategoria).map(([cat, monto]) => 
  `- ${cat.charAt(0).toUpperCase() + cat.slice(1)}: COP $${monto.toLocaleString('es-CO')}`
).join('\n')}

🎯 PRESUPUESTOS:
${contexto.presupuestos.map(p => 
  `- ${p.categoria.charAt(0).toUpperCase() + p.categoria.slice(1)}: 
  Presupuesto: COP $${p.presupuesto.toLocaleString('es-CO')}
  Gastado: COP $${p.gastado.toLocaleString('es-CO')} (${p.porcentaje.toFixed(1)}%)
  ${p.porcentaje >= 90 ? '⚠️ ALERTA: Cerca del límite' : p.porcentaje >= 70 ? '⚡ Atención' : '✅ Bien'}`
).join('\n\n')}

💵 AHORRO:
- Meta: COP $${contexto.ahorro.meta.toLocaleString('es-CO')}
- Ahorrado: COP $${contexto.ahorro.actual.toLocaleString('es-CO')}
- Progreso: ${contexto.ahorro.porcentaje.toFixed(1)}%

INSTRUCCIONES:
1. Analiza los datos financieros del usuario de forma amigable y motivadora
2. Identifica áreas de mejora específicas
3. Proporciona tips y consejos prácticos personalizados
4. Sugiere acciones concretas basadas en su situación actual
5. Educa sobre conceptos financieros de forma simple
6. Sé positivo y motivador, especialmente si hay deudas o gastos altos
7. Usa emojis para hacer la conversación más amigable
8. Responde en español colombiano
9. Sé breve y conciso (máximo 3-4 párrafos)

MENSAJE DEL USUARIO: "${mensajeUsuario}"

Responde de forma amigable, útil y personalizada:`
}

/**
 * Enviar mensaje a Gemini con contexto del usuario
 */
export const enviarMensajeIA = async (mensajeUsuario, contexto) => {
  try {
    // Verificar API key
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'TU_API_KEY_AQUI' || GEMINI_API_KEY === 'tu_api_key_aqui') {
      throw new Error('API Key de Gemini no configurada. Agrega VITE_GEMINI_API_KEY en tu archivo .env')
    }

    if (!genAI) {
      throw new Error('Error al inicializar Gemini. Verifica tu API key.')
    }

    // Generar prompt con contexto
    const prompt = generarPromptConContexto(contexto, mensajeUsuario)

    // Intentar diferentes modelos en orden de preferencia
    const modelos = [
      'gemini-1.5-flash',      // Más rápido y económico (recomendado)
      'gemini-1.5-pro',        // Más potente
      'gemini-pro',            // Modelo clásico
    ]
    
    let ultimoError = null
    
    // Probar cada modelo hasta encontrar uno que funcione
    for (const modeloNombre of modelos) {
      try {
        console.log(`📤 Intentando con modelo: ${modeloNombre}...`)
        const model = getModel(modeloNombre)
        
        const result = await model.generateContent(prompt, {
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
        
        const response = await result.response
        const texto = response.text()
        
        console.log(`✅ Respuesta recibida de Gemini (${modeloNombre})`)
        
        return {
          success: true,
          mensaje: texto
        }
      } catch (error) {
        console.warn(`⚠️ Modelo ${modeloNombre} falló:`, error.message)
        ultimoError = error
        // Continuar con el siguiente modelo
        continue
      }
    }
    
    // Si todos los modelos fallaron, lanzar el último error
    throw ultimoError || new Error('Ningún modelo de Gemini está disponible')
  } catch (error) {
    console.error('❌ Error en Gemini:', error)
    
    // Mensaje de error más amigable y útil
    let mensajeError = 'Error al procesar tu mensaje. Por favor intenta de nuevo.'
    let instrucciones = ''
    
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'TU_API_KEY_AQUI' || GEMINI_API_KEY === 'tu_api_key_aqui') {
      mensajeError = 'API Key de Gemini no configurada.'
      instrucciones = 'Crea un archivo .env en la raíz del proyecto y agrega: VITE_GEMINI_API_KEY=tu_api_key_aqui'
    } else if (error.message.includes('API Key') || error.message.includes('VITE_GEMINI_API_KEY')) {
      mensajeError = 'API Key de Gemini no válida.'
      instrucciones = 'Verifica que tu API key sea correcta en el archivo .env y reinicia el servidor de desarrollo.'
    } else if (error.message.includes('404') || error.message.includes('not found') || error.message.includes('no está disponible')) {
      mensajeError = 'El modelo de IA no está disponible con tu API key.'
      instrucciones = 'Verifica que tengas acceso a Gemini API en https://aistudio.google.com/apikey y que tu API key tenga permisos para usar los modelos.'
    } else if (error.message.includes('403') || error.message.includes('Permission') || error.message.includes('permission denied')) {
      mensajeError = 'Error de permisos con tu API key.'
      instrucciones = 'Tu API key no tiene acceso a los modelos de Gemini. Verifica tu cuenta en Google AI Studio y asegúrate de que la API key esté activa.'
    } else if (error.message.includes('quota') || error.message.includes('limit') || error.message.includes('429')) {
      mensajeError = 'Has excedido el límite de solicitudes.'
      instrucciones = 'Espera unos minutos antes de intentar de nuevo, o verifica tu cuota en Google AI Studio.'
    } else if (error.message.includes('Ningún modelo')) {
      mensajeError = 'Ningún modelo de Gemini está disponible.'
      instrucciones = 'Verifica que tu API key tenga acceso a los modelos en https://aistudio.google.com/apikey'
    } else if (error.message) {
      mensajeError = `Error: ${error.message}`
    }
    
    const mensajeCompleto = instrucciones 
      ? `${mensajeError}\n\n💡 ${instrucciones}`
      : mensajeError
    
    return {
      success: false,
      mensaje: mensajeCompleto
    }
  }
}

/**
 * Generar tips automáticos basados en el contexto
 */
export const generarTipsAutomaticos = async (contexto) => {
  const mensajesTips = [
    'Dame 3 tips personalizados para mejorar mi situación financiera',
    '¿Qué categoría debo priorizar para reducir gastos?',
    '¿Cómo puedo alcanzar mi meta de ahorro más rápido?'
  ]

  // Elegir mensaje según el contexto
  let mensaje = mensajesTips[0]
  
  if (contexto.balance < 0) {
    mensaje = 'Estoy gastando más de lo que gano. ¿Qué puedo hacer?'
  } else if (contexto.ahorro.porcentaje < 50) {
    mensaje = '¿Cómo puedo ahorrar más dinero efectivamente?'
  } else if (Math.max(...contexto.presupuestos.map(p => p.porcentaje)) >= 90) {
    mensaje = 'Estoy cerca de exceder algunos presupuestos. ¿Qué debo hacer?'
  }

  return await enviarMensajeIA(mensaje, contexto)
}

