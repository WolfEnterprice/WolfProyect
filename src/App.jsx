import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Ingresos from './pages/Ingresos'
import Gastos from './pages/Gastos'
import Presupuesto from './pages/Presupuesto'
import Ahorro from './pages/Ahorro'
import Historial from './pages/Historial'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ingresos" element={<Ingresos />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/presupuesto" element={<Presupuesto />} />
          <Route path="/ahorro" element={<Ahorro />} />
          <Route path="/historial" element={<Historial />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

