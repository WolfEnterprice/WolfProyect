import { usePreferencias } from '../contexts/PreferenciasContext'
import { formatCurrency as formatCurrencyUtil } from '../utils/formatCurrency'
import { convertirMoneda, MONEDA_BASE } from '../services/conversionService'

export const useFormatCurrency = () => {
  const { moneda } = usePreferencias()
  
  const formatCurrency = (amount) => {
    // Si el monto es 0, null o undefined, retornar formateado sin conversión
    if (!amount || amount === 0) {
      return formatCurrencyUtil(0, moneda)
    }

    // Convertir el monto de la moneda base (COP) a la moneda seleccionada
    const montoConvertido = convertirMoneda(parseFloat(amount), moneda.codigo)
    
    // Formatear el monto convertido
    return formatCurrencyUtil(montoConvertido, moneda)
  }
  
  return { formatCurrency, moneda, monedaBase: MONEDA_BASE }
}

