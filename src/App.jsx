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
import CustomerBookings from './pages/customer/Bookings'
import CustomerWorkers from './pages/customer/Workers'
import CustomerProfile from './pages/customer/Profile'

// Worker
import WorkerLogin from './pages/worker/Login'
import WorkerDashboard from './pages/worker/Dashboard'
import WorkerEarnings from './pages/worker/Earnings'
import WorkerHistory from './pages/worker/History'

// Admin
import AdminLogin from './pages/admin/Login'
import AdminSignup from './pages/admin/Signup'
import AdminDashboard from './pages/admin/Dashboard'
import AdminWorkers from './pages/admin/Workers'
import AdminRequests from './pages/admin/Requests'
import AdminReports from './pages/admin/Reports'
import AdminSettings from './pages/admin/Settings'

function ProtectedRoute({ children, allowedRole }) {
  const { session, role, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"/>
    </div>
  )
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
          <Route path="/bookings" element={<ProtectedRoute allowedRole="customer"><CustomerBookings /></ProtectedRoute>} />
          <Route path="/workers" element={<ProtectedRoute allowedRole="customer"><CustomerWorkers /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRole="customer"><CustomerProfile /></ProtectedRoute>} />
          <Route path="/workers/:id" element={<ProtectedRoute allowedRole="customer"><WorkerProfile /></ProtectedRoute>} />

          {/* Worker */}
          <Route path="/worker/login" element={<WorkerLogin />} />
          <Route path="/worker/dashboard" element={<ProtectedRoute allowedRole="worker"><WorkerDashboard /></ProtectedRoute>} />
          <Route path="/worker/earnings" element={<ProtectedRoute allowedRole="worker"><WorkerEarnings /></ProtectedRoute>} />
          <Route path="/worker/history" element={<ProtectedRoute allowedRole="worker"><WorkerHistory /></ProtectedRoute>} />

          {/* Admin — secret routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/workers" element={<ProtectedRoute allowedRole="admin"><AdminWorkers /></ProtectedRoute>} />
          <Route path="/admin/requests" element={<ProtectedRoute allowedRole="admin"><AdminRequests /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRole="admin"><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRole="admin"><AdminSettings /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
