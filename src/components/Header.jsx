import { Menu, Bell, User, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Header = ({ onMenuClick }) => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg p-2 transition-all duration-200"
        >
          <Menu size={24} />
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <button className="relative text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full p-2 transition-all duration-200">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full ring-2 ring-white"></span>
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-gray-700">
                {user?.email || 'Usuario'}
              </span>
              <span className="text-xs text-gray-500">Sesión activa</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <User size={20} className="text-white" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

