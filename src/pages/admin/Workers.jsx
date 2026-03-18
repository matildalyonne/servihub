import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Star, CheckCircle, XCircle } from 'lucide-react'

export default function AdminWorkers() {
  const navigate = useNavigate()
  const [workers, setWorkers] = useState([])
  const [pendingBookings, setPendingBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [assigningBooking, setAssigningBooking] = useState(null)
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: w }, { data: b }] = await Promise.all([
      supabase.from('workers').select('*, profiles(full_name, email)').order('rating', { ascending: false }),
      supabase.from('bookings').select('*, profiles!bookings_customer_id_fkey(full_name)').eq('status', 'pending').is('worker_id', null),
    ])
    setWorkers(w || [])
    setPendingBookings(b || [])
    setLoading(false)
  }

  async function assignWorker(bookingId, workerId) {
    setAssigning(true)
    await supabase.from('bookings').update({ worker_id: workerId, status: 'pending' }).eq('id', bookingId)
    setAssigningBooking(null)
    setAssigning(false)
    fetchAll()
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-sm mx-auto min-h-screen pb-10">
        {/* Header */}
        <div className="px-5 pt-10 pb-4 flex items-center gap-3">
          <button onClick={() => navigate('/admin/dashboard')} className="text-stone-500 hover:text-stone-700">
            <ArrowLeft size={22} />
          </button>
          <h1 className="font-display font-extrabold text-xl text-stone-900">Manage Workers</h1>
        </div>

        {/* Unassigned bookings */}
        {pendingBookings.length > 0 && (
          <div className="px-5 mb-6">
            <h2 className="font-display font-bold text-stone-800 mb-3">Unassigned Requests ({pendingBookings.length})</h2>
            <div className="flex flex-col gap-2">
              {pendingBookings.map(b => (
                <div key={b.id} className="bg-white rounded-2xl p-4 border border-yellow-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-stone-800">{b.service_name}</p>
                      <p className="text-xs text-stone-400">{b.profiles?.full_name} · {new Date(b.scheduled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <button
                      onClick={() => setAssigningBooking(assigningBooking?.id === b.id ? null : b)}
                      className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full hover:bg-yellow-100"
                    >
                      Assign
                    </button>
                  </div>

                  {/* Worker picker */}
                  {assigningBooking?.id === b.id && (
                    <div className="mt-3 border-t border-stone-100 pt-3">
                      <p className="text-xs text-stone-400 mb-2">Select a worker:</p>
                      <div className="flex flex-col gap-2">
                        {workers.filter(w => w.is_available !== false).map(w => (
                          <button
                            key={w.id}
                            onClick={() => assignWorker(b.id, w.id)}
                            disabled={assigning}
                            className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-left"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-600">
                                {(w.profiles?.full_name || 'W')[0]}
                              </div>
                              <div>
                                <p className="font-semibold text-stone-800 text-sm">{w.profiles?.full_name}</p>
                                <p className="text-xs text-stone-400">{w.title}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-stone-500">
                              <Star size={11} fill="#F59E0B" className="text-yellow-400" />
                              {w.rating?.toFixed(1)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Worker list */}
        <div className="px-5">
          <h2 className="font-display font-bold text-stone-800 mb-3">All Workers ({workers.length})</h2>
          <div className="flex flex-col gap-2">
            {workers.map(w => (
              <div key={w.id} className="bg-white rounded-2xl p-4 border border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-stone-200 flex items-center justify-center text-base font-bold text-stone-600 flex-shrink-0">
                    {(w.profiles?.full_name || 'W')[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-stone-800">{w.profiles?.full_name}</p>
                      <span className={`status-badge ${w.is_available === false ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                        {w.is_available === false ? 'Busy' : 'Available'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400">{w.title} · {w.profiles?.email}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-stone-600">
                    <Star size={13} fill="#F59E0B" className="text-yellow-400" />
                    {w.rating?.toFixed(1) || '5.0'}
                  </div>
                </div>
              </div>
            ))}
            {workers.length === 0 && (
              <div className="bg-white rounded-2xl p-6 text-center text-stone-400 text-sm border border-stone-100">
                No workers yet. Add your first worker from the dashboard.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
