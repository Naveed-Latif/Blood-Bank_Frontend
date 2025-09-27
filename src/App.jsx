import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { ProtectedRoute } from './components/Auth/ProtectedRoute'
import NavigationErrorBoundary from './components/Navigation/NavigationErrorBoundary'

// Import pages
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import FindDonors from './pages/FindDonors'
import AllDonors from './pages/AllDonors'
import DashboardErrorBoundary from './components/ui/DashboardErrorBoundary'

// App component - removed memo to ensure re-renders on route changes
const App = () => {
  return (
    <NavigationErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Routes>
        {/* Public routes with Layout */}
        <Route 
          path="/" 
          element={
            <Layout key="home">
              <Home />
            </Layout>
          } 
        />
        <Route 
          path="/login" 
          element={
            <Layout key="login">
              <Login />
            </Layout>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <Layout key="signup">
              <Signup />
            </Layout>
          } 
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute key="dashboard">
              <Layout key="dashboard-layout">
                <DashboardErrorBoundary>
                  <Dashboard />
                </DashboardErrorBoundary>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/find-donors"
          element={
            <ProtectedRoute key="find-donors">
              <Layout key="find-donors-layout">
                <FindDonors />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-donors"
          element={
            <ProtectedRoute key="all-donors">
              <Layout key="all-donors-layout">
                <AllDonors />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
      </div>
    </NavigationErrorBoundary>
  )
}

export default App