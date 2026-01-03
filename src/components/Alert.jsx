import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'

const Alert = ({ type = 'info', title, message, onClose, className = '', compact = false }) => {
  const config = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: AlertCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      titleColor: 'text-green-800'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      icon: AlertTriangle,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-800'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: Info,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800'
    }
  }

  const style = config[type] || config.info
  const Icon = style.icon

  if (compact) {
    return (
      <div
        className={`${style.bg} ${style.border} border rounded-lg shadow-sm p-2 ${className} relative`}
      >
        <div className="flex items-start gap-2">
          <div className={`${style.iconBg} ${style.iconColor} rounded p-1 flex-shrink-0`}>
            <Icon size={14} />
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className={`${style.titleColor} font-semibold text-xs mb-0.5`}>
                {title}
              </h3>
            )}
            <div className={`${style.text} text-xs ${title ? '' : 'font-medium'}`}>
              {typeof message === 'string' ? <p>{message}</p> : message}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-xl shadow-sm p-4 ${className} relative`}
    >
      <div className="flex items-start gap-3">
        <div className={`${style.iconBg} ${style.iconColor} rounded-lg p-2 flex-shrink-0`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`${style.titleColor} font-semibold text-sm mb-1`}>
              {title}
            </h3>
          )}
          <div className={`${style.text} text-sm ${title ? '' : 'font-medium'}`}>
            {typeof message === 'string' ? <p>{message}</p> : message}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${style.text} hover:${style.bg} opacity-70 hover:opacity-100 rounded-lg p-1 transition-all flex-shrink-0`}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  )
}

export default Alert

