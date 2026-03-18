import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import MobileShell from '../../components/layout/MobileShell'
import CustomerNav from '../../components/layout/CustomerNav'
import { Home } from 'lucide-react'

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const FILTERS = ['all', 'pending', 'in_progress', 'completed', 'cancelled']

export default function CustomerBookings() {
  const { profile } = useAuth()
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    setLoading(true)
    let query = supabase
      .from('bookings')
      .select('*, workers(profiles(full_name))')
      .eq('customer_id', profile.id)
      .order('scheduled_at', { ascending: false })
    if (filter !== 'all') query = query.eq('status', filter)
    query.then(({ data }) => { setBookings(data || []); setLoading(false) })
  }, [profile, filter])

  return (
    <MobileShell>
      <div className="flex flex-col min-h-screen pb-24">
        <div className="px-5 pt-10 pb-4">
          <h1 className="font-display font-extrabold text-2xl text-stone-900">My Bookings</h1>
          <p className="text-stone-500 text-sm mt-0.5">Your service history</p>
        </div>

        {/* Filter pills */}
        <div className="px-5 mb-4 overflow-x-auto">
          <div className="flex gap-2 pb-1">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === f ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}>
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5">
          {loading ? (
            <div className="flex justify-center py-10"><div className="w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>
          ) : bookings.length === 0 ? (
            <div className="card text-center py-10 text-stone-400">
              <p className="font-medium">No {filter === 'all' ? '' : filter.replace('_', ' ')} bookings</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {bookings.map(b => (
                <div key={b.id} className="card">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                        <Home size={17} className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-stone-800">{b.service_name}</p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {new Date(b.scheduled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}
                          {new Date(b.scheduled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span className={`status-badge flex-shrink-0 ${STATUS_STYLES[b.status] || 'bg-stone-100 text-stone-600'}`}>
                      {b.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <p className="text-xs text-stone-400">
                      Worker: {b.workers?.profiles?.full_name || 'Not yet assigned'}
                    </p>
                    {b.price > 0 && <p className="text-sm font-bold text-stone-700">UGX {b.price.toLocaleString()}</p>}
                  </div>
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
