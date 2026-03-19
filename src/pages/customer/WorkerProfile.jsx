import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import MobileShell from '../../components/layout/MobileShell'
import { ArrowLeft, Share2, Star, Wrench, Zap, Droplets, Home } from 'lucide-react'

const SKILL_ICONS = { 'AC Repair': Zap, Electrical: Zap, Plumbing: Droplets, 'Interior Repairs': Home, Cleaning: Home }

export default function WorkerProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [worker, setWorker] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: w } = await supabase.from('workers').select('*, profiles(full_name, avatar_url)').eq('id', id).single()
      setWorker(w)
      const { data: r } = await supabase.from('reviews').select('*').eq('worker_id', id).order('created_at', { ascending: false }).limit(5)
      setReviews(r || [])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <MobileShell>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </MobileShell>
  )

  if (!worker) return (
    <MobileShell>
      <div className="min-h-screen flex items-center justify-center text-stone-500">Worker not found.</div>
    </MobileShell>
  )

  const name = worker.profiles?.full_name || 'Worker'
  const skills = worker.skills || ['Cleaning', 'AC Repair']

  return (
    <MobileShell>
      <div className="flex flex-col min-h-screen pb-32">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-10 pb-4">
          <button onClick={() => navigate(-1)} className="text-stone-500 hover:text-stone-700"><ArrowLeft size={22} /></button>
          <h2 className="font-display font-bold text-stone-900">Worker Profile</h2>
          <button className="text-stone-500 hover:text-stone-700"><Share2 size={20} /></button>
        </div>

        {/* Avatar & name */}
        <div className="flex flex-col items-center px-5 pb-6">
          <div className="w-24 h-24 rounded-full bg-stone-200 overflow-hidden mb-3 ring-4 ring-yellow-400">
            {worker.profiles?.avatar_url
              ? <img src={worker.profiles.avatar_url} className="w-full h-full object-cover" alt={name} />
              : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-stone-500">{name[0]}</div>}
          </div>
          <h1 className="font-display font-extrabold text-xl text-stone-900">{name}</h1>
          <p className="text-stone-500 text-sm mt-0.5">{worker.title || 'Service Professional'}</p>

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            {[
              { label: 'Rating', value: worker.rating?.toFixed(1) || '4.9' },
              { label: 'Reviews', value: worker.review_count || '0' },
              { label: 'Exp', value: `${worker.years_exp || '1'} yrs` },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center">
                <span className="font-display font-extrabold text-xl text-stone-900">{value}</span>
                <span className="text-xs text-stone-400 uppercase tracking-wider font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="px-5 mb-5">
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center">
                <Wrench size={12} className="text-orange-500" />
              </div>
              <h3 className="font-display font-bold text-stone-800">About</h3>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">{worker.bio || 'Dedicated service professional committed to quality and customer satisfaction.'}</p>
          </div>
        </div>

        {/* Skills */}
        <div className="px-5 mb-5">
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                <Zap size={12} className="text-blue-500" />
              </div>
              <h3 className="font-display font-bold text-stone-800">Skills & Services</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-stone-100 rounded-full text-xs font-semibold text-stone-700">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="px-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Star size={12} className="text-yellow-500" fill="currentColor" />
              </div>
              <h3 className="font-display font-bold text-stone-800">Reviews</h3>
            </div>
            <button className="text-sm text-yellow-600 font-medium">See All</button>
          </div>
          {reviews.length === 0 ? (
            <div className="card text-center py-5 text-stone-400 text-sm">No reviews yet</div>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map(r => (
                <div key={r.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-600">
                        {(r.reviewer_name || 'A')[0]}
                      </div>
                      <span className="font-semibold text-stone-800 text-sm">{r.reviewer_name || 'Anonymous'}</span>
                    </div>
                    <span className="text-xs text-stone-400">{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="flex gap-0.5 mb-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} fill={i < (r.rating || 5) ? '#F59E0B' : 'none'} className="text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-stone-100 px-5 py-4">
        <button onClick={() => navigate('/book')} className="btn-primary py-3.5">
          Book Now 📅
        </button>
      </div>
    </MobileShell>
  )
}
