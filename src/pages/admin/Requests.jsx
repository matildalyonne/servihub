import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Filter } from 'lucide-react'

const STATUSES = ['all', 'pending', 'in_progress', 'completed', 'cancelled']
const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AdminRequests() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => { fetchBookings() }, [filter])

  async function fetchBookings() {
    setLoading(true)
    let query = supabase
      .from('bookings')
      .select('*, profiles!bookings_customer_id_fkey(full_name), workers(profiles(full_name))')
      .order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('status', filter)
    const { data } = await query
    setBookings(data || [])
    setLoading(false)
  }

  async function updateStatus(id, status) {
    setUpdating(id)
    await supabase.from('bookings').update({ status }).eq('id', id)
    setUpdating(null)
    fetchBookings()
  }

  const NEXT_STATUS = { pending: 'in_progress', in_progress: 'completed' }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-sm mx-auto min-h-screen pb-10">
        {/* Header */}
        <div className="px-5 pt-10 pb-4 flex items-center gap-3">
          <button onClick={() => navigate('/admin/dashboard')} className="text-stone-500 hover:text-stone-700">
            <ArrowLeft size={22} />
          </button>
          <h1 className="font-display font-extrabold text-xl text-stone-900">All Requests</h1>
        </div>

        {/* Filter tabs */}
        <div className="px-5 mb-5 overflow-x-auto">
          <div className="flex gap-2 pb-1">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === s ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'}`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings */}
        <div className="px-5">
          {loading ? (
            <div className="flex justify-center py-10"><div className="w-7 h-7 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-stone-400 border border-stone-100">
              <p className="font-medium">No {filter === 'all' ? '' : filter} requests</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {bookings.map(b => (
                <div key={b.id} className="bg-white rounded-2xl p-4 border border-stone-100">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-stone-800">{b.service_name}</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Customer: {b.profiles?.full_name || '—'}<br/>
                        Worker: {b.workers?.profiles?.full_name || 'Unassigned'}<br/>
                        {new Date(b.scheduled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`status-badge flex-shrink-0 ${STATUS_STYLES[b.status] || 'bg-stone-100 text-stone-600'}`}>
                      {b.status?.replace('_', ' ')}
                    </span>
                  </div>

                  {b.price && (
                    <p className="text-xs text-stone-500 mb-3">UGX {b.price.toLocaleString()}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {NEXT_STATUS[b.status] && (
                      <button
                        onClick={() => updateStatus(b.id, NEXT_STATUS[b.status])}
                        disabled={updating === b.id}
                        className="flex-1 bg-stone-900 text-white text-xs font-semibold py-2 rounded-xl hover:bg-stone-800 disabled:opacity-60 transition-colors"
                      >
                        {updating === b.id ? '…' : `Mark ${NEXT_STATUS[b.status].replace('_', ' ')}`}
                      </button>
                    )}
                    {b.status !== 'cancelled' && b.status !== 'completed' && (
                      <button
                        onClick={() => updateStatus(b.id, 'cancelled')}
                        disabled={updating === b.id}
                        className="px-3 bg-red-50 text-red-600 text-xs font-semibold py-2 rounded-xl hover:bg-red-100 disabled:opacity-60 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    {b.status === 'pending' && !b.worker_id && (
                      <button
                        onClick={() => navigate('/admin/workers')}
                        className="px-3 bg-yellow-50 text-yellow-700 text-xs font-semibold py-2 rounded-xl hover:bg-yellow-100 transition-colors"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
