import { AlertTriangle, X } from 'lucide-react'

const DeleteModal = ({ isOpen, onClose, onConfirm, title, message, confirmButtonText = 'Eliminar' }) => {
  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    // Solo cerrar si se hace click en el overlay, no en el contenido del modal
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 transform transition-all animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 rounded-t-2xl border-b border-red-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg shadow-sm">
                <AlertTriangle className="text-red-600" size={22} />
              </div>
              <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg p-1 transition-all duration-200"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Contenido tipo tarjeta */}
        <div className="p-6">
          {/* Mensaje en tarjeta */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 shadow-sm">
            <p className="text-sm text-gray-700 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onConfirm()
              }}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal

