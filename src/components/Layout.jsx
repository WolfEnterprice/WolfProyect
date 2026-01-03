import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import BotonAsistenteIA from './BotonAsistenteIA'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64 transition-all duration-300">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-3 lg:p-4">
          {children}
        </main>
      </div>
      {/* Botón flotante del Asistente IA */}
      <BotonAsistenteIA />
    </div>
  )
}

export default Layout

