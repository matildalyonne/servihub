import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Public
import Landing from './pages/Landing'
import ResetPassword from './pages/ResetPassword'

// Customer
import CustomerLogin from './pages/customer/Login'
import CustomerSignup from './pages/customer/Signup'
import CustomerDashboard from './pages/customer/Dashboard'
import BookService from './pages/customer/BookService'
import BookingConfirmed from './pages/customer/BookingConfirmed'
import WorkerProfile from './pages/customer/WorkerProfile'

// Worker
import WorkerLogin from './pages/worker/Login'
import WorkerDashboard from './pages/worker/Dashboard'
import WorkerEarnings from './pages/worker/Earnings'
import WorkerHistory from './pages/worker/History'

// Admin
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminWorkers from './pages/admin/Workers'
import AdminRequests from './pages/admin/Requests'

function ProtectedRoute({ children, allowedRole }) {
  const { session, role, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"/></div>
  if (!session) return <Navigate to="/" replace />
  if (allowedRole && role !== allowedRole) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/signup" element={<CustomerSignup />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Customer */}
          <Route path="/home" element={<ProtectedRoute allowedRole="customer"><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/book" element={<ProtectedRoute allowedRole="customer"><BookService /></ProtectedRoute>} />
          <Route path="/booking-confirmed" element={<ProtectedRoute allowedRole="customer"><BookingConfirmed /></ProtectedRoute>} />
          <Route path="/worker/:id" element={<ProtectedRoute allowedRole="customer"><WorkerProfile /></ProtectedRoute>} />

          {/* Worker */}
          <Route path="/worker/login" element={<WorkerLogin />} />
          <Route path="/worker/dashboard" element={<ProtectedRoute allowedRole="worker"><WorkerDashboard /></ProtectedRoute>} />
          <Route path="/worker/earnings" element={<ProtectedRoute allowedRole="worker"><WorkerEarnings /></ProtectedRoute>} />
          <Route path="/worker/history" element={<ProtectedRoute allowedRole="worker"><WorkerHistory /></ProtectedRoute>} />

          {/* Admin — secret route */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/workers" element={<ProtectedRoute allowedRole="admin"><AdminWorkers /></ProtectedRoute>} />
          <Route path="/admin/requests" element={<ProtectedRoute allowedRole="admin"><AdminRequests /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
