import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import MobileShell from '../../components/layout/MobileShell'
import CustomerNav from '../../components/layout/CustomerNav'
import { Shirt, Home, Car, Scissors, User } from 'lucide-react'

const SERVICES = [
  { label: 'Laundry', icon: Shirt, color: 'bg-blue-50 text-blue-600' },
  { label: 'Home Cleaning', icon: Home, color: 'bg-green-50 text-green-600' },
  { label: 'Car Washing', icon: Car, color: 'bg-orange-50 text-orange-600' },
  { label: 'Slashing', icon: Scissors, color: 'bg-purple-50 text-purple-600' },
]

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default function CustomerDashboard() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(true)

  useEffect(() => {
    async function fetchBookings() {
      if (!profile) return
      const { data } = await supabase
        .from('bookings')
        .select('*, services(name)')
        .eq('customer_id', profile.id)
        .order('scheduled_at', { ascending: false })
        .limit(5)
      setBookings(data || [])
      setLoadingBookings(false)
    }
    fetchBookings()
  }, [profile])

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <MobileShell>
      <div className="flex flex-col pb-24 min-h-screen">
        {/* Header */}
        <div className="px-5 pt-10 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-extrabold text-stone-900">Hello, {firstName}</h1>
            <p className="text-stone-500 text-sm mt-0.5">What service do you need today?</p>
          </div>
          <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center hover:bg-stone-300 transition-colors">
            <User size={18} className="text-stone-600" />
          </button>
        </div>

        {/* Book button */}
        <div className="px-5 mb-6">
          <button onClick={() => navigate('/book')} className="btn-primary text-base py-4">
            Book a Service
          </button>
        </div>

        {/* Services grid */}
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-stone-800">Our Services</h2>
            <button onClick={() => navigate('/book')} className="text-sm text-yellow-600 font-medium">View All</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {SERVICES.map(({ label, icon: Icon, color }) => (
              <button
                key={label}
                onClick={() => navigate('/book', { state: { service: label } })}
                className="card flex flex-col items-center justify-center gap-2 py-5 hover:shadow-md transition-shadow active:scale-95"
              >
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
                  <Icon size={22} />
                </div>
                <span className="text-sm font-semibold text-stone-700">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent bookings */}
        <div className="px-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-stone-800">Recent Bookings</h2>
            <button onClick={() => navigate('/bookings')} className="text-sm text-yellow-600 font-medium">History</button>
          </div>

          {loadingBookings ? (
            <div className="flex justify-center py-6"><div className="w-6 h-6 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>
          ) : bookings.length === 0 ? (
            <div className="card text-center py-8 text-stone-400">
              <p className="font-medium">No bookings yet</p>
              <p className="text-sm mt-1">Book your first service above</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {bookings.map(b => (
                <div key={b.id} className="card flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <Home size={18} className="text-stone-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800 truncate">{b.services?.name || b.service_name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {new Date(b.scheduled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {new Date(b.scheduled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`status-badge ${STATUS_STYLES[b.status] || 'bg-stone-100 text-stone-600'} flex-shrink-0`}>
                    {STATUS_LABELS[b.status] || b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CustomerNav />
    </MobileShell>
  )
}
