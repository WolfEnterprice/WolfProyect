import { Menu, Bell, User } from 'lucide-react'

const Header = ({ onMenuClick }) => {
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
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-105">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <User size={20} className="text-white" />
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

