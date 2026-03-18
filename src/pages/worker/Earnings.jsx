import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import MobileShell from '../../components/layout/MobileShell'
import WorkerNav from '../../components/layout/WorkerNav'
import { TrendingUp } from 'lucide-react'

export default function WorkerEarnings() {
  const { profile } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase
      .from('bookings')
      .select('*')
      .eq('worker_id', profile.id)
      .eq('status', 'completed')
      .order('scheduled_at', { ascending: false })
      .then(({ data }) => { setJobs(data || []); setLoading(false) })
  }, [profile])

  const total = jobs.reduce((s, j) => s + (j.price || 0), 0)
  const todayStart = new Date(); todayStart.setHours(0,0,0,0)
  const todayJobs = jobs.filter(j => new Date(j.scheduled_at) >= todayStart)
  const todayTotal = todayJobs.reduce((s, j) => s + (j.price || 0), 0)

  return (
    <MobileShell>
      <div className="flex flex-col min-h-screen pb-24">
        <div className="px-5 pt-10 pb-5">
          <h1 className="font-display font-extrabold text-2xl text-stone-900">Earnings</h1>
          <p className="text-stone-500 text-sm mt-0.5">Your income summary</p>
        </div>

        {/* Summary cards */}
        <div className="px-5 mb-5 flex flex-col gap-3">
          <div className="card bg-stone-900 text-white">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-yellow-400" />
              <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold">All-time earnings</p>
            </div>
            <p className="font-display font-extrabold text-3xl text-yellow-400">UGX {total.toLocaleString()}</p>
            <p className="text-xs text-stone-400 mt-1">{jobs.length} completed jobs</p>
          </div>
          <div className="card">
            <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold mb-1">Today</p>
            <p className="font-display font-extrabold text-2xl text-stone-900">UGX {todayTotal.toLocaleString()}</p>
            <p className="text-xs text-stone-400 mt-0.5">{todayJobs.length} jobs</p>
          </div>
        </div>

        {/* Recent */}
        <div className="px-5">
          <h2 className="font-display font-bold text-stone-800 mb-3">Recent Payments</h2>
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>
          ) : jobs.length === 0 ? (
            <div className="card text-center py-8 text-stone-400">No completed jobs yet</div>
          ) : (
            <div className="flex flex-col gap-2">
              {jobs.map(j => (
                <div key={j.id} className="card flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">{j.service_name}</p>
                    <p className="text-xs text-stone-400">{new Date(j.scheduled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                  </div>
                  <span className="font-bold text-green-600">+UGX {(j.price || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <WorkerNav />
    </MobileShell>
  )
}
