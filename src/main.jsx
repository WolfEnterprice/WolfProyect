import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { PreferenciasProvider } from './contexts/PreferenciasContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <PreferenciasProvider>
        <App />
      </PreferenciasProvider>
    </AuthProvider>
  </React.StrictMode>,
)

