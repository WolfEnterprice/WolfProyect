// Servicio de conversión de monedas
// Usa tasas de conversión basadas en USD como moneda intermedia

// Tasas de conversión (basadas en USD como referencia)
// Estas tasas se pueden actualizar o cargar desde una API
const TASAS_CONVERSION = {
  // Moneda base: USD = 1
  USD: 1,
  // Tasas aproximadas (se pueden actualizar o cargar desde API)
  COP: 4000,    // 1 USD = ~4000 COP
  EUR: 0.92,    // 1 USD = ~0.92 EUR
  MXN: 17,      // 1 USD = ~17 MXN
  ARS: 850,     // 1 USD = ~850 ARS
  CLP: 950,     // 1 USD = ~950 CLP
  BRL: 5,       // 1 USD = ~5 BRL
}

// Moneda base en la que se almacenan los datos (COP)
const MONEDA_BASE = 'COP'

/**
 * Convierte un monto de la moneda base (COP) a otra moneda
 * @param {number} monto - Monto en la moneda base (COP)
 * @param {string} monedaDestino - Código de la moneda destino (ej: 'USD', 'EUR')
 * @returns {number} - Monto convertido
 */
export const convertirMoneda = (monto, monedaDestino) => {
  // Si la moneda destino es la misma que la base, no convertir
  if (monedaDestino === MONEDA_BASE) {
    return monto
  }

  // Obtener tasas
  const tasaBase = TASAS_CONVERSION[MONEDA_BASE] || 1
  const tasaDestino = TASAS_CONVERSION[monedaDestino] || 1

  // Convertir: COP -> USD -> Moneda destino
  // Primero convertir COP a USD
  const montoEnUSD = monto / tasaBase
  // Luego convertir USD a moneda destino
  const montoConvertido = montoEnUSD * tasaDestino

  return montoConvertido
}

/**
 * Convierte un monto de una moneda a la moneda base (COP)
 * @param {number} monto - Monto en la moneda origen
 * @param {string} monedaOrigen - Código de la moneda origen
 * @returns {number} - Monto en COP
 */
export const convertirAMonedaBase = (monto, monedaOrigen) => {
  // Si la moneda origen es la base, no convertir
  if (monedaOrigen === MONEDA_BASE) {
    return monto
  }

  // Obtener tasas
  const tasaOrigen = TASAS_CONVERSION[monedaOrigen] || 1
  const tasaBase = TASAS_CONVERSION[MONEDA_BASE] || 1

  // Convertir: Moneda origen -> USD -> COP
  const montoEnUSD = monto / tasaOrigen
  const montoEnCOP = montoEnUSD * tasaBase

  return montoEnCOP
}

/**
 * Obtiene la tasa de conversión entre dos monedas
 * @param {string} monedaOrigen - Código de la moneda origen
 * @param {string} monedaDestino - Código de la moneda destino
 * @returns {number} - Tasa de conversión
 */
export const obtenerTasaConversion = (monedaOrigen, monedaDestino) => {
  if (monedaOrigen === monedaDestino) return 1

  const tasaOrigen = TASAS_CONVERSION[monedaOrigen] || 1
  const tasaDestino = TASAS_CONVERSION[monedaDestino] || 1

  return tasaDestino / tasaOrigen
}

/**
 * Actualiza las tasas de conversión (útil para cargar desde una API)
 * @param {Object} nuevasTasas - Objeto con las nuevas tasas
 */
export const actualizarTasasConversion = (nuevasTasas) => {
  Object.assign(TASAS_CONVERSION, nuevasTasas)
}

/**
 * Obtiene las tasas de conversión actuales
 * @returns {Object} - Objeto con las tasas de conversión
 */
export const obtenerTasasConversion = () => {
  return { ...TASAS_CONVERSION }
}

export { MONEDA_BASE }

