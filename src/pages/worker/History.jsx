import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import MobileShell from '../../components/layout/MobileShell'
import WorkerNav from '../../components/layout/WorkerNav'

const STATUS_STYLES = {
  completed: 'bg-green-100 text-green-700',
  in_progress: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
}

export default function WorkerHistory() {
  const { profile } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase
      .from('bookings')
      .select('*, profiles!bookings_customer_id_fkey(full_name)')
      .eq('worker_id', profile.id)
      .order('scheduled_at', { ascending: false })
      .then(({ data }) => { setJobs(data || []); setLoading(false) })
  }, [profile])

  return (
    <MobileShell>
      <div className="flex flex-col min-h-screen pb-24">
        <div className="px-5 pt-10 pb-5">
          <h1 className="font-display font-extrabold text-2xl text-stone-900">Job History</h1>
          <p className="text-stone-500 text-sm mt-0.5">All your past assignments</p>
        </div>

        <div className="px-5">
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>
          ) : jobs.length === 0 ? (
            <div className="card text-center py-10 text-stone-400">
              <p className="font-medium">No job history yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {jobs.map(j => (
                <div key={j.id} className="card">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-stone-800">{j.service_name}</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {j.profiles?.full_name || 'Customer'} · {new Date(j.scheduled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`status-badge ${STATUS_STYLES[j.status] || 'bg-stone-100 text-stone-600'}`}>
                        {j.status?.replace('_', ' ')}
                      </span>
                      {j.price && <span className="text-sm font-bold text-stone-700">UGX {j.price.toLocaleString()}</span>}
                    </div>
                  </div>
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
