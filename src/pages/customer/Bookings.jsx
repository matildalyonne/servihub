import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import MobileShell from '../../components/layout/MobileShell'
import CustomerNav from '../../components/layout/CustomerNav'
import { Home, CheckCircle, Star, X } from 'lucide-react'

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const FILTERS = ['all', 'pending', 'in_progress', 'completed', 'cancelled']

function ReviewModal({ booking, onClose, onSubmit }) {
  const [rating, setRating] = useState(5)
  const [hovered, setHovered] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    await onSubmit({ rating, comment, booking })
    setLoading(false)
  }

  return (
    // Backdrop
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-extrabold text-xl text-stone-900">Rate your service</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X size={20} />
          </button>
        </div>

        <p className="text-stone-500 text-sm mb-5">
          How was your <strong>{booking.service_name}</strong> experience?
        </p>

        {/* Star picker */}
        <div className="flex justify-center gap-2 mb-5">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(null)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                size={36}
                fill={(hovered ?? rating) >= star ? '#F59E0B' : 'none'}
                className={(hovered ?? rating) >= star ? 'text-yellow-400' : 'text-stone-300'}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>

        <p className="text-center text-sm font-semibold text-stone-600 mb-4">
          {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][hovered ?? rating]}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            className="input-field resize-none text-sm"
            rows={3}
            placeholder="Tell us about your experience (optional)…"
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
            {loading ? 'Submitting…' : 'Submit Review'}
          </button>
          <button type="button" onClick={onClose} className="text-stone-400 text-sm hover:text-stone-600 text-center">
            Skip for now
          </button>
        </form>
      </div>
    </div>
  )
}

export default function CustomerBookings() {
  const { profile } = useAuth()
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(null)
  const [reviewBooking, setReviewBooking] = useState(null)
  const [reviewedIds, setReviewedIds] = useState(new Set())

  useEffect(() => {
    if (!profile) return
    fetchBookings()
    fetchReviewedIds()
  }, [profile, filter])

  async function fetchBookings() {
    setLoading(true)
    let query = supabase
      .from('bookings')
      .select('*, workers(profiles(full_name))')
      .eq('customer_id', profile.id)
      .order('scheduled_at', { ascending: false })
    if (filter !== 'all') query = query.eq('status', filter)
    const { data } = await query
    setBookings(data || [])
    setLoading(false)
  }

  async function fetchReviewedIds() {
    // Find booking IDs the customer has already reviewed
    const { data } = await supabase
      .from('reviews')
      .select('booking_id')
      .not('booking_id', 'is', null)
    setReviewedIds(new Set((data || []).map(r => r.booking_id)))
  }

  async function confirmJobDone(booking) {
    setConfirming(booking.id)
    const { data } = await supabase
      .from('bookings')
      .update({ customer_confirmed: true })
      .eq('id', booking.id)
      .select()
      .single()
    setConfirming(null)

    // If both confirmed, the trigger will have set status=completed
    // Refresh and if now completed, prompt review
    await fetchBookings()
    if (data?.status === 'completed' || data?.worker_confirmed) {
      // Re-fetch to get latest status
      const { data: fresh } = await supabase.from('bookings').select('*').eq('id', booking.id).single()
      if (fresh?.status === 'completed' && booking.worker_id) {
        setReviewBooking(fresh)
      }
    }
  }

  async function submitReview({ rating, comment, booking }) {
    await supabase.from('reviews').insert({
      booking_id: booking.id,
      worker_id: booking.worker_id,
      reviewer_name: profile.full_name,
      rating,
      comment: comment || null,
    })

    // Update worker's average rating
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('worker_id', booking.worker_id)
    if (allReviews?.length) {
      const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
      await supabase.from('workers').update({
        rating: Math.round(avg * 10) / 10,
        review_count: allReviews.length,
      }).eq('id', booking.worker_id)
    }

    setReviewedIds(prev => new Set([...prev, booking.id]))
    setReviewBooking(null)
  }

  return (
    <MobileShell>
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmit={submitReview}
        />
      )}

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
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="card text-center py-10 text-stone-400">
              <p className="font-medium">No {filter === 'all' ? '' : filter.replace('_', ' ')} bookings</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {bookings.map(b => {
                const canConfirm = b.status === 'in_progress' && !b.customer_confirmed
                const waitingForWorker = b.status === 'in_progress' && b.customer_confirmed && !b.worker_confirmed
                const waitingForCustomer = b.status === 'in_progress' && b.worker_confirmed && !b.customer_confirmed
                const isCompleted = b.status === 'completed'
                const canReview = isCompleted && b.worker_id && !reviewedIds.has(b.id)

                return (
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

                    <div className="flex items-center justify-between py-2 border-t border-stone-100 mb-2">
                      <p className="text-xs text-stone-400">
                        Worker: {b.workers?.profiles?.full_name || 'Not yet assigned'}
                      </p>
                      {b.price > 0 && <p className="text-sm font-bold text-stone-700">UGX {b.price.toLocaleString()}</p>}
                    </div>

                    {/* Confirmation indicators */}
                    {b.status === 'in_progress' && (
                      <div className="flex gap-2 mb-3">
                        <div className={`flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold ${b.worker_confirmed ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-400'}`}>
                          <CheckCircle size={12} />
                          Worker {b.worker_confirmed ? 'confirmed' : 'pending'}
                        </div>
                        <div className={`flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold ${b.customer_confirmed ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-400'}`}>
                          <CheckCircle size={12} />
                          You {b.customer_confirmed ? 'confirmed' : 'pending'}
                        </div>
                      </div>
                    )}

                    {/* Confirm done button */}
                    {canConfirm && (
                      <button
                        onClick={() => confirmJobDone(b)}
                        disabled={confirming === b.id}
                        className="w-full bg-green-500 hover:bg-green-400 text-white font-semibold py-2.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60 text-sm"
                      >
                        <CheckCircle size={16} />
                        {confirming === b.id ? 'Confirming…' : 'Confirm Job Done'}
                      </button>
                    )}

                    {/* Waiting states */}
                    {waitingForWorker && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 text-center">
                        <p className="text-yellow-700 text-xs font-semibold">✓ You confirmed — waiting for worker to confirm</p>
                      </div>
                    )}

                    {waitingForCustomer && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-center">
                        <p className="text-blue-700 text-xs font-semibold">Worker confirmed job done — please confirm above</p>
                      </div>
                    )}

                    {/* Leave review button for completed jobs */}
                    {canReview && (
                      <button
                        onClick={() => setReviewBooking(b)}
                        className="w-full mt-1 border-2 border-yellow-300 text-yellow-700 bg-yellow-50 font-semibold py-2.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-yellow-100 active:scale-95 transition-all text-sm"
                      >
                        <Star size={15} fill="currentColor" />
                        Leave a Review
                      </button>
                    )}

                    {isCompleted && reviewedIds.has(b.id) && (
                      <div className="flex items-center justify-center gap-1.5 text-xs text-green-600 font-semibold mt-1">
                        <CheckCircle size={13} />
                        Review submitted
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <CustomerNav />
    </MobileShell>
  )
}
