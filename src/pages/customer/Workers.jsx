import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import MobileShell from '../../components/layout/MobileShell'
import CustomerNav from '../../components/layout/CustomerNav'
import { Star, Search } from 'lucide-react'

export default function CustomerWorkers() {
  const navigate = useNavigate()
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('workers')
      .select('*, profiles(full_name, avatar_url)')
      .order('rating', { ascending: false })
      .then(({ data }) => { setWorkers(data || []); setLoading(false) })
  }, [])

  const filtered = workers.filter(w =>
    (w.profiles?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (w.title || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <MobileShell>
      <div className="flex flex-col min-h-screen pb-24">
        <div className="px-5 pt-10 pb-4">
          <h1 className="font-display font-extrabold text-2xl text-stone-900">Our Workers</h1>
          <p className="text-stone-500 text-sm mt-0.5">Browse available professionals</p>
        </div>

        {/* Search */}
        <div className="px-5 mb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              className="input-field pl-9"
              placeholder="Search by name or skill…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="px-5">
          {loading ? (
            <div className="flex justify-center py-10"><div className="w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-10 text-stone-400">
              <p className="font-medium">No workers found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map(w => (
                <button key={w.id} onClick={() => navigate(`/workers/${w.id}`)}
                  className="card flex items-center gap-4 text-left hover:shadow-md transition-shadow active:scale-95">
                  <div className="w-14 h-14 rounded-full bg-stone-200 overflow-hidden flex-shrink-0 ring-2 ring-stone-100">
                    {w.profiles?.avatar_url
                      ? <img src={w.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                      : <div className="w-full h-full flex items-center justify-center font-display font-bold text-xl text-stone-500">
                          {(w.profiles?.full_name || 'W')[0]}
                        </div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-stone-800 truncate">{w.profiles?.full_name}</p>
                      <span className={`status-badge flex-shrink-0 ${w.is_available === false ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                        {w.is_available === false ? 'Busy' : 'Available'}
                      </span>
                    </div>
                    <p className="text-sm text-stone-500 truncate">{w.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={12} fill="#F59E0B" className="text-yellow-400" />
                      <span className="text-xs font-semibold text-stone-600">{w.rating?.toFixed(1) || '5.0'}</span>
                      <span className="text-xs text-stone-400">· {w.review_count || 0} reviews</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display font-bold text-stone-900">${w.hourly_rate || 45}</p>
                    <p className="text-xs text-stone-400">/hr</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <CustomerNav />
    </MobileShell>
  )
}
