import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-yellow-400 flex flex-col items-center justify-center px-8 font-sans">
      {/* Logo mark */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-28 h-28 mb-4">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Hand */}
            <path d="M20 90 Q20 105 35 105 L85 105 Q100 105 100 90 L100 70 Q100 60 90 60 L75 60 L75 30 Q75 20 65 20 Q55 20 55 30 L55 55 L45 55 Q35 55 35 65 L35 70 L30 70 Q20 70 20 80 Z" stroke="#1A2E2A" strokeWidth="4" strokeLinejoin="round" fill="none"/>
            {/* House */}
            <path d="M40 60 L60 38 L80 60" stroke="#1A2E2A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="48" y="60" width="24" height="20" rx="2" stroke="#1A2E2A" strokeWidth="3.5" fill="none"/>
            <path d="M57 80 L57 68 Q57 66 60 66 Q63 66 63 68 L63 80" stroke="#1A2E2A" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="font-display text-4xl font-extrabold text-stone-900 tracking-tight">ServiHub</h1>
        <p className="text-stone-700 mt-2 text-sm tracking-widest uppercase font-medium">Reliable · Trusted · Delivered</p>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-xs flex flex-col gap-4 mt-4">
        <button
          onClick={() => navigate('/login')}
          className="bg-stone-900 text-white font-semibold py-4 rounded-2xl text-base hover:bg-stone-800 active:scale-95 transition-all"
        >
          Customer
        </button>
        <button
          onClick={() => navigate('/worker/login')}
          className="bg-stone-900 text-white font-semibold py-4 rounded-2xl text-base hover:bg-stone-800 active:scale-95 transition-all"
        >
          Worker
        </button>
      </div>

      <p className="mt-12 text-stone-600 text-xs">© 2026 ServiHub. All rights reserved.</p>
    </div>
  )
}
