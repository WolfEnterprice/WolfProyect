import { X, Calendar, FileText, Tag, DollarSign, CreditCard } from 'lucide-react'
import { useFormatCurrency } from '../hooks/useFormatCurrency'

const DetailModal = ({ isOpen, onClose, item, type = 'ingreso' }) => {
  const { formatCurrency } = useFormatCurrency()
  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 bg-wolf-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Detalles</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-all"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="text-gray-400 mt-0.5" size={18} />
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Fecha</p>
              <p className="text-sm font-medium text-gray-800">{item.fecha}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileText className="text-gray-400 mt-0.5" size={18} />
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Descripción</p>
              <p className="text-sm font-medium text-gray-800">{item.descripción || item.descripcion}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Tag className="text-gray-400 mt-0.5" size={18} />
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Categoría</p>
              <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full mt-1 ${
                type === 'ingreso' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {item.categoría || item.categoria}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <DollarSign className="text-gray-400 mt-0.5" size={18} />
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Monto</p>
              <p className={`text-lg font-extrabold ${
                type === 'ingreso' 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent' 
                  : 'text-gray-800'
              }`}>
                {type === 'ingreso' ? '+' : ''}{formatCurrency(item.monto)}
              </p>
            </div>
          </div>
          {type === 'gasto' && (item.metodoPago || item.metodo_pago) && (
            <div className="flex items-start gap-3">
              <CreditCard className="text-gray-400 mt-0.5" size={18} />
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Método de pago</p>
                <p className="text-sm font-medium text-gray-800">{item.metodoPago || item.metodo_pago}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DetailModal

