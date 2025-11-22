import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Ingresos from './pages/Ingresos'
import Gastos from './pages/Gastos'
import Presupuesto from './pages/Presupuesto'
import Ahorro from './pages/Ahorro'
import Historial from './pages/Historial'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
        
        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ingresos"
          element={
            <ProtectedRoute>
              <Layout>
                <Ingresos />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/gastos"
          element={
            <ProtectedRoute>
              <Layout>
                <Gastos />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/presupuesto"
          element={
            <ProtectedRoute>
              <Layout>
                <Presupuesto />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ahorro"
          element={
            <ProtectedRoute>
              <Layout>
                <Ahorro />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/historial"
          element={
            <ProtectedRoute>
              <Layout>
                <Historial />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* Redirigir rutas desconocidas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App

