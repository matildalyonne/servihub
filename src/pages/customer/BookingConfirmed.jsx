import { useLocation, useNavigate } from 'react-router-dom'
import MobileShell from '../../components/layout/MobileShell'
import { CheckCircle } from 'lucide-react'

const STEPS = [
  { label: 'Booking Received', sub: 'Your request has been received' },
  { label: 'Worker Assigned', sub: 'Searching for the best pro near you…' },
  { label: 'Worker On the Way', sub: 'Not started yet' },
  { label: 'Service Completed', sub: 'Final step' },
]

export default function BookingConfirmed() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const booking = state?.booking

  const now = new Date().toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })

  return (
    <MobileShell>
      <div className="flex flex-col min-h-screen items-center px-6 py-14">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-yellow-500" strokeWidth={1.5} />
        </div>

        <h1 className="font-display font-extrabold text-2xl text-stone-900 mb-2">Booking Confirmed!</h1>
        <p className="text-stone-500 text-sm text-center max-w-xs leading-relaxed mb-8">
          Your request has been received and we are currently processing it. Thank you for choosing ServiHub.
        </p>

        {/* Status timeline */}
        <div className="w-full bg-white rounded-3xl p-5 mb-6 border border-stone-100">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">Booking Status</p>
          <div className="flex flex-col gap-0">
            {STEPS.map((step, i) => {
              const done = i <= 1
              const active = i === 1
              return (
                <div key={step.label} className="flex gap-4">
                  {/* Dot + line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 ${done ? 'bg-yellow-400 border-yellow-400' : 'bg-white border-stone-300'}`} />
                    {i < STEPS.length - 1 && <div className={`w-0.5 flex-1 my-1 ${done ? 'bg-yellow-300' : 'bg-stone-200'}`} style={{ minHeight: 28 }} />}
                  </div>
                  {/* Text */}
                  <div className="pb-5">
                    <p className={`font-semibold text-sm ${done ? (active ? 'text-yellow-600' : 'text-stone-800') : 'text-stone-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {i === 0 ? `Today, ${now}` : step.sub}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <button onClick={() => navigate('/bookings')} className="btn-primary py-4">
            View Booking Details
          </button>
          <button onClick={() => navigate('/home')} className="btn-outline py-4">
            Back to Home
          </button>
        </div>

        <p className="mt-8 text-xs text-stone-400">
          Need help?{' '}
          <a href="mailto:support@servihub.com" className="text-yellow-600 font-semibold">Contact Support</a>
        </p>
      </div>
    </MobileShell>
  )
}
