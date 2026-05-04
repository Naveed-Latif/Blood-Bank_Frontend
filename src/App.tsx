import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { ProtectedRoute } from './components/Auth/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import FindDonors from './pages/FindDonors'
import UpdateProfile from './pages/UpdateProfile'

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/signup" element={<Layout><Signup /></Layout>} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/find-donors" element={<ProtectedRoute><Layout><FindDonors /></Layout></ProtectedRoute>} />
        <Route path="/update-profile" element={<ProtectedRoute><Layout><UpdateProfile /></Layout></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default App