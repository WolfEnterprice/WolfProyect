// Esta función ahora usa el contexto de preferencias
// Se debe usar desde un componente que tenga acceso al contexto
export const formatCurrency = (amount, moneda = null) => {
  // Si se pasa una moneda específica, usarla
  // Si no, intentar obtenerla del contexto (requiere que se pase desde el componente)
  const monedaConfig = moneda || {
    codigo: 'COP',
    locale: 'es-CO',
    simbolo: '$'
  }

  return new Intl.NumberFormat(monedaConfig.locale, {
    style: 'currency',
    currency: monedaConfig.codigo,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatNumber = (amount, locale = 'es-CO') => {
  return amount.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

