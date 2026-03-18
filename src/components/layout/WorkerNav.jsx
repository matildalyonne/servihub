import { useNavigate, useLocation } from 'react-router-dom'
import { Home, BarChart2, Clock, User } from 'lucide-react'

const tabs = [
  { label: 'Jobs', icon: Home, path: '/worker/dashboard' },
  { label: 'Earnings', icon: BarChart2, path: '/worker/earnings' },
  { label: 'History', icon: Clock, path: '/worker/history' },
  { label: 'Profile', icon: User, path: '/worker/profile' },
]

export default function WorkerNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-stone-100 flex z-50">
      {tabs.map(({ label, icon: Icon, path }) => {
        const active = pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${active ? 'text-yellow-500' : 'text-stone-400'}`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
