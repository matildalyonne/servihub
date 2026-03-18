import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { AdminNav } from './Dashboard'
import { ArrowLeft, TrendingUp, DollarSign, Users, CheckCircle } from 'lucide-react'

export default function AdminReports() {
  const navigate = useNavigate()
  const [data, setData] = useState({ totalRevenue: 0, totalBookings: 0, completedBookings: 0, totalWorkers: 0, topWorkers: [], recentBookings: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { data: bookings },
        { data: workers },
        { count: workerCount },
      ] = await Promise.all([
        supabase.from('bookings').select('*, workers(profiles(full_name))').order('created_at', { ascending: false }),
        supabase.from('workers').select('*, profiles(full_name)').order('rating', { ascending: false }).limit(5),
        supabase.from('workers').select('*', { count: 'exact', head: true }),
      ])

      const completed = (bookings || []).filter(b => b.status === 'completed')
      const revenue = completed.reduce((s, b) => s + (b.price || 0), 0)

      // Count completions per worker
      const workerCounts = {}
      completed.forEach(b => {
        if (b.worker_id) workerCounts[b.worker_id] = (workerCounts[b.worker_id] || 0) + 1
      })
      const topWorkers = (workers || []).map(w => ({
        ...w,
        completions: workerCounts[w.id] || 0,
      })).sort((a, b) => b.completions - a.completions)

      setData({
        totalRevenue: revenue,
        totalBookings: bookings?.length || 0,
        completedBookings: completed.length,
        totalWorkers: workerCount || 0,
        topWorkers,
        recentBookings: (bookings || []).slice(0, 10),
      })
      setLoading(false)
    }
    load()
  }, [])

  const STATUS_STYLES = {
    pending: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto pb-24 px-4 sm:px-6">
        <div className="pt-10 pb-5 flex items-center gap-3">
          <button onClick={() => navigate('/admin/dashboard')} className="text-stone-500 hover:text-stone-700">
            <ArrowLeft size={22} />
          </button>
          <h1 className="font-display font-extrabold text-2xl text-stone-900">Reports</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Total Revenue', value: `UGX ${data.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-green-100 text-green-600' },
                { label: 'Total Bookings', value: data.totalBookings, icon: TrendingUp, color: 'bg-blue-100 text-blue-600' },
                { label: 'Completed', value: data.completedBookings, icon: CheckCircle, color: 'bg-yellow-100 text-yellow-600' },
                { label: 'Workers', value: data.totalWorkers, icon: Users, color: 'bg-purple-100 text-purple-600' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-2xl p-4 border border-stone-100">
                  <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-2`}>
                    <Icon size={17} />
                  </div>
                  <p className="font-display font-extrabold text-xl text-stone-900 leading-tight">{value}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Completion rate */}
            <div className="bg-white rounded-2xl p-4 border border-stone-100 mb-6">
              <p className="text-sm font-semibold text-stone-700 mb-2">Completion Rate</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-stone-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                    style={{ width: data.totalBookings > 0 ? `${Math.round((data.completedBookings / data.totalBookings) * 100)}%` : '0%' }}
                  />
                </div>
                <span className="font-bold text-stone-800 text-sm w-10 text-right">
                  {data.totalBookings > 0 ? Math.round((data.completedBookings / data.totalBookings) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Top workers */}
            {data.topWorkers.length > 0 && (
              <div className="mb-6">
                <h2 className="font-display font-bold text-stone-800 mb-3">Top Workers</h2>
                <div className="flex flex-col gap-2">
                  {data.topWorkers.map((w, i) => (
                    <div key={w.id} className="bg-white rounded-2xl p-4 border border-stone-100 flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500 flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-stone-800">{w.profiles?.full_name}</p>
                        <p className="text-xs text-stone-400">{w.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-stone-800">{w.completions}</p>
                        <p className="text-xs text-stone-400">jobs done</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent bookings */}
            <div>
              <h2 className="font-display font-bold text-stone-800 mb-3">Recent Bookings</h2>
              <div className="flex flex-col gap-2">
                {data.recentBookings.map(b => (
                  <div key={b.id} className="bg-white rounded-2xl p-4 border border-stone-100 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-800 truncate">{b.service_name}</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {new Date(b.scheduled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        {b.workers?.profiles?.full_name && ` · ${b.workers.profiles.full_name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {b.price > 0 && <span className="text-sm font-bold text-stone-700">UGX {b.price.toLocaleString()}</span>}
                      <span className={`status-badge ${STATUS_STYLES[b.status] || 'bg-stone-100 text-stone-600'}`}>
                        {b.status?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <AdminNav />
    </div>
  )
}
