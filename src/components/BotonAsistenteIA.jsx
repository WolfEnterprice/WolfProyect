import { useState } from 'react'
import { DollarSign } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import dynamic from 'next/dynamic';

const AsistenteIA = dynamic(() => import('./AsistenteIA'), {
  ssr: false,
  loading: () => null,
});

const BotonAsistenteIA = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, loading } = useAuth()

  // Solo mostrar si el usuario está autenticado (después de cargar)
  if (loading) return null
  if (!user) return null

  return (
    <>
      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-primary-500 via-teal-500 to-lime-500 text-white rounded-full shadow-2xl hover:shadow-primary-500/50 transform hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        title="Asistente Financiero IA - FinBot"
        aria-label="Abrir asistente financiero IA"
        style={{ 
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          pointerEvents: 'auto'
        }}
      >
        <DollarSign 
          size={28} 
          className="group-hover:rotate-12 transition-transform duration-300"
        />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
      </button>

      {/* Componente de Chat */}
      <AsistenteIA isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

export default BotonAsistenteIA

