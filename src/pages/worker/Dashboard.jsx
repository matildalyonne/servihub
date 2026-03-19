import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import MobileShell from '../../components/layout/MobileShell'
import WorkerNav from '../../components/layout/WorkerNav'
import { MapPin, User, CheckCircle, Clock } from 'lucide-react'

export default function WorkerDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [activeJobs, setActiveJobs] = useState([])
  const [completedJobs, setCompletedJobs] = useState([])
  const [todayEarned, setTodayEarned] = useState(0)
  const [todayCount, setTodayCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [declining, setDeclining] = useState(false)
  const [confirming, setConfirming] = useState(null)

  useEffect(() => {
    if (!profile) return
    fetchJobs()
  }, [profile])

  async function fetchJobs() {
    setLoading(true)
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)

    // All active jobs (pending or in_progress) assigned to this worker
    const { data: active } = await supabase
      .from('bookings')
      .select('*, profiles!bookings_customer_id_fkey(full_name)')
      .eq('worker_id', profile.id)
      .in('status', ['pending', 'in_progress'])
      .order('scheduled_at', { ascending: true })
    setActiveJobs(active || [])

    // Completed today
    const { data: completed } = await supabase
      .from('bookings')
      .select('*, profiles!bookings_customer_id_fkey(full_name)')
      .eq('worker_id', profile.id)
      .eq('status', 'completed')
      .gte('scheduled_at', todayStart.toISOString())
      .order('scheduled_at', { ascending: false })
    setCompletedJobs(completed || [])
    const earned = (completed || []).reduce((sum, j) => sum + (j.price || 0), 0)
    setTodayEarned(earned)
    setTodayCount(completed?.length || 0)
    setLoading(false)
  }

  async function acceptJob(jobId) {
    setAccepting(true)
    await supabase.from('bookings').update({ status: 'in_progress' }).eq('id', jobId)
    fetchJobs()
    setAccepting(false)
  }

  async function declineJob(jobId) {
    setDeclining(true)
    await supabase.from('bookings').update({ status: 'pending', worker_id: null }).eq('id', jobId)
    fetchJobs()
    setDeclining(false)
  }

  async function confirmJobDone(jobId) {
    setConfirming(jobId)
    await supabase.from('bookings').update({ worker_confirmed: true }).eq('id', jobId)
    fetchJobs()
    setConfirming(null)
  }

  const nextJob = activeJobs[0] || null

  return (
    <MobileShell>
      <div className="flex flex-col min-h-screen pb-24">
        {/* Header */}
        <div className="px-5 pt-10 pb-5 flex items-center justify-between">
          <h1 className="font-display font-extrabold text-xl text-stone-900">
            ServiHub <span className="text-yellow-500">Worker</span>
          </h1>
          <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
            <User size={18} className="text-stone-600" />
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 mb-5 grid grid-cols-2 gap-3">
          <div className="card">
            <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Today's Jobs</p>
            <p className="font-display font-extrabold text-3xl text-stone-900 mt-1">{todayCount}</p>
          </div>
          <div className="card">
            <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Earned</p>
            <p className="font-display font-extrabold text-2xl text-green-600 mt-1">
              {todayEarned > 0 ? `UGX ${todayEarned.toLocaleString()}` : '—'}
            </p>
          </div>
        </div>

        {/* Next assigned job */}
        <div className="px-5 mb-5">
          <h2 className="font-display font-bold text-stone-800 mb-3">Next Assigned Job</h2>
          {loading ? (
            <div className="card flex justify-center py-6">
              <div className="w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !nextJob ? (
            <div className="card text-center py-6 text-stone-400">
              <p className="font-medium">No jobs assigned yet</p>
              <p className="text-sm mt-1">Check back soon</p>
            </div>
          ) : (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="status-badge bg-blue-100 text-blue-700 text-xs">Priority Booking</span>
                <span className={`status-badge text-xs ${nextJob.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {nextJob.status === 'in_progress' ? 'In Progress' : 'Pending'}
                </span>
              </div>

              <p className="font-display font-bold text-stone-900">{nextJob.profiles?.full_name || 'Customer'}</p>
              <p className="text-yellow-600 font-semibold text-sm mb-1">{nextJob.service_name}</p>

              <div className="flex items-center justify-between text-xs text-stone-400 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin size={12} />
                  <span>{nextJob.location || 'Location not set'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{new Date(nextJob.scheduled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Accept/Decline for pending jobs */}
              {nextJob.status === 'pending' && (
                <div className="flex gap-2 mb-3">
                  <button onClick={() => declineJob(nextJob.id)} disabled={declining}
                    className="flex-1 btn-outline py-2.5 text-sm disabled:opacity-60">
                    {declining ? '…' : 'Decline'}
                  </button>
                  <button onClick={() => acceptJob(nextJob.id)} disabled={accepting}
                    className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">
                    {accepting ? 'Accepting…' : 'Accept Job'}
                  </button>
                </div>
              )}

              {/* Confirm done for in_progress jobs */}
              {nextJob.status === 'in_progress' && (
                nextJob.worker_confirmed ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                    <p className="text-yellow-700 font-semibold text-sm text-center">
                      ✓ You've confirmed — waiting for customer to confirm
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => confirmJobDone(nextJob.id)}
                    disabled={confirming === nextJob.id}
                    className="w-full bg-green-500 hover:bg-green-400 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60"
                  >
                    <CheckCircle size={18} />
                    {confirming === nextJob.id ? 'Confirming…' : 'Mark Job as Done'}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* All active jobs if more than one */}
        {activeJobs.length > 1 && (
          <div className="px-5 mb-5">
            <h2 className="font-display font-bold text-stone-800 mb-3">Upcoming Jobs</h2>
            <div className="flex flex-col gap-2">
              {activeJobs.slice(1).map(j => (
                <div key={j.id} className="card flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">{j.service_name}</p>
                    <p className="text-xs text-stone-400">{j.profiles?.full_name} · {new Date(j.scheduled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className={`status-badge text-xs ${j.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {j.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed today */}
        <div className="px-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-stone-800">Completed Today</h2>
            <button onClick={() => navigate('/worker/history')} className="text-sm text-yellow-600 font-medium">View All</button>
          </div>
          {completedJobs.length === 0 ? (
            <div className="card text-center py-5 text-stone-400 text-sm">No completed jobs today</div>
          ) : (
            <div className="flex flex-col gap-2">
              {completedJobs.map(j => (
                <div key={j.id} className="card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle size={14} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800 text-sm">{j.service_name}</p>
                      <p className="text-xs text-stone-400">{j.profiles?.full_name} · {new Date(j.scheduled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-800 text-sm">UGX {(j.price || 0).toLocaleString()}</span>
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
