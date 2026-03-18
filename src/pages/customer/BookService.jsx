import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import MobileShell from '../../components/layout/MobileShell'
import { ArrowLeft, Zap, Home, Car, Scissors } from 'lucide-react'

const SERVICES = [
  { id: 'laundry', name: 'Laundry', icon: Zap, duration: 'Approx. 2 hours', price: 30000 },
  { id: 'home_cleaning', name: 'House Cleaning', icon: Home, duration: 'Approx. 4 hours', price: 30000 },
  { id: 'car_washing', name: 'Car Washing', icon: Car, duration: 'Approx. 1 hour', price: 15000 },
  { id: 'slashing', name: 'Slashing', icon: Scissors, duration: 'Approx. 3 hours', price: 25000 },
]

const TIMES = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM', '07:00 PM']

function getDays() {
  const days = []
  const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const MONTH_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  for (let i = 0; i < 5; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push({ date: d, label: d.getDate(), day: DAY_LABELS[d.getDay()], month: MONTH_LABELS[d.getMonth()] })
  }
  return days
}

export default function BookService() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()

  const preselected = SERVICES.find(s => s.name === location.state?.service) || null
  const [selected, setSelected] = useState(preselected)
  const [dayIdx, setDayIdx] = useState(0)
  const [time, setTime] = useState(TIMES[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const days = getDays()

  async function handleConfirm() {
    if (!selected) { setError('Please select a service.'); return }
    setLoading(true)
    setError('')

    const chosenDay = days[dayIdx].date
    const [h, m] = time.replace(' AM', '').replace(' PM', '').split(':').map(Number)
    const isPM = time.includes('PM') && h !== 12
    const scheduledAt = new Date(chosenDay)
    scheduledAt.setHours(isPM ? h + 12 : h, m, 0, 0)

    const { data, error } = await supabase.from('bookings').insert({
      customer_id: profile.id,
      service_name: selected.name,
      scheduled_at: scheduledAt.toISOString(),
      status: 'pending',
      price: selected.price,
    }).select().single()

    if (error) { setError(error.message); setLoading(false); return }
    navigate('/booking-confirmed', { state: { booking: data } })
  }

  return (
    <MobileShell>
      <div className="flex flex-col min-h-screen pb-8">
        {/* Header */}
        <div className="px-5 pt-10 pb-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-stone-500 hover:text-stone-700">
            <ArrowLeft size={22} />
          </button>
          <h1 className="font-display font-extrabold text-xl text-stone-900">Book Service</h1>
        </div>

        <div className="px-5 flex flex-col gap-6">
          {/* Select service */}
          <div>
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Select Service</h2>
            <div className="flex flex-col gap-2">
              {SERVICES.map(svc => {
                const Icon = svc.icon
                const isSelected = selected?.id === svc.id
                return (
                  <button
                    key={svc.id}
                    onClick={() => setSelected(svc)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isSelected ? 'border-yellow-400 bg-yellow-50' : 'border-stone-200 bg-white hover:border-stone-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-yellow-400' : 'bg-stone-100'}`}>
                        <Icon size={18} className={isSelected ? 'text-stone-900' : 'text-stone-500'} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-stone-800 text-sm">{svc.name}</p>
                        <p className="text-xs text-stone-400">{svc.duration}</p>
                      </div>
                    </div>
                    <span className="font-bold text-stone-800">{svc.price.toLocaleString()}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Select date */}
          <div>
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Select Date</h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {days.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setDayIdx(i)}
                  className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl transition-all ${dayIdx === i ? 'bg-yellow-400 text-stone-900' : 'bg-white text-stone-600 border border-stone-200'}`}
                >
                  <span className="text-xs font-semibold">{d.month}</span>
                  <span className="text-xl font-extrabold font-display leading-tight">{d.label}</span>
                  <span className="text-xs font-medium">{d.day}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Select time */}
          <div>
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Select Time</h2>
            <div className="grid grid-cols-3 gap-2">
              {TIMES.map(t => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={`py-3 rounded-2xl text-sm font-semibold transition-all ${time === t ? 'bg-yellow-400 text-stone-900' : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Estimated total */}
          {selected && (
            <div className="flex items-center justify-between px-4 py-3 bg-stone-100 rounded-2xl">
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Estimated Total</p>
                <p className="text-2xl font-extrabold font-display text-stone-900">{selected.price.toLocaleString()}</p>
              </div>
              <p className="text-xs text-stone-400">Service Fee Included</p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

          <button onClick={handleConfirm} disabled={loading || !selected} className="btn-primary py-4 text-base disabled:opacity-50">
            {loading ? 'Confirming…' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </MobileShell>
  )
}
