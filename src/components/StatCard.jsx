import { formatCurrency } from '../utils/formatCurrency'

const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorConfig = {
    blue: {
      iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600',
      iconColor: 'text-white',
      titleColor: 'text-blue-600',
      valueGradient: 'bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent',
    },
    green: {
      iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
      iconColor: 'text-white',
      titleColor: 'text-emerald-600',
      valueGradient: 'bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent',
    },
    orange: {
      iconBg: 'bg-gradient-to-br from-orange-400 to-orange-600',
      iconColor: 'text-white',
      titleColor: 'text-orange-600',
      valueGradient: 'bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent',
    },
    purple: {
      iconBg: 'bg-gradient-to-br from-purple-400 to-purple-600',
      iconColor: 'text-white',
      titleColor: 'text-purple-600',
      valueGradient: 'bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent',
    },
  }

  const config = colorConfig[color] || colorConfig.blue

  return (
    <div className="group relative bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 border border-gray-200 overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-xs font-semibold ${config.titleColor} uppercase tracking-wide`}>
            {title}
          </h3>
          <div className={`p-2 rounded-lg ${config.iconBg} shadow-md transform group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={18} className={config.iconColor} />
          </div>
        </div>
        <p className={`text-xl font-extrabold ${config.valueGradient} leading-tight`}>
          {formatCurrency(value)}
        </p>
      </div>
    </div>
  )
}

export default StatCard

