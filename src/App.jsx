import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { ProtectedRoute } from './components/Auth/ProtectedRoute'

// Import pages
import Home from './Pages/Home'
import Login from './Pages/Login'
import Signup from './Pages/Signup'
import Dashboard from './pages/Dashboard'
import FindDonors from './pages/FindDonors'
import AllDonors from './pages/AllDonors'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes with Layout */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/signup" element={<Layout><Signup /></Layout>} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/find-donors"
          element={
            <ProtectedRoute>
              <Layout><FindDonors /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-donors"
          element={
            <ProtectedRoute>
              <Layout><AllDonors /></Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App