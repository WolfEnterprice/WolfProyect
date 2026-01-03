import { createContext, useContext, useEffect, useState } from 'react'

const PreferenciasContext = createContext({})

export const usePreferencias = () => {
  const context = useContext(PreferenciasContext)
  if (!context) {
    throw new Error('usePreferencias debe ser usado dentro de PreferenciasProvider')
  }
  return context
}

export const PreferenciasProvider = ({ children }) => {
  // Monedas disponibles
  const monedasDisponibles = [
    { codigo: 'COP', nombre: 'Peso Colombiano', simbolo: '$', locale: 'es-CO' },
    { codigo: 'USD', nombre: 'Dólar Estadounidense', simbolo: '$', locale: 'en-US' },
    { codigo: 'EUR', nombre: 'Euro', simbolo: '€', locale: 'es-ES' },
    { codigo: 'MXN', nombre: 'Peso Mexicano', simbolo: '$', locale: 'es-MX' },
    { codigo: 'ARS', nombre: 'Peso Argentino', simbolo: '$', locale: 'es-AR' },
    { codigo: 'CLP', nombre: 'Peso Chileno', simbolo: '$', locale: 'es-CL' },
    { codigo: 'BRL', nombre: 'Real Brasileño', simbolo: 'R$', locale: 'pt-BR' },
  ]

  // Cargar preferencias desde localStorage
  const [moneda, setMoneda] = useState(() => {
    const saved = localStorage.getItem('preferencias_moneda')
    return saved ? JSON.parse(saved) : monedasDisponibles[0]
  })

  const [temaColor, setTemaColor] = useState(() => {
    const saved = localStorage.getItem('preferencias_tema_color')
    return saved || '#3b82f6' // Azul por defecto
  })

  // Guardar preferencias en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('preferencias_moneda', JSON.stringify(moneda))
  }, [moneda])

  useEffect(() => {
    localStorage.setItem('preferencias_tema_color', temaColor)
    aplicarTema(temaColor)
  }, [temaColor])

  // Aplicar tema dinámicamente usando CSS variables
  const aplicarTema = (color) => {
    const root = document.documentElement
    
    // Convertir color hex a RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    }

    const rgb = hexToRgb(color)
    if (!rgb) return

    // Calcular colores derivados
    const luminancia = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
    const esClaro = luminancia > 0.5

    // Color principal
    root.style.setProperty('--color-primary', color)
    root.style.setProperty('--color-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`)
    
    // Colores derivados
    const primaryLight = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`
    const primaryLighter = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`
    const primaryDark = `rgb(${Math.max(0, rgb.r - 30)}, ${Math.max(0, rgb.g - 30)}, ${Math.max(0, rgb.b - 30)})`
    const primaryDarker = `rgb(${Math.max(0, rgb.r - 60)}, ${Math.max(0, rgb.g - 60)}, ${Math.max(0, rgb.b - 60)})`
    
    root.style.setProperty('--color-primary-light', primaryLight)
    root.style.setProperty('--color-primary-lighter', primaryLighter)
    root.style.setProperty('--color-primary-dark', primaryDark)
    root.style.setProperty('--color-primary-darker', primaryDarker)
    
    // Texto según luminancia
    root.style.setProperty('--text-on-primary', esClaro ? '#000000' : '#ffffff')
    
    // Gradientes
    root.style.setProperty('--gradient-primary', `linear-gradient(to right, ${color}, ${primaryDark})`)
    root.style.setProperty('--gradient-primary-light', `linear-gradient(to right, ${primaryLight}, ${primaryLighter})`)
  }

  // Aplicar tema al cargar
  useEffect(() => {
    aplicarTema(temaColor)
  }, [])

  const cambiarMoneda = (nuevaMoneda) => {
    const monedaEncontrada = monedasDisponibles.find(m => m.codigo === nuevaMoneda.codigo)
    if (monedaEncontrada) {
      setMoneda(monedaEncontrada)
    }
  }

  const cambiarTemaColor = (nuevoColor) => {
    setTemaColor(nuevoColor)
  }

  const value = {
    moneda,
    monedasDisponibles,
    cambiarMoneda,
    temaColor,
    cambiarTemaColor,
  }

  return (
    <PreferenciasContext.Provider value={value}>
      {children}
    </PreferenciasContext.Provider>
  )
}

