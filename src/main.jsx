import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { DashboardRefreshProvider } from './contexts/DashboardRefreshContext.jsx'
import './index.css'

// Use base path from environment, default to root
const basename = import.meta.env.VITE_BASE_PATH || ""

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <DashboardRefreshProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </DashboardRefreshProvider>
    </BrowserRouter>
  </React.StrictMode>,
)