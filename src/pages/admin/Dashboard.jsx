import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Users, Clock, CheckCircle, Plus, ChevronRight, Menu, BarChart2, Settings } from 'lucide-react'

export default function AdminDashboard() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ workers: 0, pending: 0, completed: 0 })
  const [activity, setActivity] = useState([])
  const [showAddWorker, setShowAddWorker] = useState(false)
  const [newWorker, setNewWorker] = useState({ name: '', email: '', password: '', title: '' })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  useEffect(() => { fetchStats(); fetchActivity() }, [])

  async function fetchStats() {
    const [{ count: workers }, { count: pending }, { count: completed }] = await Promise.all([
      supabase.from('workers').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    ])
    setStats({ workers: workers || 0, pending: pending || 0, completed: completed || 0 })
  }

  async function fetchActivity() {
    const { data } = await supabase
      .from('bookings')
      .select('*, profiles!bookings_customer_id_fkey(full_name), workers(profiles(full_name))')
      .order('created_at', { ascending: false })
      .limit(5)
    setActivity(data || [])
  }

  async function handleAddWorker(e) {
    e.preventDefault()
    setAddLoading(true); setAddError(''); setAddSuccess('')

    // Create auth user via admin API — in production use Supabase edge function
    // Here we use signUp and then update role
    const { data, error } = await supabase.auth.signUp({
      email: newWorker.email,
      password: newWorker.password,
      options: { data: { full_name: newWorker.name } },
    })
    if (error) { setAddError(error.message); setAddLoading(false); return }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: newWorker.name,
        email: newWorker.email,
        role: 'worker',
      })
      await supabase.from('workers').insert({
        id: data.user.id,
        title: newWorker.title || 'Service Professional',
        rating: 5.0,
        review_count: 0,
        years_exp: 0,
      })
    }

    setAddSuccess(`Worker account created for ${newWorker.name}!`)
    setNewWorker({ name: '', email: '', password: '', title: '' })
    setAddLoading(false)
    fetchStats()
  }

  const ACTIVITY_COLORS = { completed: 'bg-green-400', pending: 'bg-yellow-400', in_progress: 'bg-blue-400', cancelled: 'bg-red-400' }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-sm mx-auto min-h-screen flex flex-col pb-24">
        {/* Header */}
        <div className="px-5 pt-10 pb-5 flex items-center justify-between">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-stone-900">ServiHub Panel</h1>
          </div>
          <button onClick={() => { signOut(); navigate('/admin') }} className="p-2 text-stone-400 hover:text-stone-600">
            <Menu size={22} />
          </button>
        </div>

        <div className="px-5 mb-6">
          <p className="font-display font-extrabold text-xl text-stone-900">Welcome, Admin</p>
          <p className="text-stone-500 text-sm">Monitor and manage your service hub ecosystem.</p>
        </div>

        {/* Stats */}
        <div className="px-5 mb-6 flex flex-col gap-3">
          {[
            { label: 'Total Workers', value: stats.workers, icon: Users, color: 'bg-blue-100 text-blue-600' },
            { label: 'Pending Requests', value: stats.pending, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
            { label: 'Completed Jobs', value: stats.completed, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-stone-100 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold">{label}</p>
                <p className="font-display font-extrabold text-3xl text-stone-900 leading-tight">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="px-5 mb-6">
          <h2 className="font-display font-bold text-stone-800 mb-3">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowAddWorker(!showAddWorker)}
              className="btn-primary flex items-center justify-between px-5 py-4"
            >
              <div className="flex items-center gap-2">
                <Plus size={18} />
                <span>Add Worker</span>
              </div>
              <ChevronRight size={18} />
            </button>

            {/* Add worker form */}
            {showAddWorker && (
              <form onSubmit={handleAddWorker} className="bg-white rounded-2xl p-4 border border-stone-200 flex flex-col gap-3 mt-1">
                <h3 className="font-display font-bold text-stone-800">New Worker Account</h3>
                {['name', 'email', 'title', 'password'].map(field => (
                  <input
                    key={field}
                    type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                    placeholder={field === 'name' ? 'Full name' : field === 'email' ? 'Email address' : field === 'title' ? 'Job title (e.g. Cleaner)' : 'Temporary password'}
                    value={newWorker[field]}
                    onChange={e => setNewWorker(f => ({ ...f, [field]: e.target.value }))}
                    required
                    className="input-field text-sm"
                  />
                ))}
                {addError && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-xl">{addError}</p>}
                {addSuccess && <p className="text-green-600 text-xs bg-green-50 px-3 py-2 rounded-xl">{addSuccess}</p>}
                <button type="submit" disabled={addLoading} className="btn-dark py-2.5 text-sm disabled:opacity-60">
                  {addLoading ? 'Creating…' : 'Create Worker Account'}
                </button>
              </form>
            )}

            <button onClick={() => navigate('/admin/workers')} className="bg-white border border-stone-200 rounded-2xl px-5 py-3.5 flex items-center justify-between hover:border-stone-300 transition-colors">
              <div className="flex items-center gap-3">
                <Users size={18} className="text-stone-500" />
                <span className="font-semibold text-stone-700">Manage Workers</span>
              </div>
              <ChevronRight size={18} className="text-stone-400" />
            </button>

            <button onClick={() => navigate('/admin/requests')} className="bg-white border border-stone-200 rounded-2xl px-5 py-3.5 flex items-center justify-between hover:border-stone-300 transition-colors">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-stone-500" />
                <span className="font-semibold text-stone-700">View Requests</span>
              </div>
              <div className="flex items-center gap-2">
                {stats.pending > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{stats.pending} New</span>
                )}
                <ChevronRight size={18} className="text-stone-400" />
              </div>
            </button>
          </div>
        </div>

        {/* Recent activity */}
        <div className="px-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-stone-800">Recent Activity</h2>
            <button onClick={() => navigate('/admin/requests')} className="text-sm text-yellow-600 font-medium">View All</button>
          </div>
          <div className="flex flex-col gap-2">
            {activity.length === 0 ? (
              <div className="bg-white rounded-2xl p-5 text-center text-stone-400 text-sm border border-stone-100">No activity yet</div>
            ) : activity.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-4 border border-stone-100 flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${ACTIVITY_COLORS[item.status] || 'bg-stone-300'}`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-stone-800">
                    {item.status === 'completed'
                      ? `Job completed by ${item.workers?.profiles?.full_name || 'worker'}`
                      : `${item.service_name} — ${item.status}`}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-stone-100 flex z-50">
        {[
          { label: 'Home', icon: Menu, path: '/admin/dashboard' },
          { label: 'Reports', icon: BarChart2, path: '/admin/reports' },
          { label: 'Settings', icon: Settings, path: '/admin/settings' },
        ].map(({ label, icon: Icon, path }) => (
          <button key={label} onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 ${window.location.pathname === path ? 'text-yellow-500' : 'text-stone-400'}`}>
            <Icon size={20} strokeWidth={1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
