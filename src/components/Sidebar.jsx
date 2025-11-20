import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, TrendingDown, Target, PiggyBank, History, X } from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/ingresos', label: 'Ingresos', icon: TrendingUp },
    { path: '/gastos', label: 'Gastos', icon: TrendingDown },
    { path: '/presupuesto', label: 'Presupuesto', icon: Target },
    { path: '/ahorro', label: 'Ahorro', icon: PiggyBank },
    { path: '/historial', label: 'Historial', icon: History },
  ]

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`
        fixed top-0 left-0 h-full bg-gradient-to-b from-white to-gray-50 shadow-2xl z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        w-64
        border-r border-gray-200
      `}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            💰 Gestor Finanzas
          </h1>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg p-1 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 mb-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105 font-semibold'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md'
                  }`
                }
              >
                <Icon size={22} className={({ isActive }) => isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar

